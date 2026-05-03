require('dotenv').config();
const { Sequelize } = require('sequelize');


// Creamos la conexión
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true
    }
  }
);
module.exports = sequelize;