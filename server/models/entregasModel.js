const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Entrega = sequelize.define('Entrega', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  actividadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'actividades', key: 'id' },
    onDelete: 'CASCADE'
  },
  estudianteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  codigoEnviado: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tiempoEmpleado: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'calificado'),
    defaultValue: 'pendiente'
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
    min: 0,
    max: 100
  }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'entregas',
  indexes: [
    {
      unique: true,
      fields: ['actividadId', 'estudianteId']
    }
  ]
});

module.exports = Entrega;