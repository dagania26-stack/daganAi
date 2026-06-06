import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProduitsClient from "@/components/gestion/ProduitsClient"

export default async function ProduitsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion/produits")

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (!business) redirect("/gestion/setup")

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where:   { businessId: business.id },
      include: { category: { select: { id: true, nom: true } } },
      orderBy: [{ actif: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({
      where:   { businessId: business.id },
      orderBy: { nom: "asc" },
    }),
  ])

  return <ProduitsClient initialProducts={products} initialCategories={categories} />
}
