const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles  } = require('../middlewares/authMiddleware');
const {
  generarEnunciado,
  revisarLeccion
} = require('../controllers/asistenteController');
router.post('/generar', verifyToken, authorizeRoles('docente'), generarEnunciado);
router.post('/revisar/leccion', verifyToken, revisarLeccion);

module.exports = router;
