import type { Location } from '../types/location';

interface SearchResultsProps {
  results: Location[];
  onSelect: (location: Location) => void;
}

export default function SearchResults({ results, onSelect }: SearchResultsProps) {
  if (!results.length) return null;
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-white/80" role="status">
        {results.length} cidade(s) encontrada(s).
      </p>
      <ul
        aria-label="Resultados da busca"
        className="divide-y divide-white/15 border-y border-white/15"
      >
        {results.map((location) => (
          <li key={location.id}>
            <button
              className="min-h-11 w-full break-words px-3 py-4 text-left text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => onSelect(location)}
              type="button"
            >
              {[location.name, location.admin1, location.country].filter(Boolean).join(', ')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
