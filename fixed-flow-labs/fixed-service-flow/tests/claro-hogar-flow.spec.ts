// ============================================
// CLARO HOGAR FLOW - E2E Playwright Tests
// Fixed Service Flow Web Component
// ============================================
//
// These tests validate the CLARO HOGAR e-commerce flow
// which is triggered when a user selects a location
// outside of fiber/DSL coverage (rural/mountainous areas)
//
// Flow: Location -> Catalogue -> ProductDetail -> Plans ->
//       OrderSummary -> Shipping -> Payment -> Confirmation

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3333';
const TIMEOUT = 30000;

// Coordinates for areas outside fiber coverage (CLARO HOGAR)
const CLARO_HOGAR_LOCATIONS = {
  // Mountainous area in Ciales, PR - rural with vegetation
  ciales: { lat: 18.349585, lng: -66.530791, name: 'Hato Viejo, Ciales' },
  // Adjuntas - central mountain region
  adjuntas: { lat: 18.1627, lng: -66.7227, name: 'Adjuntas' },
  // Jayuya - mountainous interior
  jayuya: { lat: 18.2186, lng: -66.5916, name: 'Jayuya' },
};

// Helper functions
async function waitForMapToLoad(page: Page) {
  await page.waitForSelector('[role="region"][aria-label="Mapa"]', { timeout: TIMEOUT });
  await page.waitForTimeout(2000); // Allow map tiles to render
}

async function clickOnMapLocation(page: Page, xPercent: number, yPercent: number) {
  const mapRegion = page.getByRole('region', { name: 'Mapa' });
  const box = await mapRegion.boundingBox();
  if (!box) throw new Error('Map region not found');

  await page.mouse.click(
    box.x + box.width * xPercent,
    box.y + box.height * yPercent
  );
}

async function zoomOutMap(page: Page, clicks: number = 5) {
  const zoomOutButton = page.getByRole('button', { name: 'Alejar' });
  for (let i = 0; i < clicks; i++) {
    await zoomOutButton.click();
    await page.waitForTimeout(300);
  }
}

// Test Suite
test.describe('CLARO HOGAR Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForMapToLoad(page);
  });

  test.describe('Step 1: Location Selection', () => {
    test('should detect CLARO HOGAR coverage in rural area', async ({ page }) => {
      // Zoom out to see Puerto Rico
      await zoomOutMap(page, 6);

      // Click on mountainous interior (center-left of map)
      await clickOnMapLocation(page, 0.35, 0.45);

      // Wait for coverage validation
      await expect(page.getByText('Validando cobertura...')).toBeVisible({ timeout: TIMEOUT });

      // Should show CLARO HOGAR message
      await expect(page.getByText('Tenemos un poderoso servicio de internet inalámbrico')).toBeVisible({ timeout: TIMEOUT });
    });

    test('should show continue button after CLARO HOGAR detection', async ({ page }) => {
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);

      // Wait for modal with continue button
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible({ timeout: TIMEOUT });
    });

    test('should populate address field after map click', async ({ page }) => {
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);

      // Address field should be populated
      const addressInput = page.getByPlaceholder('Ingrese su dirección');
      await expect(addressInput).not.toHaveValue('', { timeout: TIMEOUT });
    });
  });

  test.describe('Step 2: Catalogue', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Step 2
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Continuar' }).click();
    });

    test('should display Internet Inalambrico catalogue', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Internet Inalámbrico' })).toBeVisible({ timeout: TIMEOUT });
    });

    test('should show product cards with prices', async ({ page }) => {
      // Should show at least one product with price
      await expect(page.getByText('/mes')).toBeVisible({ timeout: TIMEOUT });
    });

    test('should have filter for Internet Inalambrico selected', async ({ page }) => {
      const radioButton = page.getByRole('radio', { name: 'Internet Inalámbrico' });
      await expect(radioButton).toBeChecked({ timeout: TIMEOUT });
    });

    test('should show Ver más buttons for products', async ({ page }) => {
      const verMasButtons = page.getByRole('button', { name: 'Ver más' });
      await expect(verMasButtons.first()).toBeVisible({ timeout: TIMEOUT });
    });

    test('should have search functionality', async ({ page }) => {
      await expect(page.getByPlaceholder('Buscar articulo')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
    });

    test('should show Regresar button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Regresar' })).toBeVisible();
    });
  });

  test.describe('Step 3: Product Detail', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to Step 3
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Ver más' }).first().click();
    });

    test('should display product name', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: TIMEOUT });
    });

    test('should show payment term options (12, 24, 36 months)', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Plazos de pago' })).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByText('12 meses')).toBeVisible();
      await expect(page.getByText('24 meses')).toBeVisible();
      await expect(page.getByText('36 meses')).toBeVisible();
    });

    test('should show quantity selector', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Cantidad' })).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByRole('button', { name: '-' })).toBeVisible();
      await expect(page.getByRole('button', { name: '+' })).toBeVisible();
    });

    test('should display price summary', async ({ page }) => {
      await expect(page.getByText('Pago mensual')).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByText('Precio total')).toBeVisible();
      await expect(page.getByText('Financiado a')).toBeVisible();
    });

    test('should have breadcrumb navigation', async ({ page }) => {
      await expect(page.getByText('Catálogo')).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByText('>')).toBeVisible();
    });

    test('should show continue and back buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByRole('button', { name: /Volver al catálogo/ })).toBeVisible();
    });

    test('should allow changing payment terms', async ({ page }) => {
      // Click on 12 months option
      await page.getByRole('button', { name: /12 meses/ }).click();
      await page.waitForTimeout(500);

      // Click on 24 months option
      await page.getByRole('button', { name: /24 meses/ }).click();
      await page.waitForTimeout(500);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back from catalogue to location', async ({ page }) => {
      // Go to catalogue
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(2000);

      // Go back
      await page.getByRole('button', { name: 'Regresar' }).click();

      // Should be back at location step
      await expect(page.getByPlaceholder('Ingrese su dirección')).toBeVisible({ timeout: TIMEOUT });
    });

    test('should navigate back from product detail to catalogue', async ({ page }) => {
      // Go to product detail
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Ver más' }).first().click();
      await page.waitForTimeout(2000);

      // Go back
      await page.getByRole('button', { name: /Volver al catálogo/ }).click();

      // Should be back at catalogue
      await expect(page.getByRole('heading', { name: 'Internet Inalámbrico' })).toBeVisible({ timeout: TIMEOUT });
    });
  });

  test.describe('Error Handling', () => {
    test('should show error state when cart API fails', async ({ page }) => {
      // Go to product detail and try to continue (will fail due to API)
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);
      await page.getByRole('button', { name: 'Continuar' }).click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Ver más' }).first().click();
      await page.waitForTimeout(2000);
      await page.getByRole('button', { name: 'Continuar' }).click();

      // Should show error with retry option
      await expect(page.getByText(/Error/)).toBeVisible({ timeout: TIMEOUT });
      await expect(page.getByRole('button', { name: 'Reintentar' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Volver al catálogo' })).toBeVisible();
    });
  });

  test.describe('UI Components', () => {
    test('should display loading spinner during coverage validation', async ({ page }) => {
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);

      // Should show validating message
      await expect(page.getByText('Validando cobertura...')).toBeVisible();
    });

    test('should close modal with X button', async ({ page }) => {
      await zoomOutMap(page, 6);
      await clickOnMapLocation(page, 0.35, 0.45);
      await page.waitForTimeout(3000);

      // Close modal
      await page.getByRole('button', { name: '×' }).click();

      // Modal should be gone
      await expect(page.getByText('Tenemos un poderoso servicio')).not.toBeVisible();
    });
  });
});

// Smoke test for quick validation
test.describe('Smoke Tests', () => {
  test('full CLARO HOGAR flow - steps 1-3', async ({ page }) => {
    // Step 1: Location
    await page.goto(BASE_URL);
    await waitForMapToLoad(page);
    await zoomOutMap(page, 6);
    await clickOnMapLocation(page, 0.35, 0.45);
    await page.waitForTimeout(3000);
    await expect(page.getByText('internet inalámbrico')).toBeVisible({ timeout: TIMEOUT });

    // Step 2: Catalogue
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('heading', { name: 'Internet Inalámbrico' })).toBeVisible({ timeout: TIMEOUT });

    // Step 3: Product Detail
    await page.getByRole('button', { name: 'Ver más' }).first().click();
    await expect(page.getByRole('heading', { name: 'Plazos de pago' })).toBeVisible({ timeout: TIMEOUT });

    // Screenshot for documentation
    await page.screenshot({ path: 'tests/screenshots/claro-hogar-smoke-test.png', fullPage: true });
  });
});
