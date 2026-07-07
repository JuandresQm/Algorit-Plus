const { User, Log, Logro } = require('../models');
const { getCurrentStreak } = require('../utils/streak');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['id','name','lastname','email','username','rol','avatar','streakCount','lastActionDate','exp','nivel'],
      include: [{
        model: require('../models').Logro,
        as: 'logros',
        through: { attributes: ['fecha_desbloqueo'] }
      }]
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const currentStreak = getCurrentStreak(user);
    res.json({ user: { ...user.toJSON(), currentStreak } });
  } catch (error) {
    console.error('getProfile error', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const { name, lastname, email, username } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (lastname) updateData.lastname = lastname;
    if (email) updateData.email = email;
    if (username) updateData.username = username;

    if (req.file && req.file.filename) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.update(updateData);

    await Log.create({
      userId: user.id,
      action: 'Actualización de perfil',
      details: 'El usuario actualizó su perfil',
      ipAddress: req.ip || req.connection.remoteAddress,
      loginTime: new Date()
    }).catch(() => {});

    await user.reload();
    res.json({ message: 'Perfil actualizado', user: { id: user.id, name: user.name, lastname: user.lastname, email: user.email, username: user.username, avatar: user.avatar } });
  } catch (error) {
    console.error('updateProfile error', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };