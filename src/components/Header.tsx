interface HeaderProps {
  onNewGame: () => void;
}

export default function Header({ onNewGame }: HeaderProps) {
  return (
    <header className="header">
      <span className="wordmark">Cribbage</span>
      <div className="header-right">
        <button type="button" className="ghost-btn" onClick={onNewGame}>
          New game
        </button>
      </div>
    </header>
  );
}
