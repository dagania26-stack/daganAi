import ConnexionForm from "@/components/auth/ConnexionForm"

export const metadata = { title: "Connexion — Dagan Gestion" }

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string }
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/gestion"

  const ERROR_MESSAGES: Record<string, string> = {
    CredentialsSignin: "Email ou mot de passe incorrect.",
    Default:           "Une erreur est survenue. Veuillez réessayer.",
  }

  const errorMessage = searchParams.error
    ? (ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.Default)
    : undefined

  return <ConnexionForm callbackUrl={callbackUrl} error={errorMessage} />
}
