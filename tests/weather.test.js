import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  DEFAULT_LOCATION, DEFAULT_WEATHER_ICON,
  weatherIcon, formatLocation, weatherUrl, formatCurrent, renderCurrent, fetchWeather, initWeather,
} from '../js/weather.js';

const CURRENT = {
  temperature_2m: 27.6,
  relative_humidity_2m: 78,
  weathercode: 3,
  wind_speed_10m: 12.4,
};

function setupDom() {
  document.body.innerHTML = `
    <span id="weather-location">--</span>
    <span id="weather-temp">--</span>
    <span id="weather-humidity">--</span>
    <span id="weather-wind">--</span>
    <span id="weather-icon">--</span>
    <span id="weather-desc">--</span>`;
}

beforeEach(setupDom);
afterEach(() => vi.unstubAllGlobals());

describe('weatherIcon', () => {
  it('maps known WMO codes', () => {
    expect(weatherIcon(0)).toBe('☀️');
    expect(weatherIcon(45)).toBe('🌫️');
    expect(weatherIcon(95)).toBe('⛈️');
  });

  it('falls back for unknown codes', () => {
    expect(weatherIcon(1234)).toBe(DEFAULT_WEATHER_ICON);
    expect(weatherIcon(undefined)).toBe(DEFAULT_WEATHER_ICON);
  });
});

describe('formatLocation', () => {
  it('prefers the city name', () => {
    expect(formatLocation(-6.2088, 106.8456, 'Jakarta')).toBe('Jakarta');
  });

  it('falls back to 2-decimal coordinates', () => {
    expect(formatLocation(-6.20881, 106.84562)).toBe('-6.21, 106.85');
  });
});

describe('weatherUrl', () => {
  it('includes the coordinates and requested fields', () => {
    const url = new URL(weatherUrl(1.5, -2.25));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('1.5');
    expect(url.searchParams.get('longitude')).toBe('-2.25');
    expect(url.searchParams.get('current')).toContain('temperature_2m');
    expect(url.searchParams.get('timezone')).toBe('auto');
  });
});

describe('formatCurrent', () => {
  it('rounds temperature and wind, and picks the icon', () => {
    expect(formatCurrent(CURRENT)).toEqual({
      temp: '28°C',
      humidity: '78%',
      wind: '12 km/h',
      icon: '☁️',
    });
  });
});

describe('renderCurrent', () => {
  it('writes every weather field into the DOM', () => {
    renderCurrent(CURRENT);

    expect(document.getElementById('weather-temp').textContent).toBe('28°C');
    expect(document.getElementById('weather-humidity').textContent).toBe('78%');
    expect(document.getElementById('weather-wind').textContent).toBe('12 km/h');
    expect(document.getElementById('weather-icon').textContent).toBe('☁️');
    expect(document.getElementById('weather-desc').textContent).toBe('Live · Updated now');
  });
});

describe('fetchWeather', () => {
  it('sets the location and renders the fetched payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ current: CURRENT }) });
    vi.stubGlobal('fetch', fetchMock);

    await fetchWeather(-6.2088, 106.8456, 'Jakarta');

    expect(fetchMock).toHaveBeenCalledWith(weatherUrl(-6.2088, 106.8456));
    expect(document.getElementById('weather-location').textContent).toBe('Jakarta');
    expect(document.getElementById('weather-temp').textContent).toBe('28°C');
  });

  it('keeps the placeholder values when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(fetchWeather(1, 2, 'Nowhere')).resolves.toBeNull();
    expect(document.getElementById('weather-temp').textContent).toBe('--');
  });
});

describe('initWeather', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ current: CURRENT }) }));
  });

  it('uses the visitor coordinates when geolocation succeeds', () => {
    const getCurrentPosition = vi.fn(success => success({ coords: { latitude: 51.5, longitude: -0.12 } }));
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    initWeather();

    expect(globalThis.fetch).toHaveBeenCalledWith(weatherUrl(51.5, -0.12));
    expect(document.getElementById('weather-location').textContent).toBe('51.50, -0.12');
  });

  it('falls back to Jakarta when geolocation is denied', () => {
    const getCurrentPosition = vi.fn((_success, failure) => failure(new Error('denied')));
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });

    initWeather();

    expect(globalThis.fetch).toHaveBeenCalledWith(weatherUrl(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon));
    expect(document.getElementById('weather-location').textContent).toBe(DEFAULT_LOCATION.city);
  });

  it('falls back to Jakarta when geolocation is unsupported', () => {
    vi.stubGlobal('navigator', {});

    initWeather();

    expect(globalThis.fetch).toHaveBeenCalledWith(weatherUrl(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon));
  });
});
