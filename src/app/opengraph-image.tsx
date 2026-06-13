import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const alt         = "Dagan IA — Grande Sœur Numérique"
export const size        = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #C1440E 0%, #8B2F08 100%)",
          position: "relative",
        }}
      >
        {/* Cercle décoratif haut-droite */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />
        {/* Cercle décoratif bas-gauche */}
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />

        {/* Logo pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "999px",
            padding: "12px 28px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#FFF8F0",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "18px", letterSpacing: "2px", textTransform: "uppercase" }}>
            dagania.tech
          </span>
        </div>

        {/* Titre principal */}
        <div style={{ fontSize: "80px", fontWeight: 800, color: "white", letterSpacing: "-2px", lineHeight: 1 }}>
          Dagan IA
        </div>

        {/* Sous-titre */}
        <div style={{ fontSize: "28px", color: "rgba(255,255,255,0.75)", marginTop: "20px", letterSpacing: "0.5px" }}>
          Grande Sœur Numérique
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {["Droit OHADA", "Fiscalité", "Financement"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "12px",
                padding: "10px 24px",
                color: "rgba(255,255,255,0.85)",
                fontSize: "20px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
