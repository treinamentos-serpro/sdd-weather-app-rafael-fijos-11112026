import { RotateCcw } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { isValidQuery, normalizeQuery } from '../lib/query';

type SearchStatus = 'idle' | 'loading' | 'empty' | 'error' | 'success';

interface SearchBarProps {
  onSearch: (query: string) => void;
  status?: SearchStatus;
  errorMessage?: string;
  onReset?: () => void;
  onRetry?: () => void;
}

export default function SearchBar({
  onSearch,
  status = 'idle',
  errorMessage = 'Não foi possível buscar cidades. Tente novamente.',
  onReset,
  onRetry,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = normalizeQuery(value);

    if (!isValidQuery(query)) {
      onReset?.();
      setValidationMessage('Digite ao menos dois caracteres, incluindo uma letra ou número.');
      return;
    }

    setValidationMessage(null);
    onSearch(query);
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    const query = normalizeQuery(nextValue);

    if (!query) {
      onReset?.();
      setValidationMessage(null);
      return;
    }

    if (!isValidQuery(query)) {
      onReset?.();
      setValidationMessage('Digite ao menos dois caracteres, incluindo uma letra ou número.');
      return;
    }

    setValidationMessage(null);
    onSearch(query);
  }

  const feedback =
    validationMessage ??
    (status === 'empty'
      ? 'Nenhuma cidade encontrada. Revise o nome e tente novamente.'
      : status === 'error'
        ? errorMessage
        : null);

  return (
    <form aria-busy={status === 'loading'} className="w-full" onSubmit={handleSubmit} role="search">
      <label className="mb-2 block text-sm font-medium text-white" htmlFor="city-search">
        Buscar cidade
      </label>
      <div className="flex gap-2">
        <input
          aria-describedby={feedback ? 'city-search-feedback' : undefined}
          aria-invalid={Boolean(validationMessage)}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-night-800 px-4 py-3 text-white placeholder:text-white/50 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40"
          id="city-search"
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Ex.: São Paulo"
          type="search"
          value={value}
        />
        <button
          className="shrink-0 rounded-lg bg-accent-500 px-4 py-3 font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="submit"
        >
          Buscar
        </button>
      </div>
      {status === 'loading' && !validationMessage && (
        <p aria-live="polite" className="mt-2 text-sm text-white/75" role="status">
          Buscando cidades...
        </p>
      )}
      {feedback && (
        <p
          aria-live={validationMessage || status === 'error' ? 'assertive' : 'polite'}
          className={`mt-2 text-sm ${validationMessage || status === 'error' ? 'text-rose-300' : 'text-white/75'}`}
          id="city-search-feedback"
          role={validationMessage || status === 'error' ? 'alert' : 'status'}
        >
          {feedback}
        </p>
      )}
      {status === 'error' && !validationMessage && onRetry && (
        <button
          aria-describedby="city-search-feedback"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-white/30 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={onRetry}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Repetir busca
        </button>
      )}
    </form>
  );
}
