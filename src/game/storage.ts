import { AppState } from '../types';

const KEY = 'cribbage-counter-v1';

export function load(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    // Minimal shape guard — a malformed payload falls back to setup.
    if (parsed && parsed.phase === 'playing' && parsed.game?.players?.length) {
      return parsed;
    }
    if (parsed && parsed.phase === 'setup') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function save(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode write failures.
  }
}
