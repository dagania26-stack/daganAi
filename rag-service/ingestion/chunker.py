import re

import tiktoken
from langchain.text_splitter import RecursiveCharacterTextSplitter

_enc = tiktoken.get_encoding("cl100k_base")


def count_tokens(text: str) -> int:
    """Compte les tokens avec l'encodage cl100k_base (GPT-3.5/4 compatible)."""
    return len(_enc.encode(text))


def chunk_ohada(text: str) -> list[str]:
    """Découpe un texte OHADA article par article.

    Utilise le motif "Article X" comme délimiteur de section.
    Conserve le titre de l'article dans chaque chunk.
    Filtre les fragments trop courts (< 80 caractères).
    """
    parts = re.split(r"(?=\bArticle\s+\d+\b)", text, flags=re.IGNORECASE)
    return [p.strip() for p in parts if p.strip() and len(p.strip()) >= 80]


def chunk_guide(text: str) -> list[str]:
    """Découpe un texte de guide ou de documentation fiscale / financement.

    Utilise RecursiveCharacterTextSplitter avec count_tokens comme
    fonction de longueur : chunk_size=500 tokens, overlap=100 tokens.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        length_function=count_tokens,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_text(text)
    return [c.strip() for c in chunks if c.strip()]


def chunk_document(text: str, domaine: str) -> list[str]:
    """Dispatche vers la stratégie de chunking adaptée au domaine.

    - OHADA → découpage article par article (chunk_ohada)
    - OTR, FINANCEMENT ou autre → découpage récursif par tokens (chunk_guide)
    """
    if domaine.upper() == "OHADA":
        return chunk_ohada(text)
    return chunk_guide(text)
