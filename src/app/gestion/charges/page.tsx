import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ChargesClient from "@/components/gestion/ChargesClient"

export default async function ChargesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/charges")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const charges = await prisma.charge.findMany({
    where:   { businessId: business.id },
    orderBy: [{ actif: "desc" }, { createdAt: "desc" }],
  })

  return (
    <ChargesClient
      initialCharges={charges.map(c => ({
        ...c,
        type:      c.type      as "FIXE" | "VARIABLE",
        frequence: c.frequence as "MENSUEL" | "HEBDO" | "ANNUEL",
      }))}
    />
  )
}
