const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getUserProgress, saveLessonProgress } = require('../controllers/progressController');

router.get('/', verifyToken, getUserProgress);
router.post('/leccion/:id', verifyToken, saveLessonProgress);

module.exports = router;
