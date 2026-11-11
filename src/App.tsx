import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastGrid from './components/ForecastGrid';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import { mockLocation, mockWeatherSnapshot } from './mocks/weather';
import type { TemperatureUnit } from './types/preferences';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [searchAttempted, setSearchAttempted] = useState(false);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Weather App</h1>
        <UnitToggle onUnitChange={setUnit} unit={unit} />
      </header>
      <SearchBar
        errorMessage="A busca de cidades ainda não está conectada ao serviço. Os dados de exemplo permanecem abaixo."
        onSearch={() => setSearchAttempted(true)}
        status={searchAttempted ? 'error' : 'idle'}
      />
      <p className="mb-4 mt-8 text-sm text-amber-200" role="status">
        Dados de demonstração — não representam condições em tempo real.
      </p>
      <CurrentWeather
        conditions={mockWeatherSnapshot.current}
        location={mockLocation}
        unit={unit}
      />
      <ForecastGrid forecast={mockWeatherSnapshot.forecast} unit={unit} />
      <footer className="mt-10 border-t border-white/10 pt-5 text-sm text-white/60">
        Integração e atribuição da fonte meteorológica pendentes de validação.
      </footer>
    </main>
  );
}
