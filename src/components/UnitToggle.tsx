import type { TemperatureUnit } from '../types/preferences';

interface UnitToggleProps {
  unit: TemperatureUnit;
  onUnitChange: (unit: TemperatureUnit) => void;
}

export default function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/15 bg-night-800 p-1"
      role="group"
    >
      {(['celsius', 'fahrenheit'] as const).map((option) => (
        <button
          aria-label={option === 'celsius' ? 'Celsius' : 'Fahrenheit'}
          aria-pressed={unit === option}
          className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${unit === option ? 'bg-accent-500 text-night-900' : 'text-white hover:bg-white/10'}`}
          key={option}
          onClick={() => onUnitChange(option)}
          type="button"
        >
          {option === 'celsius' ? 'Celsius' : 'Fahrenheit'}
        </button>
      ))}
    </div>
  );
}
