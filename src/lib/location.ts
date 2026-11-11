import type { Location } from '../types/location';

export function validCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
}

export function isLocation(value: unknown): value is Location {
  if (!value || typeof value !== 'object') return false;
  const location = value as Record<string, unknown>;
  return (
    typeof location.id === 'string' &&
    Boolean(location.id.trim()) &&
    typeof location.name === 'string' &&
    Boolean(location.name.trim()) &&
    (location.admin1 === null || typeof location.admin1 === 'string') &&
    (location.country === null || typeof location.country === 'string') &&
    ['geocoding', 'device', 'capital'].includes(String(location.source)) &&
    validCoordinates(location.latitude, location.longitude)
  );
}
