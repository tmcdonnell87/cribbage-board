import { CHIP_AMOUNTS } from '../types';

interface ChipGridProps {
  activeName: string;
  canUndo: boolean;
  onAdd: (amount: number) => void;
  onUndo: () => void;
}

export default function ChipGrid({ activeName, canUndo, onAdd, onUndo }: ChipGridProps) {
  return (
    <div className="chip-section">
      <div className="chip-label-row">
        <span className="label-caps">Add to {activeName}</span>
        <span className="chip-hint">tap to combine · e.g. 4 + 1</span>
      </div>
      <div className="chip-grid">
        {CHIP_AMOUNTS.map((amt) => (
          <button
            type="button"
            key={amt}
            className={`chip${amt === 1 ? ' chip-primary' : ''}`}
            onClick={() => onAdd(amt)}
          >
            +{amt}
          </button>
        ))}
        <button
          type="button"
          className="chip chip-undo"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last point"
        >
          ↩
        </button>
      </div>
    </div>
  );
}
