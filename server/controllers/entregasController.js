const { Entrega, Actividad, User } = require('../models');

const createEntrega = async (req, res) => {
  try {
    const { actividadId, codigoEnviado, tiempoEmpleado } = req.body;

    if (!actividadId) {
      return res.status(400).json({ message: 'Falta el id de la actividad' });
    }

    if (!codigoEnviado || !String(codigoEnviado).trim()) {
      return res.status(400).json({ message: 'El código enviado es obligatorio' });
    }

    const actividad = await Actividad.findByPk(actividadId);
    if (!actividad) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    const [entrega, created] = await Entrega.findOrCreate({
      where: { actividadId, estudianteId: req.user.id },
      defaults: {
        actividadId,
        estudianteId: req.user.id,
        codigoEnviado: String(codigoEnviado),
        tiempoEmpleado: Number(tiempoEmpleado) || 0,
        estado: 'pendiente'
      }
    });

    if (!created) {
      await entrega.update({
        codigoEnviado: String(codigoEnviado),
        tiempoEmpleado: Number(tiempoEmpleado) || 0,
        estado: 'pendiente'
      });
    }

    res.status(created ? 201 : 200).json({ entrega, message: created ? 'Entrega creada' : 'Entrega actualizada' });
  } catch (error) {
    console.error('Error creando entrega:', error);
    res.status(500).json({ message: 'Error al crear la entrega' });
  }
};

const getEntregasByDocente = async (req, res) => {
  try {
    const actividades = await Actividad.findAll({
      where: { docenteId: req.user.id },
      attributes: ['id', 'titulo']
    });

    const actividadIds = actividades.map((actividad) => actividad.id);

    if (actividadIds.length === 0) {
      return res.json({ entregas: [] });
    }

    const entregas = await Entrega.findAll({
      where: { actividadId: actividadIds },
      include: [
        {
          model: Actividad,
          as: 'actividad',
          attributes: ['id', 'titulo']
        },
        {
          model: User,
          as: 'estudiante',
          attributes: ['id', 'username', 'name', 'lastname']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ entregas });
  } catch (error) {
    console.error('Error cargando entregas:', error);
    res.status(500).json({ message: 'Error al cargar las entregas' });
  }
};

const getEntregasByEstudiante = async (req, res) => {
  try {
    const entregas = await Entrega.findAll({
      where: { estudianteId: req.user.id },
      include: [
        {
          model: Actividad,
          as: 'actividad',
          attributes: ['titulo']
        },
          ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ entregas });
  } catch (error) {
    console.error('Error cargando entregas:', error);
    res.status(500).json({ message: 'Error al cargar las entregas' });
  }
};

const calificarEntrega = async (req, res) => {
  try {
    const entrega = await Entrega.findOne({
      where: { id: req.params.id },
      include: [{ model: Actividad, as: 'actividad', where: { docenteId: req.user.id } }]
    });

    if (!entrega) {
      return res.status(404).json({ message: 'Entrega no encontrada' });
    }

    const { estado, nota, observaciones } = req.body;

    await entrega.update({
      estado: estado || entrega.estado,
      nota: nota !== undefined ? nota : entrega.nota,
      observaciones: observaciones !== undefined ? observaciones : entrega.observaciones
    });

    res.json({ entrega });
  } catch (error) {
    console.error('Error calificando entrega:', error);
    res.status(500).json({ message: 'Error al calificar la entrega' });
  }
};

module.exports = {
  createEntrega,
  getEntregasByDocente,
  getEntregasByEstudiante,
  calificarEntrega
};
