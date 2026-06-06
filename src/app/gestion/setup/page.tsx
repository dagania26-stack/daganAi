import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

async function createBusiness(formData: FormData) {
  "use server"
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion")

  const existing = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (existing) redirect("/gestion")

  const nom     = (formData.get("nom") as string).trim()
  const secteur = (formData.get("secteur") as string).trim()

  const business = await prisma.business.create({
    data: { nom, secteur: secteur || null, userId: session.user.id },
  })

  // Catégories par défaut
  await prisma.category.createMany({
    data: [
      { nom: "Ventes",           type: "VENTE",  businessId: business.id },
      { nom: "Achats",           type: "ACHAT",  businessId: business.id },
      { nom: "Frais généraux",   type: "CHARGE", businessId: business.id },
    ],
  })

  redirect("/gestion")
}

export default async function SetupPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion")

  const existing = await prisma.business.findFirst({ where: { userId: session.user.id } })
  if (existing) redirect("/gestion")

  return (
    <div className="min-h-[calc(100vh-56px)] lg:min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fi fi-rr-building text-terracotta text-2xl" aria-hidden="true" />
          </div>
          <h1 className="font-display font-bold text-dark text-2xl mb-2">Créons votre espace</h1>
          <p className="font-sans text-muted text-sm leading-relaxed">
            Quelques informations sur votre activité pour personnaliser Dagan Gestion.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-border-custom shadow-sm p-6">
          <form action={createBusiness} className="space-y-5">

            <div>
              <label htmlFor="nom" className="block font-display font-semibold text-dark text-sm mb-1.5">
                Nom de votre entreprise <span className="text-terracotta">*</span>
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                autoFocus
                placeholder="ex: Boutique Ama, Atelier Sika..."
                className="w-full border border-border-custom rounded-xl px-4 py-3 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>

            <div>
              <label htmlFor="secteur" className="block font-display font-semibold text-dark text-sm mb-1.5">
                Secteur d&apos;activité <span className="font-normal text-muted">(optionnel)</span>
              </label>
              <input
                id="secteur"
                name="secteur"
                type="text"
                placeholder="ex: Commerce de détail, Restauration, Couture..."
                className="w-full border border-border-custom rounded-xl px-4 py-3 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all text-sm mt-2"
            >
              <i className="fi fi-rr-rocket-lunch" aria-hidden="true" />
              Démarrer avec Dagan Gestion
            </button>
          </form>
        </div>

        <p className="mt-4 font-sans text-xs text-muted text-center">
          Ces informations peuvent être modifiées à tout moment dans les paramètres.
        </p>
      </div>
    </div>
  )
}
