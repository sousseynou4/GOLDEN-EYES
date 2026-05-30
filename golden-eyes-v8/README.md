# 🥇 Golden Eyes

> Plateforme web vitrine pour photographe professionnel — portfolio dynamique, réservations en ligne et dashboard admin temps réel.

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e)](https://supabase.com)

---

## 🗺️ Roadmap

| Étape | Contenu | Statut |
|-------|---------|--------|
| **1** | Init Next.js + Tailwind + arborescence | ✅ |
| **2** | Supabase (SQL + Auth + Middleware) | ✅ |
| **3** | Interface publique (Hero vidéo, Portfolio, Formulaire) | ✅ |
| 4 | Dashboard Réservations + Realtime + Messagerie | ⏳ |
| 5 | CMS Light (upload Cloudinary / Vercel Blob) | ⏳ |
| 6 | Déploiement Vercel + Supabase prod | ⏳ |

---

## 🚀 Démarrage rapide

### 1. Prérequis

- **Node.js ≥ 20**
- **pnpm** (recommandé) — `npm i -g pnpm`
- Un compte **Supabase** gratuit → https://supabase.com

### 2. Installation

```bash
pnpm install
```

### 3. Configuration Supabase

#### a) Crée un projet sur Supabase
1. https://app.supabase.com → **New project**
2. Région : Frankfurt (UE) recommandée

#### b) Applique la migration SQL
1. Onglet **SQL Editor** → **New query**
2. Copie-colle tout le contenu de `supabase/migrations/20260519000000_initial_schema.sql`
3. Clique **Run** → tu dois voir `Success`

#### c) Récupère les clés API
`Settings` → `API` → copie :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Server-only

#### d) Crée le compte admin
`Authentication` → `Users` → `Add user` → `Create new user`
- Email + password robuste
- ✅ Coche **Auto Confirm User**

### 4. Variables d'environnement

```bash
cp .env.example .env.local
```

Remplis `.env.local` avec les valeurs Supabase.

### 5. Lance le serveur

```bash
pnpm dev
```

→ http://localhost:3000

---

## 🎬 Activer la vidéo de fond du Hero

Le `VideoHero` accepte des sources vidéo optionnelles. **Sans vidéo, un dégradé doré animé s'affiche par défaut.**

### Pour activer une vidéo :

1. Place tes fichiers dans `public/videos/` :
   - `hero.webm` (recommandé, meilleure compression)
   - `hero.mp4` (fallback pour Safari)
   - `hero-poster.jpg` (image affichée pendant le chargement)

2. Édite `src/app/(public)/page.tsx` :

```tsx
<VideoHero
  videoWebm="/videos/hero.webm"
  videoMp4="/videos/hero.mp4"
  poster="/images/hero-poster.jpg"
/>
```

### 💡 Conseils d'optimisation vidéo

- Durée idéale : **10-20 secondes en boucle**
- Résolution : **1920x1080** max
- Poids cible : **< 5 Mo** par fichier
- Outils : [HandBrake](https://handbrake.fr/) pour MP4, [ffmpeg](https://ffmpeg.org/) pour WebM

```bash
# Exemple ffmpeg pour WebM optimisé
ffmpeg -i source.mp4 -c:v libvpx-vp9 -crf 35 -b:v 0 -an hero.webm
```

---

## 🖼️ Ajouter des photos au portfolio

**Pour l'instant, l'ajout se fait manuellement via la DB Supabase** (l'interface CMS arrive à l'Étape 5).

### Via l'éditeur Supabase :

1. Onglet **Table Editor** → table `media`
2. Clique **Insert row** et remplis :

| Champ | Exemple |
|---|---|
| `url` | `https://res.cloudinary.com/.../photo1.jpg` (image hébergée) |
| `type` | `image` |
| `title` | `Mariage de Marie & Jean` |
| `category` | `mariage` |
| `display_order` | `1` (ordre d'affichage) |
| `is_featured` | `true` (apparaît dans le marquee de la home) |

### Sans hébergement d'images encore :

Tu peux temporairement utiliser **Unsplash** (libre de droits) :
```
https://images.unsplash.com/photo-1519741497674-611481863552
```

---

## 📂 Architecture

```
golden-eyes/
├── public/
│   ├── images/                       # Logos, posters, fallbacks
│   └── videos/                       # hero.webm / hero.mp4
│
├── src/
│   ├── app/
│   │   ├── (public)/                 # 🌐 Site visiteur
│   │   │   ├── layout.tsx            # Header + Footer
│   │   │   ├── page.tsx              # Home (Hero + Featured + Marquee)
│   │   │   ├── portfolio/page.tsx    # Galerie + Lightbox
│   │   │   ├── about/page.tsx        # À propos
│   │   │   └── contact/page.tsx      # Formulaire réservation
│   │   ├── (admin)/                  # 🔒 Dashboard
│   │   ├── api/                      # 🔌 /api/bookings, /api/messages
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # Button, Input, Textarea, Container, SectionTitle
│   │   ├── layout/                   # Header (scroll-aware), Footer
│   │   ├── portfolio/                # VideoHero, PortfolioGrid, Marquee, FeaturedSection
│   │   ├── forms/                    # BookingForm (React Hook Form + Zod)
│   │   └── admin/                    # LoginForm, LogoutButton
│   │
│   ├── lib/
│   │   ├── supabase/                 # client / server / middleware
│   │   ├── validations/              # Schémas Zod
│   │   ├── utils.ts                  # cn(), formatDate
│   │   └── constants.ts              # Config, routes, statuts
│   │
│   ├── types/                        # Types DB + métier
│   └── middleware.ts                 # Auth Supabase
│
└── supabase/
    └── migrations/                   # Scripts SQL
```

---

## 🎨 Composants livrés à l'Étape 3

### Layout
- **`<Header />`** — Navigation responsive, transparent en haut puis blur, menu burger animé
- **`<Footer />`** — 3 colonnes, réseaux sociaux, contact

### Portfolio
- **`<VideoHero />`** — Hero plein écran avec vidéo en boucle (WebM + MP4), titre cinématographique, scroll indicator
- **`<PortfolioGrid />`** — Galerie en mosaïque, lazy loading, **lightbox** avec navigation clavier (← → Esc)
- **`<Marquee />`** — Bandeau défilant infini, fondu sur les bords
- **`<FeaturedSection />`** — Trois cartes valeurs animées

### Formulaire
- **`<BookingForm />`** — 7 champs avec validation Zod stricte, état succès animé, toasts
  - Validation téléphone français (formats acceptés : 06xx, +33, 0033)
  - Date future obligatoire (min = demain)
  - Soumission via `POST /api/bookings` → insert direct dans Supabase

### UI réutilisables
- **`<Button />`** — variants primary/ghost/danger, sizes sm/md/lg, état isLoading
- **`<Input />`** / **`<Textarea />`** — avec label, hint, error message intégrés
- **`<Container />`** — largeurs prédéfinies (sm/md/lg/xl)
- **`<SectionTitle />`** — eyebrow + titre serif + description

---

## 🔐 Sécurité

| Mécanisme | Implémentation |
|---|---|
| Auth | Supabase Auth + cookies HttpOnly |
| Protection routes | Middleware Next.js + double-check serveur |
| RLS | Activée sur toutes les tables |
| Validation | Zod côté client ET serveur (jamais faire confiance au client) |
| En-têtes | X-Frame-Options, CSP, Permissions-Policy |
| Secrets | `.env.local` (jamais commité) |

---

## 🧪 Scripts

```bash
pnpm dev           # Dev server (Turbopack)
pnpm build         # Build production
pnpm start         # Serveur production
pnpm lint          # ESLint
pnpm format        # Prettier
pnpm type-check    # tsc --noEmit
```

---

## 📝 Licence

Projet privé — Tous droits réservés © Golden Eyes
