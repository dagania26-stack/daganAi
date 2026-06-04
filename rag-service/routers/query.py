import time
import logging

from fastapi import APIRouter, HTTPException
from pydantic import field_validator

from models.schemas import QueryRequest, QueryResponse, RetrievalResponse, ChunkSource
from services.embedder import get_embedding
from services.retriever import retrieve_chunks
from services.prompt_builder import build_messages
from services.llm import call_llm

logger = logging.getLogger("dagan-rag.query")

router = APIRouter()

_NO_RESULT_MSG = (
    "Je n'ai pas d'information sur ce sujet dans ma base de documents. "
    "Je te recommande de contacter directement l'OTR à Lomé "
    "ou de visiter le site officiel otr.tg pour obtenir une réponse précise."
)


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest) -> QueryResponse:
    """Pipeline complet : embed → retrieve → prompt → LLM → réponse."""
    if not request.question.strip():
        raise HTTPException(status_code=422, detail="La question ne peut pas être vide.")
    if len(request.question) > 500:
        raise HTTPException(status_code=422, detail="La question dépasse 500 caractères.")

    start = time.monotonic()

    try:
        # a. Embedding de la question
        embedding = get_embedding(request.question)

        # b. Récupération des chunks pertinents
        raw_chunks = retrieve_chunks(
            embedding=embedding,
            top_k=request.top_k,
            domaine=request.domaine,
        )

        # c. Aucun chunk pertinent trouvé
        if not raw_chunks:
            latence_ms = int((time.monotonic() - start) * 1000)
            logger.info("query: 0 chunks — réponse par défaut en %dms", latence_ms)
            return QueryResponse(
                reponse=_NO_RESULT_MSG,
                sources=[],
                latence_ms=latence_ms,
            )

        # d. Construction des messages et appel LLM
        messages  = build_messages(question=request.question, chunks=raw_chunks)
        reponse   = call_llm(messages)

        sources = [
            ChunkSource(
                document_titre=c["document_titre"],
                domaine=c["domaine"],
                source=c["source"],
                extrait=c["contenu"][:150],
                score=c["score"],
            )
            for c in raw_chunks
        ]

        latence_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            "query: %d sources, latence=%dms, question=%r",
            len(sources),
            latence_ms,
            request.question[:60],
        )

        return QueryResponse(reponse=reponse, sources=sources, latence_ms=latence_ms)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Erreur pipeline query : %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Erreur interne du service RAG.") from exc


@router.post("/retrieve", response_model=RetrievalResponse)
async def retrieve(request: QueryRequest) -> RetrievalResponse:
    """Chunks seuls — LLM géré côté Next.js (Claude / GPT)."""
    if not request.question.strip():
        raise HTTPException(status_code=422, detail="La question ne peut pas être vide.")

    start = time.monotonic()

    try:
        embedding  = get_embedding(request.question)
        raw_chunks = retrieve_chunks(
            embedding=embedding,
            top_k=request.top_k,
            domaine=request.domaine,
        )
    except Exception as exc:
        logger.error("Erreur retrieve : %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    sources = [
        ChunkSource(
            document_titre=c["document_titre"],
            domaine=c["domaine"],
            source=c["source"],
            extrait=c["contenu"][:150],
            score=c["score"],
        )
        for c in raw_chunks
    ]

    latence_ms = int((time.monotonic() - start) * 1000)
    logger.info("retrieve: %d sources en %dms", len(sources), latence_ms)

    return RetrievalResponse(sources=sources, latence_ms=latence_ms)
