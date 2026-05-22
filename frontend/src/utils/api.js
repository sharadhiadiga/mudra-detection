import { PREDICT_FRAME } from '../config';
import { cleanMudraLabel } from './mudra';

const DEFAULT_TIMEOUT_MS = 3000;

async function fetchPredictFrame(formData, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(PREDICT_FRAME, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    return { ok: res.ok, status: res.status, data, timedOut: false };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { ok: false, status: 408, data: null, timedOut: true };
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function detectMudra(file) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchPredictFrame(formData);
}

export async function predictFrameBlob(blob, options = {}) {
  const formData = new FormData();
  formData.append('file', blob, 'frame.jpg');
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  return fetchPredictFrame(formData, timeoutMs);
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
