import { Game } from '../types';

interface PlayerSelectorProps {
  game: Game;
  onSelect: (pi: number) => void;
}

export default function PlayerSelector({ game, onSelect }: PlayerSelectorProps) {
  const { players, active, target } = game;

  return (
    <div className="player-selector">
      {players.map((p, i) => {
        const isActive = i === active;
        return (
          <button
            type="button"
            key={i}
            className={`player-pill${isActive ? ' is-active' : ''}`}
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
          >
            <span className="player-pill-head">
              <span className="player-dot" style={{ background: p.color }} />
              <span className="player-name">{p.name}</span>
            </span>
            <span className={`player-score${p.score >= target ? ' is-over' : ''}`}>{p.score}</span>
          </button>
        );
      })}
    </div>
  );
}
