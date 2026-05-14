const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contenu: { type: DataTypes.TEXT, allowNull: false },
  tache_id: { type: DataTypes.INTEGER, allowNull: false },
  auteur_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'comments', timestamps: true });

const ProjectMember = sequelize.define('ProjectMember', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  projet_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING(10), defaultValue: 'editor' },
}, { tableName: 'project_members', timestamps: true });

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  projet_id: { type: DataTypes.INTEGER, defaultValue: null },
  tache_id: { type: DataTypes.INTEGER, defaultValue: null },
  meta: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      try { return JSON.parse(this.getDataValue('meta')); } catch { return {}; }
    },
    set(v) { this.setDataValue('meta', JSON.stringify(v)); },
  },
}, { tableName: 'activities', timestamps: true });

module.exports = { Comment, ProjectMember, Activity };
