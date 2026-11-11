import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

type DemoStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

async function openDemo(page: Page, status: DemoStatus) {
  await page.route('**/src/main.tsx', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: "import '/tests/e2e/fixtures/accessibility.tsx';",
    }),
  );
  await page.goto(`/?status=${status}`);
  await expect(page.getByRole('region', { name: 'Conteúdo meteorológico' })).toBeVisible();
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

for (const status of ['idle', 'loading', 'success', 'empty', 'error'] as const) {
  test(`estado ${status} atende às verificações automatizadas WCAG 2.2 AA`, async ({ page }) => {
    await openDemo(page, status);

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

test('página real permite alternar a unidade e buscar apenas pelo teclado', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Celsius', exact: true }));
  await page.keyboard.press('Tab');
  const fahrenheit = page.getByRole('button', { name: 'Fahrenheit', exact: true });
  await expectVisibleFocus(fahrenheit);
  await page.keyboard.press('Space');
  await expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();

  await page.keyboard.press('Tab');
  const search = page.getByRole('searchbox', { name: 'Buscar cidade' });
  await expectVisibleFocus(search);
  await page.keyboard.type('Recife');
  await expect(search).toHaveAttribute('aria-describedby', 'city-search-feedback');
  await expect(page.getByRole('alert')).toContainText('ainda não está conectada');
  await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');

  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Buscar', exact: true }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expectVisibleFocus(search);
});

test('retry da demonstração funciona pelo teclado e preserva a unidade', async ({ page }) => {
  await openDemo(page, 'error');
  await expect(page.getByRole('alert')).toHaveText(/Não foi possível carregar os dados/);

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Fahrenheit', exact: true }));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expectVisibleFocus(page.getByRole('button', { name: 'Tentar novamente' }));
  await page.keyboard.press('Enter');

  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
});

test('carregamento e conclusão expõem regiões de anúncio assíncrono', async ({ page }) => {
  await openDemo(page, 'loading');
  await expect(page.getByRole('status')).toHaveText('Carregando...');
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');

  await openDemo(page, 'error');
  await page.getByRole('button', { name: 'Tentar novamente' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('Dados de demonstração');
});

test('respeita a preferência por movimento reduzido nos controles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
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
