import type { Metadata } from "next";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata: Metadata = {
  title: "Chat juridique IA — Droit OHADA, fiscalité & financement | Dagan IA",
  description: "Posez vos questions sur la création d'entreprise, le droit OHADA, la fiscalité et le financement en Afrique de l'Ouest. Réponses instantanées et sourcées par l'IA Dagan.",
  keywords: [
    "chat juridique IA OHADA", "poser question création entreprise Togo Bénin",
    "assistant conversationnel droit des affaires", "chatbot fiscalité Afrique de l'Ouest",
    "questions OHADA RCCM SARL", "aide juridique entrepreneure Afrique",
  ],
  alternates: { canonical: "/chat" },
  openGraph: {
    title:       "Chat juridique IA — Dagan IA",
    description: "Posez vos questions sur la création d'entreprise, le droit OHADA, la fiscalité et le financement en Afrique de l'Ouest.",
    url:         "/chat",
  },
};

export default function ChatPage() {
  return <ChatWindow />;
}
