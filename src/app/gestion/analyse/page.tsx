import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AnalyseClient from "@/components/gestion/AnalyseClient"
import { parsePeriodDays, periodLabel } from "@/lib/periode"

export default async function AnalysePage({ searchParams }: { searchParams: { jours?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/analyse")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const jours = parsePeriodDays(searchParams.jours)

  return <AnalyseClient key={jours} periodeJours={jours} periode={periodLabel(jours)} />
}
