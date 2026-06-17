import { Game } from '../types';

interface StatusBannerProps {
  game: Game;
  onEndHand: () => void;
  onPlayOn: () => void;
  onNewGame: () => void;
}

/**
 * Conditional banner beneath the header. Mirrors the prototype's derivation:
 * - finish mode + ≥1 crosser + undecided → amber "Finish the hand" + End hand
 * - decided + tie → green "Tied" + Play on
 * - decided + winner → green "{name} wins" + Play on (finish) / New game (first)
 * Returns null when there is nothing to show.
 */
export default function StatusBanner({ game, onEndHand, onPlayOn, onNewGame }: StatusBannerProps) {
  const { players, target, decided, winMode } = game;

  if (decided) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    if (decided.tie) {
      return (
        <div className="banner banner-result" role="status">
          <div className="banner-text">
            <div className="banner-title">Tied at {decided.max}</div>
            <div className="banner-body">Two players at {decided.max} — keep pegging to settle it.</div>
          </div>
          <button type="button" className="banner-btn banner-btn-ghost" onClick={onPlayOn}>
            Play on
          </button>
        </div>
      );
    }
    const winner = players[decided.idx];
    const second = sorted.find((p) => p !== winner);
    return (
      <div className="banner banner-result" role="status">
        <div className="banner-text">
          <div className="banner-title">{winner.name} wins</div>
          <div className="banner-body">
            {decided.max} to {second ? second.score : 0} · highest score takes it.
          </div>
        </div>
        {winMode === 'finish' ? (
          <button type="button" className="banner-btn banner-btn-ghost" onClick={onPlayOn}>
            Play on
          </button>
        ) : (
          <button type="button" className="banner-btn banner-btn-ghost" onClick={onNewGame}>
            New game
          </button>
        )}
      </div>
    );
  }

  // Undecided: only finish-the-hand shows the "play it out" prompt.
  if (winMode === 'finish') {
    const crossers = players.filter((p) => p.score >= target);
    if (crossers.length > 0) {
      const names = crossers.map((p) => p.name);
      const who =
        crossers.length > 1
          ? `${names.join(' & ')} are both past ${target}`
          : `${names[0]} is past ${target}`;
      return (
        <div className="banner banner-finish" role="status">
          <div className="banner-text">
            <div className="banner-title">Finish the hand</div>
            <div className="banner-body">{who} — play out the hand, then end it.</div>
          </div>
          <button type="button" className="banner-btn banner-btn-amber" onClick={onEndHand}>
            End hand
          </button>
        </div>
      );
    }
  }

  return null;
}
