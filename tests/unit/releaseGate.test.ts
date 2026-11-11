import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function runGate(config?: unknown) {
  const directory = mkdtempSync(join(tmpdir(), 'weather-release-'));
  try {
    const path = join(directory, 'gates.json');
    if (config !== undefined) writeFileSync(path, JSON.stringify(config));
    return spawnSync(
      process.execPath,
      ['scripts/check-release.mjs', ...(config === undefined ? [] : [path])],
      { encoding: 'utf8' },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('gate de publicação', () => {
  it('bloqueia a configuração atual pendente e configurações incompletas', () => {
    expect(runGate().status).toBe(1);
    expect(runGate({}).status).toBe(1);
  });
  it('exige aprovação identificada e evidências para todos os gates', () => {
    const approval = {
      status: 'approved',
      approvedBy: 'Responsável pelo release',
      checkedAt: '2026-11-11',
      evidence: ['docs/source-validation.md'],
    };
    const config = {
      source: 'Open-Meteo',
      gates: ['terms', 'current-contract', 'forecast-contract', 'operational-limits'].map((id) => ({
        id,
        ...approval,
      })),
      manualAccessibility: approval,
      browserMatrix: approval,
    };
    expect(runGate(config).status).toBe(0);
    expect(runGate({ ...config, manualAccessibility: { ...approval, evidence: [] } }).status).toBe(
      1,
    );
    expect(runGate({ ...config, browserMatrix: { ...approval, approvedBy: null } }).status).toBe(1);
  });
});
