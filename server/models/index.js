const User = require('./userModel');
const Log = require('./logModel');
const Materia = require('./materiaModel');
const Lesson = require('./lessonModel');
const UserProgress = require('./userProgressModel');
// Un usuario tiene muchos registros en la bitácora
User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });

// Cada registro de la bitácora pertenece a un solo usuario
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Un Usuario tiene mucho Progreso
User.hasMany(UserProgress, { foreignKey: 'userId' });
UserProgress.belongsTo(User, { foreignKey: 'userId' });

// Una Materia tiene muchas Lecciones
Materia.hasMany(Lesson, { foreignKey: 'materiaId' });
Lesson.belongsTo(Materia, { foreignKey: 'materiaId' });

// Una Lección aparece en muchos registros de progreso
Lesson.hasMany(UserProgress, { foreignKey: 'lessonId' });
UserProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });
module.exports = {
    User,
    Log,
    Materia,
    Lesson,
    UserProgress
};