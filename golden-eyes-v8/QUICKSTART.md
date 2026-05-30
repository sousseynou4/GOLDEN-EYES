# 🚀 Quickstart — Golden Eyes (Étapes 1+2+3)

Guide express pour lancer le projet en **moins de 10 minutes**.

---

## 1️⃣ Installation

```bash
cd golden-eyes-v3
pnpm install              # ou: npm install
```

---

## 2️⃣ Supabase — 3 étapes

### a) Créer le projet
1. https://app.supabase.com → **New Project**
2. Région : Frankfurt (UE) recommandée
3. Attends 2 min que la DB démarre

### b) Exécuter la migration SQL
1. Onglet **SQL Editor** → **New query**
2. Copie tout le contenu de :
   ```
   supabase/migrations/20260519000000_initial_schema.sql
   ```
3. Clique **Run** ✅

### c) Créer le compte admin
1. Onglet **Authentication** → **Users** → **Add user**
2. Email + mot de passe robuste
3. ✅ **Auto Confirm User** (important)

---

## 3️⃣ Variables d'environnement

```bash
cp .env.example .env.local
```

Récupère tes clés sur **Settings → API** dans Supabase et remplis :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## 4️⃣ Lancer

```bash
pnpm dev
```

→ http://localhost:3000

---

## ✅ Checklist de validation (Étape 3)

### Pages publiques
- [ ] `/` → Hero "Golden Eyes" + section approche + CTA
- [ ] `/portfolio` → Page galerie (vide ou avec items si tu en as ajoutés)
- [ ] `/about` → Présentation
- [ ] `/contact` → Formulaire de réservation visible

### Header
- [ ] Transparent en haut de page
- [ ] Devient opaque (avec blur) en scrollant
- [ ] Menu burger fonctionnel en mobile
- [ ] Lien actif souligné en doré

### Formulaire de contact
- [ ] Tous les champs présents (Nom, Prénom, Email, Téléphone, Adresse, Date, Message)
- [ ] Validation : essaie d'envoyer vide → messages d'erreur Zod en rouge
- [ ] Téléphone non FR : erreur "Numéro de téléphone invalide"
- [ ] Date passée : erreur "La date doit être dans le futur"
- [ ] Envoi valide → toast vert + écran de confirmation
- [ ] Vérifier dans Supabase **Table Editor → bookings** : ta réservation apparaît !

### Admin
- [ ] `/dashboard` → redirige vers `/login` (non connecté)
- [ ] Connexion → compteur **En attente : 1** (la réservation de test)

---

## 🆘 Problèmes fréquents

### "Module not found: Can't resolve '@supabase/ssr'"
→ `pnpm install` n'a pas tourné. Refais-le.

### "Error: PostCSS config is undefined"
→ Le ZIP v2 corrige ça. Si tu vois encore l'erreur, c'est que tu es sur l'ancien dossier `golden-eyes/`. Supprime-le et utilise `golden-eyes-v3/`.

### Le hero affiche un dégradé doré (pas de vidéo)
→ **Normal** : aucune vidéo n'est fournie par défaut. Voir `README.md` section "Activer la vidéo de fond".

### Le portfolio est vide
→ **Normal** : la table `media` est vide. Voir `README.md` section "Ajouter des photos au portfolio".

### Le marquee n'apparaît pas sur la home
→ **Normal** : il n'apparaît que s'il y a au moins une image avec `is_featured=true` dans la table `media`.

### `Hydration failed because the server rendered HTML...`
→ Recharge la page une fois (Ctrl+F5). Si ça persiste, supprime le dossier `.next/` et relance.

---

## 📚 Pour aller plus loin

- README complet : `./README.md`
- Schéma DB : `./supabase/migrations/20260519000000_initial_schema.sql`
- Doc Next.js : https://nextjs.org/docs
- Doc Supabase : https://supabase.com/docs
