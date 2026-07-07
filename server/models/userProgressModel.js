const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const UserProgress = sequelize.define('UserProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER,
    references: { model: 'users', key: 'id' }
  },
  lessonId: {
    type: DataTypes.INTEGER,
    references: { model: 'lessons', key: 'id' }
  },
  completed: { type: DataTypes.BOOLEAN, defaultValue: true },
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  currentPage: { type: DataTypes.INTEGER, defaultValue: 1 },
  totalTimeSeconds: { type: DataTypes.INTEGER, defaultValue: 0 },
  completionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'user_progress',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'lessonId']
    }
  ]
 });

module.exports = UserProgress;