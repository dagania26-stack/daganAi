import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateWithOpenAI(
  question: string,
  context: string
): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 800,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Contexte documentaire :\n${context}\n\nQuestion : ${question}`,
      },
    ],
  });

  return response.choices[0].message.content ?? "";
}
