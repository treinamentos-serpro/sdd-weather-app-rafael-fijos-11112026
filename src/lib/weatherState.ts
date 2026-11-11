import type { AsyncSection, CurrentConditions, ForecastDay } from '../types/weather';
import { isValidTimeZone } from './localDates';
import { getWeatherCondition } from './weatherCondition';

export function emptySection<T>(): AsyncSection<T> {
  return {
    status: 'idle',
    data: null,
    error: null,
    receivedAt: null,
    attemptId: null,
    previous: false,
  };
}

export function currentComplete(data: CurrentConditions): boolean {
  return (
    [data.temperatureC, data.apparentTemperatureC, data.minimumTodayC, data.maximumTodayC].every(
      (value) => value !== null,
    ) &&
    getWeatherCondition(data.conditionCode).label !== 'Condição indisponível' &&
    isValidTimeZone(data.timeZone) &&
    data.sourceTimestamp !== null &&
    Number.isFinite(Date.parse(data.sourceTimestamp))
  );
}

export function forecastComplete(data: ForecastDay[]): boolean {
  return (
    data.length === 5 &&
    data.every(
      (day) =>
        Object.values(day).every((value) => value !== null) &&
        getWeatherCondition(day.conditionCode).label !== 'Condição indisponível',
    )
  );
}
