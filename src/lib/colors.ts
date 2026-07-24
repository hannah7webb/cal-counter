export interface ColorSwatch {
  id: string;
  label: string;
  bg: string;
  border: string;
  dot: string;
}

export const COLOR_PALETTE: ColorSwatch[] = [
  { id: 'rose', label: 'Rose', bg: '#fff1f2', border: '#fda4af', dot: '#fb7185' },
  { id: 'orange', label: 'Orange', bg: '#fff7ed', border: '#fdba74', dot: '#fb923c' },
  { id: 'amber', label: 'Amber', bg: '#fffbeb', border: '#fcd34d', dot: '#fbbf24' },
  { id: 'green', label: 'Green', bg: '#f0fdf4', border: '#86efac', dot: '#4ade80' },
  { id: 'teal', label: 'Teal', bg: '#f0fdfa', border: '#5eead4', dot: '#2dd4bf' },
  { id: 'sky', label: 'Sky', bg: '#f0f9ff', border: '#7dd3fc', dot: '#38bdf8' },
  { id: 'indigo', label: 'Indigo', bg: '#eef2ff', border: '#a5b4fc', dot: '#818cf8' },
  { id: 'purple', label: 'Purple', bg: '#fdf4ff', border: '#f0abfc', dot: '#e879f9' },
  { id: 'brown', label: 'Brown', bg: '#fbf5ee', border: '#d3b08c', dot: '#a3703f' },
];

const DEFAULT_SWATCH = COLOR_PALETTE[6];

export function getSwatch(id: string): ColorSwatch {
  return COLOR_PALETTE.find((c) => c.id === id) ?? DEFAULT_SWATCH;
}
