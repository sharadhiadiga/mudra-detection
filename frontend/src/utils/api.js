import { PREDICT_FRAME } from '../config';
import { cleanMudraLabel } from './mudra';

export async function detectMudra(file) {
  const formData = new FormData();
  formData.append('file', file);

  console.log('Calling API:', PREDICT_FRAME);

  const res = await fetch(PREDICT_FRAME, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function predictFrameBlob(blob) {
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');

  console.log('Calling API:', PREDICT_FRAME);

  const res = await fetch(PREDICT_FRAME, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/** Parse API JSON into display-ready mudra + confidence + status. */
export function parseApiResponse(data) {
  if (!data || typeof data !== 'object') {
    return { mudra: null, confidence: 0, status: null };
  }
  const status = data.status ?? null;
  const raw = data.mudra ?? data.label ?? data.prediction ?? null;
  const c = data.confidence ?? data.conf ?? 0;
  const confidence = typeof c === 'number' ? c : parseFloat(c) || 0;
  const trimmed = raw == null ? '' : String(raw).trim();
  const mudra =
    trimmed === '' || trimmed.toLowerCase() === 'no hand'
      ? null
      : cleanMudraLabel(trimmed);
  return { mudra, confidence, status };
}
