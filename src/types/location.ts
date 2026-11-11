export interface Location {
  id: string;
  name: string;
  admin1: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  source: 'geocoding' | 'device' | 'capital';
}
