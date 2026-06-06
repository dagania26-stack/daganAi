import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: "Erreur lors de la connexion Google. Réessayez.",
  OAuthCallback: "Erreur lors de la connexion Google. Réessayez.",
  OAuthCreateAccount: "Impossible de créer votre compte. Réessayez.",
  EmailCreateAccount: "Impossible de créer votre compte. Réessayez.",
  EmailSignin: "L'envoi du lien a échoué. Vérifiez votre email et réessayez.",
  Default: "Une erreur est survenue. Veuillez réessayer.",
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/gestion"
  const errorMessage = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.Default)
    : null

  return (
    <div className="w-full max-w-md">
      {/* Carte principale */}
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        {/* En-tête terracotta */}
        <div className="bg-terracotta px-8 py-7 text-center">
          <p className="font-display font-bold text-white text-2xl">Dagan Gestion</p>
          <p className="font-sans text-white/70 text-sm mt-1">Votre espace de gestion financière</p>
        </div>

        <div className="px-8 py-8">

          {/* Bannière d'erreur */}
          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Formulaire Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server"
              try {
                await signIn("resend", {
                  email: formData.get("email") as string,
                  redirectTo: formData.get("callbackUrl") as string,
                })
              } catch (error) {
                if (error instanceof AuthError) {
                  redirect(`/connexion?error=${error.type}&callbackUrl=${formData.get("callbackUrl")}`)
                }
                throw error
              }
            }}
          >
            <input type="hidden" name="callbackUrl" value={callbackUrl} />

            <div className="mb-4">
              <label htmlFor="email" className="block font-display font-semibold text-dark text-sm mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="votre@email.com"
                className="w-full border border-border-custom rounded-xl px-4 py-3 font-sans text-dark text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta transition-colors bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-terracotta text-white font-display font-semibold px-6 py-3.5 rounded-xl min-h-[48px] hover:bg-[#a33a0c] active:scale-95 transition-all duration-150 text-sm"
            >
              <i className="fi fi-rr-envelope text-base" aria-hidden="true" />
              Recevoir un lien de connexion
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border-custom" />
            <span className="font-sans text-xs text-muted">ou</span>
            <div className="flex-1 h-px bg-border-custom" />
          </div>

          {/* Google OAuth */}
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: callbackUrl })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 border border-border-custom rounded-xl py-3.5 min-h-[48px] font-display font-semibold text-dark text-sm hover:bg-surface active:scale-95 transition-all duration-150"
            >
              {/* SVG Google */}
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuer avec Google
            </button>
          </form>

          {/* Note sécurité */}
          <p className="mt-6 font-sans text-xs text-muted text-center leading-relaxed">
            Un lien sécurisé sera envoyé à votre adresse email. Aucun mot de passe requis.
          </p>
        </div>
      </div>

      {/* Mention RGPD */}
      <p className="mt-5 font-sans text-xs text-muted text-center leading-relaxed px-4">
        En vous connectant, vous acceptez nos{" "}
        <a href="/conditions" className="text-terracotta hover:underline">conditions d&apos;utilisation</a>
        {" "}et notre{" "}
        <a href="/confidentialite" className="text-terracotta hover:underline">politique de confidentialité</a>.
      </p>
    </div>
  )
}
