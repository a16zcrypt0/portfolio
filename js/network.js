export function parseUserAgent(ua = '') {
  let browser = 'Other';
  let os = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge') || ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return { browser, os };
}

export function formatPlatform(ua) {
  const { browser, os } = parseUserAgent(ua);
  return `${browser} · ${os}`;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Browser/OS only — no IP or ISP lookup (privacy).
export function renderNetwork(ua = navigator.userAgent) {
  setText('network-browser', formatPlatform(ua));
  setText('network-ip', '🔒 Private');
  setText('network-isp', 'Hidden');
  setText('network-country', 'Protected');
}
