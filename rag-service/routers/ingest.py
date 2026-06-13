import asyncio
import logging
import os
import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile

from ingestion.ingest import ingest as _ingest

logger = logging.getLogger("dagan-rag.ingest")

router = APIRouter()

_INGEST_SECRET  = os.getenv("INGEST_SECRET", "")
_ALLOWED_DOMAINES = {"OHADA", "OTR", "FINANCEMENT"}
_ALLOWED_EXTS     = {".pdf", ".txt", ".md"}


@router.post("/ingest")
async def ingest_document(
    file: UploadFile = File(..., description="Fichier PDF, TXT ou MD à ingérer"),
    domaine: str     = Form(..., description="OHADA | OTR | FINANCEMENT"),
    titre: str       = Form(..., description="Titre du document"),
    source: str      = Form(..., description="URL ou référence source"),
    version: str     = Form("1.0"),
    x_api_key: str   = Header(..., alias="x-api-key"),
):
    if not _INGEST_SECRET or x_api_key != _INGEST_SECRET:
        raise HTTPException(status_code=401, detail="Clé API invalide")

    domaine = domaine.upper()
    if domaine not in _ALLOWED_DOMAINES:
        raise HTTPException(
            status_code=400,
            detail=f"Domaine invalide. Acceptés : {', '.join(sorted(_ALLOWED_DOMAINES))}",
        )

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED_EXTS:
        raise HTTPException(
            status_code=400,
            detail=f"Format non supporté : {suffix!r} — acceptés : .pdf .txt .md",
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    logger.info("Ingestion démarrée — titre=%r domaine=%s fichier=%s", titre, domaine, file.filename)

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            lambda: _ingest(tmp_path, domaine, titre, source, version),
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    logger.info("Ingestion terminée — titre=%r", titre)
    return {"ok": True, "titre": titre, "domaine": domaine, "version": version}
