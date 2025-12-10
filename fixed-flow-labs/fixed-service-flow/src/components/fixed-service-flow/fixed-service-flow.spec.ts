// ============================================
// FIXED SERVICE FLOW - Component Tests
// ============================================

import { newSpecPage } from '@stencil/core/testing';
import { FixedServiceFlow } from './fixed-service-flow';

describe('fixed-service-flow', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [FixedServiceFlow],
      html: `<fixed-service-flow></fixed-service-flow>`,
    });

    expect(page.root).toEqualHtml(`
      <fixed-service-flow>
        <mock:shadow-root>
          <div class="fixed-service-flow">
            <div class="fixed-service-flow__loading">
              <div class="fixed-service-flow__spinner"></div>
              <p>Inicializando...</p>
            </div>
          </div>
        </mock:shadow-root>
      </fixed-service-flow>
    `);
  });

  it('accepts apiUrl prop', async () => {
    const page = await newSpecPage({
      components: [FixedServiceFlow],
      html: `<fixed-service-flow api-url="https://api.example.com"></fixed-service-flow>`,
    });

    expect(page.rootInstance.apiUrl).toBe('https://api.example.com');
  });

  it('accepts googleMapsKey prop', async () => {
    const page = await newSpecPage({
      components: [FixedServiceFlow],
      html: `<fixed-service-flow google-maps-key="test-key"></fixed-service-flow>`,
    });

    expect(page.rootInstance.googleMapsKey).toBe('test-key');
  });

  it('accepts debug prop', async () => {
    const page = await newSpecPage({
      components: [FixedServiceFlow],
      html: `<fixed-service-flow debug="true"></fixed-service-flow>`,
    });

    expect(page.rootInstance.debug).toBe(true);
  });
});
