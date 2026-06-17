# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a **greenfield repo** — there is no application code or build tooling yet, and no
commits. The repo currently contains only a **design handoff bundle** under
`design_handoff_cribbage_counter/` (and the `Virtual Cribbage Board.zip` it was extracted
from). The first substantive task is to scaffold and build the app from that spec.

**`design_handoff_cribbage_counter/README.md` is the authoritative spec.** It defines product
rules, exact board geometry, design tokens, state model, and remaining work. Read it before
writing any code; reproduce its colors, typography, spacing, and geometry precisely
(it is explicitly high-fidelity).

## What we're building

A **Virtual Cribbage Board** — a *scoring counter*, not a card game. The app never deals or
scores cards; players tap chips to peg points manually. Target is an **installable, offline
PWA** (mobile-first, also works on desktop). Recommended stack per the handoff:
**React + Vite + service worker + web manifest**. The board is drawn as an **SVG**; the rest
is ordinary flexbox/grid.

## The design files (reference only — do not copy verbatim)

The `.dc.html` files are streaming "Design Component" prototypes that depend on a proprietary
`.dc.html` runtime (`support.js`, not included) and will not run standalone. Treat them as
visual/behavioral references to *recreate* in real code, not as production source.

- `Cribbage Counter - Mobile.dc.html` — **primary**: mobile counter, vertical serpentine
  board, finish-the-hand flow, chip grid. (Prototype renders two phones, 60 & 120, side by
  side for comparison.)
- `Cribbage Counter.dc.html` — desktop counter, horizontal serpentine.
- `Cribbage Board - Directions.dc.html` — four board-treatment explorations (context only).
  The chosen direction is the **classic peg board** with packed parallel lanes curving around
  the bends.
- `ios-frame.jsx` — prototype-only iPhone bezel for presentation. **Not product code — ignore
  it.** The real PWA renders full-bleed.

## Core architecture (when building)

**Single-screen app.** Layout top→bottom: header bar → conditional status banner → **board
(`flex:1`, the focal point, max vertical space)** → control dock (player selector pills +
quick-add chip grid).

**Game state** (local only; persist to `localStorage` and rehydrate on load):
```
game = {
  target,                            // 60 (once around) | 120 (twice around)
  players: [{ name, color, score, prev }],  // 2 or 3; prev = trailing/leapfrog peg
  active,                            // selected player index
  history: [{ pi, score, prev }],    // single-level-undo snapshot stack
  decided: null | { idx, max, tie }, // set by End hand
}
```
Transitions: `setActive`, `addTo` (push snapshot, `prev=score`, clamp score to
`target + headroom`), `undo` (pop/restore), `endHand` (compute max → `decided`), `playOn`
(`decided=null`, scores untouched).

**Two win modes (support both):**
- *First across* — first to reach target wins immediately.
- *Finish the hand* (house rule) — crossing target does NOT end the game; keep counting past
  target (122 beats 121) so true totals compare, but the **peg parks visually at the final
  hole**. When ≥1 player is across, show the "Finish the hand" banner with **End hand**;
  highest total wins. Ties: show "Tied at N — keep pegging," keep scores, **Play on**.

**The board is the heart of the product.** It is a single continuous serpentine centerline;
each player is a parallel lane offset perpendicular to it, so lanes curve concentrically
around bends (no jump gaps). Score→peg mapping uses `pointAtLength` along the centerline with
a `min(score, target)` clamp and a `(laneIndex - (n-1)/2) * 15px` perpendicular offset. Exact
viewBoxes, path `d` strings, bend radii, hole/peg sizes, and label placement are specified in
the README's **"Board geometry"** section — copy those numbers exactly for both mobile
(vertical, `0 0 340 510`) and desktop (horizontal, `0 0 920 470`).

## Scope boundaries

- **In scope:** manual pegging, 2–3 players, 60/120 length, both win modes, single-level undo,
  localStorage persistence, PWA packaging.
- **Out of scope** (do not build): history log, skunk detection, sound/haptics, theme toggle.
- **Remaining work to ship** (per README §"Remaining work"): collapse the comparison view to a
  single game with a **setup screen** (length + player count); **start scores at 0** (remove
  demo seeds); PWA packaging (manifest, icons, service worker); localStorage persistence;
  First-across mode toggle.

## Commands

The app is a React + Vite + TypeScript PWA (`vite-plugin-pwa` for the service worker/manifest).

- `npm install` — install dependencies.
- `npm run dev` — start the Vite dev server (http://localhost:5173).
- `npm run build` — typecheck (`tsc --noEmit`) then production build to `dist/` (also emits the
  service worker + `manifest.webmanifest`).
- `npm run preview` — serve the production build (use to verify the installable/offline PWA).
- `npm run typecheck` — strict TypeScript check, no emit.

PWA icons are generated from `public/peg-icon.svg` via
`npx @vite-pwa/assets-generator --preset minimal-2023 public/peg-icon.svg` (regenerate if the
source SVG changes).

### Code map
- `src/types.ts` — state model + shared constants (player palette, chip amounts, headroom).
- `src/game/reducer.ts` — `gameReducer` + actions (`NEW_GAME`/`SET_ACTIVE`/`ADD_TO`/`UNDO`/
  `END_HAND`/`PLAY_ON`/`RESET`); `src/game/storage.ts` — localStorage persistence.
- `src/board/geometry.ts` — serpentine path `d` strings, viewBoxes, and `computeBoard()` (peg
  positioning via `getPointAtLength` + perpendicular lane offset); `src/board/Board.tsx` — SVG.
- `src/components/` — `SetupScreen`, `Header`, `StatusBanner`, `PlayerSelector`, `ChipGrid`,
  `ControlDock`; `src/App.tsx` — shell (setup vs counter, responsive mobile/desktop).
