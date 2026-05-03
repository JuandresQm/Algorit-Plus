const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
    len: [3, 20]
  }
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 20]
    }

  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {
      isEmail: true
    }
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'usuario',
    validate: {
      isIn: [['usuario', 'admin', 'docente']]
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  }
}, {
  tableName: 'users', 
});

module.exports = User;