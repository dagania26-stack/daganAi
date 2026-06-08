import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { ChatMessage } from "@/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const session = await auth()
  const userId  = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 })
  }

  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!conversation || conversation.userId !== userId) {
    return NextResponse.json({ error: "Conversation introuvable." }, { status: 404 })
  }

  const messages: ChatMessage[] = conversation.messages.flatMap((m) => [
    {
      id:        `${m.id}-q`,
      role:      "user" as const,
      content:   m.question,
      createdAt: m.createdAt,
    },
    {
      id:        `${m.id}-r`,
      role:      "assistant" as const,
      content:   m.reponse,
      createdAt: m.createdAt,
    },
  ])

  return NextResponse.json({
    id:       conversation.id,
    titre:    conversation.titre ?? "Conversation",
    messages,
  })
}
