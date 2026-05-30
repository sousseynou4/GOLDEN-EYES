# 📸 Étape 5 — Compression, Albums & Vidéos externes

Cette version améliore le CMS médias avec tout ce que tu as demandé.

## 🆕 Nouveautés

### 🗜️ Compression automatique des images
- À chaque upload, les **photos sont compressées dans le navigateur** avant l'envoi
- Conversion en **WebP** + redimensionnement à 2400px max
- Une photo de 15 Mo devient ~800 Ko **sans perte visible**
- Tu vois la réduction en direct pendant l'upload (ex : `12 Mo → 740 Ko`)
- Résultat : tu stockes **10× plus de photos** dans ton 1 Go gratuit

### 📦 Limite relevée à 200 Mo
- La limite par fichier passe de 50 Mo à **200 Mo** (pour les cas exceptionnels)
- En pratique, avec la compression, les photos pèsent < 1 Mo

### 📁 Albums / Catégories (saisie libre)
- Dans l'admin, un champ **catégorie** avec autocomplétion des albums existants
- Tu tapes librement : « Mariage », « Portrait », « Reportage »…
- Les albums déjà créés te sont proposés automatiquement (évite les doublons)
- Tu peux assigner un album à tout un lot d'images d'un coup

### 🎬 Vidéos YouTube & Vimeo
- Onglet **« Vidéo YouTube / Vimeo »** dans l'admin
- Colle simplement le lien → la vidéo est détectée + miniature affichée
- Les vidéos lourdes ne pèsent **rien** sur ton stockage (elles restent chez YouTube/Vimeo)
- Sur le site public, elles se lisent dans un **lecteur intégré** (lightbox)

### 🖼️ Page Portfolio filtrable par album
- Le visiteur voit des **boutons de filtre** : Tous · Mariage · Portrait…
- Il clique « Mariage » → ne voit que cet album
- Photos ET vidéos mélangées proprement
- Clic sur une vidéo → elle se lance directement

---

## 🔧 Configuration requise (IMPORTANT)

### Exécuter la nouvelle migration SQL

Dans Supabase → **SQL Editor** → **New query**, ouvre le fichier suivant
sur ton ordinateur, copie **son contenu** (pas le chemin !) et colle-le :

```
supabase/migrations/20260521000000_media_external_video.sql
```

Puis **Run**. Cela :
- ajoute les colonnes `provider` et `embed_id` à la table `media` (pour les vidéos externes)
- relève la limite du bucket à 200 Mo

> ⚠️ Sans cette migration, l'ajout de vidéos externes échouera.

---

## 🧪 Comment tester

### Compression
1. Dashboard → **Médias** → glisse une grosse photo (plusieurs Mo)
2. Regarde le texte de progression : tu vois `X Mo → Y Ko` ✨

### Albums
1. Avant d'importer, tape un nom dans le champ **Catégorie** (ex : « Mariage »)
2. Importe tes photos → elles sont toutes classées dans cet album
3. Va sur `/portfolio` → un bouton « Mariage » apparaît

### Vidéo externe
1. Onglet **« Vidéo YouTube / Vimeo »**
2. Colle un lien YouTube (ex : `https://www.youtube.com/watch?v=...`)
3. La miniature s'affiche → donne un titre + catégorie → **Ajouter**
4. Va sur `/portfolio` → clique la vidéo → elle se lit dans la lightbox

---

## 💡 Conseils stockage

| Type | Recommandation |
|------|----------------|
| Photos | Upload direct (compression auto) — illimité en pratique |
| Vidéos courtes (< 30s, teasers) | Upload direct possible |
| Vidéos longues (films de mariage…) | **YouTube/Vimeo** (non répertorié) puis coller le lien |

Ainsi ton stockage Supabase reste léger et ton site rapide.
