"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import MessageSources from "./MessageSources";
import MarkdownMessage from "./MarkdownMessage";

interface MessageBubbleProps {
  message: ChatMessage;
  onEdit?: (content: string) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function downloadAsPdf(content: string, date: Date) {
  const dateStr = date.toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Dagan IA — Réponse</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;max-width:680px;margin:40px auto;padding:24px;color:#1A1A1A;line-height:1.7}
    header{border-bottom:2px solid #C1440E;padding-bottom:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-end}
    h1{font-size:20px;color:#C1440E;font-weight:700}
    .date{font-size:12px;color:#6B6860}
    .content{font-size:14px;line-height:1.8}
    footer{margin-top:32px;border-top:1px solid #E8E0D8;padding-top:12px;font-size:11px;color:#6B6860;text-align:center}
    @media print{body{margin:20px}}
  </style>
</head>
<body>
  <header>
    <h1>Dagan IA — Réponse</h1>
    <span class="date">${dateStr}</span>
  </header>
  <div class="content">${escaped}</div>
  <footer>dagan-ia.tg — Grande Sœur Numérique pour les femmes entrepreneures</footer>
</body>
</html>`;

  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

export default function MessageBubble({ message, onEdit }: MessageBubbleProps) {
  const isUser     = message.role === "user";
  const hasSources = (message.sources?.length ?? 0) > 0;
  const isComplete = !message.isStreaming && !!message.content;

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [message.content]);

  const handleDownload = useCallback(() => {
    downloadAsPdf(message.content, message.createdAt);
  }, [message.content, message.createdAt]);

  return (
    <div
      className={cn(
        "flex items-end gap-2 w-full animate-fade-in-up",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar assistant (gauche) */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192x192.svg" alt="Dagan IA" width={32} height={32} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Colonne : bulle + sources + timestamp + actions */}
      <div
        className={cn(
          "flex flex-col gap-1",
          "max-w-[82%] sm:max-w-[78%] md:max-w-[72%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        {/* Bulle */}
        <div
          className={cn(
            "px-4 py-3 text-sm leading-relaxed font-sans",
            isUser
              ? "bg-terracotta text-white rounded-2xl rounded-tr-sm"
              : "bg-surface border border-border-custom text-dark rounded-2xl rounded-tl-sm",
          )}
        >
          {isUser ? (
            message.content
          ) : (
            <>
              <MarkdownMessage content={message.content} />
              {/* Curseur de streaming */}
              {message.isStreaming && (
                <span
                  className="inline-block w-0.5 h-[1em] ml-0.5 align-middle animate-pulse"
                  style={{ backgroundColor: "currentColor" }}
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </div>

        {/* Sources RAG (assistant uniquement) */}
        {!isUser && hasSources && (
          <div className="w-full px-1">
            <MessageSources sources={message.sources!} />
          </div>
        )}

        {/* Timestamp */}
        <span className={cn("text-xs text-muted px-1", isUser ? "text-right" : "text-left")}>
          {formatTime(message.createdAt)}
        </span>

        {/* ── Barre d'actions ───────────────────────────────────────────── */}
        {isUser && (
          <div className="flex items-center gap-1 px-1">
            {/* Copier le message */}
            <button
              onClick={handleCopy}
              title={copied ? "Copié !" : "Copier le message"}
              aria-label={copied ? "Copié" : "Copier le message"}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                "text-muted hover:text-dark hover:bg-surface",
                "transition-colors duration-150",
                copied && "text-forest",
              )}
            >
              <i className={`fi ${copied ? "fi-rr-check" : "fi-rr-copy"} text-xs leading-none`} aria-hidden="true" />
            </button>

            {/* Modifier le message */}
            {onEdit && (
              <button
                onClick={() => onEdit(message.content)}
                title="Modifier ce message"
                aria-label="Modifier ce message"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-surface transition-colors duration-150"
              >
                <i className="fi fi-rr-edit text-xs leading-none" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {isComplete && !isUser && (
          <div className="flex items-center gap-1 px-1">
            {/* Copier la réponse */}
            <button
              onClick={handleCopy}
              title={copied ? "Copié !" : "Copier la réponse"}
              aria-label={copied ? "Copié" : "Copier la réponse"}
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                "text-muted hover:text-dark hover:bg-surface",
                "transition-colors duration-150",
                copied && "text-forest",
              )}
            >
              <i className={`fi ${copied ? "fi-rr-check" : "fi-rr-copy"} text-xs leading-none`} aria-hidden="true" />
            </button>

            {/* Télécharger en PDF */}
            <button
              onClick={handleDownload}
              title="Télécharger en PDF"
              aria-label="Télécharger la réponse en PDF"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-dark hover:bg-surface transition-colors duration-150"
            >
              <i className="fi fi-rr-download text-xs leading-none" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* Spacer utilisateur (droite) — aligne avec l'avatar assistant */}
      {isUser && <div className="shrink-0 w-8" aria-hidden="true" />}
    </div>
  );
}
