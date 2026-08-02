import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { STATUS_HIDE_DELAY, STATUS_MESSAGES, statusFor, handleForm } from '../js/contact.js';

const ACTION = 'https://formsubmit.co/adulshadega@gmail.com';

beforeEach(() => {
  document.body.innerHTML = `
    <form id="contact-form" action="${ACTION}" method="POST">
      <input name="name" />
      <button id="form-submit-btn" type="submit">Send Message</button>
    </form>
    <p id="form-status" style="display:block"></p>`;
  globalThis.lucide = { createIcons: vi.fn() };
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const status = () => document.getElementById('form-status');
const btn = () => document.getElementById('form-submit-btn');

describe('statusFor', () => {
  it('maps the API result to a status message', () => {
    expect(statusFor({ success: true })).toBe(STATUS_MESSAGES.success);
    expect(statusFor({ success: false })).toBe(STATUS_MESSAGES.failure);
    expect(statusFor(undefined)).toBe(STATUS_MESSAGES.failure);
  });
});

describe('handleForm', () => {
  it('posts the form data and reports success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ success: 'true' }) });
    vi.stubGlobal('fetch', fetchMock);
    const preventDefault = vi.fn();
    document.querySelector('input[name=name]').value = 'Ada';

    await handleForm({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(ACTION);
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ Accept: 'application/json' });
    expect(options.body.get('name')).toBe('Ada');
    expect(status().textContent).toBe(STATUS_MESSAGES.success.text);
    expect(status().style.display).toBe('block');
    expect(document.querySelector('input[name=name]').value).toBe('');
  });

  it('reports a rejected submission without clearing the form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ success: false }) }));
    document.querySelector('input[name=name]').value = 'Ada';

    await handleForm({ preventDefault: vi.fn() });

    expect(status().textContent).toBe(STATUS_MESSAGES.failure.text);
    expect(document.querySelector('input[name=name]').value).toBe('Ada');
  });

  it('reports a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await handleForm({ preventDefault: vi.fn() });

    expect(status().textContent).toBe(STATUS_MESSAGES.error.text);
    expect(status().style.display).toBe('block');
  });

  it('disables the button while sending and restores it afterwards', async () => {
    let resolveFetch;
    vi.stubGlobal('fetch', vi.fn(() => new Promise(res => { resolveFetch = res; })));

    const pending = handleForm({ preventDefault: vi.fn() });
    expect(btn().disabled).toBe(true);
    expect(btn().textContent).toContain('Sending...');

    resolveFetch({ json: async () => ({ success: true }) });
    await pending;

    expect(btn().disabled).toBe(false);
    expect(btn().textContent).toContain('Send Message');
  });

  it('hides the status message after the delay', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ success: true }) }));

    await handleForm({ preventDefault: vi.fn() });
    expect(status().style.display).toBe('block');

    vi.advanceTimersByTime(STATUS_HIDE_DELAY);
    expect(status().style.display).toBe('none');
  });

  it('does nothing when the form is missing', async () => {
    document.body.innerHTML = '';
    await expect(handleForm({ preventDefault: vi.fn() })).resolves.toBeUndefined();
  });
});
