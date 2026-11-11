import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockLocation } from '../../src/mocks/weather';
import { searchCities } from '../../src/services/geocodingService';
import { requestJSON } from '../../src/services/http';
import {
  PREFERENCES_KEY,
  readPreferences,
  savePreferences,
} from '../../src/services/preferencesStorage';
import { getCurrentWeather, getForecast } from '../../src/services/weatherService';

function respond(value: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(value), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  localStorage.clear();
});

describe('preferências tolerantes a falhas', () => {
  it('salva somente unidade e cidade explícita', () => {
    savePreferences({ schemaVersion: 1, unit: 'fahrenheit', lastExplicitLocation: mockLocation });
    expect(readPreferences().lastExplicitLocation).toEqual(mockLocation);
    expect(readPreferences().unit).toBe('fahrenheit');
    savePreferences({
      schemaVersion: 1,
      unit: 'celsius',
      lastExplicitLocation: { ...mockLocation, source: 'device' },
    });
    expect(readPreferences().lastExplicitLocation).toBeNull();
  });
  it.each([
    '{',
    '{}',
    '{"schemaVersion":2}',
    '{"schemaVersion":1,"unit":"kelvin","lastExplicitLocation":null}',
  ])('tolera %s', (raw) => {
    localStorage.setItem(PREFERENCES_KEY, raw);
    expect(readPreferences()).toEqual({
      schemaVersion: 1,
      unit: 'celsius',
      lastExplicitLocation: null,
    });
  });
  it('rejeita coordenadas inválidas e acesso indisponível', () => {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 1,
        unit: 'fahrenheit',
        lastExplicitLocation: { ...mockLocation, latitude: 91 },
      }),
    );
    expect(readPreferences().unit).toBe('celsius');
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readPreferences(storage).unit).toBe('celsius');
    expect(() => savePreferences(readPreferences(), storage)).not.toThrow();
    expect(readPreferences(null).lastExplicitLocation).toBeNull();
  });
});

describe('HTTP, geocoding e prazos', () => {
  it('normaliza, codifica e limita resultados válidos', async () => {
    const fetchMock = respond({
      results: [
        { id: 1, name: 'São Paulo', latitude: -23, longitude: -46 },
        { id: 2, name: 'Invalid', latitude: 99, longitude: 0 },
      ],
    });
    expect(await searchCities(' São   Paulo ')).toEqual([
      expect.objectContaining({ name: 'São Paulo', admin1: null, country: null }),
    ]);
    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.searchParams.get('name')).toBe('São Paulo');
    expect(url.searchParams.get('count')).toBe('5');
    expect(url.searchParams.get('language')).toBe('pt');
  });
  it('não envia consultas inválidas e diferencia vazio de resposta inválida', async () => {
    const fetchMock = respond({});
    expect(await searchCities('a')).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await searchCities('Recife')).toEqual([]);
    respond({ results: 'invalid' });
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'invalid' });
  });
  it.each([
    [429, 'rate-limit'],
    [500, 'http'],
  ])('distingue HTTP %s', async (status, kind) => {
    respond({}, Number(status));
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind });
  });
  it('distingue JSON inválido e falha de rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('invalid')));
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'invalid' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'network' });
  });
  it('encerra em oito segundos mesmo se o transporte ignorar abort', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    const request = expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'timeout' });
    await vi.advanceTimersByTimeAsync(8_000);
    await request;
  });
  it('cancela antes e durante a consulta', async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    const request = expect(
      requestJSON(new URL('https://example.test'), controller.signal),
    ).rejects.toMatchObject({ kind: 'cancelled' });
    controller.abort();
    await request;
    await expect(searchCities('Recife', controller.signal)).rejects.toMatchObject({
      kind: 'cancelled',
    });
  });
});

describe('contratos meteorológicos', () => {
  it('normaliza Fahrenheit e preserva origem não declarada', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T15:00:00Z'));
    const fetchMock = respond({
      timezone: 'America/Sao_Paulo',
      current: {
        temperature_2m: 77,
        apparent_temperature: null,
        weather_code: 2,
        time: Date.now() / 1000,
      },
      current_units: {
        temperature_2m: '°F',
        apparent_temperature: '°C',
        weather_code: 'wmo code',
        time: 'unixtime',
      },
      daily: { time: ['2026-11-11'], temperature_2m_min: [18], temperature_2m_max: [29] },
      daily_units: { temperature_2m_min: '°C', temperature_2m_max: '°C' },
    });
    expect(await getCurrentWeather(mockLocation)).toMatchObject({
      temperatureC: 25,
      apparentTemperatureC: null,
      minimumTodayC: 18,
      maximumTodayC: 29,
      origin: 'unclassified',
      sourceTimestamp: '2026-11-11T15:00:00.000Z',
    });
    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.searchParams.get('forecast_days')).toBe('1');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(url.searchParams.get('timeformat')).toBe('unixtime');
  });
  it('mantém campos ausentes, unidades desconhecidas e timestamp indisponíveis', async () => {
    respond({ current: { temperature_2m: 20 }, current_units: { temperature_2m: 'kelvin' } });
    expect(await getCurrentWeather(mockLocation)).toMatchObject({
      temperatureC: null,
      sourceTimestamp: null,
      timeZone: null,
    });
  });
  it('mantém cinco posições, agrega umidade e preserva lacunas', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T15:00:00Z'));
    respond({
      timezone: 'America/Sao_Paulo',
      daily: {
        time: ['2026-11-11', '2026-11-13'],
        temperature_2m_min: [18, 19],
        precipitation_sum: [0.4, 2],
        precipitation_probability_max: [80, 90],
        wind_speed_10m_max: [12, 14],
      },
      daily_units: {
        temperature_2m_min: '°C',
        precipitation_sum: 'mm',
        precipitation_probability_max: '%',
        wind_speed_10m_max: 'km/h',
      },
      hourly: {
        time: ['2026-11-11T10:00', '2026-11-11T11:00', '2026-11-11T12:00'],
        relative_humidity_2m: [60, null, 80],
      },
      hourly_units: { relative_humidity_2m: '%' },
    });
    const days = await getForecast(mockLocation);
    expect(days).toHaveLength(5);
    expect(days[0]).toMatchObject({
      localDate: '2026-11-11',
      minimumC: 18,
      meanHumidityPercent: 70,
      precipitationMm: 0.4,
      precipitationProbabilityPercent: 80,
      maximumWindKmh: 12,
    });
    expect(days[1]).toMatchObject({
      localDate: '2026-11-12',
      minimumC: null,
      meanHumidityPercent: null,
    });
    expect(days[2].minimumC).toBe(19);
  });
  it('rejeita previsão sem fuso e coordenadas inválidas', async () => {
    const fetchMock = respond({ timezone: 'invalid' });
    await expect(getForecast(mockLocation)).rejects.toMatchObject({ kind: 'invalid' });
    fetchMock.mockClear();
    await expect(getCurrentWeather({ ...mockLocation, longitude: 181 })).rejects.toMatchObject({
      kind: 'invalid',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
