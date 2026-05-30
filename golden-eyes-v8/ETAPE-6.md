# 📧 Étape 6 — Emails automatiques & Formulaire enrichi

## 🆕 Nouveautés

### 📝 Formulaire de réservation enrichi
4 nouveaux champs :
- **Type de prestation** (obligatoire) : Mariage, Portrait, Événement, Reportage, Autre
- **Lieu / ville** (optionnel)
- **Nombre de personnes** (optionnel)
- **Budget approximatif** (optionnel, menu déroulant)

Ces infos s'affichent aussi dans le **détail de chaque réservation** côté admin.

### 📧 Deux emails automatiques à chaque réservation
1. **Au client** : confirmation « Demande bien reçue » avec récapitulatif
2. **À toi** : notification « Nouvelle demande de [nom] » avec tous les détails

Les emails ont un **design assorti au site** (crème, or, espresso).

> 💡 Le bouton « Répondre » de l'email admin répond directement au client
> (grâce au `replyTo`).

---

## 🔧 Configuration — DEUX choses à faire

### 1. Migration SQL (nouveaux champs)

Supabase → **SQL Editor** → ouvre le fichier, copie son **CONTENU**, colle, **Run** :
```
supabase/migrations/20260522000000_booking_extra_fields.sql
```

### 2. Configurer Resend (pour activer les emails)

> ⚠️ **Sans cette étape, le site marche quand même** : les demandes sont
> enregistrées dans le dashboard. Seuls les emails ne partent pas (un
> avertissement apparaît dans la console). Tu peux donc tester le reste
> tout de suite et brancher les emails quand tu veux.

**Étapes (5 minutes) :**

1. Va sur **https://resend.com** → crée un compte gratuit
   (3000 emails/mois offerts)
2. Une fois connecté : menu **API Keys** → **Create API Key**
   - Nom : « Golden Eyes »
   - Permission : « Sending access »
   - Copie la clé (commence par `re_...`)
3. Ouvre ton fichier **`.env.local`** et ajoute ces 3 lignes :

```env
RESEND_API_KEY=re_ta_cle_ici
EMAIL_FROM=Golden Eyes <onboarding@resend.dev>
ADMIN_EMAIL=ton.email@gmail.com
```

   - `RESEND_API_KEY` : la clé que tu viens de copier
   - `EMAIL_FROM` : garde `onboarding@resend.dev` pour l'instant (voir note ci-dessous)
   - `ADMIN_EMAIL` : **TON** email perso, où tu veux recevoir les notifications

4. Redémarre le serveur (`Ctrl+C` puis `pnpm dev`)

5. Teste : envoie une demande via `/contact` → tu reçois 2 emails ! 🎉

---

## ⚠️ Important sur l'adresse d'expéditeur

Au départ, avec `onboarding@resend.dev`, il y a **une limite** : Resend
n'enverra les emails QU'À ton adresse de compte Resend (mode test). C'est
parfait pour tester.

**Pour envoyer à de vrais clients**, il faut vérifier ton propre domaine :
1. Resend → **Domains** → **Add Domain** → entre ton domaine (ex : `golden-eyes.fr`)
2. Ajoute les enregistrements DNS indiqués (chez ton hébergeur de domaine)
3. Une fois vérifié, change dans `.env.local` :
   ```env
   EMAIL_FROM=Golden Eyes <contact@golden-eyes.fr>
   ```

> Si tu n'as pas encore de nom de domaine, on s'en occupera à l'étape
> déploiement. Pour l'instant, le mode test suffit pour valider que tout marche.

---

## 🧪 Test rapide (sans Resend)

Même sans configurer Resend, tu peux déjà tester le **formulaire enrichi** :
1. Va sur `/contact`
2. Le formulaire a maintenant : type de prestation, lieu, nombre de personnes, budget
3. Remplis et envoie
4. Dans le dashboard → **Réservations** → clique la demande → tu vois tous les nouveaux champs ✨

(Les emails afficheront juste un avertissement console tant que Resend n'est pas branché.)
