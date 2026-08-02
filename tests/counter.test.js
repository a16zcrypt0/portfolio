import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  COUNTER_FALLBACK, COUNTER_GET_URL, COUNTER_HIT_URL,
  formatCount, readCounter, hitCounter, initCounter,
} from '../js/counter.js';

function jsonOnce(value) {
  return { json: async () => value };
}

beforeEach(() => {
  document.body.innerHTML = '<span id="counter-value">0</span>';
});

afterEach(() => vi.unstubAllGlobals());

describe('formatCount', () => {
  it('formats numbers with locale separators', () => {
    expect(formatCount(1234567)).toBe((1234567).toLocaleString());
    expect(formatCount(0)).toBe('0');
  });

  it('falls back for non-numeric values', () => {
    expect(formatCount('42')).toBe(COUNTER_FALLBACK);
    expect(formatCount(NaN)).toBe(COUNTER_FALLBACK);
    expect(formatCount(undefined)).toBe(COUNTER_FALLBACK);
  });
});

describe('readCounter', () => {
  it('renders the current total', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonOnce({ value: 2048 })));

    await expect(readCounter()).resolves.toBe(2048);

    expect(globalThis.fetch).toHaveBeenCalledWith(COUNTER_GET_URL);
    expect(document.getElementById('counter-value').textContent).toBe((2048).toLocaleString());
  });

  it('ignores a payload without a value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonOnce({})));

    await expect(readCounter()).resolves.toBeNull();
    expect(document.getElementById('counter-value').textContent).toBe('0');
  });

  it('shows the fallback when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(readCounter()).resolves.toBeNull();
    expect(document.getElementById('counter-value').textContent).toBe(COUNTER_FALLBACK);
  });
});

describe('hitCounter', () => {
  it('renders the incremented total', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonOnce({ value: 2049 })));

    await expect(hitCounter()).resolves.toBe(2049);

    expect(globalThis.fetch).toHaveBeenCalledWith(COUNTER_HIT_URL);
    expect(document.getElementById('counter-value').textContent).toBe((2049).toLocaleString());
  });

  it('leaves the displayed value alone when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(hitCounter()).resolves.toBeNull();
    expect(document.getElementById('counter-value').textContent).toBe('0');
  });
});

describe('initCounter', () => {
  it('reads and increments the counter', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonOnce({ value: 10 }))
      .mockResolvedValueOnce(jsonOnce({ value: 11 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(initCounter()).resolves.toEqual([10, 11]);

    expect(fetchMock.mock.calls.map(c => c[0])).toEqual([COUNTER_GET_URL, COUNTER_HIT_URL]);
    expect(document.getElementById('counter-value').textContent).toBe('11');
  });
});
