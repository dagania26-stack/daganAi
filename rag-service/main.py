import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("dagan-rag")

# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[START] Dagan RAG service démarré")
    yield
    logger.info("[STOP] Dagan RAG service arrêté")


# ─── Application ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Dagan IA — RAG Service",
    description="Microservice de récupération augmentée (RAG) pour Dagan IA",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "https://dagan-ia.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# ─── Middleware de logging des requêtes ───────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.monotonic()
    response = await call_next(request)
    elapsed_ms = int((time.monotonic() - start) * 1000)
    logger.info(
        "%s %s → %d (%dms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response

# ─── Gestion globale des erreurs ──────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Erreur non gérée sur %s : %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur RAG", "type": type(exc).__name__},
    )

# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["infra"])
async def health():
    return {"status": "ok", "service": "dagan-rag"}


from routers.query import router as query_router

app.include_router(query_router, prefix="/api", tags=["query"])
