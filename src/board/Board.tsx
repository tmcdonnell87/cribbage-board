import { useMemo } from 'react';
import { Game, Layout } from '../types';
import { computeBoard } from './geometry';

interface BoardProps {
  game: Game;
  layout: Layout;
}

/**
 * The serpentine peg board. A single continuous centerline; each player is a
 * parallel lane offset perpendicular to it, so lanes curve concentrically
 * around the bends. Drawn back-to-front: guides + holes → trailing pegs →
 * leader ring → front pegs → labels.
 */
export default function Board({ game, layout }: BoardProps) {
  const { players, target } = game;
  const numPlayers = players.length;

  const { spec, lanes, pegPos } = useMemo(
    () => computeBoard(layout, target, numPlayers),
    [layout, target, numPlayers],
  );

  // Leader = highest current score (first one wins ties for the ring).
  let leaderIdx = 0;
  players.forEach((p, i) => {
    if (p.score > players[leaderIdx].score) leaderIdx = i;
  });
  const lead = pegPos(players[leaderIdx].score, leaderIdx);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1px',
  };

  return (
    <svg
      viewBox={spec.viewBox}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', overflow: 'visible' }}
      role="img"
      aria-label={`Cribbage board to ${target}. ${players
        .map((p) => `${p.name} ${p.score}`)
        .join(', ')}.`}
    >
      {/* Static lane guides + drilled holes */}
      {lanes.map((lane, li) => (
        <g key={`lane-${li}`}>
          <polyline
            points={lane.guidePoints}
            fill="none"
            stroke="rgba(74,48,22,0.15)"
            strokeWidth={spec.guideStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {lane.holes.map((hole, hi) => (
            <circle
              key={`h-${li}-${hi}`}
              cx={hole.x}
              cy={hole.y}
              r={hole.fifth ? spec.holeFifthR : spec.holeR}
              fill={hole.fifth ? 'rgba(54,34,14,0.6)' : 'rgba(60,38,16,0.4)'}
            />
          ))}
        </g>
      ))}

      {/* Trailing (previous-score) pegs */}
      {players.map((pl, lane) => {
        const b = pegPos(pl.prev, lane);
        return (
          <circle key={`bp-${lane}`} cx={b.x} cy={b.y} r={spec.trailR} fill={pl.color} opacity={0.38} />
        );
      })}

      {/* Leader ring */}
      <circle cx={lead.x} cy={lead.y} r={spec.ringR} fill="none" stroke="#d6a43a" strokeWidth={2} />

      {/* Front (current-score) pegs with shadow + brass highlight */}
      {players.map((pl, lane) => {
        const f = pegPos(pl.score, lane);
        return (
          <g key={`fp-${lane}`}>
            <circle cx={f.x} cy={f.y + 1.5} r={spec.pegR} fill="rgba(40,20,0,0.33)" />
            <circle cx={f.x} cy={f.y} r={spec.pegR} fill={pl.color} />
            <circle cx={f.x - 1.8} cy={f.y - 2} r={2} fill="rgba(255,255,255,0.62)" />
          </g>
        );
      })}

      {/* Labels */}
      <text x={spec.start.x} y={spec.start.y} fill="#a0855c" textAnchor={spec.startAnchor} style={labelStyle}>
        START
      </text>
      <text x={spec.win.x} y={spec.win.y} fill="#9a6a2e" textAnchor={spec.winAnchor} style={labelStyle}>
        WIN {target + 1}
      </text>
    </svg>
  );
}
