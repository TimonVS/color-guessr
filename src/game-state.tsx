import { ComponentChildren, createContext } from 'preact';
import { useContext, useReducer, useState } from 'preact/hooks';
import { colors } from './colors';
import { randomInt } from './utils';

type GameState = IdleState | SubmittedState;

type Action = SubmitAction | NextAction;

interface BaseState {
  colorIndex: number;
  previousColorIndices: number[];
}

interface IdleState extends BaseState {
  status: 'idle';
}

interface SubmittedState extends BaseState {
  status: 'submitted';
  guess: string;
}

interface SubmitAction {
  type: 'submit';
  payload: { guess: string };
}

interface NextAction {
  type: 'next';
}

type TGameStateContext = { state: GameState; dispatch: (action: Action) => void } | null;

const GameStateContext = createContext<TGameStateContext>(null);

export function useGameState(): Exclude<TGameStateContext, null> {
  const context = useContext(GameStateContext);

  if (context == null) {
    throw new Error('Cannot use useGameState without GameStateContextProvider');
  }

  return context;
}

export function GameStateContextProvider(props: { children: ComponentChildren }) {
  const [initialColorIndex] = useState(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const randomColorIndex = randomInt(0, colors.length);

    if (!q) return randomColorIndex;

    const parsed = Number.parseInt(q, 10);
    return !Number.isNaN(parsed) ? parsed : randomColorIndex;
  });

  const [state, dispatch] = useReducer<GameState, Action, number>(
    (state, action) => {
      switch (action.type) {
        case 'submit':
          return {
            ...state,
            status: 'submitted',
            guess: action.payload.guess,
            previousColorIndices: [...state.previousColorIndices, state.colorIndex],
          };
        case 'next':
          return { ...state, status: 'idle', colorIndex: randomInt(0, colors.length) };
        default:
          console.error(`Unrecognized action: ${action['type']}`);
          return state;
      }
    },
    initialColorIndex,
    initGameState
  );

  return <GameStateContext.Provider value={{ state, dispatch }} {...props} />;
}

function initGameState(initialColorIndex: number): GameState {
  return { status: 'idle', colorIndex: initialColorIndex, previousColorIndices: [] };
}
