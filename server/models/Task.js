const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titre: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, defaultValue: null },
  statut: { type: DataTypes.STRING(20), defaultValue: 'todo' },
  priorite: { type: DataTypes.STRING(20), defaultValue: 'moyenne' },
  projet_id: { type: DataTypes.INTEGER, allowNull: false },
  assigne_a: { type: DataTypes.INTEGER, defaultValue: null },
  cree_par: { type: DataTypes.INTEGER, allowNull: false },
  echeance: { type: DataTypes.DATEONLY, defaultValue: null },
  ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const v = this.getDataValue('tags');
      try { return JSON.parse(v); } catch { return []; }
    },
    set(val) {
      this.setDataValue('tags', JSON.stringify(val));
    },
  },
}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;
