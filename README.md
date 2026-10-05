# TaskFlow — Plateforme de Gestion de Projets Collaboratifs (MVP)

Une plateforme web moderne, fluide et collaborative pour gérer des projets d'équipe avec une expérience inspirée de Trello, des vues multiples (Kanban, Liste, Calendrier, Métriques), une synchronisation temps réel par WebSockets, des automatisations de règles et une conception responsive mobile-first propulsée par **Tailwind CSS v4**.

**[Démo Live (Frontend Vercel)](https://taskflow-ivory-nine.vercel.app)** • **[API Backend (Railway)](https://taskflow-production-fd38.up.railway.app)** • **[Documentation API](./docs/API.md)**

---

## Déploiement en Production

| Service | Plateforme | URL | Statut |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | [taskflow-ivory-nine.vercel.app](https://taskflow-ivory-nine.vercel.app) | En ligne |
| **Backend API** | Railway | [taskflow-production-fd38.up.railway.app](https://taskflow-production-fd38.up.railway.app) | En ligne |

---

## Comptes de Démonstration

Des boutons de **connexion en un clic** sont directement intégrés sur la page de connexion pour tester immédiatement avec différents profils et rôles :

| Utilisateur | Email | Mot de passe | Rôle & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@taskflow.io` | `admin123` | **Administrateur** : Vue globale sur tous les tableaux, métriques et gestion des utilisateurs |
| **Alice** | `alice@taskflow.io` | `membre123` | **Collaboratrice** (Frontend) : Gestion de projets, création et suivi de tâches |
| **Bob** | `bob@taskflow.io` | `membre123` | **Collaborateur** (Backend) : Collaboration et assignation de cartes |
| **Claire** | `claire@taskflow.io` | `membre123` | **Collaboratrice** (Design) : Collaboration et suivi en temps réel |

> **Note**: Les comptes de test et le jeu de données initial sont automatiquement synchronisés (*auto-seed*) au démarrage du serveur (local, Docker ou Railway).

---

## Fonctionnalités Clés

### 1. Vues Multiples & Tableau Kanban Interactif
- **Tableau Kanban** : Glisser-déposer (*Drag & Drop*) ultra-fluide avec `@hello-pangea/dnd` entre colonnes (*À faire*, *En cours*, *En révision*, *Terminé*).
- **Vue Liste (Tabulaire)** : Vue tabulaire structurée avec tri rapide, modification en ligne du statut, de la priorité et des assignés.
- **Vue Calendrier** : Vue calendaire mensuelle complète permettant de visualiser la répartition des tâches selon leurs dates d'échéance.
- **Vue Métriques & Dashboard** : Indicateurs de performance visuels avec taux de complétion, graphiques Recharts et jauges de répartition par statut et priorité.

### 2. Multi-Assignation Collaborateurs
- **Assignation multiple** : Possibilité d'assigner une même tâche à un ou plusieurs membres de l'équipe.
- **Badges d'avatars superposés** : Affichage compact et élégant des collaborateurs assignés sur les cartes Kanban et dans les vues détaillées.
- **Filtres d'équipe** : Filtrage direct par collaborateur pour isoler les tâches d'un membre précis ou afficher rapidement "Mes tâches".

### 3. Checklists & Sous-tâches Interactives
- **Création & Gestion** : Ajout rapide de sous-tâches au sein de chaque carte avec titre et statut (*fait / à faire*).
- **Barre de progression dynamique** : Calcul automatique du pourcentage d'achèvement (`X/Y (Z%)`) et barre de jauge animée dans la modale de détail.
- **Badge d'état sur les cartes** : Indicateur visuel `[X/Y]` avec icône `CheckSquare` sur le Kanban.
- **Mise à jour instantanée** : Coche/décoche sans rechargement de page avec persistance automatique en base de données.

### 4. Centre de Notifications In-App & Temps Réel
- **Cloche interactive** : Menu déroulant accessible depuis la barre supérieure (desktop) et l'en-tête mobile.
- **Notifications instantanées (Socket.io)** : Déclenchement automatique dès qu'un collaborateur est assigné à une tâche ou qu'un commentaire est ajouté.
- **Actions rapides intégrées** : Marquage individuel comme lu, filtre "Toutes / Non lues", action "Tout marquer comme lu" et suppression instantanée.
- **Redirection directe** : Clic sur une notification pour naviguer automatiquement vers le tableau de projet concerné.
- **Toasts visuels** : Alertes discrètes lors de la réception d'une notification en cours de session.

### 5. Règles d'Automatisation & Champs Personnalisés
- **Règles d'automatisation (Triggers & Actions)** : Déclencheurs automatiques (ex: passage d'une tâche à "Terminé" marquant automatiquement les sous-tâches comme faites, notifications de rappel).
- **Champs personnalisés par projet** : Définition de champs sur mesure (texte, nombre, date, sélecteur) adaptés aux besoins spécifiques de chaque projet.

### 6. Palette de Commandes (`Ctrl+K` / `Cmd+K`)
- **Accès rapide au clavier** : Recherche globale et navigation instantanée dans toute l'application via le raccourci `Ctrl+K`.
- **Recherche prédictive** : Trouver un tableau, une tâche ou une page en quelques frappes sans quitter la vue active.

### 7. Couleurs de Couverture & Pièces Jointes
- **Bandeau de couverture (Card Covers)** : Palette de 8 couleurs distinctes pour thématiser et hiérarchiser visuellement les cartes du tableau.
- **Pièces jointes & Liens externes** : Intégration de liens utiles (Figma, GitHub, Notion, Google Drive) avec ouverture sécurisée.
- **Badges Kanban** : Présence d'une icône trombone (`Paperclip`) indiquant le nombre de documents attachés à la carte.

### 8. Filtres Rapides & Filtre "Mes Tâches"
- **Toggle "Mes tâches"** : Bouton d'accès rapide dans le bandeau du tableau pour afficher instantanément uniquement les cartes qui vous sont assignées.
- **Filtres combinés** : Recherche textuelle instantanée et filtre par niveau de priorité (*Basse, Moyenne, Haute, Critique*).
- **Indicateur de filtres actifs** : Affichage d'un bouton de réinitialisation en un clic dès qu'un filtre est appliqué.

### 9. Conception Mobile-First & Tailwind CSS v4
- **Intégration Tailwind CSS v4** : Styling moderne avec classes utilitaires et système de design tokens variables.
- **Menu Burger Mobile Dédié** :
  - Tiroir coulissant fluide avec flou d'arrière-plan (*backdrop blur*).
  - Verrouillage automatique du défilement de fond (`body overflow hidden`) et fermeture via la touche `Échap`.
  - Carte utilisateur avec avatar, liens de navigation active, raccourcis vers les tableaux récents et bouton de déconnexion.
  - Cibles tactiles optimisées (minimum 44px) pour une excellente ergonomie sur smartphone.
- **Adaptation responsive du popover de notification** : Affichage centré pleine largeur adaptative sur écrans mobiles.

### 10. Mode Sombre Persistant (Dark Mode)
- **Palette CSS Variables complète** : Thème sombre soigné (`[data-theme="dark"]`) basé sur des tons ardoise et zinc profonds.
- **Bouton de bascule fluide** : Toggle Soleil / Lune accessible sur la barre latérale desktop et l'en-tête mobile.
- **Persistance locale** : Sauvegarde immédiate dans le `localStorage` pour conserver la préférence à chaque visite.

### 11. Export des Données du Projet (CSV & JSON)
- **Format CSV** : Téléchargement tabulaire prêt pour Excel / Google Sheets avec colonnes complètes (*ID, Titre, Statut, Priorité, Assignés, Checklists, Date de création*).
- **Format JSON** : Export complet de l'arborescence du projet avec toutes ses métadonnées, sous-tâches et commentaires.

### 12. Gestion du Profil & Avatars Stylisés
- **Choix d'avatar prédéfini** : Galerie de 8 avatars modernes au style Notion / Dicebear sélectionnables en un clic.
- **URL d'image personnalisée** : Champ direct pour renseigner l'URL de votre propre photo avec aperçu en direct.
- **Sécurité du compte** : Modification sécurisée du mot de passe avec contrôle de l'ancien mot de passe.

---

## Bonnes Pratiques & Sécurité

### Sécurité du Backend
- **Contrôle d'accès basé sur les rôles (RBAC)** : Vérification rigoureuse des droits d'accès sur chaque route.
- **Authentification JWT Sécurisée** : Tokens signés transmis via le header standard `Authorization: Bearer <token>`.
- **Chiffrement des mots de passe** : Hachage fort avec `bcryptjs` (12 tours de salage).
- **Protection des en-têtes HTTP** : Intégration de `helmet` pour la protection contre le XSS, reniflage MIME, et clickjacking.
- **Politique CORS restrictive** : Configuration whitelist autorisant uniquement les origines officielles Vercel et le localhost.
- **Limitation de débit (Rate Limiting)** : Protection anti-brute-force sur les routes d'authentification et l'API générale.
- **Sanitisation et validation des entrées** : Contrôle des payloads avec `express-validator` et validation stricte des identifiants et des statuts autorisés.

### Qualité du Frontend
- **State Management prévisible** : Stores modulaires avec `zustand` (`authStore`, `projectStore`, `notificationStore`, `themeStore`).
- **Gestion optimiste des états (Optimistic UI)** : Déplacement instantané des cartes lors du drag & drop avec rollback automatique en cas d'erreur réseau.
- **Intercepteur Axios sécurisé** : Injection automatique du token JWT et gestion centralisée des erreurs 401 avec déconnexion propre.
- **Analyse Web Vercel** : Intégration non bloquante de `@vercel/analytics`.

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
  - **Création complète** (couleur de couverture, sous-tâches checklists, pièces jointes, assignation multiple)
  - **Mise à jour interactive de checklist**
  - **Ajout de commentaire & notification**
- **Centre de notifications** (Réception temps réel, marquage comme lu, suppression, marquage global comme lu)
- **Nettoyage & Intégrité** (Suppression de la tâche et suppression du projet en cascade)

---

## Stack Technique

| Couche | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS v4, Zustand, React Router v6, Lucide React, @hello-pangea/dnd, Recharts, Date-fns, React Hot Toast, @vercel/analytics |
| **Backend** | Node.js (v22+), Express 4, Socket.io 4, Sequelize ORM 6 |
| **Base de Données** | SQLite (développement local) / PostgreSQL (production Railway) |
| **Sécurité** | JWT, Bcryptjs (12 rounds), Helmet, Express-Rate-Limit, CORS whitelist |
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
git clone https://github.com/Ericjason2/Taskflow.git
cd Taskflow
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
├── client/                     # Application React SPA (Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── common/         # NotificationDropdown, CommandPalette, ThemeToggle, ConfirmModal...
│   │   │   ├── layout/         # AppLayout, Sidebar, AppTopBar, MobileHeader
│   │   │   ├── projects/       # ProjectCard, ProjectModal, AutomationModal...
│   │   │   └── tasks/          # KanbanBoard, TaskModal, TaskDetailModal, CalendarView...
│   │   ├── pages/              # Pages (Dashboard, Projects, ProjectDetail, Profile, Login, Register)
│   │   ├── services/           # Instances API (Axios), intercepteurs, Socket.io
│   │   ├── store/              # Stores Zustand (auth, project, notification, theme)
│   │   └── styles/             # Styles globaux, variables CSS et intégration Tailwind v4
│   ├── vite.config.js          # Configuration Vite avec plugin Tailwind CSS v4
│   └── package.json
│
├── server/                     # API REST Node.js / Express
│   ├── config/                 # Connexion Sequelize & seed automatique
│   ├── controllers/            # Contrôleurs (auth, project, task, notification, user, stats, fields, automation)
│   ├── middleware/             # Authentification JWT, validation des rôles, rate-limit
│   ├── models/                 # Modèles Sequelize (User, Project, Task, Notification, Rule, CustomField...)
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
- GitHub : [@Ericjason2](https://github.com/Ericjason2)
- Email : erickouta6@gmail.com

---

## Licence

Ce projet est sous licence MIT. Libre d'utilisation pour des projets d'apprentissage et de développement personnel.
