# ⚙️ Étape 4 — Dashboard admin complet

Cette version ajoute tout le back-office fonctionnel.

## 🆕 Nouveautés

### 📊 Dashboard temps réel
- Compteurs par statut + liste des 5 dernières demandes
- Mise à jour **automatique** quand une nouvelle réservation arrive (Supabase Realtime)

### 📋 Réservations (`/dashboard/bookings`)
- Tableau de toutes les demandes, **temps réel**
- Filtres par statut + recherche (nom, email)
- Clic sur une ligne → **panneau détail** (coordonnées, message, dates)
- Changement de statut en un clic (En attente / Confirmé / Terminé / Annulé)
- Suppression avec confirmation

### 💬 Messages — « Replay Récent » (`/dashboard/messages`)
- Liste des dossiers à gauche, **fil de discussion** à droite
- Le message initial du formulaire ouvre la conversation
- Rédaction + envoi de réponses (Entrée pour envoyer)
- **Temps réel** : les nouveaux messages s'affichent instantanément
- Historique horodaté

### 🖼️ Médias — CMS Light (`/dashboard/media`)
- **Upload par glisser-déposer** (ou sélection) vers Supabase Storage
- Photos (JPG, PNG, WebP) et vidéos (MP4, WebM), 50 Mo max
- Pour chaque média : titre, catégorie, **mise en avant** (★)
- Les médias « mis en avant » apparaissent sur la page d'accueil
- Suppression (retire le fichier du Storage ET la ligne en base)

---

## 🔧 Configuration requise (IMPORTANT)

### 1. Exécuter la nouvelle migration SQL Storage

Dans Supabase → **SQL Editor** → **New query**, copie-colle tout le contenu de :

```
supabase/migrations/20260520000000_storage_setup.sql
```

Puis **Run**. Cela crée le bucket `portfolio` (public) et ses règles d'accès.

> ⚠️ Sans cette étape, l'upload de médias échouera avec une erreur "bucket not found".

### 2. Vérifier que Realtime est activé

La migration initiale active déjà Realtime sur `bookings` et `messages_history`. Pour vérifier :
- Supabase → **Database** → **Replication** → la publication `supabase_realtime` doit inclure ces deux tables.

---

## 🧪 Comment tester

### Test du temps réel (le plus impressionnant)
1. Connecte-toi au dashboard → onglet **Réservations**
2. Dans un autre onglet (navigation privée), va sur `/contact` et envoie une demande
3. **Sans recharger**, la nouvelle réservation apparaît dans le tableau ✨

### Test de la messagerie
1. Onglet **Messages** → sélectionne un dossier
2. Écris une réponse, appuie sur Entrée
3. Le message s'ajoute au fil instantanément

### Test du CMS
1. Onglet **Médias** → glisse une photo
2. Elle s'upload, puis apparaît dans la grille
3. Clique ★ pour la mettre en avant
4. Va sur la page d'accueil → elle apparaît dans le portfolio (remplace les démos)

---

## 📌 Notes

- **Messagerie** : pour l'instant, suivi interne uniquement. L'envoi de vrais
  emails au client (via Resend ou autre) pourra être branché plus tard.
- **Stockage** : Supabase Storage, gratuit jusqu'à 1 Go. Migrable vers
  Cloudinary ultérieurement si besoin.
