import { readFile } from 'node:fs/promises';

const requiredGates = ['terms', 'current-contract', 'forecast-contract', 'operational-limits'];

function approved(value) {
  return (
    value?.status === 'approved' &&
    typeof value.approvedBy === 'string' &&
    value.approvedBy.trim().length > 0 &&
    typeof value.checkedAt === 'string' &&
    Number.isFinite(Date.parse(value.checkedAt)) &&
    Array.isArray(value.evidence) &&
    value.evidence.length > 0 &&
    value.evidence.every((item) => typeof item === 'string' && item.trim().length > 0)
  );
}

try {
  const config = JSON.parse(
    await readFile(process.argv[2] ?? new URL('../release-gates.json', import.meta.url), 'utf8'),
  );
  const blocked = [];
  if (
    config.source !== 'Open-Meteo' ||
    !Array.isArray(config.gates) ||
    config.gates.length !== requiredGates.length
  ) {
    blocked.push('Configuração dos gates inválida.');
  }
  for (const id of requiredGates) {
    const matches = Array.isArray(config.gates)
      ? config.gates.filter((gate) => gate?.id === id)
      : [];
    if (matches.length !== 1 || !approved(matches[0]))
      blocked.push(`Gate pendente ou sem evidência: ${id}`);
  }
  if (!approved(config.manualAccessibility))
    blocked.push('Validação manual de acessibilidade pendente.');
  if (!approved(config.browserMatrix)) blocked.push('Smoke test da matriz de release pendente.');
  if (blocked.length) {
    console.error(`Publicação bloqueada:\n${blocked.join('\n')}`);
    process.exitCode = 1;
  } else console.log('Gates de release aprovados com responsáveis e evidências.');
} catch {
  console.error('Publicação bloqueada: não foi possível validar os gates de release.');
  process.exitCode = 1;
}
