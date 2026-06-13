import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const { auth } = NextAuth(authConfig)

// ── Rate limiters ────────────────────────────────────────────────────────────
const store = new Map<string, { count: number; resetAt: number }>()
const LIMIT     = 15
const WINDOW_MS = 60_000

const authStore = new Map<string, { count: number; resetAt: number }>()
const AUTH_LIMIT     = 8
const AUTH_WINDOW_MS = 10 * 60_000

const contactStore = new Map<string, { count: number; resetAt: number }>()
const CONTACT_LIMIT     = 3
const CONTACT_WINDOW_MS = 10 * 60_000

const AUTH_LIMITED_PATHS = [
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/verify-otp",
  "/api/auth/reset-password",
]

// Signatures de scanners et outils d'attaque connus
const SCANNER_SIGNATURES = [
  "sqlmap", "nikto", "nmap", "masscan", "zgrab", "nessus",
  "openvas", "burpsuite", "metasploit", "havij", "acunetix",
  "w3af", "dirbuster", "gobuster", "nuclei", "hydra", "wfuzz",
  "commix", "zaproxy", "whatweb", "scrapy",
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

function isMaliciousBot(ua: string): boolean {
  if (!ua) return true
  const lower = ua.toLowerCase()
  return SCANNER_SIGNATURES.some(sig => lower.includes(sig))
}

// ── Mode maintenance ─────────────────────────────────────────────────────────
let maintenanceCache: { enabled: boolean; fetchedAt: number } | null = null
const MAINTENANCE_TTL_MS = 20_000

async function isMaintenanceEnabled(req: NextRequest): Promise<boolean> {
  const now = Date.now()
  if (maintenanceCache && now - maintenanceCache.fetchedAt < MAINTENANCE_TTL_MS) {
    return maintenanceCache.enabled
  }
  try {
    const url = new URL("/api/internal/maintenance", req.nextUrl)
    const res = await fetch(url.toString(), {
      headers: { "x-internal-key": process.env.CRON_SECRET ?? "" },
      cache:   "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      maintenanceCache = { enabled: !!data.enabled, fetchedAt: now }
    } else if (!maintenanceCache) {
      maintenanceCache = { enabled: false, fetchedAt: now }
    }
  } catch {
    if (!maintenanceCache) maintenanceCache = { enabled: false, fetchedAt: now }
  }
  return maintenanceCache.enabled
}

function isMaintenanceBypass(pathname: string): boolean {
  return (
    pathname === "/maintenance" ||
    pathname.startsWith("/connexion") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/internal") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/cron")
  )
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // ── Blocage des scanners et outils d'attaque ──────────────────────────────
  if (pathname.startsWith("/api/")) {
    const ua = req.headers.get("user-agent") ?? ""
    if (isMaliciousBot(ua)) {
      return new NextResponse(null, { status: 403 })
    }
  }

  // ── Mode maintenance ──────────────────────────────────────────────────────
  if (!isMaintenanceBypass(pathname)) {
    const maintenanceOn = await isMaintenanceEnabled(req)
    if (maintenanceOn && req.auth?.user?.role !== "ADMIN") {
      return NextResponse.rewrite(new URL("/maintenance", req.nextUrl))
    }
  }

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

  // ── Rate limiting /api/contact (Edge) ────────────────────────────────────
  if (pathname === "/api/contact") {
    if (isRateLimited(contactStore, ip, CONTACT_LIMIT, CONTACT_WINDOW_MS)) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Veuillez patienter quelques minutes." },
        { status: 429, headers: { "Retry-After": "600" } },
      )
    }
  }

  // ── Rate limiting endpoints d'authentification ────────────────────────────
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
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json|sw.js|robots.txt|sitemap.xml|logo.png|og-image.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
}
