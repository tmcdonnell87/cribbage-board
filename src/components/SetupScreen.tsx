import { useState } from 'react';
import { Target, WinMode, SetupConfig, PLAYER_COLORS, defaultPlayerName } from '../types';

interface SetupScreenProps {
  onStart: (config: SetupConfig) => void;
  initial?: SetupConfig;
}

const WIN_HINT: Record<WinMode, string> = {
  first: 'First player to reach the target wins immediately.',
  finish: 'Cross the target, then play out the hand — highest total wins.',
};

interface SegmentedProps<T extends string | number> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string | number>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          type="button"
          key={String(opt.value)}
          className={`seg-pill${opt.value === value ? ' is-active' : ''}`}
          aria-pressed={opt.value === value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SetupScreen({ onStart, initial }: SetupScreenProps) {
  const [target, setTarget] = useState<Target>(initial?.target ?? 120);
  const [count, setCount] = useState(initial?.count ?? 2);
  const [winMode, setWinMode] = useState<WinMode>(initial?.winMode ?? 'first');
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: 3 }, (_, i) => initial?.names[i] ?? defaultPlayerName(i)),
  );

  const setName = (i: number, value: string) =>
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));

  const start = () => {
    const trimmed = names.map((n, i) => n.trim() || defaultPlayerName(i));
    onStart({ target, count, winMode, names: trimmed });
  };

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <div className="setup-header">
          <span className="wordmark">Cribbage</span>
          <span className="setup-subtitle">New game</span>
        </div>

        <div className="setup-section">
          <span className="label-caps">Length</span>
          <Segmented<Target>
            value={target}
            onChange={setTarget}
            options={[
              { value: 60, label: '60 · once around' },
              { value: 120, label: '120 · twice around' },
            ]}
          />
        </div>

        <div className="setup-section">
          <span className="label-caps">Players</span>
          <Segmented<number>
            value={count}
            onChange={setCount}
            options={[
              { value: 2, label: '2' },
              { value: 3, label: '3' },
            ]}
          />
        </div>

        <div className="setup-section">
          <span className="label-caps">Win rule</span>
          <Segmented<WinMode>
            value={winMode}
            onChange={setWinMode}
            options={[
              { value: 'first', label: 'First across' },
              { value: 'finish', label: 'Finish the hand' },
            ]}
          />
          <span className="setup-hint">{WIN_HINT[winMode]}</span>
        </div>

        <div className="setup-section">
          <span className="label-caps">Names</span>
          <div className="name-list">
            {Array.from({ length: count }, (_, i) => (
              <div className="name-row" key={i}>
                <span className="player-dot" style={{ background: PLAYER_COLORS[i] }} />
                <input
                  className="name-input"
                  type="text"
                  value={names[i]}
                  maxLength={16}
                  placeholder={defaultPlayerName(i)}
                  aria-label={`Player ${i + 1} name`}
                  onChange={(e) => setName(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="button" className="start-btn" onClick={start}>
          Start game
        </button>
      </div>
    </div>
  );
}
