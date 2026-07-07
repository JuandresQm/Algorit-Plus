const { Lesson, UserProgress } = require('../models');
const { updateUserStreak } = require('../utils/streak');

// GET /lessons/:id
async function getLessonById(req, res) {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lección no encontrada' });
    res.json({ id: lesson.id, title: lesson.title, content: lesson.content });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener la lección', error: err.message });
  }
}

// POST /lessons/:id/respuestas
async function answerLessonQuiz(req, res) {
  try {
    const { answers, currentPage, totalTimeSeconds } = req.body;
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lección no encontrada' });
    const quiz = lesson.content?.quiz;
    if (!quiz) return res.status(400).json({ message: 'La lección no tiene quiz' });
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Respuestas inválidas' });
    }

    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id] ?? answers[String(question.id)] ?? answers[Number(question.id)] ?? null;
      let isCorrect = false;

      const normalizeValue = (value) => {
        if (value === null || value === undefined) return '';
        if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).join('|');
        if (typeof value === 'object') return JSON.stringify(value).trim().toLowerCase();
        return String(value).trim().toLowerCase();
      };

      if (question.type === 'multiple-choice') {
        const expected = question.options?.[question.correctIndex];
        isCorrect = normalizeValue(userAnswer) === normalizeValue(expected);
      } else {
        const expected = question.correctAnswer ?? question.answer ?? '';
        isCorrect = normalizeValue(userAnswer) === normalizeValue(expected);
      }

      if (isCorrect) correctAnswers += 1;
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const completed = true;

    await UserProgress.upsert({
      userId: req.user.id,
      lessonId: lesson.id,
      completed,
      score,
      currentPage: Number.isFinite(Number(currentPage)) ? Number(currentPage) : 1,
      totalTimeSeconds: Number.isFinite(Number(totalTimeSeconds)) ? Number(totalTimeSeconds) : 0,
      completionDate: new Date()
    }, { returning: false });

    let awardResult = null;
    try {
      const { awardExpForLessonCompletion } = require('../utils/exp');
      awardResult = await awardExpForLessonCompletion(req.user.id, lesson.id, Number(totalTimeSeconds));
    } catch (expErr) {
      console.error('Error asignando EXP:', expErr);
    }

    let streakResult = { unlocked: [] };
    try {
      streakResult = await updateUserStreak(req.user.id) || { unlocked: [] };
    } catch (streakError) {
      console.error('Error actualizando racha:', streakError);
    }

    const allCorrect = correctAnswers === totalQuestions;
    console.log(`User ${req.user.id} completed lesson ${lesson.id} quiz: ${allCorrect ? 'All correct' : 'Some incorrect'}. Score: ${score}`);
    res.json({
      correct: allCorrect,
      score,
      correctAnswers,
      totalQuestions,
      message: allCorrect ? 'Respuestas correctas' : 'Hay respuestas incorrectas. Intenta de nuevo.',
      unlocked: [
        ...(awardResult?.unlocked || []),
        ...(streakResult?.unlocked || [])
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar respuesta', error: err.message });
  }
}

module.exports = { getLessonById, answerLessonQuiz };