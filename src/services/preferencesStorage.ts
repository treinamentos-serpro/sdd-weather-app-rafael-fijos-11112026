import { isLocation } from '../lib/location';
import type { SavedPreferences } from '../types/preferences';

export const PREFERENCES_KEY = 'weather-app.preferences';
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function readPreferences(storage?: PreferenceStorage | null): SavedPreferences {
  const fallback: SavedPreferences = {
    schemaVersion: 1,
    unit: 'celsius',
    lastExplicitLocation: null,
  };
  try {
    const raw = (storage === undefined ? window.localStorage : storage)?.getItem(PREFERENCES_KEY);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return fallback;
    const saved = value as Record<string, unknown>;
    if (saved.schemaVersion !== 1 || !['celsius', 'fahrenheit'].includes(String(saved.unit)))
      return fallback;
    if (
      saved.lastExplicitLocation !== null &&
      (!isLocation(saved.lastExplicitLocation) || saved.lastExplicitLocation.source === 'device')
    )
      return fallback;
    return {
      schemaVersion: 1,
      unit: saved.unit as SavedPreferences['unit'],
      lastExplicitLocation: saved.lastExplicitLocation,
    };
  } catch {
    return fallback;
  }
}

export function savePreferences(
  preferences: SavedPreferences,
  storage?: PreferenceStorage | null,
): void {
  try {
    const location = preferences.lastExplicitLocation;
    const lastExplicitLocation =
      location && isLocation(location) && location.source !== 'device'
        ? {
            id: location.id,
            name: location.name,
            admin1: location.admin1,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
            source: location.source,
          }
        : null;
    (storage === undefined ? window.localStorage : storage)?.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 1,
        unit: preferences.unit,
        lastExplicitLocation,
      }),
    );
  } catch {
    return;
  }
}
