import { useEffect, useState } from 'preact/hooks';
import { HexColorPicker } from 'react-colorful';
import { Button, TwitterShareButton } from './button';
import { ColorSwatch } from './color-swatch';
import { deltaE2000, hex2rgb, rgb2lab } from './color-utils';
import { colors } from './colors';
import { GameStateContextProvider, useGameState } from './game-state';

export function App() {
  return (
    <GameStateContextProvider>
      <Game />
    </GameStateContextProvider>
  );
}

function Game() {
  const { state } = useGameState();
  const color = colors[state.colorIndex];

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('q', state.colorIndex.toString());
    history.replaceState({}, '', url);
  }, [state.colorIndex]);

  return (
    <div className="main">
      <h1 class="title">Guess the color: {color.name}</h1>
      {state.status === 'idle' && <QuestionForm />}
      {state.status === 'submitted' && <Result />}
    </div>
  );
}

function QuestionForm() {
  const { dispatch } = useGameState();
  const [guess, setGuess] = useState('#000000');

  return (
    <form
      id="answer"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: 'submit', payload: { guess } });
      }}
    >
      <HexColorPicker color={guess} onChange={(c) => setGuess(c)} />
      <ColorSwatch color={guess} />
      <Button type="submit">Submit guess</Button>
    </form>
  );
}

function Result() {
  const { state, dispatch } = useGameState();

  if (state.status !== 'submitted') return null;

  const color = colors[state.colorIndex];
  const distance = deltaE2000(rgb2lab(hex2rgb(color.hex)), rgb2lab(hex2rgb(state.guess)));
  const score = 100 - Math.min(distance, 100);
  const formattedScore = `${score.toFixed(2)}%`;

  return (
    <div>
      <p>
        Your score is <strong>{formattedScore}</strong>. {resultStr(distance)}
      </p>

      <h2>You chose:</h2>

      <ColorSwatch color={state.guess} />

      <h2>The answer was:</h2>

      <ColorSwatch color={color.hex} />

      <TwitterShareButton
        text={`I scored ${formattedScore} for the color: ${color.name}. Challenge me on ${window.location.href} #ColorGuessr`}
      >
        Share on Twitter
      </TwitterShareButton>

      <Button
        onClick={() => {
          dispatch({ type: 'next' });
        }}
      >
        Next question
      </Button>
    </div>
  );
}

function resultStr(distance: number): string {
  switch (true) {
    // TODO: 0
    case distance <= 1:
      return 'The difference is not perceptible by human eyes.';
    case distance <= 2:
      return 'The difference is perceptible through close observation.';
    case distance <= 10:
      return 'The difference is perceptible at a glance.';
    case distance <= 49:
      return 'Colors are more similar than opposite.';
    case distance >= 100:
      return 'Colors are exact opposite.';
    default:
      return 'Colors are not similar.';
  }
}
