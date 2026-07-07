const { Actividad } = require('../models');

const getDocenteActividades = async (req, res) => {
  try {
    const actividades = await Actividad.findAll({
      where: { docenteId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });

    res.json({ actividades });
  } catch (error) {
    console.error('Error cargando actividades:', error);
    res.status(500).json({ message: 'Error al cargar las actividades' });
  }
};
const getActividades = async (req, res) => {
  try {
    const actividades = await Actividad.findAll({
      order: [['updatedAt', 'DESC']]
    });

    res.json({ actividades });
  } catch (error) {
    console.error('Error cargando actividades:', error);
    res.status(500).json({ message: 'Error al cargar las actividades' });
  }
};

const createActividad = async (req, res) => {
  try {
    const { titulo, enunciado } = req.body;

    if (!titulo || !String(titulo).trim()) {
      return res.status(400).json({ message: 'El título de la actividad es obligatorio' });
    }

    if (!enunciado || !String(enunciado).trim()) {
      return res.status(400).json({ message: 'El enunciado de la actividad es obligatorio' });
    }

    const actividad = await Actividad.create({
      docenteId: req.user.id,
      titulo: String(titulo).trim(),
      enunciado: String(enunciado).trim()
    });

    res.status(201).json({ actividad });
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ message: 'Error al crear la actividad' });
  }
};

const updateActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findOne({
      where: { id: req.params.id, docenteId: req.user.id }
    });

    if (!actividad) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const { titulo, enunciado } = req.body;

    if (titulo !== undefined && !String(titulo).trim()) {
      return res.status(400).json({ message: 'El título de la actividad es obligatorio' });
    }

    if (enunciado !== undefined && !String(enunciado).trim()) {
      return res.status(400).json({ message: 'El enunciado de la actividad es obligatorio' });
    }

    await actividad.update({
      titulo: titulo !== undefined ? String(titulo).trim() : actividad.titulo,
      enunciado: enunciado !== undefined ? String(enunciado).trim() : actividad.enunciado
    });

    res.json({ actividad });
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({ message: 'Error al actualizar la actividad' });
  }
};

const deleteActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findOne({
      where: { id: req.params.id, docenteId: req.user.id }
    });

    if (!actividad) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    await actividad.destroy();
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ message: 'Error al eliminar la actividad' });
  }
};

module.exports = {
  getDocenteActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  getActividades
};
