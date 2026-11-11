import { validCoordinates } from '../lib/location';
import { isValidQuery, normalizeQuery } from '../lib/query';
import type { Location } from '../types/location';
import { record, requestJSON, ServiceError } from './http';

export async function searchCities(value: string, signal?: AbortSignal): Promise<Location[]> {
  const query = normalizeQuery(value);
  if (!isValidQuery(query)) return [];
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({
    name: query,
    count: '5',
    language: 'pt',
    format: 'json',
  }).toString();
  const data = await requestJSON(url, signal);
  if (data.results !== undefined && !Array.isArray(data.results)) throw new ServiceError('invalid');
  const results: Location[] = [];
  for (const value of (data.results ?? []) as unknown[]) {
    const item = record(value);
    if (
      !validCoordinates(item.latitude, item.longitude) ||
      typeof item.name !== 'string' ||
      !item.name.trim() ||
      !(
        (typeof item.id === 'number' && Number.isFinite(item.id)) ||
        (typeof item.id === 'string' && item.id)
      )
    )
      continue;
    results.push({
      id: `geo-${item.id}`,
      name: item.name,
      admin1: typeof item.admin1 === 'string' ? item.admin1 : null,
      country: typeof item.country === 'string' ? item.country : null,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      source: 'geocoding',
    });
  }
  return Array.from(new Map(results.map((location) => [location.id, location])).values()).slice(
    0,
    5,
  );
}
