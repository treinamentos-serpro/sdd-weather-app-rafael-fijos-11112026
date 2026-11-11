import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('state components', () => {
  it('apresenta uma mensagem de estado vazio', () => {
    render(<EmptyState message="Nenhuma cidade encontrada." />);

    expect(screen.getByText('Nenhuma cidade encontrada.')).toBeInTheDocument();
  });

  it('anuncia o carregamento com role status', () => {
    render(<LoadingState message="Buscando clima..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima...');
  });

  it('permite tentar novamente após um erro', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Serviço indisponível." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Serviço indisponível.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
