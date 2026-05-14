-- TaskFlow Database Schema (PostgreSQL)
-- Pour SQLite en développement, Sequelize génère automatiquement le schéma via `npm run seed`

-- ================================================
-- EXTENSIONS
-- ================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10) DEFAULT 'membre' CHECK (role IN ('admin', 'membre')),
    avatar      TEXT,
    bio         TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    titre       VARCHAR(200) NOT NULL,
    description TEXT,
    statut      VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'en_pause', 'terminé', 'annulé')),
    priorite    VARCHAR(20) DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')),
    couleur     VARCHAR(7) DEFAULT '#6366f1',
    date_debut  DATE DEFAULT CURRENT_DATE,
    date_fin    DATE,
    createur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id         SERIAL PRIMARY KEY,
    projet_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       VARCHAR(10) DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (projet_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    titre       VARCHAR(200) NOT NULL,
    description TEXT,
    statut      VARCHAR(20) DEFAULT 'todo' CHECK (statut IN ('todo', 'in_progress', 'review', 'done')),
    priorite    VARCHAR(20) DEFAULT 'moyenne' CHECK (priorite IN ('basse', 'moyenne', 'haute', 'critique')),
    projet_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigne_a   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cree_par    INTEGER NOT NULL REFERENCES users(id),
    echeance    DATE,
    ordre       INTEGER DEFAULT 0,
    tags        TEXT DEFAULT '[]',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id        SERIAL PRIMARY KEY,
    contenu   TEXT NOT NULL,
    tache_id  INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    auteur_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
    id          SERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    projet_id   INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    tache_id    INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    meta        TEXT DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEX (performance)
-- ================================================
CREATE INDEX IF NOT EXISTS idx_tasks_projet_id ON tasks(projet_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigne_a ON tasks(assigne_a);
CREATE INDEX IF NOT EXISTS idx_tasks_statut ON tasks(statut);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_projet ON project_members(projet_id);
CREATE INDEX IF NOT EXISTS idx_comments_tache ON comments(tache_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_projet ON activities(projet_id);
CREATE INDEX IF NOT EXISTS idx_projects_createur ON projects(createur_id);
