export function cleanMudraLabel(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  return raw.split('(')[0].trim();
}

export function formatConfidencePercent(c) {
  if (c == null || !Number.isFinite(c)) return '—';
  if (c >= 0 && c <= 1) return `${Math.round(c * 100)}%`;
  if (c > 1 && c <= 100) return `${Math.round(c)}%`;
  return `${Math.round(c)}%`;
}
