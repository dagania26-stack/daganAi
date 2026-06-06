import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ParametresClient from "@/components/gestion/ParametresClient"

export default async function ParametresPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/parametres")

  const business = await prisma.business.findFirst({
    where:  { userId: session.user.id },
    select: { id: true, nom: true, secteur: true, pays: true, devise: true, rapportFrequence: true },
  })
  if (!business) redirect("/gestion/setup")

  return (
    <ParametresClient
      business={business}
      userEmail={session.user.email ?? ""}
    />
  )
}
