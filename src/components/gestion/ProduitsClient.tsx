"use client"

import { useState, useMemo } from "react"
import Pagination from "./Pagination"

const PER_PAGE = 10

type Category = { id: string; nom: string; type: string }
type Product  = {
  id:          string
  nom:         string
  prixVente:   number
  coutRevient: number
  unite:       string
  actif:       boolean
  category:    { nom: string } | null
}

function fmt(n: number) { return new Intl.NumberFormat("fr-FR").format(n) + " FCFA" }

const INPUT      = "w-full border border-border-custom rounded-xl px-4 py-2.5 font-sans text-dark text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta bg-white"
const EMPTY_P    = { nom: "", prixVente: "", coutRevient: "", unite: "unité", categoryId: "" }
const EMPTY_CAT  = { nom: "", type: "VENTE" as "VENTE"|"ACHAT"|"CHARGE" }

interface Props {
  initialProducts:   Product[]
  initialCategories: Category[]
}

export default function ProduitsClient({ initialProducts, initialCategories }: Props) {
  const [products, setProducts]     = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [tab, setTab]               = useState<"produits"|"categories">("produits")
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [formP, setFormP]           = useState(EMPTY_P)
  const [formC, setFormC]           = useState(EMPTY_CAT)
  const [pageP, setPageP]           = useState(1)
  const [pageC, setPageC]           = useState(1)

  const pageCountP   = Math.max(1, Math.ceil(products.length / PER_PAGE))
  const currentPageP = Math.min(pageP, pageCountP)
  const paginatedP   = useMemo(
    () => products.slice((currentPageP - 1) * PER_PAGE, currentPageP * PER_PAGE),
    [products, currentPageP]
  )

  const pageCountC   = Math.max(1, Math.ceil(categories.length / PER_PAGE))
  const currentPageC = Math.min(pageC, pageCountC)
  const paginatedC   = useMemo(
    () => categories.slice((currentPageC - 1) * PER_PAGE, currentPageC * PER_PAGE),
    [categories, currentPageC]
  )

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!formP.nom.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/gestion/produits", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...formP, prixVente: parseFloat(formP.prixVente)||0, coutRevient: parseFloat(formP.coutRevient)||0, categoryId: formP.categoryId||null }),
      })
      if (!res.ok) throw new Error()
      const p = await res.json()
      setProducts(prev => [p, ...prev])
      setFormP(EMPTY_P)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!formC.nom.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/gestion/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formC),
      })
      if (!res.ok) throw new Error()
      const c = await res.json()
      setCategories(prev => [...prev, c])
      setFormC(EMPTY_CAT)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
    finally  { setSubmitting(false) }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Supprimer ce produit ?")) return
    setDeleting(id)
    await fetch(`/api/gestion/produits/${id}`, { method: "DELETE" })
    setProducts(p => p.filter(x => x.id !== id))
    setDeleting(null)
  }

  async function deleteCategory(id: string) {
    if (!confirm("Supprimer cette catégorie ? Les produits liés ne seront pas supprimés.")) return
    await fetch("/api/gestion/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setCategories(p => p.filter(c => c.id !== id))
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-dark text-xl sm:text-2xl">Produits</h1>
          <p className="font-sans text-muted text-sm mt-0.5">{products.length} produit{products.length !== 1 ? "s" : ""} · {categories.length} catégorie{categories.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className={`flex items-center gap-2 font-display font-semibold px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-all ${
            showForm ? "bg-surface border border-border-custom text-muted" : "bg-terracotta text-white hover:bg-[#a33a0c]"
          }`}>
          <i className={`fi ${showForm ? "fi-rr-cross" : "fi-rr-plus"} text-sm`} />
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["produits","categories"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setShowForm(false) }}
            className={`px-4 py-1.5 rounded-lg text-xs font-display font-semibold transition-colors ${
              tab === t ? "bg-terracotta text-white" : "bg-white border border-border-custom text-muted hover:bg-surface"
            }`}>
            {t === "produits" ? "Produits" : "Catégories"}
          </button>
        ))}
      </div>

      {/* Formulaire produit */}
      {showForm && tab === "produits" && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 mb-4 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouveau produit</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Nom du produit</label>
              <input type="text" required value={formP.nom} onChange={e => setFormP(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Tissu wax, Robe traditionnelle..." className={INPUT} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Prix de vente</label>
                <input type="number" min="0" step="1" value={formP.prixVente}
                  onChange={e => setFormP(f => ({ ...f, prixVente: e.target.value }))} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Coût de revient</label>
                <input type="number" min="0" step="1" value={formP.coutRevient}
                  onChange={e => setFormP(f => ({ ...f, coutRevient: e.target.value }))} placeholder="0" className={INPUT} />
              </div>
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Unité</label>
                <input type="text" value={formP.unite} onChange={e => setFormP(f => ({ ...f, unite: e.target.value }))}
                  placeholder="unité" className={INPUT} />
              </div>
            </div>
            {categories.length > 0 && (
              <div>
                <label className="block font-display font-semibold text-dark text-sm mb-1.5">Catégorie</label>
                <select value={formP.categoryId} onChange={e => setFormP(f => ({ ...f, categoryId: e.target.value }))} className={INPUT}>
                  <option value="">-- Sélectionner --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      )}

      {/* Formulaire catégorie */}
      {showForm && tab === "categories" && (
        <div className="bg-white rounded-2xl border border-border-custom p-5 mb-4 shadow-sm animate-fade-in-up">
          <h2 className="font-display font-bold text-dark text-base mb-4">Nouvelle catégorie</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-1.5">Nom</label>
              <input type="text" required value={formC.nom} onChange={e => setFormC(f => ({ ...f, nom: e.target.value }))}
                placeholder="ex: Vêtements, Épicerie, Services..." className={INPUT} />
            </div>
            <div>
              <label className="block font-display font-semibold text-dark text-sm mb-2">Type</label>
              <div className="flex gap-2">
                {(["VENTE","ACHAT","CHARGE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFormC(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-xl text-xs font-display font-semibold border transition-colors ${
                      formC.type === t ? "bg-terracotta/10 border-terracotta text-terracotta" : "border-border-custom text-muted hover:bg-surface"
                    }`}>
                    {t === "VENTE" ? "Vente" : t === "ACHAT" ? "Achat" : "Charge"}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-terracotta text-white font-display font-semibold py-3 rounded-xl text-sm hover:bg-[#a33a0c] disabled:opacity-60 transition-colors">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      )}

      {/* Liste produits */}
      {tab === "produits" && (
        products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
            <i className="fi fi-rr-box text-muted/40 text-3xl block mb-3" />
            <p className="font-sans text-muted text-sm">Aucun produit enregistré.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 font-display font-semibold text-sm text-terracotta hover:underline">
              Ajouter un produit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedP.map(p => {
              const marge = p.prixVente > 0 ? ((p.prixVente - p.coutRevient) / p.prixVente * 100) : 0
              return (
                <div key={p.id} className="bg-white rounded-xl border border-border-custom px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center shrink-0">
                    <i className="fi fi-rr-box text-terracotta text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-dark text-sm truncate">{p.nom}</p>
                    <p className="font-sans text-xs text-muted">
                      {p.category?.nom ?? "Sans catégorie"} · {fmt(p.prixVente)} / {p.unite}
                    </p>
                  </div>
                  {p.prixVente > 0 && (
                    <span className={`text-xs font-display font-bold px-2 py-1 rounded-lg shrink-0 ${marge > 30 ? "bg-green-100 text-green-700" : marge > 10 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {marge.toFixed(0)}% marge
                    </span>
                  )}
                  <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                    className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-40">
                    <i className="fi fi-rr-trash text-sm" />
                  </button>
                </div>
              )
            })}
          </div>
        )
      )}
      {tab === "produits" && products.length > 0 && (
        <Pagination page={currentPageP} total={products.length} perPage={PER_PAGE} onChange={setPageP} />
      )}

      {/* Liste catégories */}
      {tab === "categories" && (
        categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-custom p-8 text-center">
            <i className="fi fi-rr-tags text-muted/40 text-3xl block mb-3" />
            <p className="font-sans text-muted text-sm">Aucune catégorie.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedC.map(cat => (
              <div key={cat.id} className="bg-white rounded-xl border border-border-custom px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
                  <i className="fi fi-rr-tag text-muted text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-dark text-sm">{cat.nom}</p>
                  <p className="font-sans text-xs text-muted capitalize">{cat.type.toLowerCase()}</p>
                </div>
                <button onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <i className="fi fi-rr-trash text-sm" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
      {tab === "categories" && categories.length > 0 && (
        <Pagination page={currentPageC} total={categories.length} perPage={PER_PAGE} onChange={setPageC} />
      )}
    </div>
  )
}
