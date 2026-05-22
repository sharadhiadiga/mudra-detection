import asyncio
import logging
import os
import threading
from contextlib import asynccontextmanager

# Quiet TensorFlow / absl before any app import pulls mediapipe.
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("absl").setLevel(logging.ERROR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import mudra


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🚀 Load model in background (NON-BLOCKING)
    def background_load():
        try:
            mudra.load_model()
            print("✅ Model loaded in background")
        except FileNotFoundError:
            print("⚠️ Model not found at startup")

    threading.Thread(target=background_load).start()

    yield

    # 🧹 Cleanup (safe shutdown)
    try:
        await asyncio.to_thread(mudra.unload_artifacts)
    except asyncio.CancelledError:
        mudra.unload_artifacts()
        raise


app = FastAPI(title="NrityaAI Mudra", lifespan=lifespan)

# 🌐 CORS (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔗 Routes
app.include_router(mudra.router)


# ❤️ Health check (important for Render)
@app.get("/health")
def health() -> dict:
    return {"status": "ok"}