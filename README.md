# Virtual Cribbage Board

An installable, offline PWA **cribbage scoring counter** — not a card game. The app never
deals or scores cards; players tap chips to peg points manually on a classic wood-and-brass
serpentine board.

- **Players:** 2 or 3
- **Game length:** 60 (once around) or 120 (twice around)
- **Win modes:** First across, or Finish the hand (house rule)

## Status

Greenfield — not yet scaffolded. Build tooling, `dev`/`build`/`test` commands, and PWA
packaging are still to be set up.

## Stack (planned)

React + Vite, with a service worker and web manifest for offline/installable PWA. The board
is drawn as SVG; the rest is flexbox/grid.
