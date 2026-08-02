import { refreshIcons } from './icons.js';

export const THEME_KEY = 'portfolio-theme';
export const ACCENT_KEY = 'portfolio-accent';

export const ACCENT_COLORS = {
  sky: '#38bdf8',
  teal: '#14b8a6',
  violet: '#818cf8',
  emerald: '#34d399',
};

export const DEFAULT_ACCENT = 'emerald';

export function accentColor(name) {
  return ACCENT_COLORS[name] || ACCENT_COLORS[DEFAULT_ACCENT];
}

export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

export function themeIcon(theme) {
  return theme === 'dark' ? 'moon' : 'sun';
}

export function toggleTheme() {
  const html = document.documentElement;
  const next = nextTheme(html.getAttribute('data-theme'));
  html.setAttribute('data-theme', next);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.setAttribute('data-lucide', themeIcon(next));
  refreshIcons();
  localStorage.setItem(THEME_KEY, next);
  return next;
}

export function setAccent(name) {
  document.documentElement.setAttribute('data-accent', name);
  document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
  const dot = document.querySelector(`.accent-dot[style*="${accentColor(name)}"]`);
  if (dot) dot.classList.add('active');
  localStorage.setItem(ACCENT_KEY, name);
  toggleAccentPicker();
}

export function toggleAccentPicker() {
  const picker = document.getElementById('accent-picker');
  if (picker) picker.classList.toggle('hidden');
}

export function closeAccentPickerOnOutsideClick(event) {
  const picker = document.getElementById('accent-picker');
  const btn = document.getElementById('accent-btn');
  if (!picker || !btn) return false;
  if (picker.classList.contains('hidden')) return false;
  if (picker.contains(event.target)) return false;
  if (event.target === btn || btn.contains(event.target)) return false;
  picker.classList.add('hidden');
  return true;
}

export function restorePrefs() {
  const theme = localStorage.getItem(THEME_KEY);
  const accent = localStorage.getItem(ACCENT_KEY);
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  if (accent) document.documentElement.setAttribute('data-accent', accent);
  const icon = document.getElementById('theme-icon');
  if (theme && icon) icon.setAttribute('data-lucide', themeIcon(theme));
  return { theme, accent };
}
