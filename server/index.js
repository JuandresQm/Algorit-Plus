require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const sequelize = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const progressRoutes = require('./routes/progressRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const projectRoutes = require('./routes/projectRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const entregasRoutes = require('./routes/entregasRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();



// Middlewares globales
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/progreso', progressRoutes);
app.use('/leccion', lessonRoutes);
app.use('/proyectos', projectRoutes);
app.use('/actividades', actividadRoutes);
app.use('/entregas', entregasRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', userRoutes);

const PORT = process.env.PORT;



sequelize.sync({ alter: true })
  .then(async () => {
    console.log('Database connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor listo en el puerto ${PORT}`);
    });
  })
  .catch(err => console.error('Error al conectar la DB:', err));