import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const MetodologiaFlowSimulator = ({ settings, onComplete }) => {
  const { instructions, correctOrder, rules } = settings;

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const [pasos, setPasos] = useState([]);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isSuccess) return;

    const startTime = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isSuccess]);

  useEffect(() => {
    if (correctOrder) {
      setPasos(shuffleArray(correctOrder));
    }
  }, [correctOrder]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
    setErrorFeedback("");
  };


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const nuevosPasos = [...pasos];
    const [itemMovido] = nuevosPasos.splice(draggedIndex, 1);
    nuevosPasos.splice(targetIndex, 0, itemMovido);


    setPasos(nuevosPasos);
    setDraggedIndex(null);

    // --- VERIFICACIÓN DE VICTORIA ---
    const mapeoCorrecto = nuevosPasos.every((paso, idx) => paso === correctOrder[idx]);
    if (mapeoCorrecto) {
      setIsSuccess(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  return (
    <div className="quiz-sim-container">
      <div className="quiz-sim-header">
        <h2>Ordena los pasos metodológicos</h2>
      </div>

      <div className="quiz-sim-body">
        <p className="quiz-sim-question-text">
          {instructions}
        </p>
        <div className="quiz-sim-note">
          Tiempo de actividad: {formatElapsedTime(elapsedSeconds)}
        </div>
         <div className="quiz-sim-note">
          Arrastra cada cuadro a la posición correcta.
        </div>


        {isSuccess && (
          <div className="quiz-sim-feedback quiz-sim-feedback-success">
            Actividad completada. Has organizado la metodología correctamente.
          </div>
        )}

        <div className="quiz-sim-options-container">
          {pasos.map((paso, index) => (
            <div
              key={paso}
              draggable={!isSuccess}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={`quiz-sim-option-card ${isSuccess ? 'quiz-sim-option-card-success' : ''}`}
            >
              <div className={`quiz-sim-option-number ${isSuccess ? 'quiz-sim-option-number-success' : ''}`}>
                {index + 1}
              </div>
              <div className="quiz-sim-option-content">
                {paso}
              </div>
            </div>
          ))}
        </div>

       
      </div>

      <style>{`
        .quiz-sim-container, .quiz-sim-container * {
          font-family: 'Jersey 20', sans-serif;
        }
       .quiz-sim-container {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 0 #e5e5e5;
  border: 2px solid #e5e5e5;
  padding: 28px;
  max-width: 640px;
  margin: 0 auto;
  color: #1F2937;
}
        .quiz-sim-header {
          border-bottom: 1px solid #E5E7EB;
          margin-bottom: 20px;
        }
        .quiz-sim-header h2 {
          margin: 0;
          font-size: 22px;
          color: #111827;
        }
        .quiz-sim-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .quiz-sim-question-text {
          font-size: 16px;
          margin: 0;
          line-height: 1.5;
          color: #374151;
        }
        .quiz-sim-feedback {
          padding: 14px 16px;
          border-radius: 12px;
          font-weight: 600;
          text-align: center;
        }
        .quiz-sim-feedback-error {
          background-color: #FEE2E2;
          border: 1px solid #FECACA;
          color: #B91C1C;
        }
        .quiz-sim-feedback-success {
          background-color: #D1FAE5;
          border: 1px solid #34D399;
          color: #065F46;
        }
        .quiz-sim-options-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .quiz-sim-option-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 18px;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          background-color: #FFFFFF;
          cursor: grab;
          transition: all 0.2s ease;
        }
        .quiz-sim-option-card:hover {
          background-color: #F9FAFB;
          border-color: #C7D2FE;
        }
        .quiz-sim-option-card-success {
          border-color: #34D399;
          background-color: #ECFDF5;
        }
        .quiz-sim-option-number {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background-color: #2D3354;
          color: #FFFFFF;
          font-weight: 700;
          flex-shrink: 0;
        }
        .quiz-sim-option-number-success {
          background-color: #10B981;
        }
        .quiz-sim-option-content {
          flex: 1;
          min-width: 0;
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          word-break: break-word;
        }
        .quiz-sim-note {
          font-size: 13px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        @media (max-width: 600px) {
          .quiz-sim-container {
            padding: 20px;
          }
          .quiz-sim-option-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .quiz-sim-option-number {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default MetodologiaFlowSimulator;