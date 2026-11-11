import { capitals } from '../lib/capitals';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCondition';
import type { Location } from '../types/location';
import type { TemperatureUnit } from '../types/preferences';
import type { AsyncSection, CurrentConditions } from '../types/weather';

interface CapitalListProps {
  sections: Record<string, AsyncSection<CurrentConditions>>;
  unit: TemperatureUnit;
  onSelect: (location: Location) => void;
}

export default function CapitalList({ sections, unit, onSelect }: CapitalListProps) {
  return (
    <section aria-labelledby="capitals-heading" className="mt-8">
      <h2 className="mb-4 text-xl font-semibold" id="capitals-heading">
        Capitais
      </h2>
      <ul aria-label="Capitais" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {capitals.map((city) => {
          const section = sections[city.id];
          const conditions = section?.data;
          const { Icon, label } = getWeatherCondition(conditions?.conditionCode ?? null);
          return (
            <li className="min-w-0" key={city.id}>
              <button
                className="h-full min-h-36 w-full rounded-lg border border-white/15 bg-white/5 p-4 text-left backdrop-blur-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => onSelect(city)}
                type="button"
              >
                <span className="block break-words font-semibold">{city.name}</span>
                <span className="mt-1 block break-words text-sm text-white/70">{city.country}</span>
                {conditions ? (
                  <span className="mt-4 block text-sm">
                    <Icon aria-hidden="true" className="mb-2 size-7 text-sun" />
                    <span className="block break-words">{label}</span>
                    <span className="mt-1 block">
                      {formatTemperature(conditions.temperatureC, unit)}
                    </span>
                  </span>
                ) : (
                  <span className="mt-4 block text-sm text-white/80">
                    {section?.status === 'unavailable' ? 'Indisponível' : 'Carregando...'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
