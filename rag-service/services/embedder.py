import os
import time
import logging

from openai import OpenAI, APIError, RateLimitError, APIConnectionError

logger = logging.getLogger("dagan-rag.embedder")

_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

_EMBED_MODEL = "text-embedding-3-small"
_MAX_CHARS   = 8_000   # ~2 000 tokens, sous la limite du modèle
_MAX_RETRIES = 3


def get_embedding(text: str) -> list[float]:
    """Retourne un vecteur de 1536 dimensions pour le texte donné.

    Retente jusqu'à 3 fois en cas d'erreur API, avec délai exponentiel.
    """
    truncated = text[:_MAX_CHARS]
    last_err: Exception | None = None

    for attempt in range(_MAX_RETRIES):
        try:
            response = _client.embeddings.create(
                model=_EMBED_MODEL,
                input=truncated,
            )
            embedding = response.data[0].embedding

            if len(embedding) != 1536:
                raise ValueError(
                    f"Dimension inattendue : {len(embedding)} (attendu 1536)"
                )

            logger.debug("Embedding OK — %d dims (tentative %d)", len(embedding), attempt + 1)
            return embedding

        except (RateLimitError, APIConnectionError, APIError) as exc:
            last_err = exc
            delay = 2 ** attempt          # 1s → 2s → 4s
            logger.warning(
                "Embedding tentative %d/%d échouée (%s), nouvel essai dans %ds",
                attempt + 1,
                _MAX_RETRIES,
                type(exc).__name__,
                delay,
            )
            time.sleep(delay)

    raise RuntimeError(
        f"Embedding impossible après {_MAX_RETRIES} tentatives"
    ) from last_err
