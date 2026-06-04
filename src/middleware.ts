import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const config = {
  matcher: ["/api/chat"],
};

export function middleware(request: NextRequest): NextResponse {
  // Identifiant : IP réelle (Vercel/proxy) ou header forwarded
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const allowed = rateLimit(ip, 15, 60_000); // 15 requêtes / minute / IP

  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Veuillez patienter avant de réessayer." },
      {
        status: 429,
        headers: {
          "Retry-After":               "60",
          "X-RateLimit-Limit":         "15",
          "X-RateLimit-Remaining":     "0",
          "X-RateLimit-Reset":         String(Math.floor(Date.now() / 1000) + 60),
        },
      },
    );
  }

  return NextResponse.next();
}
