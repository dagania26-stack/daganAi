// ─── Source documentaire retournée par le RAG ────────────────────────────────
export interface RAGSource {
  documentTitre: string;
  domaine: string;
  source: string;
  extrait: string; // 150 premiers caractères du chunk
  score: number;   // score cosinus 0-1
}

// ─── Message dans le chat UI ──────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RAGSource[];
  isStreaming?: boolean;
  createdAt: Date;
}

// ─── Tour de conversation transmis au LLM pour garder le contexte ────────────
export interface HistoryTurn {
  role:    "user" | "assistant";
  content: string;
}

// ─── Conversation listée dans l'historique utilisateur ───────────────────────
export interface ConversationSummary {
  id:           string;
  titre:        string;
  derniereMaj:  string;
  apercu:       string;
}

// ─── Requête vers /api/chat ───────────────────────────────────────────────────
export interface ChatRequest {
  question: string;
  conversationId?: string;
}

// ─── Réponse de /api/chat ─────────────────────────────────────────────────────
export interface ChatResponse {
  reponse: string;
  sources: RAGSource[];
  conversationId: string;
  messageId: string;
  latenceMs: number;
}

// ─── Réponse du microservice Python RAG ──────────────────────────────────────
export interface RAGServiceResponse {
  reponse: string;
  sources: RAGSource[];
  latence_ms: number;
}

// ─── État global du hook useChat ──────────────────────────────────────────────
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  conversationId: string | null;
  error: string | null;
}

// ─── Props des composants principaux ─────────────────────────────────────────
export interface MessageBubbleProps {
  message: ChatMessage;
}

export interface InputBarProps {
  onSend: (question: string) => void;
  isLoading: boolean;
}

// ─── Domaines RAG disponibles ─────────────────────────────────────────────────
export type RAGDomain = "OHADA" | "OTR" | "FINANCEMENT" | "ALL";

// ─── Questions suggérées ──────────────────────────────────────────────────────
export interface SuggestedQuestion {
  id: string;
  text: string;
  domaine: RAGDomain;
}
