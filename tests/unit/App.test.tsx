import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../../src/App';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockLocation } from '../../src/mocks/weather';

describe('App', () => {
  it.each([
    ['idle', 'Busque uma cidade para consultar o clima.'],
    ['loading', 'Carregando...'],
    ['empty', 'Nenhum resultado encontrado.'],
    ['error', 'Não foi possível carregar os dados.'],
  ] as const)('exibe o estado %s sem os dados de demonstração', (initialStatus, message) => {
    render(<App initialStatus={initialStatus} />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('pendentes de validação');
    expect(screen.getByRole('region', { name: 'Conteúdo meteorológico' })).toHaveTextContent(
      message,
    );
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Previsão de 5 dias' })).not.toBeInTheDocument();
    expect(screen.queryByText(/dados de demonstração/i)).not.toBeInTheDocument();
  });

  it('mantém a unidade escolhida ao sair do erro para a demonstração', async () => {
    const user = userEvent.setup();
    render(<App initialStatus="error" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados.');
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(screen.getByText('76°F')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('monta a busca, o seletor e o Hero com dados de demonstração', () => {
    render(<App />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText(/dados de demonstração/i)).toBeInTheDocument();
    expect(screen.getByText('25°C')).toBeInTheDocument();
    expect(screen.getByText('Umidade')).toBeInTheDocument();
    expect(screen.getByText('Vento')).toBeInTheDocument();
    expect(screen.getByText('Precipitação')).toBeInTheDocument();
    expect(screen.getByText('Índice UV')).toBeInTheDocument();
  });

  it('converte as temperaturas a partir dos valores originais', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByText('76°F')).toBeInTheDocument();
    expect(screen.getByText(/Sensação térmica: 77°F/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(screen.getByText('25°C')).toBeInTheDocument();
  });

  it('exibe cinco dias com máximas, mínimas e probabilidade de chuva na unidade selecionada', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    const forecastList = screen.getByRole('list', {
      name: 'Previsão para os próximos cinco dias',
    });
    expect(within(forecastList).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Máx 27°C')).toBeInTheDocument();
    expect(within(forecastList).getAllByText('Mín 18°C')).toHaveLength(3);
    expect(screen.getByText('Prob. de chuva 30%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByText('Máx 81°F')).toBeInTheDocument();
  });

  it('informa que a busca ainda está indisponível sem alterar a cidade do exemplo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('searchbox'), 'Recife');
    expect(screen.getByRole('alert')).toHaveTextContent('ainda não está conectada');
    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
  });

  it('preserva campos ausentes sem substituí-los por zero', () => {
    render(<CurrentWeather conditions={null} location={mockLocation} unit="celsius" />);

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.queryByText('0°C')).not.toBeInTheDocument();
  });
});
