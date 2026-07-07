const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles  } = require('../middlewares/authMiddleware');
const {
  getDocenteActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  getActividades
} = require('../controllers/actividadController');
router.get('/estudiante', verifyToken, getActividades);
router.get('/', verifyToken, authorizeRoles('docente'), getDocenteActividades);
router.post('/', verifyToken, authorizeRoles('docente'), createActividad);
router.put('/:id', verifyToken, authorizeRoles('docente'), updateActividad);
router.delete('/:id', verifyToken, authorizeRoles('docente'), deleteActividad);

module.exports = router;
