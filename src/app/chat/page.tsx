import type { Metadata } from "next";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata: Metadata = {
  title: "Chat — Dagan IA",
  description: "Posez vos questions sur la création d'entreprise, la fiscalité et le financement au Togo.",
};

export default function ChatPage() {
  return <ChatWindow />;
}
