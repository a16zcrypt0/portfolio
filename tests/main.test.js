import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = `
    <i id="theme-icon" data-lucide="moon"></i>
    <button id="accent-btn"></button>
    <div id="accent-picker"><div class="accent-dot" style="background:#34d399;"></div></div>
    <div id="github-repos"></div>`;
  globalThis.lucide = { createIcons: vi.fn() };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }));
  vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0' });
});

afterEach(() => vi.unstubAllGlobals());

describe('main', () => {
  it('exposes the inline-handler functions on window and restores prefs', async () => {
    localStorage.setItem('portfolio-theme', 'light');

    await import('../js/main.js');

    expect(typeof window.toggleTheme).toBe('function');
    expect(typeof window.setAccent).toBe('function');
    expect(typeof window.toggleAccentPicker).toBe('function');
    expect(typeof window.handleForm).toBe('function');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('closes the accent picker on an outside document click', async () => {
    await import('../js/main.js');
    const picker = document.getElementById('accent-picker');
    picker.classList.remove('hidden');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(picker.classList.contains('hidden')).toBe(true);
  });
});
