import { useEffect, useRef, useState } from 'react';
import { isValidQuery, normalizeQuery } from '../lib/query';
import { searchCities } from '../services/geocodingService';
import type { Location } from '../types/location';

interface SearchState {
  query: string;
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  results: Location[];
  message: string | null;
}

const initial: SearchState = { query: '', status: 'idle', results: [], message: null };

export default function useCitySearch() {
  const [state, setState] = useState(initial);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);

  function reset() {
    generation.current++;
    controller.current?.abort();
    setState(initial);
  }

  function search(value: string) {
    const query = normalizeQuery(value);
    const attempt = ++generation.current;
    controller.current?.abort();
    if (!isValidQuery(query)) { setState(initial); return; }
    const active = new AbortController();
    controller.current = active;
    setState({ query, status: 'loading', results: [], message: null });
    searchCities(query, active.signal).then((results) => {
      if (attempt === generation.current) setState({ query, results, status: results.length ? 'success' : 'empty', message: null });
    }).catch((error: unknown) => {
      if (attempt === generation.current) setState({ query, results: [], status: 'error', message: error instanceof Error ? error.message : 'Não foi possível buscar cidades.' });
    });
  }

  return { ...state, search, reset, retry: () => search(state.query) };
}