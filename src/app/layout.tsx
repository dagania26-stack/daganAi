import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { SwRegister } from "@/components/SwRegister";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

/* ─── Fonts ──────────────────────────────────────────────────────────────────── */
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  metadataBase: new URL("https://dagan-ia.tg"),
  title:       "Dagan IA — Grande Sœur Numérique",
  description: "Assistant IA spécialisé en droit OHADA, fiscalité OTR et financement pour les femmes entrepreneures du Togo et du Bénin.",
  keywords:    ["OHADA", "OTR", "création entreprise Togo", "fiscalité Bénin", "financement PME", "femmes entrepreneures", "SARL Togo", "droit des affaires", "assistant IA Afrique"],
  manifest:    "/manifest.json",
  icons: {
    icon:  [{ url: "/icons-logo.ico", type: "image/x-icon" }],
    apple: [{ url: "/icons-logo.ico" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:       "Dagan IA — Grande Sœur Numérique",
    description: "Assistant IA spécialisé en droit OHADA, fiscalité OTR et financement pour les femmes entrepreneures du Togo et du Bénin.",
    type:        "website",
    locale:      "fr_FR",
    siteName:    "Dagan IA",
    url:         "https://dagan-ia.tg",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dagan IA — Grande Sœur Numérique" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Dagan IA — Grande Sœur Numérique",
    description: "Assistant IA pour les femmes entrepreneures du Togo et du Bénin — Droit, Fiscalité, Financement.",
    images:      ["/og-image.png"],
  },
  robots: {
    index:   true,
    follow:  true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  "default",
    title:           "Dagan IA",
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor:   "#C1440E",
  // interactiveWidget: "resizes-content" — réduit le viewport quand le clavier s'ouvre (Chrome 108+)
};

/* ─── Layout ─────────────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <head>
        {/* Flaticon Uicons — icônes UI straight-rounded (règle projet : jamais d'emojis) */}
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css"
        />
        {/* JSON-LD — Structured Data pour Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Dagan IA",
              url: "https://dagan-ia.tg",
              description: "Assistant IA spécialisé en droit OHADA, fiscalité OTR et financement pour les femmes entrepreneures du Togo et du Bénin.",
              applicationCategory: "BusinessApplication",
              operatingSystem: "All",
              inLanguage: "fr",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "XOF" },
              audience: {
                "@type": "Audience",
                audienceType: "Femmes entrepreneures",
                geographicArea: { "@type": "Place", name: "Togo, Bénin" },
              },
              publisher: {
                "@type": "Organization",
                name: "Dagan IA",
                url: "https://dagan-ia.tg",
                logo: "https://dagan-ia.tg/logo.png",
              },
            }),
          }}
        />
      </head>
      <body className="bg-warm-white font-sans antialiased">
        {children}
        <WhatsAppButton />
        <SwRegister />
      </body>
    </html>
  );
}
