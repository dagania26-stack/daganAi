import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt";
import type { HistoryTurn } from "@/types";

// Instanciation lazy — évite l'erreur au build Next.js si la clé est absente
function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateWithOpenAI(
  question: string,
  context: string,
  history: HistoryTurn[] = [],
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((h) => ({ role: h.role, content: h.content }) as const),
      {
        role: "user",
        content: `Contexte documentaire :\n${context}\n\nQuestion : ${question}`,
      },
    ],
  });

  return response.choices[0].message.content ?? "";
}
