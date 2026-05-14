require('dotenv').config();
const { sequelize, User, Project, Task, ProjectMember, Comment, Activity } = require('../models/associations');
const bcrypt = require('bcryptjs');

async function seed() {
  await sequelize.sync({ force: true });
  console.log('🗄️  Base de données synchronisée');

  // Users
  const adminPw = await bcrypt.hash('admin123', 12);
  const memberPw = await bcrypt.hash('membre123', 12);

  const [admin] = await User.findOrCreate({ where: { email: 'admin@taskflow.io' }, defaults: {
    nom: 'Admin TaskFlow', email: 'admin@taskflow.io', password: 'admin123', role: 'admin',
    bio: 'Administrateur de la plateforme TaskFlow',
  }});
  const [alice] = await User.findOrCreate({ where: { email: 'alice@taskflow.io' }, defaults: {
    nom: 'Alice Martin', email: 'alice@taskflow.io', password: 'membre123', role: 'membre',
    bio: 'Développeuse Frontend Senior',
  }});
  const [bob] = await User.findOrCreate({ where: { email: 'bob@taskflow.io' }, defaults: {
    nom: 'Bob Dupont', email: 'bob@taskflow.io', password: 'membre123', role: 'membre',
    bio: 'Développeur Backend',
  }});
  const [claire] = await User.findOrCreate({ where: { email: 'claire@taskflow.io' }, defaults: {
    nom: 'Claire Leblanc', email: 'claire@taskflow.io', password: 'membre123', role: 'membre',
    bio: 'Designer UX/UI',
  }});

  console.log('👤 Utilisateurs créés');

  // Projects
  const p1 = await Project.create({ titre: 'Refonte Site Web', description: 'Refonte complète du site corporate avec nouveau design system', statut: 'actif', priorite: 'haute', couleur: '#6366f1', createur_id: admin.id });
  const p2 = await Project.create({ titre: 'Application Mobile', description: 'Développement app iOS/Android pour les clients', statut: 'actif', priorite: 'critique', couleur: '#10b981', createur_id: alice.id });
  const p3 = await Project.create({ titre: 'Migration Base de Données', description: 'Migration de MySQL vers PostgreSQL', statut: 'en_pause', priorite: 'moyenne', couleur: '#f59e0b', createur_id: bob.id });
  const p4 = await Project.create({ titre: 'Dashboard Analytics', description: 'Tableau de bord temps réel des KPIs', statut: 'actif', priorite: 'haute', couleur: '#ec4899', createur_id: admin.id });

  // Members
  await ProjectMember.bulkCreate([
    { projet_id: p1.id, user_id: admin.id, role: 'owner' },
    { projet_id: p1.id, user_id: alice.id, role: 'editor' },
    { projet_id: p1.id, user_id: claire.id, role: 'editor' },
    { projet_id: p2.id, user_id: alice.id, role: 'owner' },
    { projet_id: p2.id, user_id: bob.id, role: 'editor' },
    { projet_id: p3.id, user_id: bob.id, role: 'owner' },
    { projet_id: p3.id, user_id: admin.id, role: 'editor' },
    { projet_id: p4.id, user_id: admin.id, role: 'owner' },
    { projet_id: p4.id, user_id: alice.id, role: 'editor' },
    { projet_id: p4.id, user_id: bob.id, role: 'viewer' },
  ]);

  // Tasks P1
  const tasks = await Task.bulkCreate([
    { projet_id: p1.id, titre: 'Maquettes Figma', description: 'Créer les maquettes haute fidélité', statut: 'done', priorite: 'haute', assigne_a: claire.id, cree_par: admin.id, echeance: '2025-06-15', ordre: 1 },
    { projet_id: p1.id, titre: 'Design System', description: 'Définir les composants réutilisables', statut: 'done', priorite: 'haute', assigne_a: claire.id, cree_par: admin.id, echeance: '2025-06-20', ordre: 2 },
    { projet_id: p1.id, titre: 'Intégration HTML/CSS', description: 'Intégrer les maquettes validées', statut: 'in_progress', priorite: 'haute', assigne_a: alice.id, cree_par: admin.id, echeance: '2025-07-10', ordre: 3 },
    { projet_id: p1.id, titre: 'Animations & Transitions', description: 'Ajouter les animations CSS', statut: 'todo', priorite: 'moyenne', assigne_a: alice.id, cree_par: alice.id, echeance: '2025-07-20', ordre: 4 },
    { projet_id: p1.id, titre: 'Tests cross-browser', description: 'Tester sur Chrome, Firefox, Safari', statut: 'todo', priorite: 'haute', assigne_a: bob.id, cree_par: admin.id, echeance: '2025-07-25', ordre: 5 },
    // P2
    { projet_id: p2.id, titre: 'Architecture React Native', description: 'Définir l\'architecture de base', statut: 'done', priorite: 'critique', assigne_a: alice.id, cree_par: alice.id, echeance: '2025-05-30', ordre: 1 },
    { projet_id: p2.id, titre: 'Auth OAuth2', description: 'Implémentation connexion sociale', statut: 'in_progress', priorite: 'critique', assigne_a: bob.id, cree_par: alice.id, echeance: '2025-06-30', ordre: 2 },
    { projet_id: p2.id, titre: 'Écran d\'accueil', description: 'Page principale avec feed', statut: 'in_progress', priorite: 'haute', assigne_a: alice.id, cree_par: alice.id, echeance: '2025-07-05', ordre: 3 },
    { projet_id: p2.id, titre: 'Push Notifications', description: 'Intégration Firebase FCM', statut: 'todo', priorite: 'moyenne', assigne_a: bob.id, cree_par: alice.id, echeance: '2025-07-30', ordre: 4 },
    // P3
    { projet_id: p3.id, titre: 'Audit de la BDD actuelle', description: 'Analyser le schéma existant', statut: 'done', priorite: 'haute', assigne_a: bob.id, cree_par: bob.id, echeance: '2025-05-15', ordre: 1 },
    { projet_id: p3.id, titre: 'Script de migration', description: 'Écrire les scripts de migration', statut: 'review', priorite: 'critique', assigne_a: bob.id, cree_par: bob.id, echeance: '2025-06-25', ordre: 2 },
    { projet_id: p3.id, titre: 'Tests de validation', description: 'Valider l\'intégrité des données', statut: 'todo', priorite: 'critique', assigne_a: admin.id, cree_par: bob.id, echeance: '2025-07-15', ordre: 3 },
    // P4
    { projet_id: p4.id, titre: 'Définir KPIs', description: 'Liste des métriques à afficher', statut: 'done', priorite: 'haute', assigne_a: admin.id, cree_par: admin.id, echeance: '2025-06-01', ordre: 1 },
    { projet_id: p4.id, titre: 'Graphiques Recharts', description: 'Implémenter les visualisations', statut: 'in_progress', priorite: 'haute', assigne_a: alice.id, cree_par: admin.id, echeance: '2025-07-01', ordre: 2 },
    { projet_id: p4.id, titre: 'API temps réel', description: 'WebSocket pour données live', statut: 'todo', priorite: 'moyenne', assigne_a: bob.id, cree_par: admin.id, echeance: '2025-07-20', ordre: 3 },
  ]);

  // Comments
  await Comment.bulkCreate([
    { tache_id: tasks[0].id, auteur_id: claire.id, contenu: 'Maquettes terminées, en attente de validation.' },
    { tache_id: tasks[0].id, auteur_id: admin.id, contenu: 'Validé ! On peut passer à l\'étape suivante.' },
    { tache_id: tasks[2].id, auteur_id: alice.id, contenu: 'Intégration en cours, ~60% complété.' },
    { tache_id: tasks[6].id, auteur_id: bob.id, contenu: 'OAuth2 Google OK, reste Facebook et Apple.' },
  ]);

  // Activities
  await Activity.bulkCreate([
    { type: 'project_created', description: 'Projet "Refonte Site Web" créé', user_id: admin.id, projet_id: p1.id },
    { type: 'task_status_changed', description: 'Tâche "Maquettes Figma" → Terminé', user_id: claire.id, projet_id: p1.id, tache_id: tasks[0].id },
    { type: 'project_created', description: 'Projet "Application Mobile" créé', user_id: alice.id, projet_id: p2.id },
    { type: 'task_created', description: 'Tâche "Auth OAuth2" créée', user_id: alice.id, projet_id: p2.id, tache_id: tasks[6].id },
  ]);

  console.log('✅ Données de seed insérées avec succès');
  console.log('\n📋 Comptes de test :');
  console.log('  admin@taskflow.io   / admin123  (Admin)');
  console.log('  alice@taskflow.io   / membre123 (Membre)');
  console.log('  bob@taskflow.io     / membre123 (Membre)');
  console.log('  claire@taskflow.io  / membre123 (Membre)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
