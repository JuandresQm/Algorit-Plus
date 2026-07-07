const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Actividad = sequelize.define('Actividad', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  docenteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  enunciado: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'actividades'
});

module.exports = Actividad;