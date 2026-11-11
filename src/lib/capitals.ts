import type { Location } from '../types/location';

export const capitals: Location[] = [
  { id: 'capital-tokyo', name: 'Tóquio', country: 'Japão', latitude: 35.68, longitude: 139.69 },
  {
    id: 'capital-new-delhi',
    name: 'Nova Délhi',
    country: 'Índia',
    latitude: 28.61,
    longitude: 77.21,
  },
  {
    id: 'capital-seoul',
    name: 'Seul',
    country: 'Coreia do Sul',
    latitude: 37.57,
    longitude: 126.98,
  },
  { id: 'capital-dhaka', name: 'Daca', country: 'Bangladesh', latitude: 23.81, longitude: 90.41 },
  { id: 'capital-cairo', name: 'Cairo', country: 'Egito', latitude: 30.04, longitude: 31.24 },
  {
    id: 'capital-mexico-city',
    name: 'Cidade do México',
    country: 'México',
    latitude: 19.43,
    longitude: -99.13,
  },
  { id: 'capital-beijing', name: 'Pequim', country: 'China', latitude: 39.9, longitude: 116.41 },
  {
    id: 'capital-kinshasa',
    name: 'Kinshasa',
    country: 'República Democrática do Congo',
    latitude: -4.32,
    longitude: 15.31,
  },
  {
    id: 'capital-buenos-aires',
    name: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6,
    longitude: -58.38,
  },
  { id: 'capital-manila', name: 'Manila', country: 'Filipinas', latitude: 14.6, longitude: 120.98 },
].map((location) => ({ ...location, admin1: null, source: 'capital' }));
