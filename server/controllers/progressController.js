const { UserProgress, Lesson, User, Logro, UsuarioLogro } = require('../models');
const sequelize = require('../config/db.js');
const { Op } = require('sequelize');

const getUserProgress = async (req, res) => {
  try {
    const progressEntries = await UserProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Lesson,
        attributes: ['id', 'title', 'order', 'materiaId']
      }]
    });

    const progress = progressEntries.map(entry => ({
      lessonId: entry.lessonId,
      title: entry.Lesson ? entry.Lesson.title : null,
      completed: entry.completed,
      score: entry.score,
      currentPage: entry.currentPage || 1,
      totalTimeSeconds: entry.totalTimeSeconds || 0,
      completionDate: entry.completionDate
    }));

    res.json({ progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Error al obtener el progreso del usuario', error: error.message });
  }
};

const LEVEL_TABLE = [
  { level: 1, min: 0, max: 199 },
  { level: 2, min: 200, max: 499 },
  { level: 3, min: 500, max: 899 },
  { level: 4, min: 900, max: 1349 },
  { level: 5, min: 1350, max: 1849 },
  { level: 6, min: 1850, max: 2399 },
  { level: 7, min: 2400, max: 2999 },
  { level: 8, min: 3000, max: 3599 },
  { level: 9, min: 3600, max: 4199 },
  { level: 10, min: 4200, max: Number.MAX_SAFE_INTEGER }
];

function levelFromExp(exp) {
  for (const row of LEVEL_TABLE) {
    if (exp >= row.min && exp <= row.max) return row.level;
  }
  return 10;
}

const saveLessonProgress = async (req, res) => {
  try {
    const { currentPage, completed = false, score = 0, totalTimeSeconds, elapsedSeconds } = req.body;
    const lessonId = req.params.id;

    const existingProgress = await UserProgress.findOne({
      where: { userId: req.user.id, lessonId }
    });

    const normalizedPage = Number.isInteger(Number(currentPage)) && Number(currentPage) > 0
      ? Number(currentPage)
      : (existingProgress?.currentPage || 1);



    const normalizedScore = Number.isFinite(Number(score)) ? Number(score) : (existingProgress?.score || 0);
    const isNowCompleted = (normalizedScore >= 56);    
    const normalizedTime = (typeof totalTimeSeconds === 'number' && !isNaN(totalTimeSeconds)) ? totalTimeSeconds : 0;

    const savedProgress = await UserProgress.upsert({
      userId: req.user.id,
      lessonId,
      completed: isNowCompleted, 
      score: Math.max(normalizedScore, existingProgress?.score || 0), 
      currentPage: normalizedPage,
      totalTimeSeconds: normalizedTime,
      completionDate: isNowCompleted && !existingProgress?.completionDate ? new Date() : existingProgress?.completionDate
    }, { returning: true });

    const progressEntry = Array.isArray(savedProgress) ? savedProgress[0] : savedProgress;

    if (!isNowCompleted) {
      return res.json({
        message: 'Progreso guardado correctamente',
        progress: {
          lessonId,
          completed: progressEntry.completed,
          score: progressEntry.score,
          currentPage: progressEntry.currentPage,
          totalTimeSeconds: progressEntry.totalTimeSeconds
        }
      });
    }
    try {
      const { awardExpForLessonCompletion } = require('../utils/exp');
      const awardResult = await awardExpForLessonCompletion(req.user.id, Number(lessonId), Number(normalizedTime));
      
      return res.json({
        message: 'Progreso completado y EXP asignada correctamente',
        lessonId,
        score: progressEntry.score, 
        awardedExp: awardResult.awardedExp,
        totalExp: awardResult.newTotalExp,
        nivel: awardResult.newLevel,
        unlocked: awardResult.unlocked || []
      });
    } catch (e) {
      console.error('Error asignando EXP/logros:', e);
      return res.status(500).json({ message: 'Error al asignar EXP o logros', error: e.message });
    }
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    res.status(500).json({ message: 'Error al guardar el progreso de la lección', error: error.message });
  }
};

module.exports = { getUserProgress, saveLessonProgress };