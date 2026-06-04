"use client";

import { useState, useCallback, useEffect } from "react";
import type { ChatMessage } from "@/types";
import { generateId } from "@/lib/utils";

const SESSION_KEY = "dagan_conversation_id";
const MAX_CHARS   = 500;
const TIMEOUT_MS  = 30_000;

export interface UseChatReturn {
  messages:       ChatMessage[];
  isLoading:      boolean;
  conversationId: string | null;
  error:          string | null;
  toast:          string | null;
  sendMessage:    (question: string) => Promise<void>;
  clearMessages:  () => void;
  clearToast:     () => void;
}

function classifyError(err: unknown, status?: number): string {
  if (status === 400)
    return "Ta question est trop longue. Essaie de la reformuler en moins de 500 caractères.";
  if (status === 500)
    return "Un problème technique est survenu. L'équipe est prévenue.";
  if (err instanceof Error) {
    if (err.name === "AbortError")
      return "La réponse prend trop de temps. Réessaie dans quelques instants.";
    if (!navigator.onLine || err.message.toLowerCase().includes("fetch"))
      return "Pas de connexion internet. Vérifie ta connexion et réessaie.";
  }
  return err instanceof Error ? err.message : "Une erreur est survenue.";
}

export function useChat(): UseChatReturn {
  const [messages,       setMessages]       = useState<ChatMessage[]>([]);
  const [isLoading,      setIsLoading]      = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error,          setError]          = useState<string | null>(null);
  const [toast,          setToast]          = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setConversationId(saved);
  }, []);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || trimmed.length > MAX_CHARS || isLoading) return;

    // Détection de question doublon
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg?.content === trimmed) {
      setToast("Tu as déjà posé cette question.");
      return;
    }

    const userMsgId      = generateId();
    const assistantMsgId = generateId();

    const userMsg: ChatMessage = {
      id: userMsgId, role: "user", content: trimmed, createdAt: new Date(),
    };
    const assistantPlaceholder: ChatMessage = {
      id: assistantMsgId, role: "assistant", content: "", isStreaming: true, createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ question: trimmed, conversationId }),
        signal:  controller.signal,
      });

      const data = await res.json().catch(() => ({})) as {
        reponse?:        string;
        sources?:        ChatMessage["sources"];
        conversationId?: string;
        error?:          string;
      };

      if (!res.ok) throw Object.assign(new Error(data.error ?? ""), { status: res.status });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: data.reponse ?? "", sources: data.sources ?? [], isStreaming: false }
            : m,
        ),
      );

      if (data.conversationId) {
        setConversationId(data.conversationId);
        sessionStorage.setItem(SESSION_KEY, data.conversationId);
      }
    } catch (err) {
      const status = (err as { status?: number }).status;
      const msg    = classifyError(err, status);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== assistantMsgId);
        const errMsg: ChatMessage = {
          id: generateId(), role: "assistant",
          content:   `Désolée, je n'ai pas pu traiter ta question. ${msg}`,
          createdAt: new Date(),
        };
        return [...filtered, errMsg];
      });

      setError(msg);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, [conversationId, isLoading, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setConversationId(null);
    setError(null);
    setToast(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { messages, isLoading, conversationId, error, toast, sendMessage, clearMessages, clearToast };
}
