const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getLessonById, answerLessonQuiz } = require('../controllers/lessonController');

// Obtener lección por ID
router.get('/:id', verifyToken, getLessonById);
// Responder quiz de lección
router.post('/:id/respuestas', verifyToken, answerLessonQuiz);

module.exports = router;
