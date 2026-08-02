import { refreshIcons } from './icons.js';

export const STATUS_MESSAGES = {
  success: { text: '✓ Message sent successfully!', color: '#34d399' },
  failure: { text: '✗ Failed to send. Email me directly instead.', color: '#f87171' },
  error: { text: '✗ Network error. Please email me directly.', color: '#f87171' },
};

export const STATUS_HIDE_DELAY = 5000;

export function statusFor(result) {
  return result && result.success ? STATUS_MESSAGES.success : STATUS_MESSAGES.failure;
}

function showStatus(status, { text, color }) {
  if (!status) return;
  status.textContent = text;
  status.style.color = color;
  status.style.display = 'block';
}

export function handleForm(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const btn = document.getElementById('form-submit-btn');
  const status = document.getElementById('form-status');
  const form = document.getElementById('contact-form');
  if (!form) return Promise.resolve();

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Sending...';
  }
  if (status) status.style.display = 'none';
  refreshIcons();

  return fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  })
    .then(r => r.json())
    .then(data => {
      showStatus(status, statusFor(data));
      if (data && data.success) form.reset();
    })
    .catch(() => showStatus(status, STATUS_MESSAGES.error))
    .finally(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i> Send Message';
      }
      refreshIcons();
      setTimeout(() => { if (status) status.style.display = 'none'; }, STATUS_HIDE_DELAY);
    });
}
