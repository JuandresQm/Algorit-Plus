import React, { useState } from 'react';

const colors = {
  primary: '#2D3354',
  sidebar: '#E5E5E7',
  content: '#EEEEEE',
  white: '#FFFFFF',
  correctBg: '#A7F3D0', 
  correctBorder: '#34D399',
  incorrectBg: '#FECDD3',
  incorrectBorder: '#F43F5E'
};

const LessonQuiz = ({ quiz, onSubmit, result, title }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const questions = quiz.questions;
  const currentQuestion = questions[currentIdx];
  const isLastQuestion = currentIdx === questions.length - 1;
  const totalQuestions = questions.length;

  const getCorrectAnswerText = (question) => {
    if (question.type === 'multiple-choice') {
      return question.options?.[question.correctIndex] || '';
    }
    return question.correctAnswer || '';
  };

  const evaluateAnswer = (question, answer) => {
    if (!question) return false;

    if (question.type === 'multiple-choice') {
      const expected = question.options?.[question.correctIndex];
      return answer === expected;
    }

    const normalizedAnswer = answer ? String(answer).trim().toLowerCase() : '';
    const expected = String(question.correctAnswer || '').trim().toLowerCase();
    return normalizedAnswer === expected;
  };

  const handleOptionClick = (questionId, option) => {
    if (submitted || result || showFeedback) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleNextOrSubmit = (e) => {
    e.preventDefault();

    if (showFeedback) {
      if (isLastQuestion) {
        setSubmitted(true);
        const finalAnswers = { ...answers };
        onSubmit(finalAnswers);
      } else {
        setCurrentIdx((prev) => prev + 1);
        setShowFeedback(false);
        setFeedback(null);
      }
      return;
    }

    const selectedAnswer = answers[currentQuestion.id];
    if (!selectedAnswer) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: selectedAnswer };
    setAnswers(nextAnswers);

    const isCorrect = evaluateAnswer(currentQuestion, selectedAnswer);
    setFeedback({
      questionId: currentQuestion.id,
      correct: isCorrect,
      message: isCorrect
        ? 'Respuesta correcta.'
        : `Respuesta incorrecta. La respuesta correcta es: ${getCorrectAnswerText(currentQuestion)}`
    });
    setShowFeedback(true);

    if (isLastQuestion) {
      setSubmitted(true);
      onSubmit(nextAnswers);
    }
  };

  const getOptionStyle = (opt, index) => {
    const isSelected = answers[currentQuestion.id] === opt;
    const isCorrectOption = index === currentQuestion.correctIndex;
    const shouldShowReview = (showFeedback && feedback?.questionId === currentQuestion.id) || (submitted && result);

    if (shouldShowReview) {
      if (isCorrectOption) {
        return { backgroundColor: colors.correctBg, borderColor: colors.correctBorder, color: '#000' };
      }
      if (isSelected && !isCorrectOption) {
        return { backgroundColor: colors.incorrectBg, borderColor: colors.incorrectBorder, color: '#000' };
      }
    }

    if (isSelected) {
      return {
        borderColor: colors.primary,
        backgroundColor: '#F8F9FA',
        boxShadow: '0 0 0 2px rgba(45, 51, 84, 0.15)'
      };
    }

    return {};
  };
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h2>{title}</h2>
      </div>

      <div className="quiz-body">
        <p className="quiz-question-text">
          {currentIdx + 1}. {currentQuestion.question}
        </p>
        <div className="quiz-options-container">
          {currentQuestion.type === 'multiple-choice' ? (
            currentQuestion.options.map((opt, i) => (
              <div
                key={i}
                className="quiz-option-card"
                style={getOptionStyle(opt, i)}
                onClick={() => handleOptionClick(currentQuestion.id, opt)}
              >
                {opt}
              </div>
            ))
          ) : (
            <input
              type="text"
              className="quiz-text-input"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => {
                if (!submitted && !result) {
                  setAnswers({ ...answers, [currentQuestion.id]: e.target.value });
                }
              }}
              placeholder="Escribe tu respuesta aquí..."
            />
          )}
        </div>
      </div>

      <div className="quiz-footer">
        <button 
          className="quiz-action-btn" 
          onClick={handleNextOrSubmit}
          disabled={(!answers[currentQuestion.id] && !submitted && !showFeedback) || (isLastQuestion && submitted)}
        >
          {showFeedback ? (isLastQuestion ? 'Finalizar' : 'Siguiente pregunta') : (isLastQuestion ? 'Enviar' : 'Siguiente')}
        </button>
        
        <p className="quiz-counter">
          {currentIdx + 1} de {totalQuestions} preguntas
        </p>

        {showFeedback && feedback?.questionId === currentQuestion.id && (
          <div className={`quiz-feedback-message ${feedback.correct ? 'quiz-feedback-success' : 'quiz-feedback-error'}`}>
            {feedback.message}
          </div>
        )}

        {result && isLastQuestion && (
          <div className="quiz-feedback-message" style={{ color: result.correct ? colors.correctBorder : colors.incorrectBorder }}>
            {result.message}
          </div>
        )}
      </div>

      <style>{`
        .quiz-container, .quiz-container * {
          font-family: 'Jersey 20', sans-serif;
        }
        .quiz-container {
          background-color: ${colors.white};
          padding: 30px;
          max-width: 600px;
          margin: 0 auto;
          color: #333;
          border-radius: 12px;
  box-shadow: 0 4px 0 #e5e5e5;
  border: 2px solid #e5e5e5;
        }
        .quiz-header h2 {
          margin: 0 0 15px 0;
          font-size: 24px;
          color: #000;
        }
        .quiz-header {
          border-bottom: 1px solid #E5E5E5;
          margin-bottom: 20px;
        }
        .quiz-question-text {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .quiz-options-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .quiz-option-card {
          padding: 16px 20px;
          border: 1px solid #CCC;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: ${colors.white};
        }
        .quiz-option-card:hover {
          background-color: #F9F9F9;
        }
        .quiz-text-input {
          padding: 16px;
          border: 1px solid #CCC;
          border-radius: 6px;
          font-size: 16px;
          width: 100%;
          box-sizing: border-box;
        }
        .quiz-text-input:focus {
          outline: none;
          border-color: ${colors.primary};
        }
        .quiz-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 30px;
        }
        .quiz-action-btn {
          background-color: ${colors.primary};
          color: ${colors.white};
          border: none;
          padding: 12px 40px;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          width: 200px;
        }
        .quiz-action-btn:hover {
          opacity: 0.9;
        }
        .quiz-action-btn:disabled {
          background-color: #A0A0A0;
          cursor: not-allowed;
        }
        .quiz-counter {
          margin-top: 15px;
          font-size: 14px;
          color: #666;
        }
        .quiz-feedback-message {
          margin-top: 15px;
          font-weight: bold;
          text-align: center;
        }
        .quiz-feedback-success {
          color: ${colors.correctBorder};
        }
        .quiz-feedback-error {
          color: ${colors.incorrectBorder};
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .quiz-container {
            padding: 20px;
            border-radius: 8px;
          }
          .quiz-action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LessonQuiz;
