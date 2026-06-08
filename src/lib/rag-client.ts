import type { RAGServiceResponse, RAGSource, HistoryTurn } from "@/types";

// Configurable via RAG_TIMEOUT_MS — défaut 8s pour rester dans les limites Vercel
const RAG_TIMEOUT_MS = parseInt(process.env.RAG_TIMEOUT_MS ?? "8000", 10);

// Forme brute retournée par le service Python (snake_case)
type PythonChunkSource = {
  document_titre: string;
  domaine: string;
  source: string;
  extrait: string;
  score: number;
};

type PythonQueryResponse = {
  reponse: string;
  sources: PythonChunkSource[];
  latence_ms: number;
};

function mapSource(raw: PythonChunkSource): RAGSource {
  return {
    documentTitre: raw.document_titre,
    domaine:       raw.domaine,
    source:        raw.source,
    extrait:       raw.extrait,
    score:         raw.score,
  };
}

export async function queryRAG(
  question: string,
  conversationId?: string,
  domaine?: string,
  history: HistoryTurn[] = [],
): Promise<RAGServiceResponse> {
  const url = `${process.env.RAG_SERVICE_URL}/api/query`;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), RAG_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        conversation_id: conversationId ?? null,
        domaine:         domaine ?? null,
        top_k:           3,
        history,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "(pas de détail)");
      throw new Error(`RAG service — HTTP ${res.status}: ${text}`);
    }

    const data = (await res.json()) as PythonQueryResponse;

    return {
      reponse:    data.reponse,
      latence_ms: data.latence_ms,
      sources:    (data.sources ?? []).map(mapSource),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`RAG service — timeout après ${RAG_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
