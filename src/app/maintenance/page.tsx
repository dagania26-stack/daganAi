import Image from "next/image"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function MaintenancePage() {
  const settings = await prisma.siteSettings.findFirst()

  if (!settings?.maintenanceMode) {
    redirect("/")
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-white px-6 text-center">

      <Image
        src="/logo.png"
        alt="Dagan IA"
        width={400}
        height={400}
        className="rounded-2xl mb-8 shadow-sm w-32 h-32 sm:w-52 sm:h-52 md:w-72 md:h-72 lg:w-[360px] lg:h-[360px] object-contain"
        priority
      />

      <div className="w-14 h-14 rounded-2xl bg-terracotta/10 flex items-center justify-center mb-5">
        <i className="fi fi-rr-settings text-terracotta text-2xl" aria-hidden="true" />
      </div>

      <h1 className="font-display font-bold text-2xl sm:text-3xl text-dark mb-3">
        Site en maintenance
      </h1>
      <p className="font-sans text-muted text-sm sm:text-base leading-relaxed max-w-md">
        {settings.maintenanceMessage?.trim()
          || "Nous effectuons actuellement une mise à jour pour améliorer votre expérience. Le site sera de nouveau disponible très bientôt. Merci de votre patience."}
      </p>

    </div>
  )
}
