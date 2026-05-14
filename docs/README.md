# TaskFlow — Plateforme de Gestion de Projets Collaboratifs

## Stack Technique

| Couche          | Technologie                                                          |
| --------------- | -------------------------------------------------------------------- |
| Frontend        | React 18, Vite, Zustand, React Router v6                             |
| Backend         | Node.js, Express 4, Socket.io                                        |
| Base de données | SQLite (dev) / PostgreSQL (prod)                                     |
| ORM             | Sequelize 6                                                          |
| Auth            | JWT (jsonwebtoken) + bcryptjs                                        |
| Drag & Drop     | @hello-pangea/dnd                                                    |
| Graphiques      | Recharts                                                             |
| Styling         | CSS Variables (thème noir/blanc minimalist), responsive mobile-first |
| Notifications   | react-hot-toast                                                      |

---

## Structure du Projet

```
taskflow/
├── client/                    # Frontend React
│   └── src/
│       ├── components/
│       │   ├── layout/        # Sidebar, MobileHeader, AppLayout
│       │   ├── projects/      # ProjectCard, ProjectModal
│       │   ├── tasks/         # KanbanBoard, TaskModal, TaskDetail
│       │   └── common/        # ConfirmModal
│       ├── pages/             # DashboardPage, ProjectsPage, ProjectDetailPage, ProfilePage
│       ├── services/          # api.js (axios), socket.js (socket.io-client)
│       ├── store/             # authStore.js, projectStore.js (Zustand)
│       └── styles/            # index.css (Design System)
├── server/                    # Backend Express
│   ├── controllers/           # authController, projectController, taskController
│   ├── models/                # User, Project, Task, Comment, Activity, ProjectMember
│   ├── routes/                # auth.js, projects.js, tasks.js
│   ├── middleware/            # auth.js (JWT), error.js (validation)
│   └── config/               # db.js (Sequelize), seed.js
└── docs/
    └── README.md
```

---

## Installation & Démarrage

### 1. Variables d'environnement (Backend)

```bash
cd server
cp .env.example .env
```

Contenu de `.env` :

```env
NODE_ENV=development
PORT=5000
USE_SQLITE=true          # SQLite pour le dev (aucune config DB requise)
JWT_SECRET=change_this_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 2. Backend

```bash
cd server
npm install
npm run seed        # Créeation des tables + données de test
npm run dev         # Démarrer en mode développement
```

### 3. Frontend

```bash
cd client
npm install
npm run dev         # Démarrer Vite sur http://localhost:5173
```

---

## Comptes de Test

| Email              | Mot de passe | Rôle           |
| ------------------ | ------------ | -------------- |
| admin@taskflow.io  | admin123     | Administrateur |
| alice@taskflow.io  | membre123    | Membre         |
| bob@taskflow.io    | membre123    | Membre         |
| claire@taskflow.io | membre123    | Membre         |

---

## Endpoints API

### Auth

| Méthode | Route                     | Description                                                  | Auth |
| ------- | ------------------------- | ------------------------------------------------------------ | ---- |
| POST    | `/api/auth/register`      | Inscription                                                  |
| POST    | `/api/auth/login`         | Connexion                                                    |
| GET     | `/api/auth/me`            | Profil courant                                               |
| PUT     | `/api/auth/profile`       | Modifier profil                                              |      |
| PUT     | `/api/auth/password`      | Changer mot de passe                                         |
| GET     | `/api/auth/users`         | Tous les utilisateurs                                        |
| DELETE  | `/api/auth/users/:userId` | Supprimer utilisateur (admin uniquement avec cascade delete) |

### Projets

| Méthode | Route                               | Description                            |
| ------- | ----------------------------------- | -------------------------------------- |
| GET     | `/api/projects`                     | Lister projets (pagination, filtres)   |
| POST    | `/api/projects`                     | Créer un projet                        |
| GET     | `/api/projects/:id`                 | Détails projet                         |
| PUT     | `/api/projects/:id`                 | Modifier projet (créateur uniquement)  |
| DELETE  | `/api/projects/:id`                 | Supprimer projet (créateur uniquement) |
| POST    | `/api/projects/:id/members`         | Ajouter membre (créateur uniquement)   |
| DELETE  | `/api/projects/:id/members/:userId` | Retirer membre (créateur uniquement)   |
| GET     | `/api/projects/stats`               | Statistiques                           |
| GET     | `/api/projects/activities`          | Fil d'activité                         |

### Tâches

| Méthode | Route                                          | Description                       |
| ------- | ---------------------------------------------- | --------------------------------- |
| GET     | `/api/projects/:id/tasks`                      | Lister tâches                     |
| POST    | `/api/projects/:id/tasks`                      | Créer tâche                       |
| GET     | `/api/projects/:id/tasks/:taskId`              | Détail tâche + commentaires       |
| PUT     | `/api/projects/:id/tasks/:taskId`              | Modifier tâche (créateur projet)  |
| DELETE  | `/api/projects/:id/tasks/:taskId`              | Supprimer tâche (créateur projet) |
| PATCH   | `/api/projects/:id/tasks/:taskId/status`       | Changer statut                    |
| POST    | `/api/projects/:id/tasks/:taskId/comments`     | Ajouter commentaire               |
| DELETE  | `/api/projects/:id/tasks/:taskId/comments/:id` | Supprimer commentaire             |

---

## Sécurité Implémentée

- **bcryptjs** — Hash des mots de passe (cost factor 12)
- **JWT** — Tokens avec expiration configurable
- **Helmet.js** — Headers HTTP sécurisés
- **CORS** — Configuré pour l'origine client uniquement
- **Rate Limiting** — 200 req / 15 min par IP
- **express-validator** — Validation + sanitisation des entrées
- **Variables d'environnement** — Secrets externalisés via dotenv
- **Middleware auth** — Protection de toutes les routes privées
- **RBAC** — Contrôle d'accès basé sur les rôles (admin/membre/créateur)
- **Permissions strictes** — Seul le créateur du projet peut le modifier/supprimer
- **Cascade delete** — Suppression en cascade de toutes les dépendances (tâches, commentaires, activités)
- **Admin read-only** — L'admin peut visualiser tous les projets mais ne peut pas les modifier

---

## Fonctionnalités Implémentées

- Inscription / Connexion / Déconnexion
- Sessions JWT sécurisées
- Profil utilisateur (visualisation + édition)
- Rôles Admin / Membre avec permissions strictes
- CRUD complet sur les projets (restrictions créateur)
- CRUD complet sur les tâches (restrictions créateur projet)
- Assignation de tâches
- Statuts : À faire / En cours / En révision / Terminé
- Pagination et filtres projets
- **Gestion des utilisateurs par admin** (suppression + cascade delete)

- Recherche instantanée (debounced)
- Tri des projets (date, titre)
- Notifications visuelles (react-hot-toast) avec gestion des erreurs
- **Kanban drag & drop** (@hello-pangea/dnd)
- **Graphiques** (PieChart + BarChart via Recharts)
- **Commentaires** sur les tâches
- **Temps réel** — Socket.io (sync entre onglets)
- Fil d'activité (historique des actions)
- **Dashboard Admin** — Vue complète de tous les projets en mode lecture seule

- Tags sur les tâches
- Vue liste + vue kanban
- Couleur personnalisable par projet
- Thème noir/blanc minimaliste
- Indicateurs visuels (\"Créé par\", \"Mode lecture seule\")

---

## Architecture Socket.io

```
Client A (modifie une tâche)
    ↓ emit('task_update', data)
Serveur Socket.io
    ↓ to('project_123').emit('task_updated', data)
Client B, C... (reçoivent la mise à jour)
    ↓ fetchProject() → re-render
```

---

## Modèle de Données

```
USERS ──── PROJECTS (créateur)
 │            │
 └─── N:N ───┘ (via ProjectMembers)
              │
           TASKS ──── COMMENTS
              │
           ACTIVITIES
```

---

## Permissions et Rôles

### Administrateur

- Voir **tous** les projets de l'équipe
- Modifier/Supprimer les projets (lecture seule, non autorisé)
- Créer des tâches sur les projets d'autres (Non autorisé)
- Gérer les utilisateurs (suppression avec cascade delete)
- Voir les statistiques globales et activités

### Créateur du Projet

- Créer/Modifier/Supprimer son projet
- Ajouter/Retirer des membres
- Créer/Modifier/Supprimer des tâches
- Assigner des tâches aux membres

### Membre du Projet

- Visualiser le projet
- Créer/Modifier ses tâches (si assigné)
- Ajouter des commentaires
- Modifier la configuration du projet (Non autorisé)

### Utilisateur Standard

- Créer ses propres projets
- Voir ses projets et ceux où il est membre
- Voir les projets d'autres utilisateurs (sauf s'il en est membre)

Ajout des notifications pour l'affectation d'une tâche sur un projet ou un commentaire sur une tâche.

Dashboard pour visualiser les différentes tâches assignés.
