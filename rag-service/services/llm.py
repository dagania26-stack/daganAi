import os
import time
import logging

import anthropic
from openai import OpenAI

logger = logging.getLogger("dagan-rag.llm")

_CLAUDE_MODEL  = "claude-sonnet-4-6"
_OPENAI_MODEL  = "gpt-4o-mini"
_MAX_TOKENS    = 1024
_TEMPERATURE   = 0.1

_anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
_openai_client    = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def call_llm(messages: list[dict]) -> str:
    """Génère une réponse LLM.

    Claude (claude-sonnet-4-6) par défaut.
    Bascule automatiquement sur GPT-4o-mini si Claude est indisponible.
    """
    # ── Claude — modèle principal ──────────────────────────────────────────────
    try:
        return _call_claude(messages)
    except Exception as exc:
        logger.warning(
            "Claude indisponible (%s: %s) — bascule sur %s",
            type(exc).__name__,
            exc,
            _OPENAI_MODEL,
        )

    # ── GPT-4o-mini — fallback ────────────────────────────────────────────────
    return _call_openai(messages)


def _call_claude(messages: list[dict]) -> str:
    system_prompt = next(
        (m["content"] for m in messages if m["role"] == "system"), ""
    )
    user_messages = [m for m in messages if m["role"] != "system"]

    start = time.monotonic()
    response = _anthropic_client.messages.create(
        model=_CLAUDE_MODEL,
        max_tokens=_MAX_TOKENS,
        system=system_prompt,
        messages=user_messages,
    )
    latence_ms = int((time.monotonic() - start) * 1000)

    content = response.content[0].text.strip()
    logger.info("LLM: model=%s latence=%dms chars=%d", _CLAUDE_MODEL, latence_ms, len(content))
    return content


def _call_openai(messages: list[dict]) -> str:
    start = time.monotonic()
    response = _openai_client.chat.completions.create(
        model=_OPENAI_MODEL,
        max_tokens=_MAX_TOKENS,
        temperature=_TEMPERATURE,
        messages=messages,  # type: ignore[arg-type]
    )
    latence_ms = int((time.monotonic() - start) * 1000)

    content = (response.choices[0].message.content or "").strip()
    logger.info("LLM: model=%s latence=%dms chars=%d", _OPENAI_MODEL, latence_ms, len(content))
    return content
