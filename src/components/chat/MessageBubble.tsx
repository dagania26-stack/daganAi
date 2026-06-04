import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import MessageSources from "./MessageSources";

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser      = message.role === "user";
  const hasSources  = (message.sources?.length ?? 0) > 0;

  return (
    <div
      className={cn(
        "flex items-end gap-2 w-full animate-fade-in-up",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* Avatar assistant (gauche) */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center self-end">
          <span className="font-display font-bold text-sm text-terracotta">D</span>
        </div>
      )}

      {/* Colonne : bulle + sources + timestamp */}
      <div
        className={cn(
          "flex flex-col gap-1",
          "max-w-[85%] md:max-w-[75%]",
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
          {message.content}

          {/* Curseur de streaming */}
          {!isUser && message.isStreaming && (
            <span
              className="inline-block w-0.5 h-[1em] ml-0.5 align-middle animate-pulse"
              style={{ backgroundColor: "currentColor" }}
              aria-hidden="true"
            />
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
      </div>

      {/* Spacer utilisateur (droite) — aligne avec l'avatar assistant */}
      {isUser && <div className="shrink-0 w-8" aria-hidden="true" />}
    </div>
  );
}
