import {
  AppState,
  Game,
  Player,
  Target,
  WinMode,
  PLAYER_COLORS,
  defaultPlayerName,
  FINISH_HEADROOM,
} from '../types';

export type Action =
  | { type: 'NEW_GAME'; target: Target; count: number; winMode: WinMode; names: string[] }
  | { type: 'SET_ACTIVE'; pi: number }
  | { type: 'ADD_TO'; pi: number; amount: number }
  | { type: 'UNDO' }
  | { type: 'END_HAND' }
  | { type: 'PLAY_ON' }
  | { type: 'RESET' };

export const initialState: AppState = { phase: 'setup', game: null };

const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

/** Highest total; ties flagged. Mirrors the prototype's endHand scan. */
function computeDecided(players: Player[]) {
  let max = -1;
  let idx = -1;
  let tie = false;
  players.forEach((p, i) => {
    if (p.score > max) {
      max = p.score;
      idx = i;
      tie = false;
    } else if (p.score === max) {
      tie = true;
    }
  });
  return { idx, max, tie };
}

function newGame(target: Target, count: number, winMode: WinMode, names: string[]): Game {
  const players: Player[] = Array.from({ length: count }, (_, i) => ({
    name: (names[i] ?? '').trim() || defaultPlayerName(i),
    color: PLAYER_COLORS[i],
    score: 0,
    prev: 0,
  }));
  return { target, winMode, players, active: 0, history: [], decided: null };
}

export function gameReducer(state: AppState, action: Action): AppState {
  if (action.type === 'NEW_GAME') {
    return {
      phase: 'playing',
      game: newGame(action.target, action.count, action.winMode, action.names),
    };
  }
  if (action.type === 'RESET') {
    return initialState;
  }

  const game = state.game;
  if (!game) return state;

  switch (action.type) {
    case 'SET_ACTIVE': {
      if (action.pi < 0 || action.pi >= game.players.length) return state;
      return { ...state, game: { ...game, active: action.pi } };
    }

    case 'ADD_TO': {
      // First-across is settled once decided — ignore further pegging so the
      // winner can't flip (Undo still reopens the game).
      if (game.winMode === 'first' && game.decided) return state;

      const players = game.players.map((p) => ({ ...p }));
      const p = players[action.pi];
      if (!p) return state;
      const snap = { pi: action.pi, score: p.score, prev: p.prev };
      const ceiling = game.winMode === 'finish' ? game.target + FINISH_HEADROOM : game.target;
      p.prev = p.score;
      p.score = clamp(p.score + action.amount, 0, ceiling);

      // First-across: the first player to reach the target wins immediately and locks in.
      let decided = game.decided;
      if (game.winMode === 'first' && p.score >= game.target) {
        decided = { idx: action.pi, max: p.score, tie: false };
      }

      return {
        ...state,
        game: { ...game, players, history: [...game.history, snap], decided },
      };
    }

    case 'UNDO': {
      if (!game.history.length) return state;
      const history = game.history.slice();
      const snap = history.pop()!;
      const players = game.players.map((p) => ({ ...p }));
      players[snap.pi].score = snap.score;
      players[snap.pi].prev = snap.prev;
      // Undoing a peg can un-win the game.
      return { ...state, game: { ...game, players, history, decided: null } };
    }

    case 'END_HAND': {
      return { ...state, game: { ...game, decided: computeDecided(game.players) } };
    }

    case 'PLAY_ON': {
      return { ...state, game: { ...game, decided: null } };
    }

    default:
      return state;
  }
}
