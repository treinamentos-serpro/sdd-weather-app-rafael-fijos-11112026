export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false;
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function localDateAt(timeZone: string, timestamp: number): string | null {
  if (!isValidTimeZone(timeZone) || !Number.isFinite(timestamp)) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function getLocalDates(timeZone: string, timestamp = Date.now()): string[] {
  const today = localDateAt(timeZone, timestamp);
  if (!today) return [];
  const start = Date.parse(`${today}T12:00:00Z`);
  return Array.from({ length: 5 }, (_, offset) =>
    new Date(start + offset * 86_400_000).toISOString().slice(0, 10),
  );
}

export function getFreshness(timestamp: string | null, receivedAt: number | null): string {
  if (!timestamp || receivedAt === null || !Number.isFinite(receivedAt))
    return 'Atualidade indisponível';
  const source = Date.parse(timestamp);
  const age = receivedAt - source;
  if (!Number.isFinite(source) || age < 0) return 'Atualidade indisponível';
  return age <= 10_800_000 ? 'Atual' : 'Desatualizado';
}
