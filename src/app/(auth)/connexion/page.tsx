import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin:        "Erreur lors de la connexion. Réessayez.",
  OAuthCallback:      "Erreur lors de la connexion. Réessayez.",
  EmailCreateAccount: "Impossible de créer votre compte. Réessayez.",
  EmailSignin:        "L'envoi du lien a échoué. Vérifiez votre email et réessayez.",
  Default:            "Une erreur est survenue. Veuillez réessayer.",
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const callbackUrl  = searchParams.callbackUrl ?? "/gestion"
  const errorMessage = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.Default)
    : null

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden">

        {/* En-tête */}
        <div className="bg-terracotta px-8 py-7 text-center">
          <p className="font-display font-bold text-white text-2xl">Dagan Gestion</p>
          <p className="font-sans text-white/70 text-sm mt-1">Votre espace de gestion financière</p>
        </div>

        <div className="px-8 py-8">

          {errorMessage && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <i className="fi fi-rr-exclamation text-red-500 text-sm mt-0.5 shrink-0" />
              <p className="font-sans text-sm text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Magic Link */}
          <form
            action={async (formData: FormData) => {
              "use server"
              try {
                await signIn("resend", {
                  email:      formData.get("email") as string,
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

          <p className="mt-6 font-sans text-xs text-muted text-center leading-relaxed">
            Un lien sécurisé sera envoyé à votre adresse email. Aucun mot de passe requis.
          </p>
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
