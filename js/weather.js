export const WEATHER_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️',
  80: '🌦️', 81: '🌦️', 82: '🌧️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export const DEFAULT_WEATHER_ICON = '🌤️';

export const DEFAULT_LOCATION = { lat: -6.2088, lon: 106.8456, city: 'Jakarta' };

export function weatherIcon(code) {
  return WEATHER_ICONS[code] || DEFAULT_WEATHER_ICON;
}

export function formatLocation(lat, lon, city) {
  return city || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

export function weatherUrl(lat, lon) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m&timezone=auto';
}

export function formatCurrent(current) {
  return {
    temp: `${Math.round(current.temperature_2m)}°C`,
    humidity: `${current.relative_humidity_2m}%`,
    wind: `${Math.round(current.wind_speed_10m)} km/h`,
    icon: weatherIcon(current.weathercode),
  };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

export function renderCurrent(current) {
  const view = formatCurrent(current);
  setText('weather-temp', view.temp);
  setText('weather-humidity', view.humidity);
  setText('weather-wind', view.wind);
  setText('weather-icon', view.icon);
  setText('weather-desc', 'Live · Updated now');
  return view;
}

export function fetchWeather(lat, lon, city) {
  setText('weather-location', formatLocation(lat, lon, city));
  return fetch(weatherUrl(lat, lon))
    .then(r => r.json())
    .then(d => renderCurrent(d.current))
    .catch(() => null); // keep defaults
}

export function initWeather() {
  const { lat, lon, city } = DEFAULT_LOCATION;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      p => fetchWeather(p.coords.latitude, p.coords.longitude),
      () => fetchWeather(lat, lon, city),
      { timeout: 5000 },
    );
    return;
  }
  fetchWeather(lat, lon, city);
}
