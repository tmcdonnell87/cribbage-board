import { useState } from 'react';
import { CHIP_AMOUNTS } from '../types';
import CustomChipModal from './CustomChipModal';

interface ChipGridProps {
  activeName: string;
  canUndo: boolean;
  onAdd: (amount: number) => void;
  onUndo: () => void;
}

export default function ChipGrid({ activeName, canUndo, onAdd, onUndo }: ChipGridProps) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="chip-section">
      <div className="chip-label-row">
        <span className="label-caps">Add to {activeName}</span>
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
          className="chip chip-x"
          onClick={() => setShowCustom(true)}
          aria-haspopup="dialog"
          aria-label="Add a custom amount"
        >
          +X
        </button>
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

      {showCustom && (
        <CustomChipModal
          playerName={activeName}
          onConfirm={(amt) => {
            onAdd(amt);
            setShowCustom(false);
          }}
          onClose={() => setShowCustom(false)}
        />
      )}
    </div>
  );
}
