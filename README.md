# TaskFlow — Plateforme de Gestion de Projets Collaboratifs (Style Trello)

Une plateforme web moderne, fluide et collaborative pour gérer des projets en équipe avec une expérience inspirée de Trello, des vues multiples, une synchronisation temps réel et des règles de sécurité rigoureuses.

**[Démo Live (Frontend Vercel)](https://taskflow-ivory-nine.vercel.app)** • **[API Backend (Railway)](https://taskflow-production-fd38.up.railway.app)** • **[Documentation API](./docs/API.md)**

---

## Déploiement en Production

| Service | Plateforme | URL | Statut |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | [taskflow-ivory-nine.vercel.app](https://taskflow-ivory-nine.vercel.app) | En ligne |
| **Backend API** | Railway | [taskflow-production-fd38.up.railway.app](https://taskflow-production-fd38.up.railway.app) | En ligne |

---

## Comptes de Démonstration

Des boutons de **connexion en un clic** sont directement disponibles sur la page de connexion pour tester immédiatement avec différents profils et rôles :

| Utilisateur | Email | Mot de passe | Rôle & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@taskflow.io` | `admin123` | **Administrateur** : Vue globale sur tous les tableaux, métriques et gestion des utilisateurs |
| **Alice** | `alice@taskflow.io` | `membre123` | **Collaboratrice** (Frontend) : Gestion de projets, création et suivi de tâches |
| **Bob** | `bob@taskflow.io` | `membre123` | **Collaborateur** (Backend) : Collaboration et assignation de cartes |
| **Claire** | `claire@taskflow.io` | `membre123` | **Collaboratrice** (Design) : Collaboration et suivi en temps réel |

> **Note**: Les comptes de test et le jeu de données initial sont automatiquement réinitialisés (*seeded*) au démarrage du serveur (local, Docker ou Railway).

---

## Expérience Utilisateur & Design (Inspiré de Trello)

### Architecture Visuelle Trello
- **Zéro scroll vertical sur la page du tableau** : Le conteneur du tableau occupe 100% de la hauteur disponible (`100vh` sur desktop, adapté sur mobile) sans barre de défilement globale indésirable.
- **Canvas Kanban fluide** : Défilement horizontal fluide des colonnes de listes avec scroll-snap sur petits écrans.
- **Défilement interne des cartes** : Chaque colonne dispose de sa propre zone de défilement vertical indépendante.
- **Iconographie professionnelle shadcn / Lucide** : Utilisation exclusive des icônes SVG vectorielles (`lucide-react`). Aucune émoticône ni sticker fantaisiste pour un rendu épuré et professionnel.
- **Palette soignée & micro-interactions** : États de survol délicats, badges de priorité clairs (*Basse*, *Moyenne*, *Haute*, *Critique*), dates d'échéance colorées selon l'urgence, et avatars des membres assignés.

### Vues Multiples Intégrées
1. **Vue Tableau (Kanban)** : Glisser-déposer (*Drag & Drop*) fluide des cartes entre colonnes (*À faire*, *En cours*, *En révision*, *Terminé*), ajout rapide de cartes en tête ou en bas de colonne.
2. **Vue Liste (Tabulaire)** : Tableau récapitulatif détaillé avec tri, changement rapide de statut, priorité, échéance et membre assigné.
3. **Vue Métriques** : Tableau de bord visuel avec taux de complétion dynamique et jauges de répartition par statut.

---

## Système d'Assignation & Règles Métier

Pour garantir un flux de travail collaboratif cohérent et sécurisé :
1. **Assignation réservée aux collaborateurs ajoutés** : Seuls les membres invités sur le tableau apparaissent dans le menu d'assignation d'une tâche.
2. **Exclusion stricte de soi-même** : L'utilisateur connecté ne peut pas s'assigner une carte à lui-même (`m.id !== user.id`). Cela favorise la délégation et la responsabilisation des collaborateurs de l'équipe.
3. **Validation & Protection Backend (400 Bad Request)** : L'API vérifie systématiquement que l'assigné n'est pas l'auteur de la requête et qu'il fait bien partie des membres enregistrés du projet dans la table `ProjectMembers`.
4. **Gestion des membres** : Le créateur du tableau peut inviter de nouveaux collaborateurs via le bouton **"Inviter"** avec recherche et ajout instantané.

---

## Bonnes Pratiques de Développement & Sécurité

### Sécurité du Backend
- **Contrôle d'accès basé sur les rôles (RBAC)** : Vérification rigoureuse des droits d'accès sur chaque route (propriétaire du projet, collaborateur invité ou administrateur).
- **Authentification JWT Sécurisée** : Tokens signés transmis via le header standard `Authorization: Bearer <token>`, avec expiration configurable.
- **Chiffrement des mots de passe** : Hachage fort avec `bcryptjs` (12 tours de salage).
- **Protection des en-têtes HTTP** : Intégration de `helmet` pour la protection contre le XSS, sniffing MIME, et clickjacking.
- **Politique CORS restrictive** : Configuration whitelist autorisant uniquement les origines officielles Vercel et le localhost en développement.
- **Limitation de débit (Rate Limiting)** : Protection anti-brute-force sur les routes d'authentification et l'API générale.
- **Sanitisation et validation des entrées** : Contrôle des payloads avec `express-validator` et validation stricte des identifiants et des statuts autorisés.

### Qualité du Frontend
- **State Management prévisible** : Stores modulaires avec `zustand` (`authStore`, `projectStore`).
- **Gestion optimiste des états (Optimistic UI)** : Déplacement instantané des cartes lors du drag & drop avec rollback automatique en cas d'erreur réseau.
- **Intercepteur Axios sécurisé** : Injection automatique du token JWT et gestion centralisée des erreurs 401 avec déconnexion propre.
- **Mobile-First & Accessibilité** : Layout entièrement responsive conçu pour smartphone, tablette et écran large.

---

## Stack Technique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Zustand, React Router v6, Lucide React, @hello-pangea/dnd, Date-fns, React Hot Toast |
| **Backend** | Node.js, Express 4, Socket.io, Sequelize ORM 6 |
| **Base de Données** | SQLite (développement local) / PostgreSQL (production Railway) |
| **Sécurité** | JWT (JSON Web Tokens), Bcryptjs (12 rounds), Helmet, Express-Rate-Limit, CORS |
| **Déploiement** | Vercel (SPA Frontend), Railway (API REST + WebSockets) |

---

## Installation Locale

### Prérequis
- Node.js 18+
- npm ou yarn
- Git

### 1. Cloner le dépôt
```bash
git clone https://github.com/erickouta/taskflow.git
cd taskflow
```

### 2. Configuration & Démarrage du Backend
```bash
cd server
npm install

# Copier le fichier d'exemple des variables d'environnement
cp .env.example .env
```

Exemple de variables `.env` (développement) :
```env
PORT=5000
NODE_ENV=development
USE_SQLITE=true
JWT_SECRET=votre_secret_jwt_securise
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Démarrer le serveur backend :
```bash
npm run dev
# Le serveur démarre sur http://localhost:5000 avec auto-seed des 4 comptes de test
```

### 3. Configuration & Démarrage du Frontend
Dans un autre terminal :
```bash
cd client
npm install
```

Exemple de fichier `.env` pour le client :
```env
VITE_API_URL=http://localhost:5000
```

Démarrer le serveur de développement Vite :
```bash
npm run dev
# L'application est accessible sur http://localhost:5173
```

---

## Structure du Projet

```
taskflow/
├── client/                     # Application React SPA (Vite)
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── common/         # Modales, ConfirmDialog, StatCard
│   │   │   ├── layout/         # AppLayout, Sidebar, MobileHeader
│   │   │   └── tasks/          # KanbanBoard, TaskModal, TaskDetailModal
│   │   ├── pages/              # Pages (Dashboard, Projects, ProjectDetail, Profile, Login...)
│   │   ├── services/           # Instances API (Axios), intercepteurs, Socket.io
│   │   ├── store/              # Stores Zustand (authStore, projectStore)
│   │   └── styles/             # Styles globaux, variables CSS, reset
│   └── vite.config.js
│
├── server/                     # API REST Node.js / Express
│   ├── config/                 # Connexion Sequelize & configuration DB
│   ├── controllers/            # Contrôleurs (auth, project, task, user, stats)
│   ├── middleware/             # Authentification JWT, validation des rôles
│   ├── models/                 # Modèles Sequelize et associations relationnelles
│   ├── routes/                 # Définition des routes de l'API
│   └── index.js                # Point d'entrée serveur, Socket.io, seed auto
│
└── docs/                       # Documentation technique & spécifications API
    └── API.md
```

---

## Auteur

**Eric Kouta** — Développeur Full-Stack
- GitHub : [@erickouta](https://github.com/erickouta)
- Email : erickouta6@gmail.com

---

## Licence

Ce projet est sous licence MIT. Libre d'utilisation pour des projets d'apprentissage et de développement personnel.
