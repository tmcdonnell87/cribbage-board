export type Phase = 'setup' | 'playing';
export type WinMode = 'first' | 'finish';
export type Target = 60 | 120;
export type Layout = 'mobile' | 'desktop';

export interface Player {
  name: string;
  color: string;
  score: number;
  prev: number; // trailing-peg position (leapfrog)
}

export interface Snapshot {
  pi: number;
  score: number;
  prev: number;
}

export interface Decided {
  idx: number;
  max: number;
  tie: boolean;
}

export interface Game {
  target: Target;
  winMode: WinMode;
  players: Player[]; // 2 or 3
  active: number; // index of selected player
  history: Snapshot[]; // undo stack (snapshot before each add)
  decided: Decided | null; // set by End hand / first-across win
}

export interface AppState {
  phase: Phase;
  game: Game | null;
  names?: string[]; // last-used player names, remembered across new games
}

/** Fixed, index-based player palette (spec Design Tokens). */
export const PLAYER_COLORS = ['#d1402c', '#2f6f8f', '#4f9a4a'] as const;

/** Default player names (overridable at setup). */
export const defaultPlayerName = (i: number): string => `Player ${i + 1}`;

/** Quick-add chip amounts (the dock buttons; +X opens the custom modal). */
export const CHIP_AMOUNTS = [1, 2, 3, 5, 10] as const;

/** Absolute presets offered inside the custom (+X) modal (each sets X). */
export const CUSTOM_QUICK = [1, 2, 3, 4, 5, 10, 15, 20, 25] as const;

/** Headroom past the target while finishing a hand (prototype = 60). */
export const FINISH_HEADROOM = 60;
