import asyncio
import logging
import os
from contextlib import asynccontextmanager

# Silence logs
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")
os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("absl").setLevel(logging.ERROR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import mudra


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO)
    try:
        mudra.load_model()
    except Exception:
        logging.getLogger(__name__).exception("Model failed to load at startup")

    yield

    try:
        await asyncio.to_thread(mudra.unload_artifacts)
    except Exception:
        mudra.unload_artifacts()


app = FastAPI(title="NrityaAI Mudra", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mudra.router)


@app.get("/")
def root():
    return {"message": "NrityaAI backend running"}


@app.get("/health")
def health():
    return {"status": "ok"}