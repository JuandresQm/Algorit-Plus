const { User, Logro, UsuarioLogro, UserProgress } = require('../models');
const sequelize = require('../config/db.js');
const { Op } = require('sequelize');

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

async function awardExpForLessonCompletion(userId, lessonId, elapsedSeconds) {
  return await sequelize.transaction(async (t) => {
    // Upsert progress
    await UserProgress.upsert({
      userId,
      lessonId,
      completed: true,
      totalTimeSeconds: Number.isFinite(Number(elapsedSeconds)) ? Number(elapsedSeconds) : 0,
      completionDate: new Date()
    }, { transaction: t });

    const BASE_EXP = 100;
    const SPEED_BONUS = 50;
    let awardedExp = BASE_EXP;
    const ESTIMATED_SECONDS = 90;
    const hasSpeedBonus = Number.isFinite(Number(elapsedSeconds)) && (Number(elapsedSeconds) < ESTIMATED_SECONDS);
    if (hasSpeedBonus) awardedExp += SPEED_BONUS;

    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user) throw new Error('Usuario no encontrado');

    const newTotalExp = (Number(user.exp) || 0) + awardedExp;
    const calculatedLevel = Math.min(levelFromExp(newTotalExp), 10);
    const updates = { exp: newTotalExp };
    if (calculatedLevel > (user.nivel || 1)) updates.nivel = calculatedLevel;

    await user.update(updates, { transaction: t });

    const unlocked = [];

    // 1) Speed logro
    if (hasSpeedBonus) {
      const speedLogro = await Logro.findOne({
        where: {
          [Op.or]: [
            { clave_logro: 'velocidad' },
            { clave_logro: 'speed' },
            { nombre: { [Op.iLike]: '%veloc%' } }
          ]
        },
        transaction: t
      });

      if (speedLogro) {
        const existing = await UsuarioLogro.findOne({ where: { usuarioId: user.id, logroId: speedLogro.id }, transaction: t });
        if (!existing) {
          await UsuarioLogro.create({ usuarioId: user.id, logroId: speedLogro.id }, { transaction: t });
          unlocked.push({ id: speedLogro.id, clave_logro: speedLogro.clave_logro, nombre: speedLogro.nombre });
        }
      }
    }

    // 2) Per-lesson logro (leccion_1 .. leccion_8)
    if (Number.isInteger(Number(lessonId)) && lessonId >= 1 && lessonId <= 8) {
      const clave = `leccion_${lessonId}`;
      const leLogro = await Logro.findOne({ where: { clave_logro: clave }, transaction: t });
      if (leLogro) {
        const exists = await UsuarioLogro.findOne({ where: { usuarioId: user.id, logroId: leLogro.id }, transaction: t });
        if (!exists) {
          await UsuarioLogro.create({ usuarioId: user.id, logroId: leLogro.id }, { transaction: t });
          unlocked.push({ id: leLogro.id, clave_logro: leLogro.clave_logro, nombre: leLogro.nombre });
        }
      }
    }

    // 3) Algoritmo I: first 5 lessons completed (1-5)
    const completedFirst5 = await UserProgress.count({ where: { userId: userId, lessonId: { [Op.in]: [1,2,3,4,5] }, completed: true }, transaction: t });
    if (completedFirst5 === 5) {
      const alg1 = await Logro.findOne({ where: { clave_logro: 'algoritmo_i' }, transaction: t });
      if (alg1) {
        const exists = await UsuarioLogro.findOne({ where: { usuarioId: user.id, logroId: alg1.id }, transaction: t });
        if (!exists) {
          await UsuarioLogro.create({ usuarioId: user.id, logroId: alg1.id }, { transaction: t });
          unlocked.push({ id: alg1.id, clave_logro: alg1.clave_logro, nombre: alg1.nombre });
        }
      }
    }

    // 4) Algoritmo II: last 3 lessons completed (6-8)
    const completedLast3 = await UserProgress.count({ where: { userId: userId, lessonId: { [Op.in]: [6,7,8] }, completed: true }, transaction: t });
    if (completedLast3 === 3) {
      const alg2 = await Logro.findOne({ where: { clave_logro: 'algoritmo_ii' }, transaction: t });
      if (alg2) {
        const exists = await UsuarioLogro.findOne({ where: { usuarioId: user.id, logroId: alg2.id }, transaction: t });
        if (!exists) {
          await UsuarioLogro.create({ usuarioId: user.id, logroId: alg2.id }, { transaction: t });
          unlocked.push({ id: alg2.id, clave_logro: alg2.clave_logro, nombre: alg2.nombre });
        }
      }
    }

    // 5) Curso completo: all 8 lessons
    const completedAll = await UserProgress.count({ where: { userId: userId, lessonId: { [Op.in]: [1,2,3,4,5,6,7,8] }, completed: true }, transaction: t });
    if (completedAll === 8) {
      const curso = await Logro.findOne({ where: { clave_logro: 'curso_completo' }, transaction: t });
      if (curso) {
        const exists = await UsuarioLogro.findOne({ where: { usuarioId: user.id, logroId: curso.id }, transaction: t });
        if (!exists) {
          await UsuarioLogro.create({ usuarioId: user.id, logroId: curso.id }, { transaction: t });
          unlocked.push({ id: curso.id, clave_logro: curso.clave_logro, nombre: curso.nombre });
        }
      }
    }

    return { awardedExp, newTotalExp, newLevel: updates.nivel || user.nivel, unlocked };
  });
}

module.exports = { awardExpForLessonCompletion };
