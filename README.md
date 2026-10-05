# TaskFlow — Plateforme de Gestion de Projets Collaboratifs (MVP Complet)

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

> **Note**: Les comptes de test et le jeu de données initial sont automatiquement synchronisés (*auto-seed*) au démarrage du serveur (local, Docker ou Railway).

---

## Fonctionnalités Clés du MVP

### 1. Checklists & Sous-tâches Interactives
- **Création & Gestion** : Ajout de sous-tâches au sein de chaque carte avec titre et statut (*fait / à faire*).
- **Barre de progression dynamique** : Calcul automatique du pourcentage d'achèvement (`X/Y (Z%)`) et barre de jauge animée dans la modale de détail.
- **Badge d'état sur les cartes** : Indicateur visuel `[X/Y]` avec icône `CheckSquare` sur le Kanban.
- **Mise à jour instantanée** : Coche/décoche sans rechargement de page avec persistance automatique.

### 2. Centre de Notifications In-App & Temps Réel
- **Badge dynamique** : Compteur de notifications non lues en temps réel au niveau du header et de la barre latérale.
- **Notifications instantanées (Socket.io)** : Déclenchement automatique dès qu'un collaborateur est assigné à une tâche ou qu'un commentaire est ajouté.
- **Menu déroulant (Popover)** : Liste des dernières notifications avec dates relatives, pastilles d'état de lecture et bouton "Tout marquer comme lu".
- **Toasts visuels & sonores** : Alertes discrètes lors de la réception d'une notification en cours de session.

### 3. Couleurs de Couverture & Pièces Jointes
- **Bandeau de couverture (Card Covers)** : Palette de 8 couleurs distinctes pour thématiser et hiérarchiser visuellement les cartes du tableau.
- **Pièces jointes & Liens externes** : Intégration de liens utiles (Figma, GitHub, Notion, Drive) avec ouverture sécurisée et bouton de suppression.
- **Badges Kanban** : Présence d'une icône trombone (`Paperclip`) indiquant le nombre de documents attachés à la carte.

### 4. Filtres Rapides & Filtre "Mes Tâches"
- **Toggle "Mes tâches"** : Bouton d'accès rapide dans le bandeau du tableau pour afficher instantanément uniquement les cartes qui vous sont assignées.
- **Filtres combinés** : Recherche textuelle instantanée et filtre par niveau de priorité (*Basse, Moyenne, Haute, Critique*).
- **Indicateur de filtres actifs** : Affichage d'un bouton de réinitialisation en un clic dès qu'un filtre est appliqué.

### 5. Mode Sombre Persistant (Dark Mode)
- **Palette CSS Variables complète** : Thème sombre ultra soigné (`[data-theme="dark"]`) basé sur des tons ardoise et zinc profonds.
- **Bouton de bascule fluide** : Toggle Soleil / Lune accessible sur la barre latérale desktop et le menu mobile.
- **Persistance locale** : Sauvegarde immédiate dans le `localStorage` pour conserver votre préférence à chaque visite.

### 6. Export des Données du Projet (CSV & JSON)
- **Format CSV** : Téléchargement tabulaire prêt pour Excel / Google Sheets avec colonnes complètes (*ID, Titre, Statut, Priorité, Assigné, Checklists, Date de création*).
- **Format JSON** : Export complet de l'arborescence du projet avec toutes ses métadonnées, sous-tâches et commentaires.

### 7. Gestion du Profil & Avatars Stylisés
- **Choix d'avatar prédéfini** : Galerie de 8 avatars modernes au style Notion / Dicebear sélectionnables en un clic.
- **URL d'image personnalisée** : Champ direct pour renseigner l'URL de votre propre photo avec aperçu en temps réel.
- **Réinitialisation rapide** : Restauration immédiate de l'avatar basé sur vos initiales.
- **Sécurité du compte** : Modification sécurisée du mot de passe avec contrôle de l'ancien mot de passe.

---

## Expérience Utilisateur & Design

### Architecture Visuelle Mobile-First
- **Zéro scroll vertical sur la page du tableau** : Le conteneur du tableau occupe 100% de la hauteur disponible (`100vh` sur desktop, adapté sur mobile) sans barre de défilement globale indésirable.
- **Canvas Kanban fluide** : Défilement horizontal des colonnes de listes avec *scroll-snap* sur smartphones et tablettes.
- **Défilement interne des cartes** : Chaque colonne dispose de sa propre zone de défilement vertical indépendante.
- **Iconographie professionnelle shadcn / Lucide** : Utilisation exclusive des icônes SVG vectorielles (`lucide-react`). Aucune émoticône ni sticker fantaisiste pour un rendu épuré et professionnel.

### Vues Multiples Intégrées
1. **Vue Tableau (Kanban)** : Glisser-déposer (*Drag & Drop*) fluide des cartes entre colonnes (*À faire*, *En cours*, *En révision*, *Terminé*).
2. **Vue Liste (Tabulaire)** : Tableau récapitulatif avec tri, changement rapide de statut, priorité, échéance et membre assigné.
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
- **Contrôle d'accès basé sur les rôles (RBAC)** : Vérification rigoureuse des droits d'accès sur chaque route.
- **Authentification JWT Sécurisée** : Tokens signés transmis via le header standard `Authorization: Bearer <token>`.
- **Chiffrement des mots de passe** : Hachage fort avec `bcryptjs` (12 tours de salage).
- **Protection des en-têtes HTTP** : Intégration de `helmet` pour la protection contre le XSS, sniffing MIME, et clickjacking.
- **Politique CORS restrictive** : Configuration whitelist autorisant uniquement les origines officielles Vercel et le localhost.
- **Limitation de débit (Rate Limiting)** : Protection anti-brute-force sur les routes d'authentification et l'API générale.
- **Sanitisation et validation des entrées** : Contrôle des payloads avec `express-validator` et validation stricte des identifiants et des statuts autorisés.

### Qualité du Frontend
- **State Management prévisible** : Stores modulaires avec `zustand` (`authStore`, `projectStore`, `notificationStore`, `themeStore`).
- **Gestion optimiste des états (Optimistic UI)** : Déplacement instantané des cartes lors du drag & drop avec rollback automatique en cas d'erreur réseau.
- **Intercepteur Axios sécurisé** : Injection automatique du token JWT et gestion centralisée des erreurs 401 avec déconnexion propre.
- **Mobile-First & Accessibilité** : Layout entièrement responsive conçu pour smartphone, tablette et écran large.

---

## Tests d'Intégration Automatisés

Le projet inclut une suite de tests d'intégration complète sans dépendance superflue, exécutée avec le runner natif de Node.js (`node:test` et `node:assert`).

Pour lancer la suite de tests :
```bash
cd server
npm test
```

### Couverture des Tests :
- **Santé de l'API** (`GET /api/health`)
- **Authentification & Sécurité** (Rejet d'identifiants erronés, génération de token JWT, récupération du profil `/auth/me`)
- **Gestion des Projets & Collaborateurs** (Création de projet, ajout d'un membre avec rôle éditeur)
- **Règles Métier Tâches** :
  - **Garde-fou anti auto-assignation** (rejet avec HTTP 400 si un créateur s'auto-assigne une tâche)
  - **Création complète** (couleur de couverture, sous-tâches checklists, pièces jointes, assignation à un collaborateur)
  - **Mise à jour interactive de checklist**
  - **Ajout de commentaire & notification**
- **Centre de notifications** (Réception temps réel, marquage d'une notification comme lue, marquage global comme lu)
- **Nettoyage & Intégrité** (Suppression de la tâche et suppression du projet en cascade)

---

## Stack Technique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Zustand, React Router v6, Lucide React, @hello-pangea/dnd, Date-fns, React Hot Toast |
| **Backend** | Node.js (v22+), Express 4, Socket.io, Sequelize ORM 6 |
| **Base de Données** | SQLite (développement local) / PostgreSQL (production Railway) |
| **Sécurité** | JWT, Bcryptjs (12 rounds), Helmet, Express-Rate-Limit, CORS |
| **Tests** | Node.js Native Test Runner (`node:test`, `node:assert`) |
| **Déploiement** | Vercel (SPA Frontend), Railway (API REST + WebSockets) |

---

## Installation & Démarrage Local

### Prérequis
- Node.js 18+ (Node 22 recommandé)
- npm ou yarn
- Git

### 1. Cloner le dépôt
```bash
git clone https://github.com/erickouta/taskflow.git
cd taskflow
```

### 2. Démarrage du Backend
```bash
cd server
npm install
npm run dev
# Le serveur démarre sur http://localhost:5000 avec auto-seed des comptes de démo
```

Pour lancer les tests d'intégration automatisés :
```bash
npm test
```

### 3. Démarrage du Frontend
Dans un second terminal :
```bash
cd client
npm install
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
│   │   │   ├── common/         # Modales, NotificationDropdown, ThemeToggle, ConfirmDialog
│   │   │   ├── layout/         # AppLayout, Sidebar, MobileHeader
│   │   │   └── tasks/          # KanbanBoard, TaskModal, TaskDetailModal
│   │   ├── pages/              # Pages (Dashboard, Projects, ProjectDetail, Profile, Login...)
│   │   ├── services/           # Instances API (Axios), intercepteurs, Socket.io
│   │   ├── store/              # Stores Zustand (auth, project, notification, theme)
│   │   └── styles/             # Styles globaux, variables CSS, thèmes clair/sombre
│   └── vite.config.js
│
├── server/                     # API REST Node.js / Express
│   ├── config/                 # Connexion Sequelize & seed automatique
│   ├── controllers/            # Contrôleurs (auth, project, task, notification, user, stats)
│   ├── middleware/             # Authentification JWT, validation des rôles, rate-limit
│   ├── models/                 # Modèles Sequelize (User, Project, Task, Notification...)
│   ├── routes/                 # Définition des routes de l'API
│   ├── test-suite.js           # Suite de tests d'intégration automatisée
│   └── index.js                # Point d'entrée serveur, Socket.io, migrations automatiques
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
