import { describe, it, expect, beforeEach } from 'vitest';
import { parseUserAgent, formatPlatform, renderNetwork } from '../js/network.js';

const UA = {
  chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  firefoxLinux: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  edgeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
  safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/604.1',
};

describe('parseUserAgent', () => {
  it.each([
    ['chromeWindows', { browser: 'Chrome', os: 'Windows' }],
    ['firefoxLinux', { browser: 'Firefox', os: 'Linux' }],
    ['safariMac', { browser: 'Safari', os: 'macOS' }],
    ['edgeWindows', { browser: 'Edge', os: 'Windows' }],
    ['chromeAndroid', { browser: 'Chrome', os: 'Android' }],
    ['safariIphone', { browser: 'Safari', os: 'iOS' }],
    ['ipad', { browser: 'Safari', os: 'iOS' }],
  ])('detects %s', (key, expected) => {
    expect(parseUserAgent(UA[key])).toEqual(expected);
  });

  it('falls back for unknown or empty agents', () => {
    expect(parseUserAgent('curl/8.4.0')).toEqual({ browser: 'Other', os: 'Unknown' });
    expect(parseUserAgent('')).toEqual({ browser: 'Other', os: 'Unknown' });
    expect(parseUserAgent()).toEqual({ browser: 'Other', os: 'Unknown' });
  });
});

describe('formatPlatform', () => {
  it('joins browser and OS', () => {
    expect(formatPlatform(UA.chromeWindows)).toBe('Chrome · Windows');
  });
});

describe('renderNetwork', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <span id="network-browser"></span>
      <span id="network-ip"></span>
      <span id="network-isp"></span>
      <span id="network-country"></span>`;
  });

  it('shows the platform and keeps IP details private', () => {
    renderNetwork(UA.firefoxLinux);

    expect(document.getElementById('network-browser').textContent).toBe('Firefox · Linux');
    expect(document.getElementById('network-ip').textContent).toBe('🔒 Private');
    expect(document.getElementById('network-isp').textContent).toBe('Hidden');
    expect(document.getElementById('network-country').textContent).toBe('Protected');
  });

  it('defaults to the live navigator user agent', () => {
    renderNetwork();
    expect(document.getElementById('network-browser').textContent)
      .toBe(formatPlatform(navigator.userAgent));
  });

  it('is a no-op when the elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => renderNetwork(UA.chromeWindows)).not.toThrow();
  });
});
