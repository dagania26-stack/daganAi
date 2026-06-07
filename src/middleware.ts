import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// Rate limiters — best-effort (Map locale à l'isolate Edge)
const store = new Map<string, { count: number; resetAt: number }>()
const LIMIT     = 15
const WINDOW_MS = 60_000

// Endpoints d'authentification sensibles (OTP, inscription, mot de passe)
const authStore = new Map<string, { count: number; resetAt: number }>()
const AUTH_LIMIT     = 8
const AUTH_WINDOW_MS = 10 * 60_000

const AUTH_LIMITED_PATHS = [
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-otp",
  "/api/auth/reset-password",
]

function isRateLimited(map: Map<string, { count: number; resetAt: number }>, key: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const entry = map.get(key)

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true

  entry.count++
  return false
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // ── Protection routes Gestion ─────────────────────────────────────────────
  if (pathname.startsWith("/gestion") && !req.auth) {
    const url = new URL("/connexion", req.nextUrl)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // ── Protection routes Admin ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/connexion?callbackUrl=/admin", req.nextUrl))
    }
    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"

  // ── Rate limiting /api/chat ───────────────────────────────────────────────
  if (pathname === "/api/chat") {
    if (isRateLimited(store, ip, LIMIT, WINDOW_MS)) {
      // Notifier le service de log en fire-and-forget
      const logUrl = new URL("/api/internal/log", req.nextUrl)
      fetch(logUrl.toString(), {
        method:  "POST",
        headers: {
          "Content-Type":   "application/json",
          "x-internal-key": process.env.CRON_SECRET ?? "",
        },
        body: JSON.stringify({
          type:    "RATE_LIMIT",
          ip,
          details: `Rate limit dépassé sur /api/chat (${LIMIT} req/min)`,
        }),
      }).catch(() => {})

      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
        { status: 429, headers: { "Retry-After": "60" } },
      )
    }
  }

  // ── Rate limiting endpoints d'authentification (OTP, inscription, mdp) ────
  if (AUTH_LIMITED_PATHS.includes(pathname)) {
    if (isRateLimited(authStore, `${ip}:${pathname}`, AUTH_LIMIT, AUTH_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer." },
        { status: 429, headers: { "Retry-After": "600" } },
      )
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/api/chat",
    "/api/auth/register",
    "/api/auth/forgot-password",
    "/api/auth/verify-otp",
    "/api/auth/reset-password",
    "/gestion/:path*",
    "/admin/:path*",
    "/admin",
  ],
}
