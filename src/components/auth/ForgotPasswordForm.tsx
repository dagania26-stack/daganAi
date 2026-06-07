"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = "email" | "otp" | "password" | "done"

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [step,    setStep]    = useState<Step>("email")
  const [email,   setEmail]   = useState("")
  const [digits,  setDigits]  = useState(["", "", "", "", "", ""])
  const [pwd,     setPwd]     = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // ── Step 1 : envoi du code ─────────────────────────────────────────────
  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: email.trim() }),
    })
    setLoading(false)
    if (!res.ok) { setError("Erreur réseau. Réessayez."); return }
    setStep("otp")
    setTimeout(() => inputs.current[0]?.focus(), 50)
  }

  // ── OTP helpers ────────────────────────────────────────────────────────
  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]

    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, 6)
      const padded = [...pasted.split(""), ...Array(6).fill("")].slice(0, 6)
      setDigits(padded)
      inputs.current[Math.min(pasted.length, 5)]?.focus()
      return
    }

    next[index] = value
    setDigits(next)
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleDigitKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  // ── Step 2 : stocke le code, la validation réelle est dans reset-password ──
  function handleOtp(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < 6) { setError("Saisissez les 6 chiffres."); return }
    setError("")
    setStep("password")
  }

  // ── Step 3 : nouveau mot de passe ────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (pwd !== confirm) { setError("Les mots de passe ne correspondent pas."); return }
    if (pwd.length < 8)  { setError("Minimum 8 caractères."); return }
    setError("")
    setLoading(true)

    const code = digits.join("")
    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, code, password: pwd }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? "Une erreur est survenue."); return }
    setStep("done")
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-terracotta px-8 py-7 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className={`fi text-white text-xl ${
              step === "done" ? "fi-rr-check" :
              step === "password" ? "fi-rr-lock" :
              step === "otp"   ? "fi-rr-envelope" : "fi-rr-key"
            }`} />
          </div>
          <p className="font-display font-bold text-white text-xl">
            {step === "done" ? "Mot de passe mis à jour" :
             step === "password" ? "Nouveau mot de passe" :
             step === "otp" ? "Vérification" : "Mot de passe oublié"}
          </p>
          <p className="font-sans text-white/70 text-sm mt-1">
            {step === "done" ? "Vous pouvez maintenant vous connecter" :
             step === "password" ? "Choisissez un nouveau mot de passe sécurisé" :
             step === "otp" ? `Code envoyé à ${email}` : "Nous vous enverrons un code par email"}
          </p>
        </div>

        <div className="px-8 py-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* ─ Step : email ─ */}
          {step === "email" && (
            <form onSubmit={handleEmail} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fi fi-rr-paper-plane text-base" />}
                {loading ? "Envoi…" : "Envoyer le code"}
              </button>
            </form>
          )}

          {/* ─ Step : OTP ─ */}
          {step === "otp" && (
            <form onSubmit={handleOtp}>
              <p className="font-sans text-sm text-muted text-center mb-6">
                Saisissez le code à 6 chiffres reçu par email
              </p>
              <div className="flex gap-2.5 justify-center mb-6">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    className={`w-12 h-14 text-center font-display font-bold text-xl border-2 rounded-xl transition-all focus:outline-none ${
                      digit
                        ? "border-terracotta bg-terracotta/5 text-terracotta"
                        : "border-border-custom text-dark focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                    }`}
                    aria-label={`Chiffre ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={digits.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i className="fi fi-rr-arrow-right text-base" />
                Valider le code
              </button>
              <p className="mt-4 font-sans text-sm text-muted text-center">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setDigits(["","","","","",""]); setError("") }}
                  className="text-terracotta font-semibold hover:underline"
                >
                  Changer d&apos;adresse email
                </button>
              </p>
            </form>
          )}

          {/* ─ Step : nouveau mot de passe ─ */}
          {step === "password" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="pwd" className="block font-display font-semibold text-dark text-sm mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="pwd"
                    type={showPwd ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Minimum 8 caractères"
                    value={pwd}
                    onChange={e => setPwd(e.target.value)}
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
                      confirm && pwd !== confirm
                        ? "border-red-400 focus:ring-red-300"
                        : confirm && pwd === confirm
                        ? "border-green-400 focus:ring-green-300"
                        : "border-border-custom focus:ring-terracotta/30 focus:border-terracotta"
                    }`}
                  />
                  {confirm && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <i className={`fi text-base ${pwd === confirm ? "fi-rr-check text-green-500" : "fi-rr-cross text-red-400"}`} />
                    </span>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <i className="fi fi-rr-lock text-base" />}
                {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
              </button>
            </form>
          )}

          {/* ─ Step : done ─ */}
          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fi fi-rr-check-circle text-green-500 text-2xl" />
              </div>
              <p className="font-sans text-sm text-muted mb-6 leading-relaxed">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button
                onClick={() => router.push("/connexion")}
                className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm"
              >
                <i className="fi fi-rr-sign-in-alt text-base" />
                Se connecter
              </button>
            </div>
          )}

          {/* Lien retour connexion */}
          {step !== "done" && (
            <div className="mt-6 pt-5 border-t border-border-custom text-center">
              <Link href="/connexion" className="font-sans text-sm text-muted hover:text-dark transition-colors flex items-center justify-center gap-1.5">
                <i className="fi fi-rr-arrow-left text-xs" />
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
