const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Materia = sequelize.define('Materia', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
}, { tableName: 'Materias' });

module.exports = Materia;