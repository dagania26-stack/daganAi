import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// Rate limiter pour /api/chat — best-effort (Map locale à l'isolate Edge)
const store = new Map<string, { count: number; resetAt: number }>()
const LIMIT     = 15
const WINDOW_MS = 60_000

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

  // ── Rate limiting /api/chat ───────────────────────────────────────────────
  if (pathname === "/api/chat") {
    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous"

    const now   = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    } else if (entry.count >= LIMIT) {
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
        {
          status: 429,
          headers: {
            "Retry-After":           "60",
            "X-RateLimit-Limit":     String(LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset":     String(Math.floor(entry.resetAt / 1000)),
          },
        },
      )
    } else {
      entry.count++
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/api/chat", "/gestion/:path*", "/admin/:path*", "/admin"],
}
