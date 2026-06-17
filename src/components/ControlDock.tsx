import { Game } from '../types';
import PlayerSelector from './PlayerSelector';
import ChipGrid from './ChipGrid';

interface ControlDockProps {
  game: Game;
  onSelect: (pi: number) => void;
  onAdd: (amount: number) => void;
  onUndo: () => void;
}

export default function ControlDock({ game, onSelect, onAdd, onUndo }: ControlDockProps) {
  const activeName = game.players[game.active]?.name ?? '';
  return (
    <div className="control-dock">
      <PlayerSelector game={game} onSelect={onSelect} />
      <ChipGrid
        activeName={activeName}
        canUndo={game.history.length > 0}
        onAdd={onAdd}
        onUndo={onUndo}
      />
    </div>
  );
}
