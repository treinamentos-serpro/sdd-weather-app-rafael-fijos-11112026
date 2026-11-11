import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import CurrentWeather from '../../src/components/CurrentWeather';
import { capitals } from '../../src/lib/capitals';
import { mockLocation, mockWeatherSnapshot } from '../../src/mocks/weather';
import { searchCities } from '../../src/services/geocodingService';
import { readPreferences } from '../../src/services/preferencesStorage';
import { getCurrentWeather, getForecast } from '../../src/services/weatherService';

vi.mock('../../src/services/geocodingService', () => ({ searchCities: vi.fn() }));
vi.mock('../../src/services/weatherService', () => ({
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('navigator', {
    permissions: { query: vi.fn().mockResolvedValue({ state: 'denied' }) },
    geolocation: { getCurrentPosition: vi.fn() },
  });
  vi.mocked(searchCities).mockReset().mockResolvedValue([mockLocation]);
  vi.mocked(getCurrentWeather).mockReset().mockResolvedValue(mockWeatherSnapshot.current);
  vi.mocked(getForecast).mockReset().mockResolvedValue(mockWeatherSnapshot.forecast);
});
afterEach(() => vi.unstubAllGlobals());

async function selectCity() {
  const user = userEvent.setup();
  await user.type(screen.getByRole('searchbox'), 'São Paulo');
  await user.click(await screen.findByRole('button', { name: 'São Paulo, São Paulo, Brasil' }));
  await screen.findByRole('heading', { name: 'São Paulo' });
  return user;
}

describe('App', () => {
  it('apresenta busca, seletor e dez capitais sem cidade fictícia selecionada', async () => {
    render(<App />);
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'Capitais' });
    const buttons = within(list).getAllByRole('button');
    expect(buttons).toHaveLength(10);
    capitals.forEach((city, index) => { expect(buttons[index]).toHaveTextContent(city.name); });
    expect(screen.queryByRole('heading', { name: 'São Paulo' })).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('publicação bloqueada');
  });

  it('converte e persiste unidade sem nova consulta', async () => {
    render(<App />);
    const user = await selectCity();
    const calls = vi.mocked(getCurrentWeather).mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByText('76°F')).toBeInTheDocument();
    expect(screen.getByText(/Sensação térmica: 77°F/)).toBeInTheDocument();
    expect(readPreferences().unit).toBe('fahrenheit');
    expect(getCurrentWeather).toHaveBeenCalledTimes(calls);
    await user.click(screen.getByRole('button', { name: 'Celsius' }));
    expect(screen.getByText('25°C')).toBeInTheDocument();
  });

  it('exibe cinco dias com máximas, mínimas e probabilidade de chuva na unidade selecionada', async () => {
    render(<App />);
    const user = await selectCity();

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    const forecastList = screen.getByRole('list', {
      name: 'Previsão para os próximos cinco dias',
    });
    expect(within(forecastList).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('Máx 27°C')).toBeInTheDocument();
    expect(within(forecastList).getAllByText('Mín 18°C')).toHaveLength(3);
    expect(screen.getByText('Prob. de chuva 30%')).toBeInTheDocument();
    expect(within(forecastList).getByText('0,4 mm')).toBeInTheDocument();
    expect(within(forecastList).getAllByText('Umidade média')).toHaveLength(5);
    expect(within(forecastList).getAllByText('Vento máximo')).toHaveLength(5);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByText('Máx 81°F')).toBeInTheDocument();
  });

  it('distingue vazio, falha e retry manual da busca', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'Recife');
    expect(await screen.findByText(/Nenhuma cidade encontrada/)).toBeInTheDocument();
    vi.mocked(searchCities).mockRejectedValue(new Error('Serviço temporariamente indisponível.'));
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('indisponível');
    vi.mocked(searchCities).mockResolvedValue([mockLocation]);
    await user.click(screen.getByRole('button', { name: 'Repetir busca' }));
    expect(await screen.findByRole('list', { name: 'Resultados da busca' })).toBeInTheDocument();
  });

  it('mantém clima atual ao falhar a previsão e permite retry por teclado', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(new Error('Previsão indisponível.'));
    render(<App />);
    const user = await selectCity();
    expect(await screen.findByRole('alert')).toHaveTextContent('Previsão indisponível');
    expect(screen.getByText('25°C')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Tentar novamente' }).focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
  });

  it('seleciona uma capital sem busca e persiste apenas a cidade', async () => {
    render(<App />);
    const user = userEvent.setup();
    const list = await screen.findByRole('list', { name: 'Capitais' });
    await user.click(within(list).getByRole('button', { name: /Tóquio/ }));
    expect(await screen.findByRole('heading', { name: 'Tóquio' })).toBeInTheDocument();
    expect(readPreferences().lastExplicitLocation?.id).toBe('capital-tokyo');
  });

  it('identifica origem modelada e horário local sem afirmar observação', () => {
    render(
      <CurrentWeather
        conditions={{ ...mockWeatherSnapshot.current, origin: 'model' }}
        receivedAt={mockWeatherSnapshot.currentReceivedAt}
        location={mockLocation}
        unit="celsius"
      />,
    );
    expect(screen.getByText(/Atual · Estimativa/)).toBeInTheDocument();
    expect(screen.queryByText(/Observado/)).not.toBeInTheDocument();
    expect(screen.getByText(/12:00/)).toHaveTextContent('America/Sao_Paulo');
  });

  it('preserva campos ausentes sem substituí-los por zero', () => {
    render(<CurrentWeather conditions={null} location={mockLocation} unit="celsius" />);

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.queryByText('0°C')).not.toBeInTheDocument();
  });
});
