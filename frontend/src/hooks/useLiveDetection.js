import { useCallback, useEffect, useRef, useState } from 'react';
import { predictFrameBlob, parseApiResponse } from '../utils/api';

const CAPTURE_MS = 800;
const FRAME_SIZE = 128;
const JPEG_QUALITY = 0.8;
const MIN_CONFIDENCE = 0.6;
const VOTE_WINDOW = 5;
const VOTE_THRESHOLD = 3;
const HISTORY_LIMIT = 5;
const FETCH_TIMEOUT_MS = 3000;

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

function majorityVote(list) {
  if (!list.length) return { label: null, count: 0 };
  const counts = {};
  for (const m of list) counts[m] = (counts[m] || 0) + 1;
  let best = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return { label: best, count: max };
}

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
  const isProcessingRef = useRef(false);
  const loopTimerRef = useRef(null);
  const voteBufferRef = useRef([]);
  const runTickRef = useRef(null);

  const [live, setLive] = useState(initialState);
  const [running, setRunning] = useState(false);

  const clearLoopTimer = useCallback(() => {
    if (loopTimerRef.current != null) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  }, []);

  const resetVoteBuffer = useCallback(() => {
    voteBufferRef.current = [];
  }, []);

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

  const pushHistory = useCallback((mudra, confidence) => {
    setLive((prev) => ({
      ...prev,
      history: [{ mudra, confidence, id: Date.now() }, ...prev.history].slice(
        0,
        HISTORY_LIMIT
      ),
    }));
  }, []);

  const setNoHand = useCallback(() => {
    resetVoteBuffer();
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
  }, [resetVoteBuffer]);

  const applyStablePrediction = useCallback(
    (mudra, confidence) => {
      const { label, count } = majorityVote(voteBufferRef.current);
      if (!label || count < VOTE_THRESHOLD) {
        setLive((prev) => ({
          ...prev,
          phase: 'stabilizing',
          message: 'Hold steady…',
          lastError: null,
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      pushHistory(label, confidence);
      const stability = Math.round((count / voteBufferRef.current.length) * 100);
      setLive((prev) => ({
        ...prev,
        phase: 'prediction',
        currentMudra: label,
        currentConfidence: confidence,
        stability,
        message: label,
        lastError: null,
        framesAnalyzed: prev.framesAnalyzed + 1,
      }));
    },
    [pushHistory]
  );

  const handleFrameResult = useCallback(
    (mudra, confidence, responseStatus) => {
      if (responseStatus === 'loading') {
        setLive((prev) => ({
          ...prev,
          phase: 'detecting',
          message: 'Loading model…',
          lastError: null,
        }));
        return;
      }

      if (mudra == null) {
        setNoHand();
        return;
      }

      if (confidence < MIN_CONFIDENCE) {
        setLive((prev) => ({
          ...prev,
          phase: prev.currentMudra ? 'stabilizing' : 'detecting',
          message: prev.currentMudra ? 'Hold steady…' : 'Position your hand',
          lastError: null,
          framesAnalyzed: prev.framesAnalyzed + 1,
        }));
        return;
      }

      voteBufferRef.current.push(mudra);
      if (voteBufferRef.current.length > VOTE_WINDOW) {
        voteBufferRef.current.shift();
      }
      applyStablePrediction(mudra, confidence);
    },
    [applyStablePrediction, setNoHand]
  );

  const runTick = useCallback(async () => {
    if (!runningRef.current) return;

    if (isProcessingRef.current) {
      scheduleNext();
      return;
    }

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

    isProcessingRef.current = true;
    try {
      const { ok, status, data, timedOut } = await predictFrameBlob(blob, {
        timeoutMs: FETCH_TIMEOUT_MS,
      });

      if (timedOut) {
        setLive((prev) => ({
          ...prev,
          lastError: 'Request timed out',
        }));
        return;
      }

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
      if (data?.status === 'no_hand' || responseStatus === 'no_hand') {
        setNoHand();
        return;
      }

      handleFrameResult(mudra, confidence, responseStatus);
    } catch {
      setLive((prev) => ({
        ...prev,
        lastError: 'Network error',
      }));
    } finally {
      isProcessingRef.current = false;
      scheduleNext();
    }
  }, [handleFrameResult, scheduleNext, setNoHand]);

  runTickRef.current = runTick;

  const start = useCallback(async () => {
    clearLoopTimer();
    runningRef.current = false;
    isProcessingRef.current = false;
    resetVoteBuffer();

    setLive({
      ...initialState,
      phase: 'detecting',
      message: 'Starting camera…',
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
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
  }, [clearLoopTimer, resetVoteBuffer, runTick]);

  const stop = useCallback(() => {
    runningRef.current = false;
    isProcessingRef.current = false;
    clearLoopTimer();
    resetVoteBuffer();

    setRunning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(initialState);
  }, [clearLoopTimer, resetVoteBuffer]);

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
