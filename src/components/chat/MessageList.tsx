"use client";

import { useRef } from "react";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import DomainBadge from "@/components/layout/DomainBadge";

interface MessageListProps {
  messages:        ChatMessage[];
  isLoading:       boolean;
  onEditMessage?:  (content: string) => void;
}

// Messages avec contenu vide et en streaming → remplacés par TypingIndicator
function useDisplayMessages(messages: ChatMessage[]) {
  const visible  = messages.filter(m => !(m.isStreaming && !m.content));
  const isTyping = messages.some(m => m.isStreaming && !m.content);
  return { visible, isTyping };
}

function WelcomeMessage() {
  return (
    <div className="flex justify-start items-end gap-2 animate-fade-in-up">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden self-start mt-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192x192.svg" alt="Dagan IA" width={32} height={32} className="w-full h-full object-cover" />
      </div>

      {/* Bulle de bienvenue */}
      <div className="max-w-[85%] md:max-w-[75%] bg-surface border border-border-custom rounded-2xl rounded-tl-sm px-4 py-4">
        <div className="text-sm text-dark leading-relaxed space-y-3">
          <p>
            Bonjour ! Je suis <span className="font-semibold font-display">Dagan IA</span>.
          </p>
          <p>
            Je suis votre Grande Sœur Numérique — ici pour vous aider avec vos questions
            sur la création d&apos;entreprise et la fiscalité au Togo.
          </p>

          <div className="space-y-2">
            <p className="text-muted text-xs font-display uppercase tracking-wider">
              Je peux vous aider sur :
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <DomainBadge domaine="OHADA" className="mt-0.5 shrink-0" />
                <span>Création d&apos;entreprise, RCCM, formes juridiques</span>
              </li>
              <li className="flex items-start gap-2">
                <DomainBadge domaine="OTR" className="mt-0.5 shrink-0" />
                <span>Fiscalité togolaise, TVA, patente, CFE</span>
              </li>
              <li className="flex items-start gap-2">
                <DomainBadge domaine="FINANCEMENT" className="mt-0.5 shrink-0" />
                <span>Microfinance, subventions, accès au crédit</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted italic">
            Posez votre question en français. Je vous répondrai avec des informations
            vérifiées et sourcées.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ messages, isLoading, onEditMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { visible, isTyping } = useDisplayMessages(messages);

  useScrollToBottom(bottomRef, [visible.length, isTyping]);

  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto scrollbar-hide",
        "px-3 sm:px-4 py-4",
        // iOS momentum scroll
        "[overflow-y:auto] [-webkit-overflow-scrolling:touch]",
      )}
    >
      <div className="mx-auto max-w-2xl flex flex-col gap-4">

        {/* Message de bienvenue si aucun message */}
        {visible.length === 0 && !isLoading && <WelcomeMessage />}

        {/* Liste des messages */}
        {visible.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onEdit={message.role === "user" ? onEditMessage : undefined}
          />
        ))}

        {/* Indicateur de frappe pendant le chargement */}
        {(isTyping || (isLoading && visible.length > 0)) && <TypingIndicator />}

        {/* Ancre de scroll */}
        <div ref={bottomRef} className="h-px" aria-hidden="true" />
      </div>
    </div>
  );
}
