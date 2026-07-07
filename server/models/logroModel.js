const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Logro = sequelize.define('Logro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  clave_logro: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'logros'
});

module.exports = Logro;
