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

export function deltaE2000([l1, a1, b1]: LAB, [l2, a2, b2]: LAB) {
  const avgL = (l1 + l2) / 2;
  const c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
  const c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
  const avgC = (c1 + c2) / 2;
  const g = (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) / 2;

  const a1p = a1 * (1 + g);
  const a2p = a2 * (1 + g);

  const c1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
  const c2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));

  const avgCp = (c1p + c2p) / 2;

  let h1p = rad2deg(Math.atan2(b1, a1p));
  if (h1p < 0) {
    h1p = h1p + 360;
  }

  let h2p = rad2deg(Math.atan2(b2, a2p));
  if (h2p < 0) {
    h2p = h2p + 360;
  }

  const avghp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;

  const t =
    1 -
    0.17 * Math.cos(deg2rad(avghp - 30)) +
    0.24 * Math.cos(deg2rad(2 * avghp)) +
    0.32 * Math.cos(deg2rad(3 * avghp + 6)) -
    0.2 * Math.cos(deg2rad(4 * avghp - 63));

  let deltahp = h2p - h1p;
  if (Math.abs(deltahp) > 180) {
    if (h2p <= h1p) {
      deltahp += 360;
    } else {
      deltahp -= 360;
    }
  }

  const deltalp = l2 - l1;
  const deltacp = c2p - c1p;

  deltahp = 2 * Math.sqrt(c1p * c2p) * Math.sin(deg2rad(deltahp) / 2);

  const sl = 1 + (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;

  const deltaro = 30 * Math.exp(-Math.pow((avghp - 275) / 25, 2));
  const rc = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const rt = -rc * Math.sin(2 * deg2rad(deltaro));

  const kl = 1;
  const kc = 1;
  const kh = 1;

  const deltaE = Math.sqrt(
    Math.pow(deltalp / (kl * sl), 2) +
      Math.pow(deltacp / (kc * sc), 2) +
      Math.pow(deltahp / (kh * sh), 2) +
      rt * (deltacp / (kc * sc)) * (deltahp / (kh * sh))
  );

  return deltaE;
}

function rad2deg(rad: number) {
  return (360 * rad) / (2 * Math.PI);
}

function deg2rad(deg: number) {
  return (2 * Math.PI * deg) / 360;
}
