import { useEffect, useMemo, useState } from 'preact/hooks';
import { HexColorPicker } from 'react-colorful';
import { Button, TwitterShareButton } from './button';
import { ColorSwatch } from './color-swatch';
import { deltaE2000, hex2rgb, rgb2lab } from './color-utils';
import { colors } from './colors';
import { randomInt } from './utils';

export function App() {
  const { color, nextQuestion } = useQuestion();
  const [guess, setGuess] = useState('#000000');
  const [submitted, setSubmitted] = useState(false);
  const distance = deltaE2000(rgb2lab(hex2rgb(color.hex)), rgb2lab(hex2rgb(guess)));
  const score = 100 - Math.min(distance, 100);
  const formattedScore = `${score.toFixed(2)}%`;

  return (
    <div className="main">
      <h1 class="title">Guess the color: {color.name}</h1>
      {!submitted && (
        <form
          id="answer"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <HexColorPicker color={guess} onChange={(c) => setGuess(c)} />

          <ColorSwatch color={guess} />

          <Button type="submit">Submit guess</Button>
        </form>
      )}
      {submitted && (
        <div>
          <p>
            Your score is <strong>{formattedScore}</strong>. {resultStr(distance)}
          </p>

          <h2>You chose:</h2>

          <ColorSwatch color={guess} />

          <h2>The answer was:</h2>

          <ColorSwatch color={color.hex} />

          <TwitterShareButton
            text={`I scored ${formattedScore} for the color: ${color.name}. Challenge me on ${window.location.href} #ColorGuessr`}
          >
            Share on Twitter
          </TwitterShareButton>

          <Button
            onClick={() => {
              setSubmitted(false);
              setGuess('#000000');
              nextQuestion();
            }}
          >
            Next question
          </Button>
        </div>
      )}
    </div>
  );
}

function useQuestion() {
  const [initialColorIndex] = useState(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');

    if (!q) return undefined;

    const parsed = Number.parseInt(q, 10);
    return !Number.isNaN(parsed) ? parsed : undefined;
  });
  const { color, colorIndex, nextColor } = useRandomColor(initialColorIndex);

  function nextQuestion() {
    const index = nextColor();
    const url = new URL(window.location.href);
    url.searchParams.set('q', index.toString());
    history.pushState({}, '', url);
  }

  useEffect(() => {
    if (initialColorIndex != null) return;

    const url = new URL(window.location.href);
    url.searchParams.set('q', colorIndex.toString());
    history.pushState({}, '', url);
  }, []);

  return { color, nextQuestion };
}

function useRandomColor(initialColorIndex?: number): {
  color: { hex: string; name: string };
  colorIndex: number;
  nextColor: () => number;
} {
  const getRandomColorIndex = () => randomInt(0, colors.length);
  const [colorIndex, setColorIndex] = useState(() => initialColorIndex ?? getRandomColorIndex());
  const nextColor = () => {
    const index = getRandomColorIndex();
    setColorIndex(index);
    return index;
  };
  const [hex, name] = colors[colorIndex];

  return useMemo(() => ({ color: { hex, name }, colorIndex, nextColor }), [colorIndex]);
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
