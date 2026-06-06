import type { NextAuthConfig } from "next-auth"

// Config Edge-safe : pas de Prisma, pas de Resend, pas de Node.js
// Utilisée par le middleware pour la vérification JWT
export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn:        "/connexion",
    verifyRequest: "/connexion/verification",
    error:         "/connexion",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn     = !!auth?.user
      const { pathname }   = request.nextUrl
      const isGestionRoute = pathname.startsWith("/gestion")
      const isAdminRoute   = pathname.startsWith("/admin")

      if (isGestionRoute && !isLoggedIn) return false
      if (isAdminRoute && (!isLoggedIn || auth?.user?.role !== "ADMIN")) return false
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id   = user.id
        token.role = user.role ?? "USER"
      }
      return token
    },
    session({ session, token }) {
      if (token.id)   session.user.id   = token.id as string
      if (token.role) session.user.role = token.role as "USER" | "ADMIN"
      return session
    },
  },
}
