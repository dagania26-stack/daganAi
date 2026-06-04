import re

from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Extrait le texte brut de toutes les pages d'un PDF."""
    reader = PdfReader(file_path)
    pages: list[str] = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n".join(pages)


def clean_text(text: str) -> str:
    """Nettoie le texte extrait du PDF.

    - Supprime les caractères de contrôle (sauf \\n)
    - Normalise les espaces et tabulations
    - Réduit les lignes vides consécutives à 2 maximum
    - Supprime les tirets de coupure de mots en fin de ligne
    """
    # Caractères de contrôle (hors \\t et \\n)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Tirets de coupure de mots (ex: "com-\npétence" → "compétence")
    text = re.sub(r"-\n(\w)", r"\1", text)

    # Espaces et tabulations multiples → espace simple
    text = re.sub(r"[ \t]+", " ", text)

    # Plus de 2 sauts de ligne consécutifs → 2 sauts
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Espaces en début/fin de ligne
    text = "\n".join(line.strip() for line in text.splitlines())

    return text.strip()


def prepare_document(file_path: str) -> str:
    """Pipeline complet : extraction PDF + nettoyage du texte."""
    raw_text = extract_text_from_pdf(file_path)
    return clean_text(raw_text)
