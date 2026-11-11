import { isValidTimeZone } from './localDates';

export function formatNumber(value: number | null | undefined, suffix = ''): string {
  return value == null || !Number.isFinite(value)
    ? 'Indisponível'
    : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}${suffix}`;
}

export function formatLocalDate(localDate: string): string {
  const date = new Date(`${localDate}T12:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(localDate) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== localDate
  ) {
    return 'Data indisponível';
  }
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function formatTimestamp(
  timestamp: string | number | null,
  timeZone: string | null,
): string {
  const value = typeof timestamp === 'string' ? Date.parse(timestamp) : timestamp;
  if (value === null || !Number.isFinite(value) || !isValidTimeZone(timeZone))
    return 'Horário indisponível';
  return `${new Intl.DateTimeFormat('pt-BR', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)} (${timeZone})`;
}
