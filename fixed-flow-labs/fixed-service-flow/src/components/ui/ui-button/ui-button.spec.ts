// ============================================
// UI BUTTON - Component Tests
// ============================================

import { newSpecPage } from '@stencil/core/testing';
import { UiButton } from './ui-button';

describe('ui-button', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button>Click me</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.classList.contains('btn--primary')).toBe(true);
    expect(button.disabled).toBe(false);
  });

  it('renders with secondary variant', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button variant="secondary">Secondary</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button.classList.contains('btn--secondary')).toBe(true);
  });

  it('renders with outline variant', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button variant="outline">Outline</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button.classList.contains('btn--outline')).toBe(true);
  });

  it('renders disabled state', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button disabled>Disabled</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('renders loading state', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button loading>Loading</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button.classList.contains('btn--loading')).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('renders full width', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button full-width>Full Width</ui-button>`,
    });

    const button = page.root.shadowRoot.querySelector('button');
    expect(button.classList.contains('btn--full-width')).toBe(true);
  });

  it('emits click event when clicked', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button>Click</ui-button>`,
    });

    const spy = jest.fn();
    page.root.addEventListener('buttonClick', spy);

    const button = page.root.shadowRoot.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('does not emit click when disabled', async () => {
    const page = await newSpecPage({
      components: [UiButton],
      html: `<ui-button disabled>Click</ui-button>`,
    });

    const spy = jest.fn();
    page.root.addEventListener('buttonClick', spy);

    const button = page.root.shadowRoot.querySelector('button');
    button.click();

    expect(spy).not.toHaveBeenCalled();
  });
});
