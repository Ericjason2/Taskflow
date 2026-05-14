# TaskFlow — Documentation API

## Base URL

```
http://localhost:5000/api
```

## Authentification

Toutes les routes protégées requièrent un header :

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Auth

### POST `/auth/register`

Inscription d'un nouvel utilisateur.

**Body:**

```json
{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "password": "monpassword"
}
```

**Réponse 201:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "Jean Dupont",
    "email": "jean@example.com",
    "role": "membre",
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
}
```

---

### POST `/auth/login`

Connexion.

**Body:**

```json
{ "email": "jean@example.com", "password": "monpassword" }
```

**Réponse 200:** Identique à register.

---

### GET `/auth/me`

Retourne l'utilisateur courant.

---

### PUT `/auth/profile`

Mise à jour du profil.

**Body:** `{ "nom": "...", "bio": "..." }`

---

### PUT `/auth/password`

Changement de mot de passe.

**Body:** `{ "current_password": "...", "new_password": "..." }`

---

### GET `/auth/users`

Liste tous les utilisateurs (pour l'ajout de membres).

---

## Projets

### GET `/projects`

Liste les projets accessibles (avec pagination).

**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Recherche titre/description |
| `statut` | string | `actif`, `en_pause`, `terminé`, `annulé` |
| `priorite` | string | `basse`, `moyenne`, `haute`, `critique` |
| `page` | number | Page (défaut: 1) |
| `limit` | number | Résultats/page (défaut: 10) |
| `sort` | string | Champ de tri (défaut: `createdAt`) |
| `order` | string | `ASC` ou `DESC` |

**Réponse 200:**

```json
{
  "success": true,
  "data": [...],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

---

### POST `/projects`

Créer un projet.

**Body:**

```json
{
  "titre": "Mon Projet",
  "description": "Description...",
  "statut": "actif",
  "priorite": "haute",
  "couleur": "#6366f1",
  "date_debut": "2025-01-01",
  "date_fin": "2025-12-31",
  "membres": [{ "id": 2, "role": "editor" }]
}
```

---

### GET `/projects/:id`

Détails d'un projet avec tâches et membres.

---

### PUT `/projects/:id`

Modifier un projet (créateur ou admin uniquement).

---

### DELETE `/projects/:id`

Supprimer projet + tâches + membres.

---

### POST `/projects/:id/members`

Ajouter un membre.

**Body:** `{ "user_id": 3, "role": "editor" }`

---

### DELETE `/projects/:id/members/:userId`

Retirer un membre.

---

### GET `/projects/stats`

Statistiques du tableau de bord.

**Réponse:**

```json
{
  "data": {
    "total_projets": 4,
    "projets_actifs": 3,
    "total_taches": 24,
    "mes_taches": 8,
    "taches_en_cours": 5,
    "taches_terminees": 12,
    "taches_en_retard": 2
  }
}
```

---

### GET `/projects/activities`

Historique des 20 dernières activités.

---

## Tâches

Base URL : `/projects/:projet_id/tasks`

### GET `/`

Lister les tâches d'un projet.

**Query:** `statut`, `assigne_a`, `priorite`, `search`, `sort`, `order`

---

### POST `/`

Créer une tâche.

**Body:**

```json
{
  "titre": "Implémenter le login",
  "description": "...",
  "statut": "todo",
  "priorite": "haute",
  "assigne_a": 2,
  "echeance": "2025-07-15",
  "tags": ["frontend", "auth"]
}
```

---

### GET `/:taskId`

Détail + commentaires de la tâche.

---

### PUT `/:taskId`

Modifier la tâche.

---

### DELETE `/:taskId`

Supprimer (créateur ou admin).

---

### PATCH `/:taskId/status`

Changer seulement le statut (utilisé par le Kanban).

**Body:** `{ "statut": "in_progress" }`

---

### POST `/:taskId/comments`

Ajouter un commentaire.

**Body:** `{ "contenu": "Mon commentaire..." }`

---

### DELETE `/:taskId/comments/:commentId`

Supprimer un commentaire (auteur ou admin).

---

## ⚡ WebSocket Events

Connexion : `ws://localhost:5000`

| Événement (émis) | Payload                            | Description                   |
| ---------------- | ---------------------------------- | ----------------------------- |
| `join_project`   | `projectId`                        | Rejoindre la room d'un projet |
| `leave_project`  | `projectId`                        | Quitter la room               |
| `task_update`    | `{ projectId, taskId, newStatus }` | Notifier les autres membres   |

| Événement (reçu) | Payload                            | Description       |
| ---------------- | ---------------------------------- | ----------------- |
| `task_updated`   | `{ projectId, taskId, newStatus }` | Mise à jour reçue |

---

## Format d'erreur

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [{ "field": "email", "message": "Email invalide" }]
}
```

## Codes HTTP utilisés

| Code | Signification                 |
| ---- | ----------------------------- |
| 200  | OK                            |
| 201  | Créé                          |
| 400  | Mauvaise requête              |
| 401  | Non authentifié               |
| 403  | Accès refusé                  |
| 404  | Introuvable                   |
| 409  | Conflit (ex: email déjà pris) |
| 422  | Validation échouée            |
| 429  | Trop de requêtes              |
| 500  | Erreur serveur                |
