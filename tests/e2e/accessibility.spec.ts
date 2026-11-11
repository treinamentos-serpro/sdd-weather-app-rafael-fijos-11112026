import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { installWeatherRoutes, type Scenario, selectCity } from './fixtures/weather';

type AuditState = 'initial' | 'loading' | 'loaded' | 'empty' | 'error' | 'partial';

async function openState(page: Page, status: AuditState) {
  const scenario: Scenario = {
    currentTimeout: status === 'loading',
    forecastTimeout: status === 'loading',
    currentError: status === 'error',
    partial: status === 'partial',
    search: status === 'empty' ? 'empty' : 'success',
  };
  await installWeatherRoutes(page, scenario);
  await page.goto('/');
  if (status === 'initial')
    await expect(page.getByRole('list', { name: 'Capitais' })).toBeVisible();
  else if (status === 'empty') {
    await page.getByRole('searchbox').fill('Recife');
    await expect(page.getByText(/Nenhuma cidade encontrada/)).toBeVisible();
  } else {
    await selectCity(page);
    if (status === 'error') await expect(page.getByRole('alert')).toBeVisible();
    else if (status === 'loading')
      await expect(page.getByText('Carregando clima atual...', { exact: true })).toBeVisible();
    else await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  }
  await expect(page.getByRole('region', { name: 'Conteúdo meteorológico' })).toBeVisible();
  return scenario;
}

async function expectVisibleFocus(control: Locator) {
  await expect(control).toBeFocused();
  expect(
    await control.evaluate((element) => {
      const style = getComputedStyle(element);
      return (
        element.matches(':focus-visible') &&
        ((style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) ||
          style.boxShadow !== 'none')
      );
    }),
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', (route) => route.abort());
});

for (const status of ['initial', 'loading', 'loaded', 'empty', 'error', 'partial'] as const) {
  test(`estado ${status} atende às verificações automatizadas WCAG 2.2 AA`, async ({ page }) => {
    await openState(page, status);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    await test.info().attach(`axe-${status}.json`, {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    expect(results.violations).toEqual([]);
  });
}

test('busca, seleção e unidade funcionam apenas pelo teclado com foco visível', async ({
  page,
}) => {
  await openState(page, 'initial');

  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Celsius', exact: true }));
  await page.keyboard.press('Tab');
  const fahrenheit = page.getByRole('button', { name: 'Fahrenheit', exact: true });
  await expectVisibleFocus(fahrenheit);
  await page.keyboard.press('Space');
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');

  await page.keyboard.press('Tab');
  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await expectVisibleFocus(search);
  await page.keyboard.type('Recife');
  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Buscar', exact: true }));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await expectVisibleFocus(search);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(
    page.getByRole('button', { name: 'Recife, Pernambuco, Brasil', exact: true }),
  );
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Conteúdo meteorológico' })).toBeFocused();
});

test('retry real funciona pelo teclado, preserva a unidade e devolve foco ao conteúdo', async ({
  page,
}) => {
  const scenario: Scenario = { currentError: true };
  await installWeatherRoutes(page, scenario);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Fahrenheit', exact: true }));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Recife');
  await expect(
    page.getByRole('button', { name: 'Recife, Pernambuco, Brasil', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toContainText('temporariamente indisponível');
  await expect(page.getByRole('region', { name: 'Conteúdo meteorológico' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Tentar novamente' }));
  scenario.currentError = false;
  await page.keyboard.press('Enter');

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Conteúdo meteorológico' })).toBeFocused();
});

test('carregamento e conclusão expõem regiões de anúncio assíncrono', async ({ page }) => {
  const scenario = await openState(page, 'loading');
  await expect(page.getByText('Carregando clima atual...', { exact: true })).toHaveAttribute(
    'role',
    'status',
  );
  await expect(page.getByText('Carregando clima atual...', { exact: true })).toHaveAttribute(
    'aria-live',
    'polite',
  );
  scenario.currentTimeout = false;
  scenario.forecastTimeout = false;
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expect(
    page.getByRole('status').filter({ hasText: 'Localidade selecionada: Recife' }),
  ).toBeVisible();
});

test('validação anuncia erro associado ao campo sem enviar consulta inválida', async ({ page }) => {
  await openState(page, 'initial');
  await page.getByRole('searchbox').fill('a');
  await expect(page.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('searchbox')).toHaveAttribute(
    'aria-describedby',
    'city-search-feedback',
  );
  await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  await expect(page.getByRole('alert')).toContainText('ao menos dois caracteres');
});

test('respeita a preferência por movimento reduzido nos controles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installWeatherRoutes(page);
  await page.goto('/');
  await expect(page.getByRole('searchbox')).toBeVisible();

  const motion = await page.locator('button, input').evaluateAll((controls) =>
    controls.map((control) => {
      const style = getComputedStyle(control);
      return {
        transition: style.transitionDuration
          .split(',')
          .map((duration) => Number.parseFloat(duration)),
        animation: style.animationDuration
          .split(',')
          .map((duration) => Number.parseFloat(duration)),
      };
    }),
  );

  expect(motion.length).toBeGreaterThan(0);
  for (const control of motion) {
    expect(control.transition.every((duration) => duration <= 0.00001)).toBe(true);
    expect(control.animation.every((duration) => duration <= 0.00001)).toBe(true);
  }
  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Celsius', exact: true }));
});
