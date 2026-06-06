import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TransactionsClient from "@/components/gestion/TransactionsClient"

export default async function TransactionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/transactions")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where:   { businessId: business.id },
      include: { category: { select: { id: true, nom: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({
      where:   { businessId: business.id },
      orderBy: { nom: "asc" },
      select:  { id: true, nom: true },
    }),
  ])

  return (
    <TransactionsClient
      initialTransactions={transactions.map(t => ({
        ...t,
        type: t.type as "ENTREE" | "SORTIE",
        date: t.date.toISOString(),
      }))}
      initialCategories={categories}
    />
  )
}
