export const COUNTER_GET_URL = 'https://api.countapi.xyz/get/a16zcrypt0/portfolio';
export const COUNTER_HIT_URL = 'https://api.countapi.xyz/hit/a16zcrypt0/portfolio';
export const COUNTER_FALLBACK = '--';

export function formatCount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return COUNTER_FALLBACK;
  return value.toLocaleString();
}

function setCounter(value) {
  const el = document.getElementById('counter-value');
  if (el) el.textContent = value;
}

export function readCounter() {
  return fetch(COUNTER_GET_URL)
    .then(r => r.json())
    .then(d => {
      if (d.value === undefined) return null;
      setCounter(formatCount(d.value));
      return d.value;
    })
    .catch(() => {
      setCounter(COUNTER_FALLBACK);
      return null;
    });
}

export function hitCounter() {
  return fetch(COUNTER_HIT_URL)
    .then(r => r.json())
    .then(d => {
      if (d.value === undefined) return null;
      setCounter(formatCount(d.value));
      return d.value;
    })
    .catch(() => null);
}

export function initCounter() {
  return Promise.all([readCounter(), hitCounter()]);
}
