import { useRef, useState } from 'react';
import { readPreferences, savePreferences } from '../services/preferencesStorage';
import type { Location } from '../types/location';
import type { SavedPreferences, TemperatureUnit } from '../types/preferences';
import useCapitals from './useCapitals';
import useCitySearch from './useCitySearch';
import useGeolocation from './useGeolocation';
import useWeatherQueries from './useWeatherQueries';

export default function useWeatherApp() {
  const [preferences, setPreferences] = useState(readPreferences);
  const preferencesRef = useRef(preferences);
  const weather = useWeatherQueries();
  const citySearch = useCitySearch();
  const geolocation = useGeolocation((location) => {
    const selected = location ?? preferencesRef.current.lastExplicitLocation;
    if (selected) weather.select(selected);
  });
  const capitalWeather = useCapitals(!weather.location && geolocation.status !== 'checking');

  function persist(next: SavedPreferences) {
    preferencesRef.current = next;
    setPreferences(next);
    savePreferences(next);
  }

  function selectLocation(location: Location) {
    geolocation.cancel();
    citySearch.reset();
    if (location.source !== 'device')
      persist({ ...preferencesRef.current, lastExplicitLocation: location });
    weather.select(location);
  }

  function setUnit(unit: TemperatureUnit) {
    persist({ ...preferencesRef.current, unit });
  }

  return {
    ...weather,
    citySearch,
    selectLocation,
    unit: preferences.unit,
    setUnit,
    locationStatus: geolocation.status,
    capitalWeather,
  };
}
