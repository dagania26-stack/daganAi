import { redirect } from "next/navigation"
import OtpVerification from "@/components/auth/OtpVerification"

export const metadata = { title: "Vérification email — Dagan Gestion" }

export default function VerificationPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email
  if (!email) redirect("/inscription")

  return <OtpVerification email={decodeURIComponent(email)} />
}
