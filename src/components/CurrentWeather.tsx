import { Droplets, Sun, Umbrella, Wind } from 'lucide-react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCondition';
import type { Location } from '../types/location';
import type { TemperatureUnit } from '../types/preferences';
import type { CurrentConditions } from '../types/weather';

interface CurrentWeatherProps {
  location: Location;
  conditions: CurrentConditions | null;
  unit: TemperatureUnit;
  metrics?: {
    humidityPercent: number | null;
    windKmh: number | null;
    precipitationMm: number | null;
    uvIndex: number | null;
  };
}

function formatMetric(value: number | null | undefined, suffix: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Indisponível'
    : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

export default function CurrentWeather({
  location,
  conditions,
  unit,
  metrics,
}: CurrentWeatherProps) {
  const { label, Icon } = getWeatherCondition(conditions?.conditionCode ?? null);
  const measurements = [
    { name: 'Umidade', value: formatMetric(metrics?.humidityPercent, '%'), Icon: Droplets },
    { name: 'Vento', value: formatMetric(metrics?.windKmh, ' km/h'), Icon: Wind },
    { name: 'Precipitação', value: formatMetric(metrics?.precipitationMm, ' mm'), Icon: Umbrella },
    { name: 'Índice UV', value: formatMetric(metrics?.uvIndex, ''), Icon: Sun },
  ];

  return (
    <section
      aria-labelledby="weather-location"
      className="border-y border-white/15 bg-white/5 px-4 py-8 backdrop-blur-md sm:px-8"
    >
      <h2 className="text-2xl font-semibold sm:text-3xl" id="weather-location">
        {location.name}
      </h2>
      <p className="mt-1 text-sm text-white/70">
        {[location.admin1, location.country].filter(Boolean).join(', ')}
      </p>
      <div className="my-8 flex flex-wrap items-center gap-6 sm:gap-10">
        <Icon
          aria-hidden="true"
          className="h-24 w-24 shrink-0 text-sun sm:h-32 sm:w-32"
          strokeWidth={1.25}
        />
        <div className="min-w-0">
          <p
            className={
              conditions?.temperatureC == null ? 'text-2xl' : 'text-7xl font-semibold sm:text-8xl'
            }
          >
            {formatTemperature(conditions?.temperatureC ?? null, unit)}
          </p>
          <p className="mt-3 text-lg text-white/90">{label}</p>
          <p className="mt-2 text-sm text-white/70">
            Sensação térmica: {formatTemperature(conditions?.apparentTemperatureC ?? null, unit)}
          </p>
        </div>
      </div>
      <p className="mb-6 text-sm text-white/80">
        Mínima: {formatTemperature(conditions?.minimumTodayC ?? null, unit)} · Máxima:{' '}
        {formatTemperature(conditions?.maximumTodayC ?? null, unit)}
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 border-t border-white/15 pt-6 sm:grid-cols-4">
        {measurements.map(({ name, value, Icon: MetricIcon }) => (
          <div className="min-w-0" key={name}>
            <dt className="flex items-center gap-2 text-sm text-white/70">
              <MetricIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {name}
            </dt>
            <dd className="mt-2 break-words text-base font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
