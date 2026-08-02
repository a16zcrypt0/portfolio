import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ACCENT_COLORS, THEME_KEY, ACCENT_KEY,
  accentColor, nextTheme, themeIcon,
  toggleTheme, setAccent, toggleAccentPicker, closeAccentPickerOnOutsideClick, restorePrefs,
} from '../js/prefs.js';

function setupDom() {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-accent');
  document.body.innerHTML = `
    <i id="theme-icon" data-lucide="moon"></i>
    <button id="accent-btn"><span id="btn-child"></span></button>
    <div id="accent-picker" class="hidden">
      <div class="accent-dot active" style="background:#38bdf8;"></div>
      <div class="accent-dot" style="background:#14b8a6;"></div>
      <div class="accent-dot" style="background:#818cf8;"></div>
      <div class="accent-dot" style="background:#34d399;"></div>
    </div>`;
}

beforeEach(() => {
  localStorage.clear();
  setupDom();
  globalThis.lucide = { createIcons: vi.fn() };
});

describe('pure helpers', () => {
  it('flips the theme and defaults an unknown theme to dark', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme(null)).toBe('dark');
  });

  it('maps a theme to its lucide icon', () => {
    expect(themeIcon('dark')).toBe('moon');
    expect(themeIcon('light')).toBe('sun');
  });

  it('maps accent names to colors and falls back to emerald', () => {
    expect(accentColor('sky')).toBe(ACCENT_COLORS.sky);
    expect(accentColor('violet')).toBe(ACCENT_COLORS.violet);
    expect(accentColor('chartreuse')).toBe(ACCENT_COLORS.emerald);
  });
});

describe('toggleTheme', () => {
  it('switches the document theme, icon, and persists it', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    expect(toggleTheme()).toBe('light');

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.getElementById('theme-icon').getAttribute('data-lucide')).toBe('sun');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(globalThis.lucide.createIcons).toHaveBeenCalled();
  });

  it('toggles back to dark on a second call', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleTheme();
    toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('works when lucide has not loaded', () => {
    delete globalThis.lucide;
    expect(() => toggleTheme()).not.toThrow();
  });
});

describe('setAccent', () => {
  it('applies the accent, marks the matching dot active, and persists it', () => {
    setAccent('teal');

    expect(document.documentElement.getAttribute('data-accent')).toBe('teal');
    expect(localStorage.getItem(ACCENT_KEY)).toBe('teal');
    const active = document.querySelectorAll('.accent-dot.active');
    expect(active).toHaveLength(1);
    expect(active[0].getAttribute('style')).toContain(ACCENT_COLORS.teal);
  });

  it('closes the accent picker after selection', () => {
    const picker = document.getElementById('accent-picker');
    picker.classList.remove('hidden');
    setAccent('sky');
    expect(picker.classList.contains('hidden')).toBe(true);
  });
});

describe('toggleAccentPicker', () => {
  it('toggles the hidden class', () => {
    const picker = document.getElementById('accent-picker');
    toggleAccentPicker();
    expect(picker.classList.contains('hidden')).toBe(false);
    toggleAccentPicker();
    expect(picker.classList.contains('hidden')).toBe(true);
  });

  it('is a no-op when the picker is missing', () => {
    document.body.innerHTML = '';
    expect(() => toggleAccentPicker()).not.toThrow();
  });
});

describe('closeAccentPickerOnOutsideClick', () => {
  beforeEach(() => document.getElementById('accent-picker').classList.remove('hidden'));

  it('closes on a click outside the picker and button', () => {
    expect(closeAccentPickerOnOutsideClick({ target: document.body })).toBe(true);
    expect(document.getElementById('accent-picker').classList.contains('hidden')).toBe(true);
  });

  it('keeps the picker open when clicking inside it or on the button', () => {
    const dot = document.querySelector('.accent-dot');
    expect(closeAccentPickerOnOutsideClick({ target: dot })).toBe(false);
    expect(closeAccentPickerOnOutsideClick({ target: document.getElementById('accent-btn') })).toBe(false);
    expect(closeAccentPickerOnOutsideClick({ target: document.getElementById('btn-child') })).toBe(false);
    expect(document.getElementById('accent-picker').classList.contains('hidden')).toBe(false);
  });

  it('does nothing when the picker is already hidden', () => {
    document.getElementById('accent-picker').classList.add('hidden');
    expect(closeAccentPickerOnOutsideClick({ target: document.body })).toBe(false);
  });
});

describe('restorePrefs', () => {
  it('restores stored theme and accent onto the document', () => {
    localStorage.setItem(THEME_KEY, 'light');
    localStorage.setItem(ACCENT_KEY, 'violet');

    expect(restorePrefs()).toEqual({ theme: 'light', accent: 'violet' });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-accent')).toBe('violet');
    expect(document.getElementById('theme-icon').getAttribute('data-lucide')).toBe('sun');
  });

  it('leaves the document untouched with nothing stored', () => {
    expect(restorePrefs()).toEqual({ theme: null, accent: null });
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(document.documentElement.hasAttribute('data-accent')).toBe(false);
  });
});
