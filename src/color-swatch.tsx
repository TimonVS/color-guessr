export function ColorSwatch({ color, ...props }: { color: string; class?: string }) {
  return (
    <div class="color-swatch" {...props}>
      <div class="swatch" style={{ background: color }} />
      <span class="swatch-label">{color}</span>
    </div>
  );
}
