import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Endpoint de diagnostic — désactivé en production
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model:      process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 64,
      messages:   [{ role: "user", content: "Dis juste : OK" }],
    });
    const text = msg.content[0].type === "text" ? msg.content[0].text : "non-text";
    return NextResponse.json({ ok: true, response: text, model: msg.model });
  } catch (err) {
    return NextResponse.json({
      ok:    false,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
