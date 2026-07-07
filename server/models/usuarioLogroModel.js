const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const UsuarioLogro = sequelize.define('UsuarioLogro', {
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  logroId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'logros',
      key: 'id'
    }
  },
  fecha_desbloqueo: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario_logros',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['usuarioId', 'logroId']
    }
  ]
});

module.exports = UsuarioLogro;
