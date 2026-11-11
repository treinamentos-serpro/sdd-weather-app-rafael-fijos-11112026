export type WeatherOrigin = 'model' | 'observation' | 'unclassified';

export interface CurrentConditions {
  temperatureC: number | null;
  apparentTemperatureC: number | null;
  minimumTodayC: number | null;
  maximumTodayC: number | null;
  conditionCode: number | null;
  sourceTimestamp: string | null;
  timeZone: string | null;
  origin: WeatherOrigin;
}

export interface ForecastDay {
  localDate: string;
  conditionCode: number | null;
  minimumC: number | null;
  maximumC: number | null;
  precipitationMm: number | null;
  precipitationProbabilityPercent: number | null;
  meanHumidityPercent: number | null;
  maximumWindKmh: number | null;
}

export interface WeatherSnapshot {
  locationId: string;
  current: CurrentConditions | null;
  currentReceivedAt: number | null;
  forecast: ForecastDay[];
  forecastReceivedAt: number | null;
}

export type AsyncStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'partial'
  | 'unavailable';

export interface AsyncSection<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  receivedAt: number | null;
  attemptId: number | null;
}
