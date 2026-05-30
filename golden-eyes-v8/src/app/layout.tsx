import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

// ─────────────────────────────────────────────
// Polices éditoriales
//   Fraunces : serif "old-style" contrastée, parfaite pour un
//              titrage magazine élégant et chaleureux.
//   Jost     : sans géométrique fin, idéal pour le corps de texte
//              et les labels en majuscules espacées.
// ─────────────────────────────────────────────
const fontSerif = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const fontSans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
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
