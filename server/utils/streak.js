const { User, Logro, UsuarioLogro } = require('../models');
const sequelize = require('../config/db.js');

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateOnly(dateValue) {
  if (!dateValue) return null;
  if (dateValue instanceof Date) {
    return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  }
  const parts = String(dateValue).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function dateDiffDays(dateA, dateB) {
  const a = parseDateOnly(dateA);
  const b = parseDateOnly(dateB);
  if (!a || !b) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / msPerDay);
}

function getCurrentStreak(user) {
  if (!user) return 0;
  const todayStr = getTodayDateString();
  const lastAction = user.lastActionDate ? String(user.lastActionDate) : null;
  if (!lastAction) return 0;
  const daysSinceLastAction = dateDiffDays(lastAction, todayStr);
  if (daysSinceLastAction === null) return 0;
  return daysSinceLastAction > 1 ? 0 : (user.streakCount || 0);
}

async function updateUserStreak(userId) {
  return await sequelize.transaction(async (t) => {
    const user = await User.findByPk(userId, { transaction: t, lock: true });
    if (!user) return null;

    const todayStr = getTodayDateString();
    const lastAction = user.lastActionDate ? String(user.lastActionDate) : null;

    if (lastAction === todayStr) {
      return { user, unlocked: [] };
    }

    const daysSinceLastAction = lastAction ? dateDiffDays(lastAction, todayStr) : null;
    let newStreak = 1;

    if (daysSinceLastAction === 1) {
      newStreak = (user.streakCount || 0) + 1;
    }

    await user.update({
      streakCount: newStreak,
      lastActionDate: todayStr
    }, { transaction: t });

    const unlocked = [];

    // Award streak achievements: 7 days and 30 days
    try {
      if (newStreak === 7 || newStreak === 30) {
        const clave = newStreak === 7 ? 'racha_1_semana' : 'racha_1_mes';
        const logro = await Logro.findOne({ where: { clave_logro: clave }, transaction: t });
        if (logro) {
          const exists = await UsuarioLogro.findOne({ where: { usuarioId: userId, logroId: logro.id }, transaction: t });
          if (!exists) {
            await UsuarioLogro.create({ usuarioId: userId, logroId: logro.id }, { transaction: t });
            unlocked.push({ id: logro.id, clave_logro: logro.clave_logro, nombre: logro.nombre });
          }
        }
      }
    } catch (e) {
      console.error('Error otorgando logro por racha:', e);
    }

    return { user, unlocked };
  });
}

module.exports = {
  updateUserStreak,
    getCurrentStreak
};
