"""Script CLI d'ingestion de documents PDF dans Dagan IA.

Usage :
    python ingestion/ingest.py \\
        --file /chemin/vers/document.pdf \\
        --domaine OHADA \\
        --titre "Acte Uniforme OHADA sur le Droit Commercial Général" \\
        --source "ohada.com"

Domaines disponibles : OHADA | OTR | FINANCEMENT

Le script :
    1. Extrait et nettoie le texte du PDF
    2. Découpe le texte en chunks selon le domaine
    3. Génère l'embedding OpenAI pour chaque chunk
    4. Insère le Document et les Chunks en base PostgreSQL (avec pgvector)
"""

import argparse
import os
import sys
import uuid
import time

import numpy as np
import psycopg2
from pgvector.psycopg2 import register_vector
from dotenv import load_dotenv

# Ajoute le répertoire rag-service/ au path pour les imports relatifs
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from ingestion.cleaner import prepare_document      # noqa: E402
from ingestion.chunker import chunk_document, count_tokens  # noqa: E402
from services.embedder import get_embedding         # noqa: E402


def _get_connection() -> psycopg2.extensions.connection:
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    register_vector(conn)
    return conn


def ingest(
    file_path: str,
    domaine: str,
    titre: str,
    source: str,
    version: str = "1.0",
) -> None:
    print(f"\n[FILE]    Fichier  : {file_path}")
    print(f"          Domaine  : {domaine}")
    print(f"          Titre    : {titre}")
    print(f"          Source   : {source}\n")

    # ── 1. Extraction et nettoyage ─────────────────────────────────────────────
    print("[...] Extraction du texte PDF...")
    text = prepare_document(file_path)
    print(f"      {len(text):,} caractères extraits.\n")

    # ── 2. Chunking ────────────────────────────────────────────────────────────
    print("[CUT] Découpage en chunks...")
    chunks = chunk_document(text, domaine)
    total = len(chunks)
    print(f"      {total} chunks générés.\n")

    if total == 0:
        print("[ERROR] Aucun chunk généré. Vérifiez le PDF et le domaine.")
        sys.exit(1)

    # ── 3. Connexion base de données ───────────────────────────────────────────
    conn = _get_connection()

    try:
        with conn.cursor() as cur:
            # ── 4. Insertion du Document ───────────────────────────────────────
            doc_id = str(uuid.uuid4())
            cur.execute(
                """
                INSERT INTO "Document"
                    (id, titre, domaine, source, version, actif, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, true, NOW(), NOW())
                """,
                (doc_id, titre, domaine.upper(), source, version),
            )
            print(f"[DB]  Document inséré (id={doc_id})\n")

            # ── 5. Embedding + insertion des Chunks ────────────────────────────
            print("[EMBED] Génération des embeddings et insertion des chunks :\n")
            start_all = time.monotonic()

            for i, chunk_text in enumerate(chunks, start=1):
                chunk_start = time.monotonic()
                embedding   = get_embedding(chunk_text)
                vec         = np.array(embedding, dtype=np.float32)
                token_count = count_tokens(chunk_text)
                chunk_id    = str(uuid.uuid4())

                cur.execute(
                    """
                    INSERT INTO "Chunk"
                        (id, contenu, embedding, position, "tokenCount", "documentId", "createdAt")
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    """,
                    (chunk_id, chunk_text, vec, i - 1, token_count, doc_id),
                )

                elapsed = int((time.monotonic() - chunk_start) * 1000)
                print(
                    f"   [{i:>3}/{total}] {token_count:>4} tokens — {elapsed}ms"
                    f" — {chunk_text[:60].replace(chr(10), ' ')!r}..."
                )

        conn.commit()
        total_s = time.monotonic() - start_all
        print(f"\n[OK]  Ingestion terminée : {total} chunks en {total_s:.1f}s")
        print(f"      Document ID : {doc_id}\n")

    except Exception as exc:
        conn.rollback()
        print(f"\n[ERROR] Erreur — rollback effectué : {exc}")
        raise
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Ingestion de documents PDF dans la base vectorielle Dagan IA",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--file",    required=True, help="Chemin vers le fichier PDF")
    parser.add_argument(
        "--domaine", required=True,
        choices=["OHADA", "OTR", "FINANCEMENT"],
        help="Domaine juridique/fiscal du document",
    )
    parser.add_argument("--titre",   required=True, help="Titre du document")
    parser.add_argument("--source",  required=True, help="URL ou référence source")
    parser.add_argument("--version", default="1.0",  help="Version du document (défaut: 1.0)")
    args = parser.parse_args()

    if not os.path.isfile(args.file):
        print(f"[ERROR] Fichier introuvable : {args.file}")
        sys.exit(1)

    if not os.environ.get("DATABASE_URL"):
        print("[ERROR] Variable DATABASE_URL manquante. Vérifiez votre fichier .env")
        sys.exit(1)

    if not os.environ.get("OPENAI_API_KEY"):
        print("[ERROR] Variable OPENAI_API_KEY manquante.")
        sys.exit(1)

    ingest(
        file_path=args.file,
        domaine=args.domaine,
        titre=args.titre,
        source=args.source,
        version=args.version,
    )


if __name__ == "__main__":
    main()
