import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import DettesClient from "@/components/gestion/DettesClient"

export default async function DettesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/dettes")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const debts = await prisma.debt.findMany({
    where:   { businessId: business.id },
    orderBy: [{ statut: "asc" }, { createdAt: "desc" }],
  })

  return (
    <DettesClient
      initialDebts={debts.map(d => ({
        ...d,
        statut:       d.statut as "EN_COURS" | "REMBOURSE" | "EN_RETARD",
        dateEcheance: d.dateEcheance?.toISOString() ?? null,
      }))}
    />
  )
}
