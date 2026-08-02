import { describe, it, expect, afterEach, vi } from 'vitest';
import { refreshIcons } from '../js/icons.js';

afterEach(() => { delete globalThis.lucide; });

describe('refreshIcons', () => {
  it('calls lucide.createIcons when the CDN script loaded', () => {
    globalThis.lucide = { createIcons: vi.fn() };
    expect(refreshIcons()).toBe(true);
    expect(globalThis.lucide.createIcons).toHaveBeenCalledTimes(1);
  });

  it('is a safe no-op when lucide is unavailable or malformed', () => {
    expect(refreshIcons()).toBe(false);
    globalThis.lucide = {};
    expect(refreshIcons()).toBe(false);
  });
});
