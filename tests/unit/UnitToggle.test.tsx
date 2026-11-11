import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import type { TemperatureUnit } from '../../src/types/preferences';

describe('UnitToggle', () => {
  it('reflete a unidade recebida e solicita alterações por clique', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    const { rerender } = render(<UnitToggle onUnitChange={onUnitChange} unit="celsius" />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius', pressed: true })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fahrenheit', pressed: false }));
    expect(onUnitChange).toHaveBeenCalledWith('fahrenheit');

    rerender(<UnitToggle onUnitChange={onUnitChange} unit="fahrenheit" />);
    expect(screen.getByRole('button', { name: 'Fahrenheit', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius', pressed: false })).toBeInTheDocument();
  });

  it('permite alternar as unidades usando Tab, Enter e espaço', async () => {
    const user = userEvent.setup();

    function ControlledToggle() {
      const [unit, setUnit] = useState<TemperatureUnit>('celsius');
      return <UnitToggle onUnitChange={setUnit} unit={unit} />;
    }

    render(<ControlledToggle />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Fahrenheit', pressed: true })).toHaveFocus();
    await user.tab({ shift: true });
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Celsius', pressed: true })).toHaveFocus();
  });
});
