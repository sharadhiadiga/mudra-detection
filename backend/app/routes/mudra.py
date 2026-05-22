from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Any

import cv2
import joblib
import numpy as np
from fastapi import APIRouter, File, UploadFile

from app.services.feature_extractor import FEATURE_VECTOR_SIZE
from app.services.mediapipe_service import MediaPipeHandService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["mudra"])

_MODEL: Any = None
_LABEL_ENCODER: Any = None
_SERVICE: MediaPipeHandService | None = None

FRAME_SIZE = (128, 128)
READ_TIMEOUT_SEC = 2.0
PREDICT_TIMEOUT_SEC = 4.0
MAX_UPLOAD_BYTES = 512_000

_NO_HAND = {"mudra": None, "confidence": 0.0, "status": "no_hand"}


def clean_mudra_label(raw: str) -> str:
    if not raw:
        return raw
    return raw.split("(", 1)[0].strip()


def _models_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "models"


def load_model() -> None:
    """Load model and MediaPipe once at application startup."""
    global _MODEL, _LABEL_ENCODER, _SERVICE

    if _MODEL is not None and _SERVICE is not None:
        return

    model_path = _models_dir() / "mudra_model.pkl"
    if not model_path.is_file():
        raise FileNotFoundError(f"Missing model: {model_path}")

    bundle = joblib.load(model_path)

    if isinstance(bundle, dict) and "model" in bundle:
        _MODEL = bundle["model"]
        _LABEL_ENCODER = bundle.get("label_encoder")
    else:
        _MODEL = bundle
        _LABEL_ENCODER = None

    if _SERVICE is None:
        _SERVICE = MediaPipeHandService()

    logger.info("Mudra model and MediaPipe ready")


def unload_artifacts() -> None:
    global _SERVICE, _MODEL, _LABEL_ENCODER
    if _SERVICE is not None:
        try:
            _SERVICE.close()
        except Exception:
            pass
        _SERVICE = None
    _MODEL = None
    _LABEL_ENCODER = None


def _predict_from_bytes(raw: bytes) -> dict:
    """Synchronous inference using globals loaded at startup."""
    if _MODEL is None or _SERVICE is None:
        return {"mudra": None, "confidence": 0.0, "status": "loading"}

    if not raw:
        return dict(_NO_HAND)

    arr = np.frombuffer(raw, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        return dict(_NO_HAND)

    bgr = cv2.resize(bgr, FRAME_SIZE, interpolation=cv2.INTER_AREA)

    feat = _SERVICE.feature_vector_from_bgr(bgr)
    if feat is None:
        return dict(_NO_HAND)

    if feat.shape[0] != FEATURE_VECTOR_SIZE:
        return dict(_NO_HAND)

    proba = _MODEL.predict_proba(feat.reshape(1, -1))[0]
    idx = int(np.argmax(proba))
    confidence = float(proba[idx])

    if _LABEL_ENCODER is not None:
        label = str(_LABEL_ENCODER.inverse_transform(np.array([idx]))[0])
    else:
        label = str(_MODEL.classes_[idx])

    label = clean_mudra_label(label)
    return {"mudra": label, "confidence": confidence}


@router.get("/mudra/labels")
def list_labels() -> dict:
    p = _models_dir() / "label_map.json"
    if not p.is_file():
        return {"classes": []}
    data = json.loads(p.read_text(encoding="utf-8"))
    return {"classes": data.get("classes") or []}


@router.post("/mudra/predict-frame")
async def predict_frame(file: UploadFile = File(...)) -> dict:
    try:
        raw = await asyncio.wait_for(file.read(), timeout=READ_TIMEOUT_SEC)
    except asyncio.TimeoutError:
        return {"mudra": None, "confidence": 0.0, "status": "timeout"}

    if len(raw) > MAX_UPLOAD_BYTES:
        return {"mudra": None, "confidence": 0.0, "status": "error"}

    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_predict_from_bytes, raw),
            timeout=PREDICT_TIMEOUT_SEC,
        )
    except asyncio.TimeoutError:
        return {"mudra": None, "confidence": 0.0, "status": "timeout"}
    except Exception:
        logger.exception("predict-frame failed")
        return {"mudra": None, "confidence": 0.0, "status": "error"}
