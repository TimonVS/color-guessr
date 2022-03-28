import { useState } from 'preact/hooks';
import { HexColorPicker } from 'react-colorful';
import { Button, TwitterShareButton } from './button';
import { ColorSwatch } from './color-swatch';
import { deltaE2000, hex2rgb, rgb2lab } from './color-utils';
import { colors } from './colors';
import { randomInt } from './utils';

export function App() {
  const [colorHex, colorName, randomizeColor] = useRandomColor();
  const [guess, setGuess] = useState('#000000');
  const [submitted, setSubmitted] = useState(false);
  const distance = deltaE2000(rgb2lab(hex2rgb(colorHex)), rgb2lab(hex2rgb(guess)));
  const score = 100 - Math.min(distance, 100);
  const formattedScore = `${score.toFixed(2)}%`;

  return (
    <div className="main">
      <h1 class="title">Guess the color: {colorName}</h1>
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
            Your score is <strong>{formattedScore}</strong>. {resultStr(distance)}.
          </p>

          <h2>You chose:</h2>

          <ColorSwatch color={guess} />

          <h2>The answer was:</h2>

          <ColorSwatch color={colorHex} />

          <TwitterShareButton
            text={`I scored ${formattedScore} for the color: ${colorName} on https://colorguessr.pages.dev #ColorGuessr`}
            onClick={() => {
              setSubmitted(false);
              setGuess('#000000');
              randomizeColor();
            }}
          >
            Share on Twitter
          </TwitterShareButton>

          <Button
            onClick={() => {
              setSubmitted(false);
              setGuess('#000000');
              randomizeColor();
            }}
          >
            Next question
          </Button>
        </div>
      )}
    </div>
  );
}

function useRandomColor(): [colorHex: string, colorName: string, randomizeColor: () => void] {
  const getRandomColor = () => colors[randomInt(0, colors.length)];
  const [color, setColor] = useState(getRandomColor());
  const randomizeColor = () => setColor(getRandomColor());

  return [...color, randomizeColor];
}

function resultStr(distance: number): string {
  switch (true) {
    case distance <= 1:
      return 'The difference is not perceptible by human eyes';
    case distance <= 2:
      return 'The difference is perceptible through close observation';
    case distance <= 10:
      return 'The difference is perceptible at a glance';
    case distance <= 49:
      return 'Colors are more similar than opposite';
    case distance >= 100:
      return 'Colors are exact opposite';
    default:
      return 'Colors are not similar';
  }
}
