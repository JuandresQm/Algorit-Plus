require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sequelize = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares globales
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  /* Al subirlo al render, editar el origin */ 
    origin: true,
    credentials: true
}));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);


const PORT = process.env.PORT;



sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor listo en el puerto ${PORT}`);
});
  })
  .catch(err => console.error('Error al conectar la DB:', err));