import { CloudDrizzle } from 'lucide-react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCondition';
import type { TemperatureUnit } from '../types/preferences';
import type { ForecastDay } from '../types/weather';

interface ForecastGridProps {
  forecast: ForecastDay[];
  unit: TemperatureUnit;
}

function formatForecastDate(localDate: string): string {
  const date = new Date(`${localDate}T12:00:00Z`);
  if (!Number.isFinite(date.getTime())) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

function formatProbability(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Indisponível';
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}

export default function ForecastGrid({ forecast, unit }: ForecastGridProps) {
  return (
    <section aria-labelledby="forecast-heading" className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-white" id="forecast-heading">
        Previsão de 5 dias
      </h2>
      <ul
        aria-label="Previsão para os próximos cinco dias"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {forecast.slice(0, 5).map((day) => {
          const dateLabel = formatForecastDate(day.localDate);
          const { label, Icon } = getWeatherCondition(day.conditionCode);

          return (
            <li
              className="min-w-0 border border-white/10 bg-white/5 p-4 backdrop-blur-md"
              key={day.localDate}
            >
              <h3 className="text-sm font-semibold capitalize text-white">{dateLabel}</h3>
              <Icon aria-hidden="true" className="my-4 h-9 w-9 text-sun" strokeWidth={1.5} />
              <p className="min-h-10 text-sm text-white/70">{label}</p>
              <p className="mt-3 text-sm font-medium text-white">
                Máx {formatTemperature(day.maximumC, unit)}
              </p>
              <p className="text-sm text-white/70">Mín {formatTemperature(day.minimumC, unit)}</p>
              <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <CloudDrizzle aria-hidden="true" className="h-4 w-4 shrink-0 text-accent-400" />
                <span>Prob. de chuva {formatProbability(day.precipitationProbabilityPercent)}</span>
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
