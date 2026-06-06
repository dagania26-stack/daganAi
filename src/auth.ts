import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Resend from "next-auth/providers/resend"
import { prisma } from "@/lib/prisma"
import { sendMagicLinkEmail } from "@/lib/email"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      from: "Dagan IA <connexion@daganai.com>",
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail(identifier, url)
      },
    }),
  ],
})
