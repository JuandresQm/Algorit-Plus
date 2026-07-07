const User = require('./userModel');
const Log = require('./logModel');
const Materia = require('./materiaModel');
const Lesson = require('./lessonModel');
const UserProgress = require('./userProgressModel');
const Project = require('./projectModel');
const Logro = require('./logroModel');
const UsuarioLogro = require('./usuarioLogroModel');
const Actividad = require('./actividadModel');
const Entrega = require('./entregasModel');

// Un usuario tiene muchos registros en la bitácora
User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });

// Cada registro de la bitácora pertenece a un solo usuario
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Un Usuario tiene mucho Progreso
User.hasMany(UserProgress, { foreignKey: 'userId' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

// Un Usuario tiene muchos Proyectos
User.hasMany(Project, { foreignKey: 'userId' });
Project.belongsTo(User, { foreignKey: 'userId' });

// Gamificación: Un usuario tiene muchos logros y viceversa
User.belongsToMany(Logro, {
  through: UsuarioLogro,
  foreignKey: 'usuarioId',
  otherKey: 'logroId',
  as: 'logros'
});
Logro.belongsToMany(User, {
  through: UsuarioLogro,
  foreignKey: 'logroId',
  otherKey: 'usuarioId',
  as: 'usuarios'
});

UsuarioLogro.belongsTo(User, { foreignKey: 'usuarioId' });
UsuarioLogro.belongsTo(Logro, { foreignKey: 'logroId' });
User.hasMany(UsuarioLogro, { foreignKey: 'usuarioId' });
Logro.hasMany(UsuarioLogro, { foreignKey: 'logroId' });

// Una Materia tiene muchas Lecciones
Materia.hasMany(Lesson, { foreignKey: 'materiaId' });
Lesson.belongsTo(Materia, { foreignKey: 'materiaId' });

// Una Lección aparece en muchos registros de progreso
Lesson.hasMany(UserProgress, { foreignKey: 'lessonId' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });

// Una actividad tiene muchas entregas
Actividad.hasMany(Entrega, { foreignKey: 'actividadId', as: 'entregas' });
Entrega.belongsTo(Actividad, { foreignKey: 'actividadId', as: 'actividad' });

// Un estudiante tiene muchas entregas
User.hasMany(Entrega, { foreignKey: 'estudianteId', as: 'misEntregas' });
Entrega.belongsTo(User, { foreignKey: 'estudianteId', as: 'estudiante' });

module.exports = {
    User,
    Log,
    Materia,
    Lesson,
    UserProgress,
    Project,
    Logro,
    UsuarioLogro,
    Actividad,
    Entrega
};