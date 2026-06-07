import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { prisma } from "@/lib/prisma"
import { requireBusiness } from "@/lib/gestion"
import { parsePeriodDays, periodLabel } from "@/lib/periode"

const client = new Anthropic()

export async function GET(req: Request) {
  const auth = await requireBusiness()
  if (!auth.ok) return auth.response

  const jours  = parsePeriodDays(new URL(req.url).searchParams.get("jours"))
  const periode = periodLabel(jours)
  const since   = new Date(); since.setDate(since.getDate() - jours)

  const [transactions, charges, debts, products] = await Promise.all([
    prisma.transaction.findMany({
      where:   { businessId: auth.business.id, date: { gte: since } },
      include: { category: { select: { nom: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.charge.findMany({ where: { businessId: auth.business.id } }),
    prisma.debt.findMany({   where: { businessId: auth.business.id } }),
    prisma.product.findMany({ where: { businessId: auth.business.id }, include: { category: { select: { nom: true } } } }),
  ])

  const ca       = transactions.filter(t => t.type === "ENTREE").reduce((s, t) => s + t.montant, 0)
  const depenses = transactions.filter(t => t.type === "SORTIE").reduce((s, t) => s + t.montant, 0)
  const benefice = ca - depenses

  const chargesMensuel = charges.filter(c => c.actif).reduce((s, c) => {
    if (c.frequence === "ANNUEL") return s + c.montant / 12
    if (c.frequence === "HEBDO")  return s + c.montant * 4.33
    return s + c.montant
  }, 0)

  const dettesEncours = debts.filter(d => d.statut !== "REMBOURSE")
  const detteTotal    = dettesEncours.reduce((s, d) => s + d.montantRestant, 0)
  const dettesEnRetard = dettesEncours.filter(d => d.statut === "EN_RETARD")

  // Grouper transactions par catégorie
  const catMap = new Map<string, { entrees: number; sorties: number }>()
  for (const tx of transactions) {
    const key = tx.category?.nom ?? "Non catégorisé"
    const cur = catMap.get(key) ?? { entrees: 0, sorties: 0 }
    if (tx.type === "ENTREE") cur.entrees += tx.montant
    else                      cur.sorties += tx.montant
    catMap.set(key, cur)
  }

  const categRepartition = Array.from(catMap.entries())
    .map(([nom, v]) => `  • ${nom}: +${v.entrees.toLocaleString("fr-FR")} FCFA entrées / -${v.sorties.toLocaleString("fr-FR")} FCFA sorties`)
    .join("\n")

  const topProduits = products.slice(0, 8).map(p =>
    `  • ${p.nom} (${p.category?.nom ?? "—"}) — prix vente: ${p.prixVente.toLocaleString("fr-FR")} FCFA${p.coutRevient ? `, coût: ${p.coutRevient.toLocaleString("fr-FR")} FCFA` : ""}`
  ).join("\n")

  const chargesDetail = charges.slice(0, 12).map(c =>
    `  • ${c.nom} (${c.frequence}) — ${c.montant.toLocaleString("fr-FR")} FCFA${c.actif ? "" : " [inactif]"}`
  ).join("\n")

  const dettesDetail = dettesEncours.slice(0, 8).map(d =>
    `  • ${d.description} — créancier: ${d.creancier}, restant: ${d.montantRestant.toLocaleString("fr-FR")} FCFA${d.dateEcheance ? `, échéance: ${new Date(d.dateEcheance).toLocaleDateString("fr-FR")}` : ""}${d.statut === "EN_RETARD" ? " [EN RETARD]" : ""}`
  ).join("\n")

  const prompt = `Tu es DaganAI, l'assistante financière intelligente de Dagan IA — une plateforme conçue pour les femmes entrepreneures en Afrique de l'Ouest (Togo, Bénin).

Voici les données financières réelles de l'entreprise "${auth.business.nom}" sur les ${periode} :

## RÉSUMÉ FINANCIER (${periode})
- Chiffre d'affaires : ${ca.toLocaleString("fr-FR")} FCFA
- Dépenses totales   : ${depenses.toLocaleString("fr-FR")} FCFA
- Bénéfice net       : ${benefice.toLocaleString("fr-FR")} FCFA (${ca > 0 ? ((benefice / ca) * 100).toFixed(1) : 0}% de marge)
- Charges fixes/mois : ${chargesMensuel.toLocaleString("fr-FR")} FCFA
- Nombre de transactions : ${transactions.length}

## RÉPARTITION PAR CATÉGORIE
${categRepartition || "  Aucune transaction catégorisée"}

## PRODUITS / CATALOGUE
${topProduits || "  Aucun produit enregistré"}

## CHARGES RÉCURRENTES
${chargesDetail || "  Aucune charge enregistrée"}

## DETTES EN COURS
- Total dû : ${detteTotal.toLocaleString("fr-FR")} FCFA (${dettesEncours.length} dettes actives)
- En retard : ${dettesEnRetard.length} dette(s)
${dettesDetail || "  Aucune dette active"}

---

Rédige une analyse stratégique complète et personnalisée, structurée en exactement 5 sections avec ces titres exacts en gras :

**RÉSUMÉ EXÉCUTIF**
Synthèse en 2-3 phrases de la situation financière globale. Ton direct et affirmatif.

**POINTS FORTS**
Liste de 3 à 5 points forts identifiés dans les données. Sois précise et cite les chiffres.

**FAILLES ET RISQUES**
Liste de 3 à 5 problèmes ou zones de vulnérabilité. Inclus les dettes en retard, marges trop faibles, charges disproportionnées, etc.

**OPPORTUNITÉS**
Liste de 3 à 5 opportunités concrètes pour augmenter les revenus ou réduire les coûts, basées sur les données.

**RECOMMANDATIONS PRIORITAIRES**
Liste de 3 à 5 actions concrètes à entreprendre dans les 30 prochains jours, avec des étapes actionnables.

Adapte ton langage au contexte ouest-africain. Sois précise, encourageante et pragmatique. N'invente pas de données qui ne figurent pas dans le contexte.`

  const stream = await client.messages.create({
    model:      "claude-sonnet-4-6",
    max_tokens: 1500,
    stream:     true,
    messages:   [{ role: "user", content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text))
        }
        if (event.type === "message_stop") {
          controller.close()
        }
      }
    },
    cancel() { stream.controller.abort() },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  })
}
