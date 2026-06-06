import {
  Document, Page, Text, View, StyleSheet, Font,
} from "@react-pdf/renderer"

// Pas de font custom — on utilise Helvetica (intégré)
const TERRACOTTA = "#C1440E"
const FOREST     = "#2D6A4F"
const DARK       = "#1A1512"
const MUTED      = "#6B6860"
const BORDER     = "#E8E0D8"
const SURFACE    = "#F5F0EB"

const s = StyleSheet.create({
  page:       { fontFamily: "Helvetica", backgroundColor: "#fff", padding: 40, fontSize: 10, color: DARK },
  // Cover
  cover:      { flex: 1, justifyContent: "center", alignItems: "flex-start", padding: 40 },
  coverTag:   { fontSize: 9, color: TERRACOTTA, fontFamily: "Helvetica-Bold", letterSpacing: 1.5, marginBottom: 24, textTransform: "uppercase" },
  coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 8, lineHeight: 1.2 },
  coverSub:   { fontSize: 12, color: MUTED, marginBottom: 32 },
  coverLine:  { height: 3, width: 48, backgroundColor: TERRACOTTA, marginBottom: 32 },
  coverMeta:  { fontSize: 10, color: MUTED },
  // Section
  section:    { marginBottom: 24 },
  sectionHdr: { backgroundColor: TERRACOTTA, padding: "8 12", marginBottom: 10, borderRadius: 4 },
  sectionTtl: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#fff", letterSpacing: 0.5 },
  // KPI grid
  kpiGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  kpiCard:    { width: "47%", border: `1 solid ${BORDER}`, borderRadius: 6, padding: "10 12", backgroundColor: SURFACE },
  kpiLbl:     { fontSize: 8, color: MUTED, marginBottom: 4 },
  kpiVal:     { fontSize: 14, fontFamily: "Helvetica-Bold", color: DARK },
  // Table
  tableHdr:   { flexDirection: "row", backgroundColor: SURFACE, padding: "5 6", borderBottom: `1 solid ${BORDER}`, marginBottom: 0 },
  tableRow:   { flexDirection: "row", padding: "5 6", borderBottom: `1 solid ${BORDER}` },
  colDate:    { width: "18%" },
  colDesc:    { width: "40%" },
  colCat:     { width: "20%" },
  colAmt:     { width: "22%", textAlign: "right" },
  thText:     { fontSize: 8, fontFamily: "Helvetica-Bold", color: MUTED, textTransform: "uppercase" },
  tdText:     { fontSize: 9, color: DARK },
  // Analysis
  analyseText:{ fontSize: 10, color: DARK, lineHeight: 1.6 },
  sectionBold:{ fontFamily: "Helvetica-Bold", color: DARK },
  // Footer
  footer:     { position: "absolute", bottom: 30, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText: { fontSize: 8, color: MUTED },
  pageNum:    { fontSize: 8, color: MUTED },
  // Debts
  progressBg: { height: 6, backgroundColor: BORDER, borderRadius: 3, marginTop: 2, marginBottom: 4 },
  progressFg: { height: 6, backgroundColor: TERRACOTTA, borderRadius: 3 },
})

function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA" }
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
}

interface KpiData {
  ca: number; depenses: number; benefice: number; chargesMois: number; encours: number
}
interface Transaction {
  id: string; type: string; montant: number; description: string | null; date: string
  category: { nom: string } | null
}
interface Charge {
  id: string; nom: string; montant: number; frequence: string; actif: boolean
}
interface Debt {
  id: string; description: string; creancier: string; montant: number; montantRestant: number
  dateEcheance: string | null; statut: string
}
interface Props {
  businessNom:  string
  periode:      string
  kpis:         KpiData
  transactions: Transaction[]
  charges:      Charge[]
  debts:        Debt[]
  analyseText:  string
  generatedAt:  string
}

function PageFooter({ nom }: { nom: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{nom} — Rapport Dagan IA</Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  )
}

export function RapportPDF({
  businessNom, periode, kpis, transactions, charges, debts, analyseText, generatedAt,
}: Props) {
  const entrees    = transactions.filter(t => t.type === "ENTREE").slice(0, 30)
  const sorties    = transactions.filter(t => t.type === "SORTIE").slice(0, 30)
  const margeRate  = kpis.ca > 0 ? ((kpis.benefice / kpis.ca) * 100).toFixed(1) : "0"

  // Parse analyse sections
  const analyseSections = parseAnalyse(analyseText)

  return (
    <Document title={`Rapport financier — ${businessNom}`} author="Dagan IA">

      {/* ── PAGE 1 : COUVERTURE ────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <Text style={s.coverTag}>Rapport Financier</Text>
          <Text style={s.coverTitle}>{businessNom}</Text>
          <Text style={s.coverSub}>Période : {periode}</Text>
          <View style={s.coverLine} />
          <Text style={s.coverMeta}>Généré le {generatedAt} · Dagan IA</Text>
          <Text style={[s.coverMeta, { marginTop: 4 }]}>Ce rapport est confidentiel et destiné à un usage professionnel.</Text>
        </View>
      </Page>

      {/* ── PAGE 2 : KPIs ─────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <View style={s.sectionHdr}><Text style={s.sectionTtl}>Indicateurs Clés de Performance</Text></View>
          <View style={s.kpiGrid}>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Chiffre d&apos;affaires</Text>
              <Text style={[s.kpiVal, { color: FOREST }]}>{fmt(kpis.ca)}</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Dépenses totales</Text>
              <Text style={[s.kpiVal, { color: "#DC2626" }]}>{fmt(kpis.depenses)}</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Bénéfice net</Text>
              <Text style={[s.kpiVal, { color: kpis.benefice >= 0 ? FOREST : "#DC2626" }]}>{fmt(kpis.benefice)}</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Marge bénéficiaire</Text>
              <Text style={[s.kpiVal, { color: Number(margeRate) >= 20 ? FOREST : TERRACOTTA }]}>{margeRate}%</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Charges fixes/mois</Text>
              <Text style={s.kpiVal}>{fmt(kpis.chargesMois)}</Text>
            </View>
            <View style={s.kpiCard}>
              <Text style={s.kpiLbl}>Dettes en cours</Text>
              <Text style={[s.kpiVal, { color: kpis.encours > 0 ? "#DC2626" : FOREST }]}>{fmt(kpis.encours)}</Text>
            </View>
          </View>
        </View>

        {/* Charges récurrentes */}
        {charges.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHdr}><Text style={s.sectionTtl}>Charges Récurrentes</Text></View>
            <View style={s.tableHdr}>
              <Text style={[s.thText, s.colDesc]}>Désignation</Text>
              <Text style={[s.thText, s.colCat]}>Fréquence</Text>
              <Text style={[s.thText, s.colAmt]}>Montant</Text>
            </View>
            {charges.filter(c => c.actif).map(c => (
              <View key={c.id} style={s.tableRow}>
                <Text style={[s.tdText, s.colDesc]}>{c.nom}</Text>
                <Text style={[s.tdText, s.colCat]}>{c.frequence}</Text>
                <Text style={[s.tdText, s.colAmt]}>{fmt(c.montant)}</Text>
              </View>
            ))}
          </View>
        )}

        <PageFooter nom={businessNom} />
      </Page>

      {/* ── PAGE 3 : TRANSACTIONS ─────────────────────────────── */}
      <Page size="A4" style={s.page}>
        {entrees.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHdr}><Text style={s.sectionTtl}>Entrées (Recettes)</Text></View>
            <View style={s.tableHdr}>
              <Text style={[s.thText, s.colDate]}>Date</Text>
              <Text style={[s.thText, s.colDesc]}>Description</Text>
              <Text style={[s.thText, s.colCat]}>Catégorie</Text>
              <Text style={[s.thText, s.colAmt]}>Montant</Text>
            </View>
            {entrees.map(tx => (
              <View key={tx.id} style={s.tableRow}>
                <Text style={[s.tdText, s.colDate]}>{fmtDate(tx.date)}</Text>
                <Text style={[s.tdText, s.colDesc]}>{tx.description ?? "—"}</Text>
                <Text style={[s.tdText, s.colCat]}>{tx.category?.nom ?? "—"}</Text>
                <Text style={[s.tdText, s.colAmt, { color: FOREST }]}>+{fmt(tx.montant)}</Text>
              </View>
            ))}
          </View>
        )}

        {sorties.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHdr}><Text style={s.sectionTtl}>Sorties (Dépenses)</Text></View>
            <View style={s.tableHdr}>
              <Text style={[s.thText, s.colDate]}>Date</Text>
              <Text style={[s.thText, s.colDesc]}>Description</Text>
              <Text style={[s.thText, s.colCat]}>Catégorie</Text>
              <Text style={[s.thText, s.colAmt]}>Montant</Text>
            </View>
            {sorties.map(tx => (
              <View key={tx.id} style={s.tableRow}>
                <Text style={[s.tdText, s.colDate]}>{fmtDate(tx.date)}</Text>
                <Text style={[s.tdText, s.colDesc]}>{tx.description ?? "—"}</Text>
                <Text style={[s.tdText, s.colCat]}>{tx.category?.nom ?? "—"}</Text>
                <Text style={[s.tdText, s.colAmt, { color: "#DC2626" }]}>-{fmt(tx.montant)}</Text>
              </View>
            ))}
          </View>
        )}

        <PageFooter nom={businessNom} />
      </Page>

      {/* ── PAGE 4 : DETTES ──────────────────────────────────── */}
      {debts.length > 0 && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <View style={s.sectionHdr}><Text style={s.sectionTtl}>Suivi des Dettes</Text></View>
            {debts.map(d => {
              const pct = d.montant > 0 ? Math.min(100, ((d.montant - d.montantRestant) / d.montant) * 100) : 100
              return (
                <View key={d.id} style={{ marginBottom: 12, padding: "8 10", border: `1 solid ${BORDER}`, borderRadius: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK }}>{d.description}</Text>
                    <Text style={{ fontSize: 9, color: d.statut === "EN_RETARD" ? "#DC2626" : d.statut === "REMBOURSE" ? FOREST : MUTED }}>
                      {d.statut.replace("_", " ")}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9, color: MUTED, marginBottom: 4 }}>
                    Créancier : {d.creancier}{d.dateEcheance ? `  ·  Échéance : ${fmtDate(d.dateEcheance)}` : ""}
                  </Text>
                  <View style={s.progressBg}>
                    <View style={[s.progressFg, { width: `${pct}%`, backgroundColor: pct >= 100 ? FOREST : TERRACOTTA }]} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 8, color: MUTED }}>Remboursé : {fmt(d.montant - d.montantRestant)}</Text>
                    <Text style={{ fontSize: 8, color: MUTED }}>Restant : {fmt(d.montantRestant)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
          <PageFooter nom={businessNom} />
        </Page>
      )}

      {/* ── PAGE 5 : ANALYSE IA ───────────────────────────────── */}
      {analyseText && (
        <Page size="A4" style={s.page}>
          <View style={s.section}>
            <View style={s.sectionHdr}><Text style={s.sectionTtl}>Analyse Stratégique — DaganAI</Text></View>
            {analyseSections.map((sec, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                {sec.title && (
                  <Text style={[s.analyseText, s.sectionBold, { marginBottom: 4, color: TERRACOTTA }]}>{sec.title}</Text>
                )}
                {sec.lines.map((line, j) => (
                  <Text key={j} style={[s.analyseText, { marginBottom: 2 }]}>{line}</Text>
                ))}
              </View>
            ))}
          </View>
          <PageFooter nom={businessNom} />
        </Page>
      )}

    </Document>
  )
}

function parseAnalyse(raw: string): { title: string; lines: string[] }[] {
  const sections: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null

  for (const line of raw.split("\n")) {
    const cleaned = line.replace(/\*\*/g, "")
    if (/^[A-ZÀÂÉÈÊËÎÏÔÙÛÜ\s]{5,}$/.test(cleaned.trim()) && cleaned.trim().length > 5) {
      if (current) sections.push(current)
      current = { title: cleaned.trim(), lines: [] }
    } else {
      if (!current) current = { title: "", lines: [] }
      const txt = cleaned.trim().replace(/^[-•]\s*/, "• ")
      if (txt) current.lines.push(txt)
    }
  }
  if (current) sections.push(current)
  return sections.filter(s => s.title || s.lines.length > 0)
}
