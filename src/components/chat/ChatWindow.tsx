"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import Header from "@/components/layout/Header";
import ErrorBanner from "@/components/ui/ErrorBanner";
import Toast from "@/components/ui/Toast";
import MessageList from "./MessageList";
import InputBar from "./InputBar";
import SuggestedQuestions from "./SuggestedQuestions";

export default function ChatWindow() {
  const {
    messages, isLoading, error, toast,
    sendMessage, stopMessage, clearMessages, clearToast,
  } = useChat();

  // Reset du dismiss à chaque nouvelle erreur
  const [errorDismissed, setErrorDismissed] = useState(false);
  useEffect(() => { setErrorDismissed(false); }, [error]);

  // Pré-remplissage de l'InputBar quand l'utilisateur clique "Modifier"
  const [prefill, setPrefill] = useState<{ value: string; seq: number }>({ value: "", seq: 0 });

  const handleEditMessage = useCallback((content: string) => {
    setPrefill((p) => ({ value: content, seq: p.seq + 1 }));
  }, []);

  // Gestion du clavier virtuel Android via visualViewport API
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      // Quand la hauteur visible diminue > 100px → clavier ouvert → scroll vers le bas
      if (window.innerHeight - vv.height > 100) {
        setTimeout(() => {
          const el = document.querySelector("[data-message-list]") as HTMLElement | null;
          if (el) el.scrollTop = el.scrollHeight;
        }, 150);
      }
    };

    vv.addEventListener("resize", handleResize);
    return () => vv.removeEventListener("resize", handleResize);
  }, []);

  const showSuggestions = messages.length === 0 && !isLoading;
  const showError       = !!error && !errorDismissed;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-warm-white">

      {/* Header */}
      <Header />

      {/* Bannière d'erreur animée */}
      {showError && (
        <ErrorBanner
          message={error!}
          onDismiss={() => setErrorDismissed(true)}
        />
      )}

      {/* Zone principale */}
      <main className="flex-1 flex flex-col overflow-hidden" ref={listRef}>
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onEditMessage={handleEditMessage}
        />
        <SuggestedQuestions onSelect={sendMessage} visible={showSuggestions} />
      </main>

      {/* Saisie */}
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
        onStop={stopMessage}
        prefill={prefill}
      />

      {/* Toast (question doublon, etc.) */}
      {toast && (
        <Toast message={toast} type="info" onDismiss={clearToast} />
      )}

    </div>
  );
}
