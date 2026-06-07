// ─── Géolocalisation via les en-têtes Vercel Edge Network ─────────────────────
// Vercel injecte automatiquement x-vercel-ip-country / x-vercel-ip-city sur les
// requêtes en production — aucune clé API ni service tiers nécessaire.
// (En local/hors Vercel, ces en-têtes sont absents : pays/ville restent null.)

export function getRequestIp(headers: Headers): string | null {
  return (
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  )
}

export function getRequestGeo(headers: Headers): { ip: string | null; pays: string | null; ville: string | null } {
  const villeRaw = headers.get("x-vercel-ip-city")
  return {
    ip:    getRequestIp(headers),
    pays:  headers.get("x-vercel-ip-country"),
    ville: villeRaw ? decodeURIComponent(villeRaw) : null,
  }
}
