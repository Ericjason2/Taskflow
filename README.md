# 📋 TaskFlow — Plateforme de Gestion de Projets Collaboratifs

Une plateforme web (MVP) moderne et intuitive pour gérer des projets en équipe avec une interface collaborative, temps réel, et gestion des tâches avancée.

**[Démo Live](https://taskflow-1i4vctv6x-erickouta6-4147s-projects.vercel.app)** • **[Documentation API](./docs/API.md)**

---

## Caractéristiques Principales

**Interface Moderne**

- Design minimaliste noir/blanc avec CSS Variables
- Responsive mobile-first
- Drag & Drop intuitif pour les tâches (Kanban)

  **Gestion des Utilisateurs**

- Authentification JWT sécurisée
- Rôles : Admin, Créateur de projet, Membre
- Permissions granulaires par rôle

  **Gestion de Projets & Tâches**

- CRUD complet sur projets et tâches
- Statuts : À faire, En cours, En révision, Terminé
- Assignation de tâches aux membres
- Système de commentaires

  **Temps Réel**

- Socket.io pour la synchronisation instantanée
- Fil d'activité en direct
- Notifications Toast

  **Analytique**

- Graphiques Recharts (Pie & Bar)
- Dashboard Admin avec stats complètes
- Pagination et filtres avancés

---

## Déploiement

| Service               | URL                                                                                    | Status |
| --------------------- | -------------------------------------------------------------------------------------- | ------ |
| **Frontend** (Vercel) | [taskflow.vercel.app](https://taskflow-1i4vctv6x-erickouta6-4147s-projects.vercel.app) | Live   |
| **Backend** (Render)  | taskflow-api-upnf.onrender.com                                                         | Live   |

### Configuration Production

**Frontend (Vercel):**

```
VITE_API_URL=https://taskflow-api-upnf.onrender.com
```

**Backend (Render):**

```
NODE_ENV=production
DATABASE_URL=postgresql://...
CLIENT_URL=https://taskflow-[hash].vercel.app
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

---

## Stack Technique

| Couche              | Technologie                                  |
| ------------------- | -------------------------------------------- |
| **Frontend**        | React 18 + Vite + Zustand + React Router v6  |
| **Backend**         | Node.js + Express 4 + Socket.io              |
| **Base de données** | SQLite (dev) / PostgreSQL (prod)             |
| **ORM**             | Sequelize 6                                  |
| **Auth**            | JWT + bcryptjs (12 rounds)                   |
| **UI Components**   | @hello-pangea/dnd, Recharts, react-hot-toast |
| **Styling**         | CSS Variables (design system custom)         |

---

## Installation Locale

### Prérequis

- Node.js 16+
- npm ou yarn
- Git

### 1. Cloner le repo

```bash
git clone https://github.com/erickouta/taskflow.git
cd taskflow
```

### 2. Backend

```bash
cd server
npm install

# Créer le fichier .env
cp .env.example .env
```

Contenu `.env` (développement):

```env
NODE_ENV=development
PORT=5000
USE_SQLITE=true
JWT_SECRET=dev_secret_key_change_in_prod
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Démarrer le backend:

```bash
npm run seed    # Initialiser la BDD avec données de test
npm run dev     # Démarrer sur http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm run dev     # Démarrer sur http://localhost:5173
```

L'app sera disponible sur **http://localhost:5173**

---

## Comptes de Test

| Email                | Mot de passe | Rôle           |
| -------------------- | ------------ | -------------- |
| `admin@taskflow.io`  | `admin123`   | Administrateur |
| `alice@taskflow.io`  | `membre123`  | Membre         |
| `bob@taskflow.io`    | `membre123`  | Membre         |
| `claire@taskflow.io` | `membre123`  | Membre         |

> **Note**: En production, l'admin est automatiquement créé/réinitialisé au démarrage du serveur.

---

## Architecture

### Structure des Fichiers

```
taskflow/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages (Dashboard, Projects, Login, etc.)
│   │   ├── services/          # API & Socket.io
│   │   ├── store/             # Zustand stores (auth, projects)
│   │   └── styles/            # CSS global & design system
│   └── vite.config.js
│
├── server/                    # Backend Express
│   ├── controllers/           # Logique métier
│   ├── models/                # Sequelize models (User, Project, Task, etc.)
│   ├── routes/                # Routes API
│   ├── middleware/            # Auth, validation, errors
│   └── config/               # DB & seed
│
└── docs/                      # 📚 Documentation
    └── README.md              # Cette documentation
```

### Flux d'Authentification

```
Login → JWT Token (stocké en localStorage)
        ↓
        Utilisé dans tous les appels API (Authorization: Bearer <token>)
        ↓
        Middleware auth vérifie le token
        ↓
        Accès aux routes protégées
```

### Synchronisation Temps Réel

```
Client A modifie une tâche
    ↓
emit('task_update', data) via Socket.io
    ↓
Serveur reçoit et broadcast à tous les clients du projet
    ↓
Clients reçoivent 'task_updated' et re-rendent
```

---

## Sécurité

- **Mots de passe**: Hashage bcryptjs (12 rounds)
- **JWT**: Tokens avec expiration configurable
- **Validation**: express-validator sur toutes les entrées
- **Headers HTTP**: Helmet.js (CSP, XSS protection)
- **CORS**: Configuré pour l'origine client uniquement
- **Rate Limiting**: 200 req / 15 min par IP
- **RBAC**: Contrôle d'accès granulaire par rôle
- **Cascade Delete**: Suppression conforme des dépendances

---

## Documentation API

Voir [docs/API.md](./docs/API.md) pour la documentation complète des endpoints.

**Exemples rapides:**

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskflow.io","password":"admin123"}'

# Créer un projet
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Mon projet","description":"..."}'
```

---

## Fonctionnalités par Rôle

### Administrateur

- Visualiser **tous** les projets (lecture seule)
- Gérer les utilisateurs (suppression + cascade delete)
- Voir les statistiques globales
- Accéder au fil d'activité complet

### Créateur de Projet

- Créer/Modifier/Supprimer ses projets
- Ajouter/Retirer des membres
- Créer/Modifier/Supprimer des tâches
- Assigner des tâches

### Membre

- Visualiser les projets auxquels il appartient
- Créer/Modifier ses tâches assignées
- Ajouter des commentaires
- Exporter les statistiques du projet

---

## Mises à Jour Récentes

- Correction du routing Vercel (pattern regex CORS)
- Auto-création du compte admin en production
- Support des domaines Vercel dynamiques en CORS
- Configuration API dynamique (VITE_API_URL)
- Reset du mot de passe admin à chaque démarrage

---

## Contribution

Les contributions sont bienvenues ! Pour proposer des changements :

1. Fork le projet
2. Crée une branche (`git checkout -b feature/AmazingFeature`)
3. Commite tes changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvre une Pull Request

---

## Auteur

**Eric Kouta** - Développeur Full-Stack Junior

- GitHub: [@erickouta](https://github.com/erickouta)
- Email: erickouta6@gmail.com

---

## Remerciements

- [React](https://react.dev) - UI Library
- [Sequelize](https://sequelize.org) - ORM
- [Socket.io](https://socket.io) - Real-time communication
- [Zustand](https://github.com/pmndrs/zustand) - State management

---

## Support

Si vous avez des questions ou des problèmes :

1. Vérifiez la [documentation](/README.md)
2. Ouvrez une [Issue](https://github.com/erickouta/taskflow/issues)
3. Consultez la [FAQ](#faq)

### FAQ

**Q: Pourquoi je ne peux pas me connecter?**
A: Assurez-vous que le backend tourne correctement et que les variables d'environnement sont configurées.

**Q: Comment changer la base de données?**
A: Modifiez `server/config/db.js` et mettez à jour les variables d'environnement.

**Q: Puis-je utiliser cela en production?**
A: Oui! Assurez-vous de utiliser PostgreSQL, de changer `JWT_SECRET` et de configurer HTTPS.

---

**Fait avec ❤️ par Eric Kouta**
