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
  automations: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const v = this.getDataValue('automations');
      try { return JSON.parse(v); } catch { return []; }
    },
    set(val) {
      this.setDataValue('automations', JSON.stringify(val || []));
    },
  },
  custom_fields_config: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const v = this.getDataValue('custom_fields_config');
      try { return JSON.parse(v); } catch { return []; }
    },
    set(val) {
      this.setDataValue('custom_fields_config', JSON.stringify(val || []));
    },
  },
}, {
  tableName: 'projects',
  timestamps: true,
});

module.exports = Project;
