const express = require('express');
const router = express.Router();
const { register, login, checkToken, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/validate', verifyToken, checkToken);
router.post('/registro', register);
router.post('/acceso', login);
router.post('/logout', logout);
router.post('/recuperar/:token', resetPassword);
router.post('/recuperar', forgotPassword);

module.exports = router;