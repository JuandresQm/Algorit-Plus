const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: ' '
  },
  type: {
    type: DataTypes.ENUM('libre', 'leccion', 'actividad_docente'),
    allowNull: false,
    defaultValue: 'libre' 
  },

  actividadId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'actividades', key: 'id' } 
  },
  leccionId: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  }
}, {
  tableName: 'projects',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'title', 'type'] 
    }
  ]
});

module.exports = Project;