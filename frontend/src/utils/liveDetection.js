import { predictFrameBlob, parseApiResponse } from './api';

const CAPTURE_MS = 500;
const MIN_CONFIDENCE = 0.5;
const VOTE_WINDOW = 5;
const LOCK_STREAK = 3;
const JPEG_QUALITY = 0.92;

let predictions = [];
let lastPrediction = null;
let streak = 0;
let locked = null;
let intervalId = null;
let activeStream = null;

function majorityVote(list) {
  if (!list.length) return null;
  const counts = {};
  for (const m of list) counts[m] = (counts[m] || 0) + 1;
  let best = null;
  let max = -1;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best;
}

function resetLiveState() {
  predictions = [];
  lastPrediction = null;
  streak = 0;
  locked = null;
}

function drawFrameToBlob(video, canvas) {
  if (!video.videoWidth || !video.videoHeight) return Promise.resolve(null);
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY);
  });
}

function applySmoothingAndLock(mudra, confidence, setResult) {
  if (locked) {
    setResult(`FINAL: ${locked} 🔒`);
    return;
  }

  if (mudra == null) {
    setResult('No hand detected ❌');
    return;
  }

  if (confidence < MIN_CONFIDENCE) {
    setResult('Detecting...');
    return;
  }

  predictions.push(mudra);
  if (predictions.length > VOTE_WINDOW) {
    predictions.shift();
  }

  if (mudra === lastPrediction) {
    streak += 1;
  } else {
    lastPrediction = mudra;
    streak = 1;
  }

  if (streak >= LOCK_STREAK) {
    locked = mudra;
    setResult(`FINAL: ${locked} 🔒`);
    return;
  }

  const majority = majorityVote(predictions) || mudra;
  setResult(`${majority} (${confidence.toFixed(2)})`);
}

async function tick(videoRef, canvasRef, setResult) {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas || video.readyState < 2) return;

  if (locked) {
    setResult(`FINAL: ${locked} 🔒`);
    return;
  }

  const blob = await drawFrameToBlob(video, canvas);
  if (!blob) return;

  try {
    const { ok, status, data } = await predictFrameBlob(blob);
    if (!ok) {
      setResult(status === 503 ? 'Service unavailable' : `Error ${status}`);
      return;
    }
    const { mudra, confidence } = parseApiResponse(data);
    applySmoothingAndLock(mudra, confidence, setResult);
  } catch {
    setResult('Network error');
  }
}

/**
 * Start live webcam detection (500ms interval, smoothing + lock).
 * @param {React.RefObject<HTMLVideoElement>} videoRef
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef
 * @param {(text: string) => void} setResult
 */
export async function startLive(videoRef, canvasRef, setResult) {
  stopLive(videoRef);

  resetLiveState();
  setResult('Detecting...');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    activeStream = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      await video.play();
    }
  } catch {
    setResult('Camera unavailable');
    return;
  }

  tick(videoRef, canvasRef, setResult);
  intervalId = setInterval(() => tick(videoRef, canvasRef, setResult), CAPTURE_MS);
}

/**
 * Stop live detection and reset all smoothing state.
 */
export function stopLive(videoRef) {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  if (videoRef?.current) {
    videoRef.current.srcObject = null;
  }
  resetLiveState();
}

export function isLiveLocked() {
  return locked != null;
}
