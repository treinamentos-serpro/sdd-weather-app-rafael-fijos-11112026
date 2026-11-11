import { useEffect, useRef, useState } from 'react';
import { currentComplete, emptySection, forecastComplete } from '../lib/weatherState';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import type { Location } from '../types/location';
import type { AsyncSection, CurrentConditions, ForecastDay } from '../types/weather';

interface WeatherState {
  location: Location | null;
  current: AsyncSection<CurrentConditions>;
  forecast: AsyncSection<ForecastDay[]>;
}

export default function useWeatherQueries() {
  const [state, setState] = useState<WeatherState>({
    location: null,
    current: emptySection(),
    forecast: emptySection(),
  });
  const generation = useRef(0);
  const activeLocation = useRef<Location | null>(null);
  const stop = useRef<() => void>(() => {});
  useEffect(
    () => () => {
      generation.current++;
      stop.current();
    },
    [],
  );

  function select(location: Location) {
    const attempt = ++generation.current;
    stop.current();
    activeLocation.current = location;
    const controller = new AbortController();
    let pending = 2;
    const timer = setTimeout(() => {
      if (generation.current !== attempt) return;
      generation.current++;
      controller.abort();
      setState((previous) => {
        const expired = <T>(section: AsyncSection<T>): AsyncSection<T> =>
          section.status === 'loading'
            ? {
                ...section,
                status: 'error',
                error: 'A consulta excedeu oito segundos. Tente novamente.',
              }
            : section;
        return {
          ...previous,
          current: expired(previous.current),
          forecast: expired(previous.forecast),
        };
      });
    }, 8_000);
    stop.current = () => {
      clearTimeout(timer);
      controller.abort();
    };
    setState((previous) => {
      const start = <T>(section: AsyncSection<T>): AsyncSection<T> => ({
        ...section,
        status: 'loading',
        error: null,
        attemptId: attempt,
        previous: section.data !== null,
      });
      const sameLocation = previous.location?.id === location.id;
      return {
        location,
        current: start(sameLocation ? previous.current : emptySection()),
        forecast: start(sameLocation ? previous.forecast : emptySection()),
      };
    });

    function load<T>(
      key: 'current' | 'forecast',
      request: Promise<T>,
      complete: (data: T) => boolean,
    ) {
      request
        .then((data) => {
          if (attempt !== generation.current) return;
          const section: AsyncSection<T> = {
            data,
            status: complete(data) ? 'success' : 'partial',
            error: null,
            receivedAt: Date.now(),
            attemptId: attempt,
            previous: false,
          };
          setState((previous) =>
            attempt === generation.current ? { ...previous, [key]: section } : previous,
          );
        })
        .catch((error: unknown) => {
          if (attempt !== generation.current) return;
          setState((previous) =>
            attempt === generation.current
              ? {
                  ...previous,
                  [key]: {
                    ...previous[key],
                    status: 'error',
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Não foi possível atualizar os dados.',
                  },
                }
              : previous,
          );
        })
        .finally(() => {
          if (--pending === 0) clearTimeout(timer);
        });
    }
    load('current', getCurrentWeather(location, controller.signal), currentComplete);
    load('forecast', getForecast(location, controller.signal), forecastComplete);
  }

  return {
    ...state,
    select,
    retry: () => {
      if (activeLocation.current) select(activeLocation.current);
    },
  };
}
