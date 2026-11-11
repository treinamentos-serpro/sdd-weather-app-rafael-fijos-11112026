import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('normaliza e pesquisa uma consulta válida ao digitar e enviar', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '  São   Paulo  ');

    expect(onSearch).toHaveBeenLastCalledWith('São Paulo');

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenLastCalledWith('São Paulo');
    expect(onSearch.mock.calls.length).toBeGreaterThan(1);
  });

  it('não chama onSearch quando a consulta está vazia', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Buscar cidade' });

    await user.click(input);
    expect(onSearch).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('ao menos dois caracteres');
  });

  it('orienta a corrigir consultas inválidas sem enviá-las', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), '🌦️');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('ao menos dois caracteres');
  });

  it('anuncia carregamento, vazio e erro como estados distintos', () => {
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} status="loading" />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades');

    rerender(<SearchBar onSearch={onSearch} status="empty" />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');

    rerender(<SearchBar onSearch={onSearch} status="error" errorMessage="Serviço indisponível." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Serviço indisponível.');
  });
});
