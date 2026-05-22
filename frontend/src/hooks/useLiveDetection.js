import { useCallback, useEffect, useRef, useState } from 'react';
import { predictFrameBlob, parseApiResponse } from '../utils/api';

const CAPTURE_MS = 300;
const FRAME_SIZE = 256;
const JPEG_QUALITY = 0.85;
const HISTORY_LIMIT = 5;

const initialState = {
  phase: 'idle',
  currentMudra: null,
  currentConfidence: 0,
  history: [],
  stability: 0,
  framesAnalyzed: 0,
  message: '—',
  lastError: null,
};

function captureFrameBlob(video, canvas) {
  if (!video?.videoWidth || !video?.videoHeight || video.readyState < 2) {
    return Promise.resolve(null);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = FRAME_SIZE;
  canvas.height = FRAME_SIZE;
  ctx.drawImage(video, 0, 0, FRAME_SIZE, FRAME_SIZE);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', JPEG_QUALITY);
  });
}

export function useLiveDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const runningRef = useRef(false);
  const inFlightRef = useRef(false);
  const loopTimerRef = useRef(null);

  const [live, setLive] = useState(initialState);
  const [running, setRunning] = useState(false);

  const clearLoopTimer = useCallback(() => {
    if (loopTimerRef.current != null) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  }, []);

  const pushHistory = useCallback((mudra, confidence) => {
    setLive((prev) => ({
      ...prev,
      history: [{ mudra, confidence, id: Date.now() }, ...prev.history].slice(
        0,
        HISTORY_LIMIT
      ),
    }));
  }, []);

  const applyPrediction = useCallback(
    (mudra, confidence) => {
      if (mudra == null) {
        setLive((prev) => ({
          ...prev,
          phase: 'no_hand',
          currentMudra: null,
          currentConfidence: 0,
          stability: 0,
          message: 'No hand detected',
          lastError: null,
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      pushHistory(mudra, confidence);
      setLive((prev) => ({
        ...prev,
        phase: 'prediction',
        currentMudra: mudra,
        currentConfidence: confidence,
        stability: Math.round(confidence * 100),
        message: mudra,
        lastError: null,
        framesAnalyzed: prev.framesAnalyzed + 1,
      }));
    },
    [pushHistory]
  );

  const runTickRef = useRef(null);

  const scheduleNext = useCallback(
    (delay = CAPTURE_MS) => {
      clearLoopTimer();
      if (!runningRef.current) return;
      loopTimerRef.current = setTimeout(() => {
        void runTickRef.current?.();
      }, delay);
    },
    [clearLoopTimer]
  );

  const runTick = useCallback(async () => {
    if (!runningRef.current || inFlightRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      scheduleNext();
      return;
    }

    const blob = await captureFrameBlob(video, canvas);
    if (!blob) {
      scheduleNext();
      return;
    }

    inFlightRef.current = true;
    try {
      const { ok, status, data } = await predictFrameBlob(blob);

      if (data?.status === 'loading') {
        setLive((prev) => ({
          ...prev,
          phase: 'detecting',
          message: 'Loading model…',
          lastError: null,
        }));
        return;
      }

      if (!ok) {
        setLive((prev) => ({
          ...prev,
          lastError:
            status === 503 ? 'Service unavailable' : `Request failed (${status})`,
        }));
        return;
      }

      const { mudra, confidence, status: responseStatus } = parseApiResponse(data);

      if (responseStatus === 'loading') {
        setLive((prev) => ({
          ...prev,
          phase: 'detecting',
          message: 'Loading model…',
          lastError: null,
        }));
        return;
      }

      applyPrediction(mudra, confidence);
    } catch {
      setLive((prev) => ({
        ...prev,
        lastError: 'Network error',
      }));
    } finally {
      inFlightRef.current = false;
      scheduleNext();
    }
  }, [applyPrediction, scheduleNext]);

  runTickRef.current = runTick;

  const start = useCallback(async () => {
    clearLoopTimer();
    runningRef.current = false;
    inFlightRef.current = false;

    setLive({
      ...initialState,
      phase: 'detecting',
      message: 'Detecting…',
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setLive((prev) => ({
        ...prev,
        phase: 'error',
        message: 'Camera unavailable',
      }));
      return;
    }

    runningRef.current = true;
    setRunning(true);
    void runTick();
  }, [clearLoopTimer, runTick]);

  const stop = useCallback(() => {
    runningRef.current = false;
    inFlightRef.current = false;
    clearLoopTimer();

    setRunning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(initialState);
  }, [clearLoopTimer]);

  useEffect(() => () => stop(), [stop]);

  return {
    videoRef,
    canvasRef,
    live,
    running,
    start,
    stop,
    isLocked: false,
  };
}
