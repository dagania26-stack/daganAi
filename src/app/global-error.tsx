"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#FFF8F0", fontFamily: "sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "4rem", fontWeight: "900", color: "#C1440E", margin: "0 0 1rem" }}>!</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1A1A1A", margin: "0 0 0.5rem" }}>
            Quelque chose s&apos;est mal passé
          </h1>
          <p style={{ color: "#6B6860", fontSize: "0.9rem", margin: "0 0 2rem" }}>
            Une erreur inattendue est survenue. Réessaie dans un instant.
          </p>
          <button
            onClick={reset}
            style={{ background: "#C1440E", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.875rem 1.5rem", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}
          >
            Recommencer
          </button>
        </div>
      </body>
    </html>
  );
}
