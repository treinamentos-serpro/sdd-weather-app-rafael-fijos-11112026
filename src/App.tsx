import { useEffect, useRef } from 'react';
import CapitalList from './components/CapitalList';
import CurrentWeather from './components/CurrentWeather';
import ForecastGrid from './components/ForecastGrid';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import SourceAttribution from './components/SourceAttribution';
import EmptyState from './components/states/EmptyState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import WeatherSection from './components/WeatherSection';
import useWeatherApp from './hooks/useWeatherApp';
import type { Location } from './types/location';

export default function App() {
  const app = useWeatherApp();
  const content = useRef<HTMLElement>(null);
  const focusPending = useRef(false);
  useEffect(() => {
    if (
      !focusPending.current ||
      app.current.status === 'loading' ||
      app.forecast.status === 'loading'
    )
      return;
    focusPending.current = false;
    if (
      document.activeElement === document.body ||
      (document.activeElement && content.current?.contains(document.activeElement))
    )
      content.current?.focus();
  }, [app.current.status, app.forecast.status]);

  function select(location: Location) {
    focusPending.current = true;
    app.selectLocation(location);
  }
  function retry() {
    focusPending.current = true;
    app.retry();
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <main>
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Weather App</h1>
          <UnitToggle onUnitChange={app.setUnit} unit={app.unit} />
        </header>
        <SearchBar
          errorMessage={app.citySearch.message ?? undefined}
          onSearch={app.citySearch.search}
          onReset={app.citySearch.reset}
          onRetry={app.citySearch.retry}
          status={app.citySearch.status}
        />
        <SearchResults results={app.citySearch.results} onSelect={select} />
        <section
          aria-label="Conteúdo meteorológico"
          className="mt-8 outline-offset-4"
          ref={content}
          tabIndex={-1}
        >
          {!app.location &&
            (app.locationStatus === 'checking' ? (
              <LoadingState message="Obtendo sua localização..." />
            ) : (
              <>
                <EmptyState message="Busque uma cidade para consultar o clima." />
                <CapitalList sections={app.capitalWeather} unit={app.unit} onSelect={select} />
              </>
            ))}
          {app.location && (
            <>
              <p className="mb-4 text-sm text-white/80" role="status">
                Localidade selecionada: {app.location.name}
              </p>
              <WeatherSection label="Clima atual" section={app.current} onRetry={retry}>
                <CurrentWeather
                  conditions={app.current.data}
                  location={app.location}
                  unit={app.unit}
                  receivedAt={app.current.receivedAt}
                  previous={app.current.previous}
                />
              </WeatherSection>
              <WeatherSection label="Previsão diária" section={app.forecast} onRetry={retry}>
                <ForecastGrid forecast={app.forecast.data ?? []} unit={app.unit} />
              </WeatherSection>
            </>
          )}
        </section>
      </main>
      <SourceAttribution />
    </div>
  );
}
