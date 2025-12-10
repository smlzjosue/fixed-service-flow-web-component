// ============================================
// UI CHECKBOX - Component Tests
// ============================================

import { newSpecPage } from '@stencil/core/testing';
import { UiCheckbox } from './ui-checkbox';

describe('ui-checkbox', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox></ui-checkbox>`,
    });

    const input = page.root.shadowRoot.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.checked).toBe(false);
  });

  it('renders with label', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox label="Accept terms"></ui-checkbox>`,
    });

    const label = page.root.shadowRoot.querySelector('.checkbox-label');
    expect(label.textContent).toBe('Accept terms');
  });

  it('renders checked state', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox checked></ui-checkbox>`,
    });

    const input = page.root.shadowRoot.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('renders disabled state', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox disabled></ui-checkbox>`,
    });

    const input = page.root.shadowRoot.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const container = page.root.shadowRoot.querySelector('.checkbox-container');

    expect(input.disabled).toBe(true);
    expect(container.classList.contains('checkbox-container--disabled')).toBe(true);
  });

  it('renders error state', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox has-error error-message="Required"></ui-checkbox>`,
    });

    const container = page.root.shadowRoot.querySelector('.checkbox-container');
    const error = page.root.shadowRoot.querySelector('.checkbox-error');

    expect(container.classList.contains('checkbox-container--error')).toBe(true);
    expect(error.textContent).toBe('Required');
  });

  it('emits checkboxChange event on change', async () => {
    const page = await newSpecPage({
      components: [UiCheckbox],
      html: `<ui-checkbox></ui-checkbox>`,
    });

    const spy = jest.fn();
    page.root.addEventListener('checkboxChange', spy);

    const input = page.root.shadowRoot.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail).toBe(true);
  });
});
