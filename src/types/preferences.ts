import type { Location } from './location';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface SavedPreferences {
  schemaVersion: 1;
  unit: TemperatureUnit;
  lastExplicitLocation: Location | null;
}
