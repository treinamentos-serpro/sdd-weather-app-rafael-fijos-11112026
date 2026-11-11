import { describe, expect, it } from 'vitest';
import { formatLocalDate, formatNumber, formatTimestamp } from '../../src/lib/format';
import { getFreshness, getLocalDates } from '../../src/lib/localDates';
import { isValidQuery, normalizeQuery } from '../../src/lib/query';
import { getWeatherCondition } from '../../src/lib/weatherCondition';

describe('consultas Unicode', () => {
  it('normaliza espaços e NFC', () => {
    expect(normalizeQuery('  Sa\u0303o   Paulo ')).toBe('São Paulo');
  });
  it.each(['', ' ', 'a', 'e\u0301', '👨‍👩‍👧‍👦', '!!!', '💙💙'])('rejeita %s', (query) => {
    expect(isValidQuery(query)).toBe(false);
  });
  it.each(['SP', '東京', 'e\u0301x', '1a', 'a💙'])('aceita %s', (query) => {
    expect(isValidQuery(query)).toBe(true);
  });
});

describe('datas, fuso e atualidade', () => {
  const now = Date.parse('2026-11-11T01:00:00Z');
  it('preserva cinco datas locais através da virada de dia', () => {
    expect(getLocalDates('America/Sao_Paulo', now)).toEqual([
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
    ]);
    expect(getLocalDates('Asia/Tokyo', now)[0]).toBe('2026-11-11');
    expect(getLocalDates('invalid', now)).toEqual([]);
    expect(getLocalDates('UTC', Date.parse('2026-12-31T23:59:00Z'))[1]).toBe('2027-01-01');
  });
  it('classifica o limite de três horas, futuro e inválidos', () => {
    expect(getFreshness(new Date(now - 10_800_000).toISOString(), now)).toBe('Atual');
    expect(getFreshness(new Date(now - 10_800_001).toISOString(), now)).toBe('Desatualizado');
    expect(getFreshness(new Date(now + 1).toISOString(), now)).toBe('Atualidade indisponível');
    expect(getFreshness(null, now)).toBe('Atualidade indisponível');
    expect(getFreshness('invalid', now)).toBe('Atualidade indisponível');
  });
});

describe('apresentação pt-BR', () => {
  it('formata números e preserva ausências', () => {
    expect(formatNumber(12.5, ' mm')).toBe('12,5 mm');
    expect(formatNumber(0, '%')).toBe('0%');
    expect(formatNumber(null)).toBe('Indisponível');
    expect(formatNumber(Number.NaN)).toBe('Indisponível');
    expect(formatLocalDate('2026-02-30')).toBe('Data indisponível');
    expect(formatLocalDate('2026-11-11')).toContain('11/11');
  });
  it('usa apenas o fuso informado para horários', () => {
    expect(formatTimestamp('2026-11-11T15:00:00Z', 'America/Sao_Paulo')).toContain('12:00');
    expect(formatTimestamp('2026-11-11T15:00:00Z', null)).toBe('Horário indisponível');
    expect(formatTimestamp(null, 'UTC')).toBe('Horário indisponível');
  });
  it('não inventa condições para códigos desconhecidos', () => {
    expect(getWeatherCondition(null).label).toBe('Condição indisponível');
    expect(getWeatherCondition(999).label).toBe('Condição indisponível');
    expect(getWeatherCondition(61).label).toBe('Chuva');
  });
});
