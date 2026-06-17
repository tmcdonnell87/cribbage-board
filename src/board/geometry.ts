import { Layout } from '../types';

export interface Point {
  x: number;
  y: number;
}

export interface Hole extends Point {
  fifth: boolean;
}

export interface Lane {
  guidePoints: string; // "x,y x,y ..." for a <polyline>
  holes: Hole[];
}

export interface LayoutSpec {
  viewBox: string;
  d: string;
  /** Cosmetic SVG-unit sizes, tuned per layout (from the prototypes). */
  guideStroke: number;
  holeR: number;
  holeFifthR: number;
  pegR: number;
  trailR: number;
  ringR: number;
  start: Point; // START label anchor
  win: Point; // WIN label anchor
  startAnchor: 'start' | 'middle' | 'end';
  winAnchor: 'start' | 'middle' | 'end';
}

const LANE_GAP = 15;

export const LAYOUTS: Record<Layout, LayoutSpec> = {
  mobile: {
    viewBox: '0 0 340 510',
    d: 'M68,70 L68,436 A51,51 0 0 0 170,436 L170,70 A51,51 0 0 1 272,70 L272,436',
    guideStroke: 6.5,
    holeR: 2.1,
    holeFifthR: 2.7,
    pegR: 6.3,
    trailR: 4.6,
    ringR: 10,
    start: { x: 68, y: 60 },
    win: { x: 272, y: 458 },
    startAnchor: 'middle',
    winAnchor: 'middle',
  },
  desktop: {
    viewBox: '0 0 920 470',
    d: 'M90,95 L770,95 A67.5,67.5 0 0 1 770,230 L90,230 A67.5,67.5 0 0 0 90,365 L770,365',
    guideStroke: 7,
    holeR: 2.3,
    holeFifthR: 2.9,
    pegR: 6.6,
    trailR: 5,
    ringR: 10.5,
    start: { x: 64, y: 84 },
    win: { x: 778, y: 369 },
    startAnchor: 'start',
    winAnchor: 'start',
  },
};

/**
 * Maps a score to a peg position on the serpentine centerline, offset
 * perpendicularly into the player's lane. Implements the spec formula:
 *   len = (min(score,target)/target) * totalLength   (peg parks at finish)
 *   perp = normalize(p(len+1.5) - p(len)) rotated 90°
 *   pegXY = p + perp * (laneIndex - (n-1)/2) * 15
 */
export type PegPos = (score: number, lane: number) => Point;

interface BoardGeometry {
  spec: LayoutSpec;
  lanes: Lane[];
  pegPos: PegPos;
}

// Memoize the static lane guides + drilled holes (expensive at target=120).
const cache = new Map<string, BoardGeometry>();

export function computeBoard(
  layout: Layout,
  target: number,
  numPlayers: number,
): BoardGeometry {
  const key = `${layout}-${target}-${numPlayers}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const spec = LAYOUTS[layout];

  // Offscreen path element for analytic length sampling (no DOM mount needed).
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', spec.d);
  const total = path.getTotalLength();

  const off = (lane: number) => (lane - (numPlayers - 1) / 2) * LANE_GAP;

  const pegPos: PegPos = (score, lane) => {
    const len = Math.max(0, Math.min(total, (Math.min(score, target) / target) * total));
    const p = path.getPointAtLength(len);
    const q = path.getPointAtLength(Math.min(total, len + 1.5));
    let dx = q.x - p.x;
    let dy = q.y - p.y;
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const o = off(lane);
    return { x: p.x + -dy * o, y: p.y + dx * o };
  };

  const lanes: Lane[] = [];
  for (let lane = 0; lane < numPlayers; lane++) {
    const pts: string[] = [];
    const holes: Hole[] = [];
    for (let i = 0; i <= target; i++) {
      const P = pegPos(i, lane);
      pts.push(`${P.x.toFixed(1)},${P.y.toFixed(1)}`);
      holes.push({ x: P.x, y: P.y, fifth: i % 5 === 0 });
    }
    lanes.push({ guidePoints: pts.join(' '), holes });
  }

  const geometry: BoardGeometry = { spec, lanes, pegPos };
  cache.set(key, geometry);
  return geometry;
}
