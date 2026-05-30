# 📧 Étape 7 — Suivi complet par email & Domaine `golden-eyes.eu`

Cette version active les emails à **chaque étape importante** d'une réservation, et te guide pour brancher ton domaine pour envoyer aux vrais clients.

---

## 🆕 Nouveaux emails automatiques

### 1. Email au client quand tu changes le statut
- **« Confirmé »** → email « Réservation confirmée ✨ »
- **« Annulé »** → email « Réservation annulée »
- **« Terminé »** → **pas d'email** (c'est un statut interne, sans intérêt pour le client)

### 2. Email au client quand tu lui écris un message
- Chaque message envoyé depuis le dashboard est aussi reçu par email
- Le client peut **répondre directement à l'email** (sa réponse arrive chez toi)
- Une case **« Notifier le client par email »** dans le composer permet de désactiver au cas par cas (pour les notes internes)

---

## 🌐 PRIORITÉ N°1 : brancher ton domaine sur Resend

> ⚠️ **Tant que tu n'as pas fait ça**, Resend t'envoie seulement les emails à
> TOI (à l'adresse de ton compte Resend). Les vrais clients ne reçoivent rien.
> C'est probablement pour ça que tu ne vois pas de suivi côté client !

### Étape 1 : Ajouter le domaine sur Resend

1. Va sur **https://resend.com** → connecte-toi
2. Menu de gauche → **Domains** → clique **Add Domain**
3. Entre : **`golden-eyes.eu`** → clique **Add**
4. Resend t'affiche **3 enregistrements DNS** à ajouter. Garde cette page ouverte.

### Étape 2 : Ajouter les enregistrements DNS chez ton hébergeur

Tu as acheté `golden-eyes.eu` quelque part (OVH, Gandi, Namecheap, IONOS, Hostinger…). Va sur ce site, connecte-toi, et trouve la section **DNS** (ou « Zone DNS », « Gestion DNS »).

Tu vas y ajouter **3 enregistrements** que Resend te fournit. Ils ressemblent à ça :

| Type | Nom / Hôte | Valeur |
|------|------------|--------|
| **MX** | `send` | `feedback-smtp.eu-west-1.amazonses.com` (priorité 10) |
| **TXT** | `send` | `v=spf1 include:amazonses.com ~all` |
| **TXT** | `resend._domainkey` | une longue chaîne `p=MII...` |

> 💡 **Important** : sur certains hébergeurs (OVH notamment), le champ « Nom » s'écrit `send.golden-eyes.eu` au complet ; sur d'autres juste `send`. Reste fidèle à ce que demande l'interface de ton hébergeur. En cas de doute, **copie-colle exactement** ce que Resend affiche.

Après ajout, retourne sur Resend → onglet Domains → **Verify**.

> ⏰ Compte 10 à 30 minutes pour que les DNS se propagent. Parfois quelques heures dans le pire des cas. Sois patient et reviens cliquer **Verify** régulièrement.

### Étape 3 : Une fois le domaine vérifié (badge vert)

Modifie ton `.env.local` :

```env
EMAIL_FROM=Golden Eyes <contact@golden-eyes.eu>
```

Tu peux choisir n'importe quoi avant `@golden-eyes.eu` :
- `contact@golden-eyes.eu` (recommandé)
- `bonjour@golden-eyes.eu`
- `studio@golden-eyes.eu`

> Pas besoin de créer cette adresse comme une vraie boîte mail — Resend l'utilise juste comme expéditeur. Les réponses des clients arrivent sur ton `ADMIN_EMAIL`.

Redémarre le serveur (`Ctrl+C` puis `pnpm dev`). C'est tout !

---

## 🧪 Comment vérifier que les emails partent vraiment

### Le tableau de bord Resend
1. Va sur https://resend.com → **Logs** (ou **Emails**)
2. Tu vois chaque email avec son statut :
   - ✅ **Delivered** : reçu par le destinataire
   - ⏳ **Sent** : envoyé, en cours de livraison
   - ❌ **Bounced** : adresse invalide
   - 🚫 **Failed** : erreur (le détail est affiché)

C'est l'outil n°1 pour comprendre ce qui se passe.

### Les logs de ton terminal `pnpm dev`
- `[email] RESEND_API_KEY absente…` → tu n'as pas branché la clé
- `[email] Échec envoi…` → suivi du message d'erreur Resend
- Aucun message d'erreur → l'envoi est parti

### Côté client
- Vérifie aussi les **spams** au début (avant que le domaine ait sa réputation)

---

## 🧪 Test complet du flux

Une fois ton domaine vérifié sur Resend :

1. Va sur ton site `/contact`, envoie une demande **avec une adresse de test à toi**
   → Tu dois recevoir 2 emails (le tien client + ta notif admin)

2. Dans le dashboard, **change le statut** vers « Confirmé »
   → L'adresse test reçoit « Réservation confirmée ✨ »

3. Dans **Messages**, envoie un message
   → L'adresse test reçoit « Vous avez un nouveau message »

4. Dans Resend → **Logs**, tu vois les 4 envois ✅

---

## 🛡️ Sécurité

J'ai vu que tu avais collé tes clés dans la conversation. **Régénère-les** par précaution :
- **Supabase** → Settings → API → roll/rotate les clés `anon` et `service_role`
- **Resend** → API Keys → supprime l'ancienne, crée-en une nouvelle

Mets les nouvelles dans `.env.local`, redémarre, et c'est bon.

---

## 📦 Aucune migration SQL cette fois

Cette v8 n'ajoute pas de table ni de colonne en base — juste du code applicatif. Tu peux installer et tester directement.
