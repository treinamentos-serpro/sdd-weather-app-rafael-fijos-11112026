import { getLocalDates, isValidTimeZone, localDateAt } from '../lib/localDates';
import { validCoordinates } from '../lib/location';
import type { Location } from '../types/location';
import type { CurrentConditions, ForecastDay } from '../types/weather';
import { numberOrNull, record, requestJSON, ServiceError } from './http';

function weatherURL(location: Location, forecast: boolean): URL {
  if (!validCoordinates(location.latitude, location.longitude)) throw new ServiceError('invalid');
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    timeformat: 'unixtime',
    forecast_days: forecast ? '5' : '1',
    ...(forecast
      ? {
          daily:
            'weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
          hourly: 'relative_humidity_2m',
        }
      : {
          current: 'temperature_2m,apparent_temperature,weather_code',
          daily: 'temperature_2m_min,temperature_2m_max',
        }),
  }).toString();
  return url;
}

function dateKey(value: unknown, timeZone: string): string | null {
  if (typeof value === 'number' && Number.isFinite(value))
    return localDateAt(timeZone, value * 1000);
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T|$)/.test(value)
    ? value.slice(0, 10)
    : null;
}

function entry(section: Record<string, unknown>, key: string, index: number): unknown {
  return Array.isArray(section[key]) && index >= 0 ? section[key][index] : null;
}

function temperature(value: unknown, unit: unknown): number | null {
  const number = numberOrNull(value);
  if (number === null) return null;
  return unit === '°C' ? number : unit === '°F' ? ((number - 32) * 5) / 9 : null;
}

function metric(
  value: unknown,
  unit: unknown,
  expected: string,
  maximum = Infinity,
): number | null {
  const number = numberOrNull(value);
  return number !== null && unit === expected && number >= 0 && number <= maximum ? number : null;
}

export async function getCurrentWeather(
  location: Location,
  signal?: AbortSignal,
): Promise<CurrentConditions> {
  const data = await requestJSON(weatherURL(location, false), signal);
  const current = record(data.current);
  const units = record(data.current_units);
  const daily = record(data.daily);
  const dailyUnits = record(data.daily_units);
  const timeZone = isValidTimeZone(data.timezone) ? data.timezone : null;
  const today = timeZone ? localDateAt(timeZone, Date.now()) : null;
  const index =
    Array.isArray(daily.time) && timeZone
      ? daily.time.findIndex((date) => dateKey(date, timeZone) === today)
      : -1;
  const epoch = numberOrNull(current.time);
  const sourceTimestamp =
    epoch !== null && units.time === 'unixtime' && Math.abs(epoch * 1000) <= 8.64e15
      ? new Date(epoch * 1000).toISOString()
      : null;
  return {
    temperatureC: temperature(current.temperature_2m, units.temperature_2m),
    apparentTemperatureC: temperature(current.apparent_temperature, units.apparent_temperature),
    minimumTodayC: temperature(
      entry(daily, 'temperature_2m_min', index),
      dailyUnits.temperature_2m_min,
    ),
    maximumTodayC: temperature(
      entry(daily, 'temperature_2m_max', index),
      dailyUnits.temperature_2m_max,
    ),
    conditionCode: units.weather_code === 'wmo code' ? numberOrNull(current.weather_code) : null,
    sourceTimestamp,
    timeZone,
    origin: 'unclassified',
  };
}

export async function getForecast(
  location: Location,
  signal?: AbortSignal,
): Promise<ForecastDay[]> {
  const data = await requestJSON(weatherURL(location, true), signal);
  if (!isValidTimeZone(data.timezone)) throw new ServiceError('invalid');
  const timeZone = data.timezone;
  const daily = record(data.daily);
  const units = record(data.daily_units);
  const hourly = record(data.hourly);
  const hourlyUnits = record(data.hourly_units);
  return getLocalDates(timeZone).map((localDate) => {
    const index = Array.isArray(daily.time)
      ? daily.time.findIndex((date) => dateKey(date, timeZone) === localDate)
      : -1;
    const humidity: number[] = [];
    if (index >= 0 && Array.isArray(hourly.time)) {
      hourly.time.forEach((time, hourIndex) => {
        const value = metric(
          entry(hourly, 'relative_humidity_2m', hourIndex),
          hourlyUnits.relative_humidity_2m,
          '%',
          100,
        );
        if (dateKey(time, timeZone) === localDate && value !== null) humidity.push(value);
      });
    }
    return {
      localDate,
      conditionCode:
        units.weather_code === 'wmo code'
          ? numberOrNull(entry(daily, 'weather_code', index))
          : null,
      minimumC: temperature(entry(daily, 'temperature_2m_min', index), units.temperature_2m_min),
      maximumC: temperature(entry(daily, 'temperature_2m_max', index), units.temperature_2m_max),
      precipitationMm: metric(
        entry(daily, 'precipitation_sum', index),
        units.precipitation_sum,
        'mm',
      ),
      precipitationProbabilityPercent: metric(
        entry(daily, 'precipitation_probability_max', index),
        units.precipitation_probability_max,
        '%',
        100,
      ),
      maximumWindKmh: metric(
        entry(daily, 'wind_speed_10m_max', index),
        units.wind_speed_10m_max,
        'km/h',
      ),
      meanHumidityPercent: humidity.length
        ? humidity.reduce((sum, value) => sum + value, 0) / humidity.length
        : null,
    };
  });
}
