// ============================================
// UI INPUT - Component Tests
// ============================================

import { newSpecPage } from '@stencil/core/testing';
import { UiInput } from './ui-input';

describe('ui-input', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input></ui-input>`,
    });

    const input = page.root.shadowRoot.querySelector('input');
    expect(input).not.toBeNull();
    expect(input.type).toBe('text');
  });

  it('renders with label', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input label="Email"></ui-input>`,
    });

    const label = page.root.shadowRoot.querySelector('label');
    expect(label).not.toBeNull();
    expect(label.textContent).toContain('Email');
  });

  it('renders with placeholder', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input placeholder="Enter text"></ui-input>`,
    });

    const input = page.root.shadowRoot.querySelector('input');
    expect(input.placeholder).toBe('Enter text');
  });

  it('renders with value', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input value="test value"></ui-input>`,
    });

    const input = page.root.shadowRoot.querySelector('input');
    expect(input.value).toBe('test value');
  });

  it('renders disabled state', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input disabled></ui-input>`,
    });

    const input = page.root.shadowRoot.querySelector('input');
    expect(input.disabled).toBe(true);
  });

  it('renders required indicator', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input label="Name" required></ui-input>`,
    });

    const required = page.root.shadowRoot.querySelector('.input-required');
    expect(required).not.toBeNull();
  });

  it('renders error state', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input has-error error-message="Invalid input"></ui-input>`,
    });

    const wrapper = page.root.shadowRoot.querySelector('.input-wrapper');
    const error = page.root.shadowRoot.querySelector('.input-error');

    expect(wrapper.classList.contains('input-wrapper--error')).toBe(true);
    expect(error.textContent).toBe('Invalid input');
  });

  it('renders different input types', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input type="email"></ui-input>`,
    });

    const input = page.root.shadowRoot.querySelector('input');
    expect(input.type).toBe('email');
  });

  it('emits inputChange event on input', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input></ui-input>`,
    });

    const spy = jest.fn();
    page.root.addEventListener('inputChange', spy);

    const input = page.root.shadowRoot.querySelector('input');
    input.value = 'new value';
    input.dispatchEvent(new Event('input'));

    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('emits inputBlur event on blur', async () => {
    const page = await newSpecPage({
      components: [UiInput],
      html: `<ui-input></ui-input>`,
    });

    const spy = jest.fn();
    page.root.addEventListener('inputBlur', spy);

    const input = page.root.shadowRoot.querySelector('input');
    input.dispatchEvent(new Event('blur'));

    await page.waitForChanges();

    expect(spy).toHaveBeenCalled();
  });
});
