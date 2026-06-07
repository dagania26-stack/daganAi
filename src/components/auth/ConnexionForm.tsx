"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Props {
  callbackUrl: string
  error?:      string
}

export default function ConnexionForm({ callbackUrl, error: initialError }: Props) {
  const router = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState(initialError ?? "")
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email:    email.trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (!result || result.error) {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        {/* En-tête */}
        <div className="bg-terracotta px-8 py-7 text-center">
          <p className="font-display font-bold text-white text-2xl">Dagan Gestion</p>
          <p className="font-sans text-white/70 text-sm mt-1">Votre espace de gestion financière</p>
        </div>

        <div className="px-8 py-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block font-display font-semibold text-dark text-sm mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="votre@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-border-custom rounded-xl px-4 py-3 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors bg-white"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="font-display font-semibold text-dark text-sm">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="font-sans text-xs text-terracotta hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-border-custom rounded-xl px-4 py-3 pr-11 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                  aria-label={showPwd ? "Masquer" : "Afficher"}
                >
                  <i className={`fi ${showPwd ? "fi-rr-eye-crossed" : "fi-rr-eye"} text-base`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <i className="fi fi-rr-sign-in-alt text-base" aria-hidden="true" />
              )}
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          {/* Inscription */}
          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="font-sans text-sm text-muted">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="text-terracotta font-semibold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 font-sans text-xs text-muted text-center leading-relaxed px-4">
        En vous connectant, vous acceptez nos{" "}
        <a href="/conditions" className="text-terracotta hover:underline">conditions d&apos;utilisation</a>
        {" "}et notre{" "}
        <a href="/confidentialite" className="text-terracotta hover:underline">politique de confidentialité</a>.
      </p>
    </div>
  )
}
