import { auth } from "@/auth"
import { redirect } from "next/navigation"
import GestionSidebar from "@/components/gestion/GestionSidebar"
import GestionMobileHeader from "@/components/gestion/GestionMobileHeader"

export default async function GestionLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/connexion?callbackUrl=/gestion")

  return (
    <div className="min-h-screen bg-surface">
      <GestionSidebar user={session.user} />
      <GestionMobileHeader user={session.user} />

      {/* Zone principale — décalée à droite sur desktop pour laisser place à la sidebar */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <main className="flex-1 pt-0 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
