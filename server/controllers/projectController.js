const { User, Project } = require('../models');
const { updateUserStreak } = require('../utils/streak');

const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });

    res.json({ projects });
  } catch (error) {
    console.error('Error cargando proyectos:', error);
    res.status(500).json({ message: 'Error al cargar los proyectos' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, code } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ message: 'El título del proyecto es obligatorio' });
    }

    const sanitizedTitle = title.trim();
    const existingProject = await Project.findOne({
      where: { userId: req.user.id, title: sanitizedTitle }
    });

    if (existingProject) {
      return res.status(409).json({ message: 'Ya tienes un proyecto con ese nombre' });
    }

    const defaultCode = ` `;

    const project = await Project.create({
      userId: req.user.id,
      title: sanitizedTitle,
      code: defaultCode
    });

    try {
      await updateUserStreak(req.user.id);
    } catch (streakError) {
      console.error('Error actualizando racha:', streakError);
    }

    res.status(201).json(project);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya tienes un proyecto con ese nombre' });
    }
    res.status(500).json({ message: 'Error al crear el proyecto' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, code } = req.body;
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    if (title !== undefined) {
      const sanitizedTitle = title.trim();
      if (sanitizedTitle.length === 0) {
        return res.status(400).json({ message: 'El título del proyecto es obligatorio' });
      }

      const duplicate = await Project.findOne({
        where: {
          userId: req.user.id,
          title: sanitizedTitle
        }
      });

      if (duplicate && duplicate.id !== project.id) {
        return res.status(409).json({ message: 'Ya tienes un proyecto con ese nombre' });
      }
    }

    await project.update({
      title: title !== undefined ? title.trim() : project.title,
      code: code !== undefined ? code : project.code
    });

    try {
      await updateUserStreak(req.user.id);
    } catch (streakError) {
      console.error('Error actualizando racha:', streakError);
    }

    res.json(project);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya tienes un proyecto con ese nombre' });
    }
    res.status(500).json({ message: 'Error al actualizar el proyecto' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    await project.destroy();
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ message: 'Error al eliminar el proyecto' });
  }
};



const shareProject = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: 'Falta projectId' });

    const sourceProject = await Project.findOne({ where: { id: projectId } });
    if (!sourceProject) return res.status(404).json({ message: 'Proyecto fuente no encontrado' });

    if (sourceProject.userId === req.user.id) {
      return res.status(200).json({ message: 'Ya eres propietario del proyecto', project: sourceProject });
    }

    const baseTitle = sourceProject.title || 'Proyecto compartido';
    let counter = 0;
    let newTitle = `${baseTitle} (copia)`;
    let newProject;

    while (!newProject) {
      try {
        newProject = await Project.create({
          userId: req.user.id,
          title: newTitle,
          code: sourceProject.code || ' '
        });
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          counter += 1;
          newTitle = `${baseTitle} (copia ${counter})`;
          continue;
        }
        throw error;
      }
    }

    res.status(201).json({ message: 'Proyecto compartido', project: newProject });
  } catch (error) {
    console.error('Error compartiendo proyecto:', error);
    res.status(500).json({ message: 'Error al compartir el proyecto' });
  }
};

module.exports = {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  shareProject
};
