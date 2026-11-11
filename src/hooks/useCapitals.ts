import { useEffect, useState } from 'react';
import { capitals } from '../lib/capitals';
import { currentComplete, emptySection } from '../lib/weatherState';
import { getCurrentWeather } from '../services/weatherService';
import type { AsyncSection, CurrentConditions } from '../types/weather';

export default function useCapitals(enabled: boolean) {
  const [sections, setSections] = useState<Record<string, AsyncSection<CurrentConditions>>>({});
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const controller = new AbortController();
    setSections(
      Object.fromEntries(
        capitals.map((city) => [
          city.id,
          { ...emptySection<CurrentConditions>(), status: 'loading' },
        ]),
      ),
    );
    for (const city of capitals) {
      getCurrentWeather(city, controller.signal)
        .then((data) => {
          if (active)
            setSections((previous) => ({
              ...previous,
              [city.id]: {
                data,
                status: currentComplete(data) ? 'success' : 'partial',
                receivedAt: Date.now(),
                error: null,
                attemptId: 1,
              },
            }));
        })
        .catch(() => {
          if (active)
            setSections((previous) => ({
              ...previous,
              [city.id]: { ...emptySection(), status: 'unavailable', error: 'Indisponível' },
            }));
        });
    }
    return () => {
      active = false;
      controller.abort();
    };
  }, [enabled]);
  return sections;
}
