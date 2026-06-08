import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { ConversationSummary } from "@/types"

const APERCU_MAX_LENGTH = 120

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  const userId  = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 })
  }

  const conversations = await prisma.conversation.findMany({
    where:   { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { question: true },
      },
    },
  })

  const payload: ConversationSummary[] = conversations.map((c) => {
    const dernierMessage = c.messages[0]?.question ?? ""
    return {
      id:          c.id,
      titre:       c.titre ?? "Conversation",
      derniereMaj: c.updatedAt.toISOString(),
      apercu:      dernierMessage.length > APERCU_MAX_LENGTH
        ? dernierMessage.slice(0, APERCU_MAX_LENGTH).trimEnd() + "…"
        : dernierMessage,
    }
  })

  return NextResponse.json({ conversations: payload })
}
