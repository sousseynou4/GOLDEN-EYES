import type { NextConfig } from "next";

/**
 * Configuration Next.js pour Golden Eyes
 * ----------------------------------------------------------------
 * - Optimisation des images (AVIF/WebP)
 * - En-têtes de sécurité
 * - Server Actions configurées pour l'upload de médias
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Images optimisées (WebP/AVIF automatique via next/image)
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Cloudinary (à activer à l'étape 4)
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Vercel Blob (alternative)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Supabase Storage (fallback)
      { protocol: "https", hostname: "*.supabase.co" },
      // Unsplash (images de démonstration)
      { protocol: "https", hostname: "images.unsplash.com" },
      // YouTube (miniatures des vidéos externes)
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },

  // En-têtes de sécurité globaux
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  compress: true,

  experimental: {
    // Pour autoriser les uploads de médias volumineux (étape 4)
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default nextConfig;
