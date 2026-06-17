import { Game } from '../types';

interface HeaderProps {
  game: Game;
  onNewGame: () => void;
}

export default function Header({ game, onNewGame }: HeaderProps) {
  return (
    <header className="header">
      <span className="wordmark">Cribbage</span>
      <div className="header-right">
        <span className="status-pill">
          to {game.target} · {game.players.length}p
        </span>
        <button type="button" className="ghost-btn" onClick={onNewGame}>
          New game
        </button>
      </div>
    </header>
  );
}
