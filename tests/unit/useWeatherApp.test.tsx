import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useCapitals from '../../src/hooks/useCapitals';
import useCitySearch from '../../src/hooks/useCitySearch';
import useWeatherApp from '../../src/hooks/useWeatherApp';
import useWeatherQueries from '../../src/hooks/useWeatherQueries';
import { capitals } from '../../src/lib/capitals';
import { mockLocation, mockWeatherSnapshot } from '../../src/mocks/weather';
import { searchCities } from '../../src/services/geocodingService';
import { readPreferences, savePreferences } from '../../src/services/preferencesStorage';
import { getCurrentWeather, getForecast } from '../../src/services/weatherService';
import type { Location } from '../../src/types/location';
import type { CurrentConditions } from '../../src/types/weather';

vi.mock('../../src/services/geocodingService', () => ({ searchCities: vi.fn() }));
vi.mock('../../src/services/weatherService', () => ({
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(getCurrentWeather).mockReset().mockResolvedValue(mockWeatherSnapshot.current);
  vi.mocked(getForecast).mockReset().mockResolvedValue(mockWeatherSnapshot.forecast);
  vi.mocked(searchCities).mockReset().mockResolvedValue([mockLocation]);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('busca concorrente', () => {
  it('descarta respostas e erros obsoletos e não envia entrada inválida', async () => {
    const first = deferred<Location[]>();
    const second = deferred<Location[]>();
    vi.mocked(searchCities).mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { result } = renderHook(useCitySearch);
    act(() => result.current.search('a'));
    expect(searchCities).not.toHaveBeenCalled();
    act(() => result.current.search('São Paulo'));
    act(() => result.current.search('Recife'));
    await act(async () => second.resolve([{ ...mockLocation, id: 'recife', name: 'Recife' }]));
    await act(async () => first.reject(new Error('old error')));
    expect(result.current.results[0].name).toBe('Recife');
    expect(result.current.status).toBe('success');
  });
  it('limpa resultados pendentes ao invalidar a entrada e repete manualmente falhas', async () => {
    const pending = deferred<Location[]>();
    vi.mocked(searchCities).mockReturnValueOnce(pending.promise);
    const { result } = renderHook(useCitySearch);
    act(() => result.current.search('Recife'));
    act(() => result.current.reset());
    await act(async () => pending.resolve([mockLocation]));
    expect(result.current.results).toEqual([]);
    vi.mocked(searchCities).mockRejectedValueOnce(new Error('429'));
    act(() => result.current.search('Recife'));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(searchCities).toHaveBeenCalledTimes(2);
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('success'));
  });
});

describe('consultas independentes', () => {
  it('mantém sucesso atual quando a previsão falha e conserva dados só da mesma cidade', async () => {
    vi.mocked(getForecast).mockRejectedValueOnce(new Error('forecast failed'));
    const { result } = renderHook(useWeatherQueries);
    act(() => result.current.select(mockLocation));
    await waitFor(() => expect(result.current.forecast.status).toBe('error'));
    expect(result.current.current.data?.temperatureC).toBe(24.5);
    const pending = deferred<CurrentConditions>();
    vi.mocked(getCurrentWeather).mockReturnValueOnce(pending.promise);
    act(() => result.current.retry());
    expect(result.current.current.previous).toBe(true);
    expect(result.current.current.receivedAt).not.toBeNull();
    act(() => result.current.select({ ...mockLocation, id: 'other' }));
    expect(result.current.current.data).toBeNull();
    await act(async () => pending.resolve({ ...mockWeatherSnapshot.current, temperatureC: 99 }));
    await waitFor(() => expect(result.current.current.status).toBe('success'));
    expect(result.current.current.data?.temperatureC).toBe(24.5);
    expect(result.current.location?.id).toBe('other');
  });
  it('encerra tentativas pendentes no prazo comum e ignora conclusão tardia', async () => {
    vi.useFakeTimers();
    const late = deferred<CurrentConditions>();
    vi.mocked(getCurrentWeather).mockReturnValue(late.promise);
    vi.mocked(getForecast).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(useWeatherQueries);
    act(() => result.current.select(mockLocation));
    expect(result.current.current.status).toBe('loading');
    await act(async () => vi.advanceTimersByTimeAsync(8_000));
    expect(result.current.current.status).toBe('error');
    expect(result.current.forecast.status).toBe('error');
    await act(async () => late.resolve(mockWeatherSnapshot.current));
    expect(result.current.current.data).toBeNull();
  });
  it('identifica respostas parciais sem esconder os campos válidos', async () => {
    vi.mocked(getCurrentWeather).mockResolvedValue({
      ...mockWeatherSnapshot.current,
      temperatureC: null,
    });
    const { result } = renderHook(useWeatherQueries);
    act(() => result.current.select(mockLocation));
    await waitFor(() => expect(result.current.current.status).toBe('partial'));
    expect(result.current.current.data?.maximumTodayC).toBe(27.3);
  });
});

describe('localização e preferências', () => {
  function navigatorWith(state: string, callback: (success: PositionCallback) => void = () => {}) {
    const getCurrentPosition = vi.fn(callback);
    vi.stubGlobal('navigator', {
      permissions: { query: vi.fn().mockResolvedValue({ state }) },
      geolocation: { getCurrentPosition },
    });
    return getCurrentPosition;
  }
  it('restaura cidade e unidade se a permissão já estiver negada, sem solicitá-la', async () => {
    savePreferences({ schemaVersion: 1, unit: 'fahrenheit', lastExplicitLocation: mockLocation });
    const locate = navigatorWith('denied');
    const { result } = renderHook(useWeatherApp);
    await waitFor(() => expect(result.current.location?.id).toBe(mockLocation.id));
    expect(locate).not.toHaveBeenCalled();
    expect(result.current.unit).toBe('fahrenheit');
    const calls = vi.mocked(getCurrentWeather).mock.calls.length;
    act(() => result.current.setUnit('celsius'));
    expect(readPreferences().unit).toBe('celsius');
    expect(getCurrentWeather).toHaveBeenCalledTimes(calls);
  });
  it('prioriza localização concedida sem persistir coordenadas do dispositivo', async () => {
    savePreferences({ schemaVersion: 1, unit: 'celsius', lastExplicitLocation: mockLocation });
    navigatorWith('granted', (success) =>
      success({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition),
    );
    const { result } = renderHook(useWeatherApp);
    await waitFor(() => expect(result.current.location?.source).toBe('device'));
    expect(result.current.location?.name).toBe('Minha localização');
    expect(readPreferences().lastExplicitLocation).toEqual(mockLocation);
  });
  it('ignora localização após uma seleção explícita', async () => {
    let position!: PositionCallback;
    navigatorWith('prompt', (success) => {
      position = success;
    });
    const { result } = renderHook(useWeatherApp);
    await waitFor(() => expect(position).toBeDefined());
    act(() => result.current.selectLocation(mockLocation));
    act(() => position({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition));
    expect(result.current.location?.id).toBe(mockLocation.id);
    expect(readPreferences().lastExplicitLocation).toEqual(mockLocation);
  });
  it('expira localização em oito segundos e ignora resposta posterior', async () => {
    vi.useFakeTimers();
    let position!: PositionCallback;
    navigatorWith('prompt', (success) => {
      position = success;
    });
    const { result } = renderHook(useWeatherApp);
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => vi.advanceTimersByTimeAsync(8_000));
    expect(result.current.locationStatus).toBe('timeout');
    act(() => position({ coords: { latitude: 10, longitude: 20 } } as GeolocationPosition));
    expect(result.current.location).toBeNull();
  });
});

describe('capitais independentes', () => {
  it('falha de uma capital não afeta as outras', async () => {
    vi.mocked(getCurrentWeather).mockImplementation((location) =>
      location.id === capitals[0].id
        ? Promise.reject(new Error('offline'))
        : Promise.resolve(mockWeatherSnapshot.current),
    );
    const { result } = renderHook(() => useCapitals(true));
    await waitFor(() => expect(result.current[capitals[0].id]?.status).toBe('unavailable'));
    expect(Object.keys(result.current)).toHaveLength(10);
    expect(result.current[capitals[1].id].data?.temperatureC).toBe(24.5);
    expect(result.current[capitals[0].id].data).toBeNull();
  });
});
