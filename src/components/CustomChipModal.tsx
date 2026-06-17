import { useEffect, useState } from 'react';
import { CUSTOM_QUICK } from '../types';

interface CustomChipModalProps {
  playerName: string;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}

const MIN = 1;
const MAX = 121;

export default function CustomChipModal({ playerName, onConfirm, onClose }: CustomChipModalProps) {
  const [x, setX] = useState(2);

  const clampX = (n: number) => Math.max(MIN, Math.min(MAX, n));
  const step = (delta: number) => setX((v) => clampX(v + delta));

  // Close on Escape, confirm on Enter — desktop niceties.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Enter') onConfirm(x);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [x, onClose, onConfirm]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Add custom points to ${playerName}`}
      onClick={onClose}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          Add to <strong>{playerName}</strong>
        </div>

        <div className="stepper">
          <button
            type="button"
            className="stepper-btn"
            aria-label="Decrease"
            onClick={() => step(-1)}
            disabled={x <= MIN}
          >
            −
          </button>
          <span className="stepper-value" aria-live="polite">
            {x}
          </span>
          <button
            type="button"
            className="stepper-btn"
            aria-label="Increase"
            onClick={() => step(1)}
            disabled={x >= MAX}
          >
            +
          </button>
        </div>

        <div className="quick-grid">
          {CUSTOM_QUICK.map((n) => (
            <button
              type="button"
              key={n}
              className={`quick-chip${n === x ? ' is-active' : ''}`}
              onClick={() => setX(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="quick-chip quick-add"
            aria-label="Add 5"
            onClick={() => step(5)}
          >
            +5
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" className="modal-btn modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="modal-btn modal-confirm" onClick={() => onConfirm(x)}>
            Add +{x}
          </button>
        </div>
      </div>
    </div>
  );
}
