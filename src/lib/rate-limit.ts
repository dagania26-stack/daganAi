interface RateLimitEntry {
  count:   number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Purge les entrées expirées toutes les 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 120_000);
}

/**
 * Vérifie si une clé (IP, conversationId…) dépasse la limite.
 * @returns true si la requête est autorisée, false si elle doit être bloquée.
 */
export function rateLimit(
  key:      string,
  limit:    number = 15,
  windowMs: number = 60_000,
): boolean {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}
