from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import cv2
import joblib
import numpy as np
from fastapi import APIRouter, File, UploadFile

from app.services.feature_extractor import FEATURE_VECTOR_SIZE
from app.services.mediapipe_service import MediaPipeHandService

router = APIRouter(tags=["mudra"])

_MODEL: Any = None
_LABEL_ENCODER: Any = None
_SERVICE: MediaPipeHandService | None = None


def clean_mudra_label(raw: str) -> str:
    if not raw:
        return raw
    return raw.split("(", 1)[0].strip()


def _models_dir() -> Path:
    return Path(__file__).resolve().parent.parent / "models"


# ✅ LOAD ONCE
def load_model() -> None:
    global _MODEL, _LABEL_ENCODER, _SERVICE

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

    print("✅ Model + MediaPipe loaded")


def unload_artifacts() -> None:
    global _SERVICE
    if _SERVICE is not None:
        try:
            _SERVICE.close()
        except Exception:
            pass
        _SERVICE = None


@router.get("/mudra/labels")
def list_labels() -> dict:
    p = _models_dir() / "label_map.json"
    if not p.is_file():
        return {"classes": []}
    data = json.loads(p.read_text(encoding="utf-8"))
    return {"classes": data.get("classes") or []}


# 🚀 FINAL SAFE ENDPOINT
@router.post("/mudra/predict-frame")
async def predict_frame(file: UploadFile = File(...)) -> dict:
    start = time.time()

    # ✅ MODEL LOADING STATE
    if _MODEL is None or _SERVICE is None:
        return {"mudra": None, "confidence": 0.0, "status": "loading"}

    try:
        raw = await file.read()
        if not raw:
            return {"mudra": None, "confidence": 0.0}

        arr = np.frombuffer(raw, dtype=np.uint8)
        bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)

        if bgr is None:
            return {"mudra": None, "confidence": 0.0}

        # ⚡ SPEED BOOST
        bgr = cv2.resize(bgr, (256, 256))

        feat = _SERVICE.feature_vector_from_bgr(bgr)
        if feat is None:
            return {"mudra": None, "confidence": 0.0}

        if feat.shape[0] != FEATURE_VECTOR_SIZE:
            return {"mudra": None, "confidence": 0.0}

        proba = _MODEL.predict_proba(feat.reshape(1, -1))[0]
        idx = int(np.argmax(proba))
        confidence = float(proba[idx])

        if _LABEL_ENCODER is not None:
            label = str(_LABEL_ENCODER.inverse_transform(np.array([idx]))[0])
        else:
            label = str(_MODEL.classes_[idx])

        label = clean_mudra_label(label)

        print("⏱ Prediction time:", round(time.time() - start, 2), "sec")

        return {"mudra": label, "confidence": confidence}

    except Exception as e:
        print("🔥 ERROR:", str(e))
        return {"mudra": None, "confidence": 0.0}