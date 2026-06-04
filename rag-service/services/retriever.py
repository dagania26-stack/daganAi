import os
import logging
from typing import Optional

import numpy as np
import psycopg2
from pgvector.psycopg2 import register_vector

logger = logging.getLogger("dagan-rag.retriever")

_SCORE_THRESHOLD = 0.30   # chunks sous ce seuil de similarité cosinus sont ignorés

_SQL_ALL = """
    SELECT
        c.id,
        c.contenu,
        c.position,
        d.titre,
        d.domaine,
        d.source,
        1 - (c.embedding <=> %s) AS score
    FROM "Chunk" c
    JOIN "Document" d ON c."documentId" = d.id
    WHERE d.actif = true
    ORDER BY c.embedding <=> %s
    LIMIT %s
"""

_SQL_DOMAINE = """
    SELECT
        c.id,
        c.contenu,
        c.position,
        d.titre,
        d.domaine,
        d.source,
        1 - (c.embedding <=> %s) AS score
    FROM "Chunk" c
    JOIN "Document" d ON c."documentId" = d.id
    WHERE d.actif = true
      AND d.domaine = %s
    ORDER BY c.embedding <=> %s
    LIMIT %s
"""


def retrieve_chunks(
    embedding: list[float],
    top_k: int = 5,
    domaine: Optional[str] = None,
) -> list[dict]:
    """Retourne les chunks les plus similaires à l'embedding donné.

    Filtre automatiquement les résultats dont le score cosinus est < 0.30.
    """
    vec = np.array(embedding, dtype=np.float32)

    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    register_vector(conn)

    try:
        with conn.cursor() as cur:
            if domaine and domaine.upper() != "ALL":
                cur.execute(_SQL_DOMAINE, (vec, domaine.upper(), vec, top_k))
            else:
                cur.execute(_SQL_ALL, (vec, vec, top_k))

            rows = cur.fetchall()

    finally:
        conn.close()

    results = [
        {
            "id":             row[0],
            "contenu":        row[1],
            "position":       row[2],
            "document_titre": row[3],
            "domaine":        row[4],
            "source":         row[5],
            "score":          float(row[6]),
        }
        for row in rows
        if float(row[6]) >= _SCORE_THRESHOLD   # filtre les chunks non pertinents
    ]

    logger.info(
        "retrieve_chunks: %d/%d chunks retenus (seuil=%.2f, domaine=%s)",
        len(results),
        len(rows),
        _SCORE_THRESHOLD,
        domaine or "ALL",
    )
    return results
