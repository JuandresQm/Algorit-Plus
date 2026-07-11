const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const { createEntrega, getEntregasByDocente, calificarEntrega, getEntregasByEstudiante } = require('../controllers/entregasController');

router.use(verifyToken);

router.post('/', createEntrega);
router.get('/', authorizeRoles('docente'), getEntregasByDocente);
router.get('/estudiante', getEntregasByEstudiante);
router.put('/:id/calificar',  authorizeRoles('docente'), calificarEntrega);

module.exports = router;
