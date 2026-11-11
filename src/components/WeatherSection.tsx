import type { ReactNode } from 'react';
import { formatTimestamp } from '../lib/format';
import type { AsyncSection } from '../types/weather';
import ErrorState from './states/ErrorState';
import LoadingState from './states/LoadingState';

interface WeatherSectionProps<T> {
  label: string;
  section: AsyncSection<T>;
  onRetry: () => void;
  children: ReactNode;
}

export default function WeatherSection<T>({
  label,
  section,
  onRetry,
  children,
}: WeatherSectionProps<T>) {
  return (
    <section aria-label={label} className="mt-6">
      {!section.data && <h2 className="mb-3 text-xl font-semibold">{label}</h2>}
      {section.status === 'loading' && (
        <LoadingState message={`Carregando ${label.toLocaleLowerCase('pt-BR')}...`} />
      )}
      {section.status === 'error' && (
        <ErrorState
          message={section.error ?? 'Não foi possível atualizar os dados.'}
          onRetry={onRetry}
        />
      )}
      {section.previous && section.data && (
        <p className="mb-3 text-sm text-amber-200" role="status">
          Dados anteriores — recebidos em {formatTimestamp(section.receivedAt, 'UTC')}.
        </p>
      )}
      {section.status === 'partial' && (
        <p className="mb-3 text-sm text-amber-200" role="status">
          Dados parciais de {label.toLocaleLowerCase('pt-BR')}. Campos ausentes estão indisponíveis.
        </p>
      )}
      {section.data && children}
    </section>
  );
}
