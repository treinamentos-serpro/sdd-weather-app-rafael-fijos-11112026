import { describe, expect, it } from 'vitest';
import { mockLocation, mockWeatherSnapshot } from '../../src/mocks/weather';

describe('fixture de clima', () => {
  it('associa o snapshot à localidade e oferece cinco datas locais consecutivas', () => {
    expect(mockWeatherSnapshot.locationId).toBe(mockLocation.id);
    expect(mockWeatherSnapshot.current.timeZone).toBe('America/Sao_Paulo');

    const localDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: mockWeatherSnapshot.current.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(mockWeatherSnapshot.currentReceivedAt);
    const start = Date.parse(`${localDate}T00:00:00Z`);
    const expectedDates = Array.from({ length: 5 }, (_, offset) =>
      new Date(start + offset * 86_400_000).toISOString().slice(0, 10),
    );

    expect(mockWeatherSnapshot.forecast.map((day) => day.localDate)).toEqual(expectedDates);
  });
});
