import { expect, type Route, test } from '@playwright/test';
import { capitals } from '../../src/lib/capitals';
import { PREFERENCES_KEY } from '../../src/services/preferencesStorage';
import { installWeatherRoutes, type Scenario, savedCity, selectCity } from './fixtures/weather';

test('capitais aparecem na ordem fixa e uma falha não oculta as demais', async ({ page }) => {
  await installWeatherRoutes(page, { capitalFailure: true });
  await page.goto('/');
  const cards = page.getByRole('list', { name: 'Capitais' }).getByRole('listitem');
  await expect(cards).toHaveCount(10);
  for (const [index, city] of capitals.entries())
    await expect(cards.nth(index)).toContainText(city.name);
  await expect(cards.first()).toContainText('Indisponível');
  await expect(cards.nth(1)).toContainText('25°C');
  await cards.nth(1).getByRole('button').click();
  await expect(page.getByRole('heading', { name: 'Nova Délhi' })).toBeVisible();
});

test('busca, desambiguação, clima, previsão e unidade persistida', async ({ page }) => {
  await installWeatherRoutes(page);
  await page.goto('/');
  await page.getByRole('searchbox').fill('Recife');
  await expect(
    page.getByRole('list', { name: 'Resultados da busca' }).getByRole('button'),
  ).toHaveCount(2);
  await page.getByRole('button', { name: 'Recife, Pernambuco, Brasil', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Previsão para os próximos cinco dias' }).getByRole('listitem'),
  ).toHaveCount(5);
  await expect(page.getByText('25°C', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('76°F', { exact: true })).toBeVisible();
});

test('localização concedida prevalece sem persistir coordenadas do dispositivo', async ({
  page,
}) => {
  await installWeatherRoutes(page, { geolocation: 'granted' });
  await page.addInitScript(
    ({ key, location }) =>
      localStorage.setItem(
        key,
        JSON.stringify({ schemaVersion: 1, unit: 'celsius', lastExplicitLocation: location }),
      ),
    { key: PREFERENCES_KEY, location: savedCity },
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Minha localização' })).toBeVisible();
  const preferences = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}'),
    PREFERENCES_KEY,
  );
  expect(preferences.lastExplicitLocation).toEqual(savedCity);
});

test('timeout da localização restaura cidade salva e ignora localização tardia', async ({
  page,
}) => {
  await installWeatherRoutes(page, { geolocation: 'timeout' });
  await page.addInitScript(
    ({ key, location }) =>
      localStorage.setItem(
        key,
        JSON.stringify({ schemaVersion: 1, unit: 'celsius', lastExplicitLocation: location }),
      ),
    { key: PREFERENCES_KEY, location: savedCity },
  );
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('status')).toHaveText('Obtendo sua localização...');
  await page.clock.fastForward(8_001);
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('test-geolocation')));
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Minha localização' })).toHaveCount(0);
});

test('busca sem resultados, HTTP 429 e retry manual são distintos', async ({ page }) => {
  const scenario: Scenario = { search: 'empty' };
  await installWeatherRoutes(page, scenario);
  await page.goto('/');
  await page.getByRole('searchbox').fill('Recife');
  await expect(
    page.getByRole('status').filter({ hasText: 'Nenhuma cidade encontrada' }),
  ).toBeVisible();
  scenario.search = 'error';
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('temporariamente indisponível');
  scenario.search = 'success';
  await page.getByRole('button', { name: 'Repetir busca' }).click();
  await expect(page.getByRole('list', { name: 'Resultados da busca' })).toBeVisible();
});

test('resposta parcial preserva cinco datas e campos ausentes sem previsão horária', async ({
  page,
}) => {
  await installWeatherRoutes(page, { partial: true });
  await page.goto('/');
  await selectCity(page);
  await expect(
    page.getByRole('status').filter({ hasText: 'Dados parciais de clima atual' }),
  ).toBeVisible();
  const items = page
    .getByRole('list', { name: 'Previsão para os próximos cinco dias' })
    .getByRole('listitem');
  await expect(items).toHaveCount(5);
  await expect(items.nth(1)).toContainText('Máx Indisponível');
  await expect(items.first()).toContainText('0,4 mm');
  await expect(items.first()).toContainText('70%');
  await expect(page.getByText(/previsão horária/i)).toHaveCount(0);
});

test('falha de uma seção não oculta a outra e retry recupera a mesma cidade', async ({ page }) => {
  const scenario: Scenario = { forecastError: true };
  await installWeatherRoutes(page, scenario);
  await page.goto('/');
  await selectCity(page);
  await expect(
    page.getByRole('region', { name: 'Previsão diária', exact: true }).getByRole('alert'),
  ).toBeVisible();
  await expect(page.getByText('25°C', { exact: true })).toBeVisible();
  scenario.forecastError = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
});

test('prazo comum encerra previsão pendente sem ocultar o clima recebido', async ({ page }) => {
  const scenario: Scenario = { forecastTimeout: true };
  await installWeatherRoutes(page, scenario);
  await page.clock.install();
  await page.goto('/');
  await selectCity(page);
  await expect(page.getByText('25°C', { exact: true })).toBeVisible();
  await page.clock.fastForward(8_001);
  await expect(page.getByRole('alert')).toContainText('oito segundos');
  await expect(page.getByText('25°C', { exact: true })).toBeVisible();
  scenario.forecastTimeout = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
});

test('busca substituída não publica resultado obsoleto', async ({ page }) => {
  await installWeatherRoutes(page);
  let delayed: Route | undefined;
  await page.route('https://geocoding-api.open-meteo.com/v1/search**', async (route) => {
    if (new URL(route.request().url()).searchParams.get('name') === 'Antiga') {
      delayed = route;
      return;
    }
    await route.fallback();
  });
  await page.goto('/');
  await page.getByRole('searchbox').fill('Antiga');
  await expect.poll(() => Boolean(delayed)).toBe(true);
  await page.getByRole('searchbox').fill('Recife');
  await expect(
    page.getByRole('button', { name: 'Recife, Pernambuco, Brasil', exact: true }),
  ).toBeVisible();
  await delayed
    ?.fulfill({ json: { results: [{ id: 99, name: 'Antiga', latitude: 0, longitude: 0 }] } })
    .catch(() => {});
  await expect(page.getByRole('button', { name: 'Antiga', exact: true })).toHaveCount(0);
});

for (const width of [360, 480, 768, 1024, 1440]) {
  test(`layout sem rolagem horizontal em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await installWeatherRoutes(page);
    await page.goto('/');
    await expect(page.getByRole('list', { name: 'Capitais' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await selectCity(page);
    await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await test.info().attach(`layout-${width}.png`, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });
}
