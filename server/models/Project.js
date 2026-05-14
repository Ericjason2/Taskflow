const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  statut: { type: DataTypes.STRING(20), defaultValue: 'actif' },
  priorite: { type: DataTypes.STRING(20), defaultValue: 'moyenne' },
  couleur: { type: DataTypes.STRING(7), defaultValue: '#6366f1' },
  date_debut: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  date_fin: { type: DataTypes.DATEONLY, defaultValue: null },
  createur_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'projects',
  timestamps: true,
});

module.exports = Project;
