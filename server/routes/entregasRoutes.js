const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { createEntrega, getEntregasByDocente, calificarEntrega, getEntregasByEstudiante } = require('../controllers/entregasController');

router.use(verifyToken);

router.post('/', createEntrega);
router.get('/', getEntregasByDocente);
router.get('/estudiante', getEntregasByEstudiante);
router.put('/:id/calificar', calificarEntrega);

module.exports = router;
