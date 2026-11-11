import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { validCoordinates } from '../lib/location';
import type { Location } from '../types/location';

type LocationStatus = 'checking' | 'success' | 'denied' | 'unavailable' | 'timeout' | 'idle';

export default function useGeolocation(onResolve: (location: Location | null) => void) {
  const [status, setStatus] = useState<LocationStatus>('checking');
  const resolve = useEffectEvent(onResolve);
  const cancelRef = useRef<() => void>(() => {});

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => finish('timeout', null), 8_000);
    function finish(nextStatus: LocationStatus, location: Location | null) {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      setStatus(nextStatus);
      resolve(location);
    }
    cancelRef.current = () => {
      active = false;
      clearTimeout(timer);
      setStatus('idle');
    };
    async function locate() {
      if (!navigator.geolocation) {
        finish('unavailable', null);
        return;
      }
      try {
        const permission = await navigator.permissions?.query({ name: 'geolocation' });
        if (!active) return;
        if (permission?.state === 'denied') {
          finish('denied', null);
          return;
        }
      } catch {
        if (!active) return;
      }
      if (!active) return;
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (!validCoordinates(latitude, longitude)) {
              finish('unavailable', null);
              return;
            }
            finish('success', {
              id: 'device-location',
              name: 'Minha localização',
              admin1: null,
              country: null,
              latitude,
              longitude,
              source: 'device',
            });
          },
          (error) =>
            finish(
              error.code === 1 ? 'denied' : error.code === 3 ? 'timeout' : 'unavailable',
              null,
            ),
          { timeout: 8_000, maximumAge: 0, enableHighAccuracy: false },
        );
      } catch {
        finish('unavailable', null);
      }
    }
    void locate();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  return { status, cancel: () => cancelRef.current() };
}
