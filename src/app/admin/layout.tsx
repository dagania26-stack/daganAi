import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminMobileHeader from "@/components/admin/AdminMobileHeader"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#F0EDE8]">
      <AdminSidebar user={session.user} />
      <AdminMobileHeader user={session.user} />
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
