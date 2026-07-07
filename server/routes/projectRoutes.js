const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getUserProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  shareProject
} = require('../controllers/projectController');

router.use(verifyToken);
router.get('/', getUserProjects);
router.post('/', createProject);
router.post('/compartir', shareProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
