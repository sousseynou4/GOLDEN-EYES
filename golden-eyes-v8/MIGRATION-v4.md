# 🎨 Migration v3 → v4 — Refonte design « Éditorial Crème & Or »

## Ce qui change visuellement

| Avant (v3) | Maintenant (v4) |
|---|---|
| Fond noir partout | **Fond crème/ivoire chaud** (papier de magazine) |
| Hero avec dégradé vide | **Hero avec une vraie photo** plein écran |
| Pas de photos | **Images de démo intégrées** (galerie, marquee, portrait) |
| Polices Inter + Cormorant | **Fraunces** (serif éditorial) + **Jost** (sans géométrique) |
| Or vif `#C9991A` | **Or mat affiné** `#B8862B`, plus chic |
| Sections plates | **Alternance clair/sombre** rythmée |

## Direction artistique

Le site adopte une esthétique **magazine haut de gamme** :
- Le **fond clair fait respirer** et met les photos en valeur, comme une double-page de magazine
- Les **titres serif énormes** créent un impact éditorial
- L'**or est utilisé avec parcimonie** (accents, eyebrows, hover) — jamais sur du vide
- Le **footer espresso sombre** contraste comme la dernière page d'un beau magazine

---

## 🚀 Installation

```bash
cd golden-eyes-v4
pnpm install          # ou npm install --legacy-peer-deps
cp .env.example .env.local   # remplis tes clés Supabase (mêmes que v3)
pnpm dev
```

> 💡 Réutilise simplement le `.env.local` de ta v3 — les clés Supabase sont identiques.

---

## 📸 À propos des images de démonstration

**Le site affiche des photos Unsplash par défaut** pour que tu puisses juger le design tout de suite, sans rien configurer.

### Comment elles fonctionnent
- Tant que ta table Supabase `media` est **vide** → les images de démo s'affichent
- Dès que tu **ajoutes tes propres photos** dans `media` → elles remplacent automatiquement les démos

### Où se trouvent les démos
Toutes les URLs sont dans un seul fichier : `src/lib/demo-content.ts`
Tu peux les remplacer une par une si tu veux tester avec d'autres images.

### Pour ajouter tes vraies photos (en attendant le CMS de l'étape 5)
1. Supabase → **Table Editor** → table `media` → **Insert row**
2. Remplis `url` (lien de l'image), `type` = `image`, `title`, `category`
3. Recharge le site → tes photos apparaissent

---

## 🎬 Activer une vidéo dans le Hero (optionnel)

Le composant `Hero` accepte une vidéo à la place de l'image :

```tsx
// dans src/app/(public)/page.tsx
<Hero
  videoWebm="/videos/hero.webm"
  videoMp4="/videos/hero.mp4"
  poster="/images/hero-poster.jpg"
/>
```

Place les fichiers dans `public/videos/`. Sans vidéo, la photo de démo s'affiche.

---

## 🎨 Changer les couleurs facilement

Toute la palette est centralisée dans `tailwind.config.ts` sous `colors`. Tu peux ajuster :
- `paper` → les tons crème de fond
- `gold` → l'accent doré
- `espresso` → les fonds sombres
- `ink` → les couleurs de texte

Modifie une valeur hex et tout le site se met à jour.

---

## ✅ Validation technique

- ✅ `tsc --noEmit` : **0 erreur TypeScript**
- ✅ Tous les composants refondus en thème clair
- ✅ Dashboard admin également adapté au thème clair
- ✅ Images Unsplash autorisées dans `next.config.ts`

---

## 🔜 Prochaine étape

Une fois le design validé, on attaque l'**Étape 4** : dashboard temps réel, tableau des réservations avec changement de statut, et messagerie « Replay Récent ».
