# 🆓 Hébergement Gratuit - Guide Rapide

## TL;DR - Meilleure Option Gratuite

**Vercel (Frontend) + Render (Backend + BD)**

- ✅ 100% gratuit
- ✅ Automatisé (auto-déploiement GitHub)
- ✅ HTTPS inclus
- ✅ 5 minutes à mettre en place

---

## 🎯 Déploiement en 5 étapes

### 1️⃣ Préparer GitHub

```bash
# À la racine du projet
git add .
git commit -m "Deploy: prêt pour le cloud"
git push origin main
```

Vérifie que ton repo GitHub est public/accessible.

---

### 2️⃣ Déployer la Base de Données (Render)

1. Va sur **[render.com](https://render.com)**
2. Clique: `New +` → `PostgreSQL`
3. Remplis:
   - **Name**: `taskflow-db`
   - **Database**: `taskflow_db`
   - **User**: reste par défaut
   - **Plan**: `Free`
4. Clique **Create Database**
5. ✅ Copie la **Internal Database URL** (tu en auras besoin) postgresql://taskflow_db_qmuy_user:uVxnJmCHSvBBQKvpww06cTanQIUDvvqm@dpg-d82iu3jeo5us73f6dung-a/taskflow_db_qmuy

```
# Elle ressemblera à:
postgresql://user:password@hostname:5432/database
```

---

### 3️⃣ Déployer le Backend (Render)

1. Sur Render: `New +` → `Web Service`
2. Connecte ton **GitHub repository**
3. Configure:
   - **Name**: `taskflow-api`
   - **Region**: Europe (recommandé)
   - **Branch**: `main`
   - **Build Command**:
     ```
     npm --prefix server install --production && npm --prefix server run build
     ```
   - **Start Command**:
     ```
     npm --prefix server start
     ```
   - **Plan**: `Free`

4. Clique **Create Web Service**

5. **Ajoute les variables d'environnement:**

```
NODE_ENV = production
PORT = 5000
USE_SQLITE = false
DB_HOST = dpg-d82iu3jeo5us73f6dung-a
DB_PORT = 5432
DB_NAME = taskflow_db
DB_USER = (voir dans PostgreSQL Service: username)
DB_PASSWORD = taskflow_db_qmuy_user
JWT_SECRET = changez_moi_vraiment_longue_cle_aleatoire
CLIENT_URL = https://taskflow.vercel.app
```

6. ✅ Deploy lancé automatiquement
7. ⏳ Attends 5-10 min (tu verras "Your service is live")

**Copie l'URL du service Render** (ex: `https://taskflow-api.onrender.com`)

---

### 4️⃣ Déployer le Frontend (Vercel)

1. Va sur **[vercel.com](https://vercel.com)**
2. Clique **New Project**
3. Importe ton **GitHub repository**
4. Configure:
   - **Framework**: Vite
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
   - **Root Directory**: (laisse vide)

5. **Ajoute la variable d'environnement:**

```
VITE_API_URL = https://taskflow-api.onrender.com
```

6. Clique **Deploy**
7. ⏳ Attends 2-3 min
8. ✅ Ton app est en ligne!

**L'URL sera quelque chose comme: `https://taskflow.vercel.app`**

---

### 5️⃣ Mise à jour

Maintenant, chaque fois que tu feras un `git push`, les déploiements se feront **automatiquement** sur Vercel et Render! 🚀

```bash
# Pour déployer une modification:
git add .
git commit -m "Ma modification"
git push origin main
# → Vercel et Render se redéploient automatiquement en 2-5 min
```

---

## ⚙️ Configuration du Code

### Vérifier le .env.example du serveur

```bash
cat server/.env.example
```

Doit contenir:

```env
NODE_ENV=production
PORT=5000
USE_SQLITE=false
DB_HOST=db
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=taskflow
DB_PASSWORD=taskflow_secret
JWT_SECRET=change_this_secret_key
CLIENT_URL=http://localhost:5173
```

### Si pas de .env.example, crée-le:

```bash
cat > server/.env.example << 'EOF'
NODE_ENV=production
PORT=5000
USE_SQLITE=false
DB_HOST=db
DB_PORT=5432
DB_NAME=taskflow_db
DB_USER=taskflow
DB_PASSWORD=taskflow_secret
JWT_SECRET=change_this_secret_key
CLIENT_URL=http://localhost:5173
EOF
```

---

## ✅ Vérifier que tout fonctionne

1. **Accède à l'app**: https://taskflow.vercel.app
2. **Teste le login**:
   - Email: `admin@taskflow.io`
   - Mot de passe: `admin123`
3. **Teste une action** (créer un projet, etc.)

Si ça marche → tu as réussi! 🎉

---

## ⚠️ Limitations (Freemium)

| Limite                | Impact          | Solution                   |
| --------------------- | --------------- | -------------------------- |
| Backend hiberne 15min | Démarrage lent  | Accès régulier le réveille |
| 0.5 Go BD             | Petits projets  | Suffisant pour dev/test    |
| 100 Go bande passante | Pour les médias | OK pour une app texte      |

---

## 🆘 Troubleshooting

### "Backend ne répond pas"

```bash
# Le backend hiberne après 15 min
# → Va sur l'app, recharge la page (ça prend 30s)
# → Le backend se reveille
```

### "Erreur de connexion BD"

- Vérifie les variables d'env sur Render
- Assure-toi d'avoir copié le **Internal Database URL** (pas External)

### "Frontend ne trouve pas l'API"

- Vérifie `VITE_API_URL` sur Vercel
- Doit être: `https://taskflow-api.onrender.com`

### Voir les logs

**Backend logs:**

```
Render Dashboard → taskflow-api → Logs
```

**Frontend logs:**

```
Vercel Dashboard → taskflow → Logs
```

---

## 📈 Passer à Payant (Optionnel)

Si ton app a du succès:

- **Render**: +$5-7/mois (enlever hibération)
- **Vercel**: Gratuit pour apps (Pro pour extras)
- **PostgreSQL**: +$15/mois pour BD plus grande

Reste gratuit pour l'instant! 😄

---

## 🎓 Apprendre Plus

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [PostgreSQL GUI gratuit](https://www.pgadmin.org/)
