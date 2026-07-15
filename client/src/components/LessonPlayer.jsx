import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import LessonContent from './LessonContent';
import { useNavigate } from 'react-router-dom';
import LessonQuiz from './LessonQuiz';
import axios from '../api/axios';
import Swal from 'sweetalert2';

const LessonPlayer = forwardRef(({ lessonId, onProgress }, ref) => {
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activityCompleted, setActivityCompleted] = useState(false);
  const [totalLessonTimeSeconds, setTotalLessonTimeSeconds] = useState(0);
const isEditorPage = lesson?.content?.blocks[currentPage - 1]?.type === 'editorCode';

useImperativeHandle(ref, () => ({
    saveCurrentProgress: () => {
      saveProgress(currentPage, false, 0, totalLessonTimeSeconds, false);
    } 
  }));
  const getTotalPages = (lessonData) => {
    const blocks = Array.isArray(lessonData?.content?.blocks)
      ? lessonData.content.blocks
      : Array.isArray(lessonData?.content)
        ? lessonData.content
        : [];
    const hasQuiz = Boolean(lessonData?.content?.quiz);
    return blocks.length + (hasQuiz ? 1 : 0);
  };

  const showAchievementToast = (unlocked) => {
    if (!Array.isArray(unlocked) || unlocked.length === 0) return;



    const listItems = unlocked
      .map((l) => `<li style="margin: 4px 0;">${l.nombre || 'Logro desbloqueado'}</li>`)
      .join('');

    Swal.fire({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 6000,
      timerProgressBar: true,
      background: '#E5E5E7',
      color: '#2D3354',
      icon: 'success',
      title: '<span style="font-family: \'Jersey 20\', sans-serif; font-size: 18px; letter-spacing: 1px;">¡LOGROS CONSEGUIDOS!</span>',
      html: `<div style="font-family: 'Jersey 20', sans-serif; font-size: 15px; color: #5C6384; text-align: left;"><ul style="margin: 8px 0 0 16px; padding: 0;">${listItems}</ul></div>`,
      didOpen: (toast) => {
        toast.style.padding = '16px';
      }
    });
  };

  const saveProgress = async (page, completed = false, score = 0, totalTimeSecondsValue = totalLessonTimeSeconds, showToasts = true) => {
    if (!lessonId || !lesson) return;


    try {
      const res = await axios.post(`/progreso/leccion/${lessonId}`, {
        currentPage: page,
        completed,
        score: score,
        totalTimeSeconds: totalTimeSecondsValue,
      });
      if (showToasts) {
        showAchievementToast(res.data?.unlocked || []);
      }
    } catch (err) {
      console.error('No se pudo guardar el progreso de la lección:', err);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadLesson = async () => {
      setLoading(true);
      setError(null);
      setLesson(null);
      setQuizResult(null);
      setCurrentPage(1);

      try {
        const [lessonRes, progressRes] = await Promise.all([
          axios.get(`/leccion/${lessonId}`),
          axios.get('/progreso')
        ]);

        if (!isActive) return;

        const lessonData = lessonRes.data;
        const totalPages = getTotalPages(lessonData);
        const savedProgress = (progressRes.data?.progress || []).find(
          (entry) => Number(entry.lessonId) === Number(lessonId)
        );

        setLesson(lessonData);
        setCurrentPage(
          Math.max(1, Math.min(Number(savedProgress?.currentPage || 1), totalPages || 1))
        );
        setTotalLessonTimeSeconds(Number(savedProgress?.totalTimeSeconds || 0));
        setLoading(false);
      } catch (err) {
        if (!isActive) return;
        setError('No se pudo cargar la lección. ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    loadLesson();

    return () => {
      isActive = false;
    };
  }, [lessonId]);

  useEffect(() => {
    if (!lesson) return;

    const timer = window.setInterval(() => {
      setTotalLessonTimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [lessonId, lesson]);

useEffect(() => {
  const handleBeforeUnload = () => {
    saveProgress(currentPage, false, 0, totalLessonTimeSeconds, false);
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [currentPage, totalLessonTimeSeconds, lessonId]);


   useEffect(() => {
    setActivityCompleted(false);
  }, [lessonId, currentPage]);

  const handleQuizSubmit = async (answers) => {
    try {
      const res = await axios.post(`/leccion/${lessonId}/respuestas`, {
        answers,
        currentPage,
        totalTimeSeconds: totalLessonTimeSeconds,
      });
      setQuizResult(res.data);
      showAchievementToast(res.data?.unlocked || []);
      const isCompleted = res.data.score >= 60;
      await saveProgress(currentPage, isCompleted, res.data.score || 0, totalLessonTimeSeconds, true);
      if (onProgress) onProgress();
    } catch (err) {
      setQuizResult({ correct: false, message: 'Error al enviar respuestas.', details: err.response?.data || err.message });
    }
  };

  if (loading) return <div className="lesson-player">Cargando lección...</div>;
  if (error) return <div className="lesson-player error">{error}</div>;
  if (!lesson) return null;

  const blocks = Array.isArray(lesson.content?.blocks)
    ? lesson.content.blocks
    : Array.isArray(lesson.content)
      ? lesson.content
      : [];

  const hasQuiz = Boolean(lesson.content?.quiz);
  const totalPages = blocks.length + (hasQuiz ? 1 : 0);

  const currentPageIndex = Math.max(1, Math.min(currentPage, totalPages));
  const isQuizPage = hasQuiz && currentPageIndex === totalPages;
  const currentBlock = !isQuizPage ? blocks[currentPageIndex - 1] : null;
  const requiresActivityCompletion = Boolean(currentBlock && ['simulator_flow', 'simulator_boxes'].includes(currentBlock.type));


  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    if (requiresActivityCompletion && !activityCompleted && page > currentPageIndex) return;
    setCurrentPage(page);
    saveProgress(currentPage, false, 0, totalLessonTimeSeconds, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
const nextDisabled = 
  currentPageIndex === totalPages || 
  (isEditorPage && !activityCompleted);
    const formattedTotalTime = `${String(Math.floor(totalLessonTimeSeconds / 60)).padStart(2, '0')}:${String(totalLessonTimeSeconds % 60).padStart(2, '0')}`;


const handleLessonCodeSubmit = async (code, resultadoAsistente) => {
  const { score, completed, feedback } = resultadoAsistente;
const scoreFinal = parseInt(score, 10) || 0;
  if (completed) {
    setActivityCompleted(true);
    
    try {
      await saveProgress(currentPage, true, scoreFinal, totalLessonTimeSeconds, true);
    } catch (err) {
      console.error("Error al guardar el progreso:", err);
    }

    // 3. Mostramos el modal de éxito y ESPERAMOS a que el usuario presione "Continuar"
    await Swal.fire({
      title: '¡Lección Completada!',
      html: `
        <div style="text-align: left; font-family: 'Segoe UI', sans-serif;">
          <p style="font-size: 18px; font-weight: bold; color: #2D3354;">Puntuación: <span style="color: #10b981;">${score}/100</span></p>
          <div style="background-color: #F0F2F5; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; max-height: 200px; overflow-y: auto; font-size: 14px; margin-top: 10px;">
            <strong>Retroalimentación de la I.A:</strong><br/>
            ${feedback}
          </div>
        </div>
      `,
      icon: 'success',
      target: document.fullscreenElement || document.body,
      confirmButtonColor: '#2D3354',
      confirmButtonText: 'Continuar'
    });

   navigate('/inicio');

  } else {
    // Si no se completó, advertimos al estudiante pero no guardamos como completado
    await Swal.fire({
      title: 'Requiere correcciones',
      html: `
        <div style="text-align: left; font-family: 'Segoe UI', sans-serif;">
          <p style="font-size: 18px; font-weight: bold; color: #ef4444;">Puntuación actual: <span>${score}/100</span></p>
          <div style="background-color: #F87171; color: #7f1d1d; padding: 12px; border-radius: 8px; border: 1px solid #f87171; max-height: 200px; overflow-y: auto; font-size: 14px; margin-top: 10px;">
            <strong>Sugerencias de la I.A para mejorar:</strong><br/>
            ${feedback}
          </div>
        </div>
      `,
      icon: 'warning',
      target: document.fullscreenElement || document.body,
      confirmButtonColor: '#2D3354',
      confirmButtonText: 'Entendido, ir a corregir'
    });
  }
};


  return (
    <div className="lesson-player">
      <div style={styles.paginationHeader}>
        <div>
          <strong>{isQuizPage ? 'Quiz de la lección' : `Página ${currentPageIndex} de ${totalPages}`}</strong>
        </div>
        <div style={styles.paginationLabel}>
          {isQuizPage ? 'Responde el cuestionario final para completar la lección.' : `${currentPageIndex} / ${totalPages}`}
          <div style={styles.timerInfo}>Tiempo total de la lección: {formattedTotalTime}</div>
        </div>
      </div>

      {!isQuizPage && currentBlock && (
  <LessonContent 
    content={[currentBlock]} 
    onActivityComplete={() => setActivityCompleted(true)} 
    onLessonCodeSubmit={handleLessonCodeSubmit} 
  />
)}

      {isQuizPage && lesson.content.quiz && (
        <LessonQuiz quiz={lesson.content.quiz} onSubmit={handleQuizSubmit} result={quizResult} title={lesson.title} />
      )}

      <div style={styles.paginationControls}>
        <button
          style={currentPageIndex === 1 ? styles.disabledButton : styles.navButton}
          disabled={currentPageIndex === 1}
          onClick={() => goToPage(currentPageIndex - 1)}
        >
          Anterior
        </button>

        <span style={styles.pageInfo}>
          {isQuizPage ? 'Última página' : `${currentPageIndex} / ${totalPages}`}
        </span>

        <button
          style={nextDisabled ? styles.disabledButton : styles.navButton}
          disabled={nextDisabled}
          onClick={() => goToPage(currentPageIndex + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
});

const styles = {
  paginationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '18px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
  },
  paginationLabel: {
    color: '#4A4A4A',
    fontSize: '14px',
  },
  timerInfo: {
    marginTop: '4px',
    color: '#2D3354',
    fontWeight: '700',
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  navButton: {
    backgroundColor: '#2D3354',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    minWidth: '110px',
  },
  disabledButton: {
    backgroundColor: '#BFBFBF',
    color: '#666666',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'not-allowed',
    minWidth: '110px',
  },
  pageInfo: {
    color: '#2D3354',
    fontWeight: '700',
  }
};

export default LessonPlayer;
