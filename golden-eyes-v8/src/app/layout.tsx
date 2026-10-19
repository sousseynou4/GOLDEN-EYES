import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

// ─────────────────────────────────────────────
// Polices éditoriales (hébergées dans le site, licence OFL —
// voir src/app/fonts/ : le build ne dépend plus de Google Fonts)
//   Fraunces : serif "old-style" contrastée, parfaite pour un
//              titrage magazine élégant et chaleureux.
//   Jost     : sans géométrique fin, idéal pour le corps de texte
//              et les labels en majuscules espacées.
// ─────────────────────────────────────────────
const fontSerif = localFont({
  src: [
    { path: "./fonts/fraunces-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "./fonts/fraunces-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const fontSans = localFont({
  src: [{ path: "./fonts/jost-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s · ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ["photographe", "portrait", "mariage", "événement", "reportage"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${fontSerif.variable} ${fontSans.variable}`}>
      <body className="min-h-screen bg-paper text-ink">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-paper-pure border border-line text-ink",
            },
          }}
        />
      </body>
    </html>
  );
}
