"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ChatMessage, ConversationSummary } from "@/types";
import { generateId } from "@/lib/utils";

const SESSION_KEY   = "dagan_conversation_id";
const MAX_CHARS     = 500;
const TIMEOUT_MS    = 30_000;
// Streaming simulé : 25 caractères toutes les 25 ms → ~1 000 chars/s
const STREAM_CHUNK  = 25;
const STREAM_TICK   = 25;

export interface UseChatReturn {
  messages:            ChatMessage[];
  isLoading:           boolean;
  conversationId:      string | null;
  error:               string | null;
  toast:               string | null;
  conversations:       ConversationSummary[];
  isHistoryLoading:    boolean;
  sendMessage:         (question: string) => Promise<void>;
  stopMessage:         () => void;
  clearMessages:       () => void;
  clearToast:          () => void;
  fetchConversations:  () => Promise<void>;
  loadConversation:    (id: string) => Promise<void>;
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
  const [conversations,    setConversations]    = useState<ConversationSummary[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const abortRef       = useRef<AbortController | null>(null);
  const userAbortedRef = useRef(false);
  const streamTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) setConversationId(saved);
  }, []);

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || trimmed.length > MAX_CHARS || isLoading) return;

    // Détection doublon
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
    abortRef.current     = controller;
    userAbortedRef.current = false;
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

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

      // Déverrouille l'input dès réception
      clearTimeout(timeoutId);
      abortRef.current = null;
      setIsLoading(false);

      if (data.conversationId) {
        setConversationId(data.conversationId);
        sessionStorage.setItem(SESSION_KEY, data.conversationId);
      }

      // Streaming simulé : affiche le texte progressivement
      const fullContent = data.reponse ?? "";
      const sources     = data.sources ?? [];
      let pos = 0;

      const tick = () => {
        pos = Math.min(pos + STREAM_CHUNK, fullContent.length);
        const done = pos >= fullContent.length;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: fullContent.slice(0, pos), isStreaming: !done, sources: done ? sources : undefined }
              : m,
          ),
        );
        if (!done) {
          streamTimerRef.current = setTimeout(tick, STREAM_TICK);
        }
      };
      tick();

    } catch (err) {
      clearTimeout(timeoutId);
      abortRef.current = null;
      setIsLoading(false);

      if (err instanceof Error && err.name === "AbortError" && userAbortedRef.current) {
        // Arrêt manuel → retire le placeholder, pas d'erreur
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
      } else {
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
      }
    }
  }, [conversationId, isLoading, messages]);

  const stopMessage = useCallback(() => {
    userAbortedRef.current = true;
    abortRef.current?.abort();
    if (streamTimerRef.current) {
      clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setConversationId(null);
    setError(null);
    setToast(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const fetchConversations = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const res  = await fetch("/api/chat/conversations");
      if (!res.ok) return;
      const data = await res.json() as { conversations?: ConversationSummary[] };
      setConversations(data.conversations ?? []);
    } catch {
      // Historique indisponible — pas bloquant pour le chat
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/chat/conversations/${id}`);
      if (!res.ok) return;
      const data = await res.json() as { id?: string; messages?: ChatMessage[] };
      if (!data.id || !data.messages) return;

      stopMessage();
      setMessages(
        data.messages.map((m) => ({ ...m, createdAt: new Date(m.createdAt) })),
      );
      setConversationId(data.id);
      sessionStorage.setItem(SESSION_KEY, data.id);
      setError(null);
      setToast(null);
    } catch {
      setToast("Impossible de charger cette conversation.");
    } finally {
      setIsHistoryLoading(false);
    }
  }, [stopMessage]);

  return {
    messages, isLoading, conversationId, error, toast,
    conversations, isHistoryLoading,
    sendMessage, stopMessage, clearMessages, clearToast,
    fetchConversations, loadConversation,
  };
}
