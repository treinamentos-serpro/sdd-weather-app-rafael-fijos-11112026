import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature } from '../../src/lib/temperature';

describe('temperatura', () => {
  it('converte Celsius sem arredondar o valor de domínio', () => {
    expect(convertTemperature(24.5, 'fahrenheit')).toBe(76.1);
    expect(convertTemperature(24.5, 'celsius')).toBe(24.5);
  });

  it.each<[number, string]>([
    [0.5, '1°C'],
    [-0.5, '-1°C'],
    [-1.5, '-2°C'],
    [-0.1, '0°C'],
  ])('arredonda %s sem empate em direção a zero', (value, expected) => {
    expect(formatTemperature(value, 'celsius')).toBe(expected);
  });

  it('não acumula arredondamento ao alternar unidades', () => {
    for (let iteration = 0; iteration < 10; iteration += 1) {
      expect(formatTemperature(24.5, 'fahrenheit')).toBe('76°F');
      expect(formatTemperature(24.5, 'celsius')).toBe('25°C');
    }
  });

  it.each([null, Number.NaN, Number.POSITIVE_INFINITY])('trata %s como indisponível', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Indisponível');
  });
});
