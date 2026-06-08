from typing import Optional
from pydantic import BaseModel, Field


class HistoryMessage(BaseModel):
    role: str    # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    domaine: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=20)
    history: list[HistoryMessage] = Field(default_factory=list)


class ChunkSource(BaseModel):
    document_titre: str
    domaine: str
    source: str
    extrait: str      # 150 premiers caractères du chunk
    score: float      # score cosinus 0-1


class QueryResponse(BaseModel):
    reponse: str
    sources: list[ChunkSource]
    latence_ms: int


class RetrievalResponse(BaseModel):
    sources: list[ChunkSource]
    latence_ms: int


class IngestRequest(BaseModel):
    file_path: str
    domaine: str = Field(..., pattern=r"^(OHADA|OTR|FINANCEMENT)$")
    titre: str
    source: str
