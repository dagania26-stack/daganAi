import { NextRequest, NextResponse } from "next/server";

// Rate limiter inline — 100 % Edge Runtime compatible (Vercel)
// La Map est locale à l'isolate : protection best-effort, suffisante pour un MVP
const store = new Map<string, { count: number; resetAt: number }>();

const LIMIT     = 15;
const WINDOW_MS = 60_000;

export const config = {
  matcher: ["/api/chat"],
};

export function middleware(request: NextRequest): NextResponse {
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";

  const now   = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= LIMIT) {
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
      {
        status: 429,
        headers: {
          "Retry-After":           "60",
          "X-RateLimit-Limit":     String(LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset":     String(Math.floor((entry.resetAt) / 1000)),
        },
      },
    );
  }

  entry.count++;
  return NextResponse.next();
}
