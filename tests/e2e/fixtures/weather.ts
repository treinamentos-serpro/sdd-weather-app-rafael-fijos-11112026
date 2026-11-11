import { expect, type Page } from '@playwright/test';
import { getLocalDates } from '../../../src/lib/localDates';

export interface Scenario {
  geolocation?: 'denied' | 'granted' | 'timeout';
  search?: 'success' | 'empty' | 'error';
  currentError?: boolean;
  forecastError?: boolean;
  currentTimeout?: boolean;
  forecastTimeout?: boolean;
  partial?: boolean;
  capitalFailure?: boolean;
}

export function weatherResponse(forecast: boolean, partial = false) {
  const dates = getLocalDates('America/Recife');
  const selectedDates = partial && forecast ? dates.filter((_, index) => index !== 1) : dates;
  return {
    timezone: 'America/Recife',
    current: {
      time: Math.floor(Date.now() / 1000) - 60,
      temperature_2m: 24.5,
      apparent_temperature: partial ? null : 25.2,
      weather_code: 2,
    },
    current_units: {
      time: 'unixtime',
      temperature_2m: '°C',
      apparent_temperature: '°C',
      weather_code: 'wmo code',
    },
    daily: {
      time: selectedDates,
      weather_code: selectedDates.map(() => 2),
      temperature_2m_min: selectedDates.map(() => 18.1),
      temperature_2m_max: selectedDates.map(() => 27.3),
      precipitation_sum: selectedDates.map(() => 0.4),
      precipitation_probability_max: selectedDates.map(() => 80),
      wind_speed_10m_max: selectedDates.map(() => 16),
    },
    daily_units: {
      weather_code: 'wmo code',
      temperature_2m_min: '°C',
      temperature_2m_max: '°C',
      precipitation_sum: 'mm',
      precipitation_probability_max: '%',
      wind_speed_10m_max: 'km/h',
    },
    hourly: {
      time: selectedDates.flatMap((date) => [`${date}T10:00`, `${date}T11:00`]),
      relative_humidity_2m: selectedDates.flatMap(() => [60, 80]),
    },
    hourly_units: { relative_humidity_2m: '%' },
  };
}

export async function installWeatherRoutes(page: Page, scenario: Scenario = {}) {
  await page.addInitScript(
    ({ geolocation }) => {
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        value: { query: async () => ({ state: geolocation === 'denied' ? 'denied' : 'granted' }) },
      });
      Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: {
          getCurrentPosition: (success: PositionCallback, error: PositionErrorCallback) => {
            const deliver = () =>
              success({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition);
            if (geolocation === 'granted') deliver();
            else if (geolocation === 'denied') error({ code: 1 } as GeolocationPositionError);
            else window.addEventListener('test-geolocation', deliver, { once: true });
          },
        },
      });
    },
    { geolocation: scenario.geolocation ?? 'denied' },
  );
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', (route) => {
    if (scenario.search === 'error') return route.fulfill({ status: 429, json: { error: true } });
    const name = new URL(route.request().url()).searchParams.get('name') ?? 'Recife';
    return route.fulfill({
      json: {
        results:
          scenario.search === 'empty'
            ? []
            : [
                {
                  id: 1,
                  name,
                  admin1: 'Pernambuco',
                  country: 'Brasil',
                  latitude: -8,
                  longitude: -34.9,
                },
                {
                  id: 2,
                  name,
                  admin1: 'Outra região',
                  country: 'Brasil',
                  latitude: -8.1,
                  longitude: -35,
                },
              ],
      },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast**', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const forecast = params.has('hourly');
    if ((forecast && scenario.forecastTimeout) || (!forecast && scenario.currentTimeout)) return;
    if (
      (forecast && scenario.forecastError) ||
      (!forecast && scenario.currentError) ||
      (scenario.capitalFailure && params.get('latitude') === '35.68')
    ) {
      return route.fulfill({ status: 429, json: { error: true } });
    }
    return route.fulfill({ json: weatherResponse(forecast, scenario.partial) });
  });
}

export async function selectCity(page: Page, name = 'Recife') {
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill(name);
  await page.getByRole('button', { name: `${name}, Pernambuco, Brasil`, exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: `Localidade selecionada: ${name}` }),
  ).toBeVisible();
}

export const savedCity = {
  id: 'geo-1',
  name: 'Recife',
  admin1: 'Pernambuco',
  country: 'Brasil',
  latitude: -8,
  longitude: -34.9,
  source: 'geocoding',
};
