import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./prompt";
import type { HistoryTurn } from "@/types";

// Instanciation lazy — évite l'erreur au build Next.js si la clé est absente
function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateWithClaude(
  question: string,
  context: string,
  history: HistoryTurn[] = [],
): Promise<string> {
  const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      {
        role: "user",
        content: `Contexte documentaire :\n${context}\n\nQuestion : ${question}`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Réponse Claude invalide");
  return block.text;
}
