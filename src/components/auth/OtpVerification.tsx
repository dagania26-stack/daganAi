"use client"

import { useState, useRef, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Props {
  email: string
}

export default function OtpVerification({ email }: Props) {
  const router  = useRouter()
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [error,  setError]  = useState("")
  const [loading, setLoading] = useState(false)
  const [resent,  setResent]  = useState(false)
  const [resending, setResending] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => { inputs.current[0]?.focus() }, [])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]

    if (value.length > 1) {
      // Coller un code complet
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

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < 6) { setError("Saisissez les 6 chiffres du code."); return }

    setError("")
    setLoading(true)

    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? "Code invalide.")
        setDigits(["", "", "", "", "", ""])
        inputs.current[0]?.focus()
        return
      }

      // Auto-login avec le mot de passe stocké temporairement
      const pwd = sessionStorage.getItem("__dagan_reg_pwd") ?? ""
      sessionStorage.removeItem("__dagan_reg_pwd")

      if (pwd) {
        const result = await signIn("credentials", { email, password: pwd, redirect: false })
        if (result?.ok) {
          router.push("/gestion")
          return
        }
      }

      // Fallback : rediriger vers connexion
      router.push("/connexion?success=compte-cree")
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    setError("")
    try {
      await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
      setResent(true)
      setDigits(["", "", "", "", "", ""])
      inputs.current[0]?.focus()
      setTimeout(() => setResent(false), 5000)
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        <div className="bg-terracotta px-8 py-7 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fi fi-rr-envelope text-white text-xl" />
          </div>
          <p className="font-display font-bold text-white text-xl">Vérification email</p>
          <p className="font-sans text-white/70 text-sm mt-1">Code envoyé à</p>
          <p className="font-display font-semibold text-white text-sm mt-0.5">{email}</p>
        </div>

        <div className="px-8 py-8">

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700">{error}</p>
            </div>
          )}

          {resent && (
            <div className="mb-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-check text-green-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-green-700">Nouveau code envoyé !</p>
            </div>
          )}

          <p className="font-sans text-sm text-muted text-center mb-6">
            Saisissez le code à 6 chiffres reçu par email
          </p>

          <form onSubmit={handleSubmit}>
            {/* Inputs OTP */}
            <div className="flex gap-2.5 justify-center mb-6">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
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
              disabled={loading || digits.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <i className="fi fi-rr-check-circle text-base" />
              )}
              {loading ? "Vérification…" : "Confirmer mon compte"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="font-sans text-sm text-muted">
              Code non reçu ?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-terracotta font-semibold hover:underline disabled:opacity-60"
              >
                {resending ? "Envoi…" : "Renvoyer le code"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
