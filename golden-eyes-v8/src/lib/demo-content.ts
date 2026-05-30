/**
 * Images de démonstration (Unsplash, libres de droits).
 * ────────────────────────────────────────────────────────────────
 * Utilisées tant que la table `media` de Supabase est vide, pour que
 * le site soit vivant dès le premier lancement.
 *
 * 👉 Dès que tu ajoutes tes propres photos dans Supabase (table `media`),
 *    elles remplacent automatiquement ces images de démo.
 *
 * Pour remplacer une image de démo précise, change simplement son URL.
 */

export interface DemoImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

/** Photo du hero (grand format paysage) */
export const DEMO_HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop";

/** Portrait vertical pour la section "À propos" / signature */
export const DEMO_PORTRAIT =
  "https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=1287&auto=format&fit=crop";

/** Galerie de démonstration */
export const DEMO_GALLERY: DemoImage[] = [
  {
    id: "demo-1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1470&auto=format&fit=crop",
    title: "Cérémonie au crépuscule",
    category: "Mariage",
  },
  {
    id: "demo-2",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1470&auto=format&fit=crop",
    title: "Premiers regards",
    category: "Mariage",
  },
  {
    id: "demo-3",
    url: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?q=80&w=1374&auto=format&fit=crop",
    title: "Lumière d'atelier",
    category: "Portrait",
  },
  {
    id: "demo-4",
    url: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=1364&auto=format&fit=crop",
    title: "Regard franc",
    category: "Portrait",
  },
  {
    id: "demo-5",
    url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=1374&auto=format&fit=crop",
    title: "Instant suspendu",
    category: "Portrait",
  },
  {
    id: "demo-6",
    url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1361&auto=format&fit=crop",
    title: "Sourire complice",
    category: "Portrait",
  },
  {
    id: "demo-7",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1470&auto=format&fit=crop",
    title: "Promesse échangée",
    category: "Mariage",
  },
  {
    id: "demo-8",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1470&auto=format&fit=crop",
    title: "Première danse",
    category: "Mariage",
  },
  {
    id: "demo-9",
    url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1374&auto=format&fit=crop",
    title: "Heure dorée",
    category: "Reportage",
  },
];
