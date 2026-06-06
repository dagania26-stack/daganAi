import type { NextAuthConfig } from "next-auth"

// Config Edge-safe : pas de Prisma, pas de Resend, pas de Node.js
// Utilisée uniquement par le middleware pour la vérification JWT
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
      const isLoggedIn      = !!auth?.user
      const isGestionRoute  = request.nextUrl.pathname.startsWith("/gestion")
      if (isGestionRoute && !isLoggedIn) return false
      return true
    },
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
}
