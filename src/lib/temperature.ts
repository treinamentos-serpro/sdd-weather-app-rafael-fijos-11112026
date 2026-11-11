import type { TemperatureUnit } from '../types/preferences';

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatTemperature(celsius: number | null, unit: TemperatureUnit): string {
  if (celsius === null || !Number.isFinite(celsius)) return 'Indisponível';

  const converted = convertTemperature(celsius, unit);
  const rounded = Math.sign(converted) * Math.round(Math.abs(converted));
  return `${new Intl.NumberFormat('pt-BR').format(rounded === 0 ? 0 : rounded)}°${unit === 'celsius' ? 'C' : 'F'}`;
}
