const CACHE_NAME  = "dagan-ia-v1";
const OFFLINE_URL = "/";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install : préchargement des assets statiques ────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

// ── Activate : nettoyage des anciens caches ─────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// ── Fetch : stratégie hybride ───────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API /api/chat → toujours réseau, jamais mis en cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            JSON.stringify({ error: "Pas de connexion internet." }),
            { status: 503, headers: { "Content-Type": "application/json" } },
          ),
      ),
    );
    return;
  }

  // Assets statiques → cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Mise en cache uniquement des réponses valides
          if (response.ok && request.method === "GET") {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Offline : retourne la page racine pour les documents HTML
          if (request.destination === "document") {
            return caches.match(OFFLINE_URL) ?? new Response("Hors ligne", { status: 503 });
          }
          return new Response("Ressource indisponible hors ligne", { status: 503 });
        });
    }),
  );
});
