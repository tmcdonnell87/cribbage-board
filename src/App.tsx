import { useEffect, useReducer } from 'react';
import { gameReducer, initialState } from './game/reducer';
import { load, save } from './game/storage';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Layout } from './types';
import SetupScreen from './components/SetupScreen';
import Header from './components/Header';
import StatusBanner from './components/StatusBanner';
import ControlDock from './components/ControlDock';
import Board from './board/Board';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => load() ?? init);

  // Persist on every change so an in-progress game survives a refresh.
  useEffect(() => {
    save(state);
  }, [state]);

  const isWide = useMediaQuery('(min-width: 760px)');
  const layout: Layout = isWide ? 'desktop' : 'mobile';

  if (state.phase === 'setup' || !state.game) {
    return (
      <SetupScreen
        initialNames={state.names}
        onStart={({ target, count, winMode, names }) =>
          dispatch({ type: 'NEW_GAME', target, count, winMode, names })
        }
      />
    );
  }

  const game = state.game;

  return (
    <div className={`app app-${layout}`}>
      <Header onNewGame={() => dispatch({ type: 'RESET' })} />

      <StatusBanner
        game={game}
        onEndHand={() => dispatch({ type: 'END_HAND' })}
        onPlayOn={() => dispatch({ type: 'PLAY_ON' })}
        onNewGame={() => dispatch({ type: 'RESET' })}
      />

      <div className="board-frame">
        <div className="board-felt">
          <Board game={game} layout={layout} />
        </div>
      </div>

      <ControlDock
        game={game}
        onSelect={(pi) => dispatch({ type: 'SET_ACTIVE', pi })}
        onAdd={(amount) => dispatch({ type: 'ADD_TO', pi: game.active, amount })}
        onUndo={() => dispatch({ type: 'UNDO' })}
      />
    </div>
  );
}
