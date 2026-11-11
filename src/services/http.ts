export type ServiceErrorKind =
  | 'http'
  | 'rate-limit'
  | 'invalid'
  | 'network'
  | 'timeout'
  | 'cancelled';

export class ServiceError extends Error {
  constructor(public readonly kind: ServiceErrorKind) {
    super(
      kind === 'timeout'
        ? 'A consulta excedeu oito segundos. Tente novamente.'
        : kind === 'cancelled'
          ? 'Consulta cancelada.'
          : kind === 'invalid'
            ? 'O serviço retornou dados inválidos. Tente novamente.'
            : 'O serviço está temporariamente indisponível. Tente novamente.',
    );
    this.name = 'ServiceError';
  }
}

export function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export async function requestJSON(
  url: URL,
  signal?: AbortSignal,
): Promise<Record<string, unknown>> {
  if (signal?.aborted) throw new ServiceError('cancelled');
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(), 8_000);
  let onAbort = () => {};
  const aborted = new Promise<never>((_, reject) => {
    onAbort = () => reject(new ServiceError(signal?.aborted ? 'cancelled' : 'timeout'));
    controller.signal.addEventListener('abort', onAbort, { once: true });
  });
  try {
    const response = await Promise.race([
      fetch(url, { signal: controller.signal }).then(async (result) => {
        if (!result.ok) throw new ServiceError(result.status === 429 ? 'rate-limit' : 'http');
        let value: unknown;
        try {
          value = await result.json();
        } catch {
          throw new ServiceError('invalid');
        }
        if (!value || typeof value !== 'object' || Array.isArray(value))
          throw new ServiceError('invalid');
        return record(value);
      }),
      aborted,
    ]);
    return response;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    if (controller.signal.aborted)
      throw new ServiceError(signal?.aborted ? 'cancelled' : 'timeout');
    throw new ServiceError('network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
    controller.signal.removeEventListener('abort', onAbort);
  }
}
