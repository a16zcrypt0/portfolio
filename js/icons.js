// Lucide is loaded from a CDN <script>, so it may be absent (tests, offline).
export function refreshIcons() {
  if (typeof globalThis.lucide !== 'undefined' && typeof globalThis.lucide.createIcons === 'function') {
    globalThis.lucide.createIcons();
    return true;
  }
  return false;
}
