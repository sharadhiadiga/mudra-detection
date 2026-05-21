import { useCallback, useEffect, useRef, useState } from 'react';
import { predictFrameBlob, parseApiResponse } from '../utils/api';

const CAPTURE_MS = 500;
const MIN_CONFIDENCE = 0.5;
const VOTE_WINDOW = 5;
const LOCK_STREAK = 3;
const JPEG_QUALITY = 0.92;

const initialState = {
  phase: 'idle',
  currentMudra: null,
  currentConfidence: 0,
  lockedMudra: null,
  lockedConfidence: 0,
  history: [],
  stability: 0,
  framesAnalyzed: 0,
  message: '—',
};

function majorityVote(list) {
  if (!list.length) return { label: null, count: 0 };
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
  return { label: best, count: max };
}

export function useLiveDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const predictionsRef = useRef([]);
  const lastPredictionRef = useRef(null);
  const streakRef = useRef(0);
  const lockedRef = useRef(null);
  const lockedConfRef = useRef(0);

  const [live, setLive] = useState(initialState);
  const [running, setRunning] = useState(false);

  const resetRefs = useCallback(() => {
    predictionsRef.current = [];
    lastPredictionRef.current = null;
    streakRef.current = 0;
    lockedRef.current = null;
    lockedConfRef.current = 0;
  }, []);

  const pushHistory = useCallback((mudra, confidence) => {
    setLive((prev) => {
      const history = [
        { mudra, confidence, id: Date.now() },
        ...prev.history,
      ].slice(0, 5);
      return { ...prev, history };
    });
  }, []);

  const updateFromFrame = useCallback(
    (mudra, confidence) => {
      if (lockedRef.current) {
        setLive((prev) => ({
          ...prev,
          phase: 'locked',
          lockedMudra: lockedRef.current,
          lockedConfidence: lockedConfRef.current,
          message: 'LOCKED',
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      if (mudra == null) {
        setLive((prev) => ({
          ...prev,
          phase: 'no_hand',
          message: 'No hand detected',
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      if (confidence < MIN_CONFIDENCE) {
        setLive((prev) => ({
          ...prev,
          phase: 'detecting',
          currentMudra: mudra,
          currentConfidence: confidence,
          message: 'Detecting...',
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      const preds = predictionsRef.current;
      preds.push(mudra);
      if (preds.length > VOTE_WINDOW) preds.shift();

      if (mudra === lastPredictionRef.current) {
        streakRef.current += 1;
      } else {
        lastPredictionRef.current = mudra;
        streakRef.current = 1;
      }

      const { label: maj, count: majCount } = majorityVote(preds);
      const stability = Math.round((majCount / preds.length) * 100);

      pushHistory(mudra, confidence);

      if (streakRef.current >= LOCK_STREAK) {
        lockedRef.current = mudra;
        lockedConfRef.current = confidence;
        setLive((prev) => ({
          ...prev,
          phase: 'locked',
          lockedMudra: mudra,
          lockedConfidence: confidence,
          currentMudra: mudra,
          currentConfidence: confidence,
          stability: 100,
          message: 'LOCKED',
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      setLive((prev) => ({
        ...prev,
        phase: 'stabilizing',
        currentMudra: maj || mudra,
        currentConfidence: confidence,
        stability,
        message: 'Stabilizing...',
        framesAnalyzed: prev.framesAnalyzed + 1,
      }));
    },
    [pushHistory]
  );

  const tick = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    if (lockedRef.current) {
      updateFromFrame(lockedRef.current, lockedConfRef.current);
      return;
    }

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', JPEG_QUALITY);
    });
    if (!blob) return;

    try {
      const { ok, status, data } = await predictFrameBlob(blob);
      if (!ok) {
        setLive((prev) => ({
          ...prev,
          phase: 'error',
          message: status === 503 ? 'Service unavailable' : `Error ${status}`,
        }));
        return;
      }
      const { mudra, confidence } = parseApiResponse(data);
      updateFromFrame(mudra, confidence);
    } catch {
      setLive((prev) => ({ ...prev, phase: 'error', message: 'Network error' }));
    }
  }, [updateFromFrame]);

  const start = useCallback(async () => {
    resetRefs();
    setLive({ ...initialState, phase: 'detecting', message: 'Detecting...' });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setLive((prev) => ({ ...prev, phase: 'error', message: 'Camera unavailable' }));
      return;
    }

    setRunning(true);
    tick();
    intervalRef.current = setInterval(tick, CAPTURE_MS);
  }, [resetRefs, tick]);

  const stop = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    resetRefs();
    setLive(initialState);
  }, [resetRefs]);

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    canvasRef,
    live,
    running,
    start,
    stop,
    isLocked: live.phase === 'locked',
  };
}
