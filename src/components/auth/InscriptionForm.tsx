"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function InscriptionForm() {
  const router = useRouter()
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  function strength(pwd: string): { level: number; label: string; color: string } {
    if (pwd.length < 4) return { level: 0, label: "", color: "" }
    let score = 0
    if (pwd.length >= 8)            score++
    if (/[A-Z]/.test(pwd))          score++
    if (/[0-9]/.test(pwd))          score++
    if (/[^A-Za-z0-9]/.test(pwd))   score++
    const levels = [
      { level: 1, label: "Trop court",  color: "bg-red-500"    },
      { level: 2, label: "Faible",      color: "bg-orange-500" },
      { level: 3, label: "Moyen",       color: "bg-yellow-500" },
      { level: 4, label: "Fort",        color: "bg-green-500"  },
      { level: 5, label: "Très fort",   color: "bg-green-600"  },
    ]
    return levels[Math.min(score, 4)]
  }

  const pwdStrength = password ? strength(password) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }
    if (password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.")
      return
    }

    // Stocker le mot de passe temporairement pour l'auto-login après OTP
    sessionStorage.setItem("__dagan_reg_pwd", password)
    router.push(`/inscription/verification?email=${encodeURIComponent(email.trim())}`)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        <div className="bg-terracotta px-8 py-7 text-center">
          <p className="font-display font-bold text-white text-2xl">Créer un compte</p>
          <p className="font-sans text-white/70 text-sm mt-1">Rejoignez Dagan Gestion gratuitement</p>
        </div>

        <div className="px-8 py-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nom */}
            <div>
              <label htmlFor="name" className="block font-display font-semibold text-dark text-sm mb-2">
                Prénom et nom <span className="text-muted font-normal">(optionnel)</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Kofi Mensah"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-border-custom rounded-xl px-4 py-3 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors bg-white"
              />
            </div>

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
              <label htmlFor="password" className="block font-display font-semibold text-dark text-sm mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 8 caractères"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-border-custom rounded-xl px-4 py-3 pr-11 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark transition-colors"
                >
                  <i className={`fi ${showPwd ? "fi-rr-eye-crossed" : "fi-rr-eye"} text-base`} />
                </button>
              </div>

              {/* Jauge de force */}
              {pwdStrength && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= pwdStrength.level ? pwdStrength.color : "bg-border-custom"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-sans text-xs text-muted mt-1">{pwdStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirm" className="block font-display font-semibold text-dark text-sm mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Répétez le mot de passe"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 pr-11 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 transition-colors bg-white ${
                    confirm && password !== confirm
                      ? "border-red-400 focus:ring-red-300"
                      : confirm && password === confirm
                      ? "border-green-400 focus:ring-green-300"
                      : "border-border-custom focus:ring-terracotta/30 focus:border-terracotta"
                  }`}
                />
                {confirm && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <i className={`fi text-base ${password === confirm ? "fi-rr-check text-green-500" : "fi-rr-cross text-red-400"}`} />
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <i className="fi fi-rr-envelope text-base" aria-hidden="true" />
              )}
              {loading ? "Envoi du code…" : "Recevoir le code de vérification"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-custom text-center">
            <p className="font-sans text-sm text-muted">
              Déjà un compte ?{" "}
              <Link href="/connexion" className="text-terracotta font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 font-sans text-xs text-muted text-center leading-relaxed px-4">
        En créant un compte, vous acceptez nos{" "}
        <a href="/conditions" className="text-terracotta hover:underline">conditions d&apos;utilisation</a>.
      </p>
    </div>
  )
}
