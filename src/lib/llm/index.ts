import { generateWithClaude } from "./claude";
import { generateWithOpenAI } from "./openai";

export { buildContext } from "./prompt";

export type LLMProvider = "claude" | "openai";

export async function generateResponse(
  question: string,
  context: string,
  provider: LLMProvider = "claude"
): Promise<{ reponse: string; provider: LLMProvider }> {
  if (provider === "openai") {
    const reponse = await generateWithOpenAI(question, context);
    return { reponse, provider: "openai" };
  }

  // Claude par défaut — bascule automatique sur GPT si indisponible
  try {
    const reponse = await generateWithClaude(question, context);
    return { reponse, provider: "claude" };
  } catch (err) {
    console.warn("[LLM] Claude indisponible, bascule sur GPT-4o-mini :", err);
    const reponse = await generateWithOpenAI(question, context);
    return { reponse, provider: "openai" };
  }
}
