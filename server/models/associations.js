const sequelize = require('../config/db');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const { Comment, ProjectMember, Activity } = require('./index');

// User <-> Project (creator)
Project.belongsTo(User, { as: 'createur', foreignKey: 'createur_id' });
User.hasMany(Project, { as: 'projets_crees', foreignKey: 'createur_id' });

// Project <-> User (members N-N)
Project.belongsToMany(User, {
  through: ProjectMember,
  as: 'membres',
  foreignKey: 'projet_id',
  otherKey: 'user_id',
});
User.belongsToMany(Project, {
  through: ProjectMember,
  as: 'projets',
  foreignKey: 'user_id',
  otherKey: 'projet_id',
});

// Task <-> Project
Task.belongsTo(Project, { as: 'projet', foreignKey: 'projet_id' });
Project.hasMany(Task, { as: 'taches', foreignKey: 'projet_id' });

// Task <-> User (assigned)
Task.belongsTo(User, { as: 'assigne', foreignKey: 'assigne_a' });
Task.belongsTo(User, { as: 'createur', foreignKey: 'cree_par' });
User.hasMany(Task, { as: 'taches_assignees', foreignKey: 'assigne_a' });

// Comment <-> Task / User
Comment.belongsTo(Task, { as: 'tache', foreignKey: 'tache_id' });
Comment.belongsTo(User, { as: 'auteur', foreignKey: 'auteur_id' });
Task.hasMany(Comment, { as: 'commentaires', foreignKey: 'tache_id' });

// Activity
Activity.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Activity.belongsTo(Project, { as: 'projet', foreignKey: 'projet_id' });

module.exports = { sequelize, User, Project, Task, Comment, ProjectMember, Activity };
