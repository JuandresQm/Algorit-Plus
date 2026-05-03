const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.JSON, allowNull: false },
  order: { type: DataTypes.INTEGER, allowNull: false },
  materiaId: {
    type: DataTypes.INTEGER,
    references: { model: 'Materias', key: 'id' }
  }
}, { tableName: 'lessons' });

module.exports = Lesson;