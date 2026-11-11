const segmenter = new (
  Intl as unknown as {
    Segmenter: new (
      locales: string[],
      options: { granularity: 'grapheme' },
    ) => { segment: (input: string) => Iterable<unknown> };
  }
).Segmenter(['pt-BR'], { granularity: 'grapheme' });

export function normalizeQuery(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

export function isValidQuery(query: string): boolean {
  return (
    Array.from(segmenter.segment(normalizeQuery(query))).length >= 2 && /[\p{L}\p{N}]/u.test(query)
  );
}
