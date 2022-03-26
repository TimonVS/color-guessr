export type RGB = [r: number, g: number, b: number];
export type XYZ = [x: number, y: number, z: number];
export type LAB = [l: number, a: number, b: number];

/** d65 standard illuminant in XYZ */
const d65 = [95.05, 100, 108.9] as const;

export function hex2rgb(hex: string): RGB {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Source: http://www.easyrgb.com/en/math.php
export function rgb2xyz(rgb: RGB): XYZ {
  let r = rgb[0] / 255;
  let g = rgb[1] / 255;
  let b = rgb[2] / 255;

  if (r > 0.04045) r = Math.pow((r + 0.055) / 1.055, 2.4);
  else r = r / 12.92;
  if (g > 0.04045) g = Math.pow((g + 0.055) / 1.055, 2.4);
  else g = g / 12.92;
  if (b > 0.04045) b = Math.pow((b + 0.055) / 1.055, 2.4);
  else b = b / 12.92;

  r = r * 100;
  g = g * 100;
  b = b * 100;

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  return [x, y, z];
}

// Source: http://www.easyrgb.com/en/math.php
export function xyz2lab(xyz: XYZ): LAB {
  let x = xyz[0] / d65[0];
  let y = xyz[1] / d65[1];
  let z = xyz[2] / d65[2];

  if (x > 0.008856) x = Math.pow(x, 1 / 3);
  else x = 7.787 * x + 16 / 116;
  if (y > 0.008856) y = Math.pow(y, 1 / 3);
  else y = 7.787 * y + 16 / 116;
  if (z > 0.008856) z = Math.pow(z, 1 / 3);
  else z = 7.787 * z + 16 / 116;

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return [l, a, b];
}

export function rgb2lab(rgb: RGB): LAB {
  return xyz2lab(rgb2xyz(rgb));
}

// Source: https://github.com/antimatter15/rgb-lab/blob/master/color.js
export function deltaE(labA: LAB, labB: LAB): number {
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / 1.0;
  var deltaCkcsc = deltaC / sc;
  var deltaHkhsh = deltaH / sh;
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}
