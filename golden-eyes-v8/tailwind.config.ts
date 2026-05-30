import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind — Golden Eyes
 * ════════════════════════════════════════════════════════════════
 * DIRECTION ARTISTIQUE : éditorial / magazine haut de gamme
 *
 *   Base       → crème / ivoire chaud (le papier d'un beau magazine)
 *   Encre      → brun-noir profond pour le texte (jamais #000 pur)
 *   Accent     → or affiné, utilisé avec parcimonie
 *   Sombre     → espresso pour les sections contrastées (galerie)
 *
 * Le fond clair fait respirer les pages et met les photos en valeur,
 * comme dans les pages d'un magazine de photographie.
 * ════════════════════════════════════════════════════════════════
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // ── Base claire (papier) ──────────────────────────────
        paper: {
          DEFAULT: "#F7F3EC", // crème principal
          warm: "#F1EADD", // crème plus chaud (sections alternées)
          pure: "#FDFBF7", // ivoire quasi blanc (cartes)
        },
        // ── Encre (texte / fonds sombres) ─────────────────────
        espresso: {
          DEFAULT: "#1A1410", // brun-noir profond (texte titres)
          soft: "#2B2118", // sections sombres
          muted: "#4A3F35", // texte secondaire sombre
        },
        // ── Texte sur fond clair ──────────────────────────────
        ink: {
          DEFAULT: "#241C15", // texte principal
          muted: "#6B5D4F", // texte secondaire (brun doux)
          faint: "#9B8B7A", // texte tertiaire / captions
        },
        // ── Accent or ─────────────────────────────────────────
        gold: {
          50: "#FBF6EA",
          100: "#F4E8CC",
          200: "#E9D199",
          300: "#DDB866",
          400: "#CFA043",
          500: "#B8862B", // ⭐ or principal (plus mat, plus chic)
          600: "#996D20",
          700: "#73521A",
          800: "#4D3815",
          900: "#2B1F0C",
        },
        // ── Lignes / bordures ─────────────────────────────────
        line: {
          DEFAULT: "#E2D9C9", // bordure sur fond clair
          dark: "#3A2E24", // bordure sur fond sombre
        },
      },
      fontFamily: {
        // Polices définies dans app/layout.tsx via next/font
        serif: ["var(--font-serif)", "Georgia", "serif"], // display éditorial
        sans: ["var(--font-sans)", "system-ui", "sans-serif"], // corps de texte
      },
      fontSize: {
        // Échelle éditoriale (titres généreux)
        "display-xl": ["clamp(3.5rem, 10vw, 9rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 6vw, 5.5rem)", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        editorial: "0.25em",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-up": "fadeUp 1s ease-out forwards",
        "slow-zoom": "slowZoom 24s ease-in-out infinite alternate",
        marquee: "marquee 50s linear infinite",
        "reveal": "reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slowZoom: {
          from: { transform: "scale(1)" },
          to: { transform: "scale(1.1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(40px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      backgroundImage: {
        "grain": "url('/images/noise.png')",
      },
    },
  },
  plugins: [],
};

export default config;
