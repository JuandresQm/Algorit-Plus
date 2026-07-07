import React, { useState, useEffect } from 'react';

// Función para desordenar las opciones en el banco
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const TresCajasSimulador = ({ settings, onComplete }) => {
  const { instructions, cajas, opciones } = settings;

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const [bancoOpciones, setBancoOpciones] = useState([]);
  const [cajasAsignadas, setCajasAsignadas] = useState({});
  const [draggedOptionId, setDraggedOptionId] = useState(null);
  const [errorFeedback, setErrorFeedback] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

const [isSimulating, setIsSimulating] = useState(false);
const [isDone, setIsDone] = useState(false);
const [pasosActivos, setPasosActivos] = useState([]);
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
    if (opciones && cajas) {
      setBancoOpciones(shuffleArray(opciones));
      const initCajas = {};
      cajas.forEach(caja => {
        initCajas[caja.id] = [];
      });
      setCajasAsignadas(initCajas);
    }
  }, [opciones, cajas]);

  const handleDragStart = (id) => {
    setDraggedOptionId(id);
    setErrorFeedback("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnCaja = (cajaId) => {
    if (!draggedOptionId) return;

    const opcionSeleccionada = opciones.find(opt => opt.id === draggedOptionId);

    if (opcionSeleccionada.perteneceA !== cajaId) {
      setErrorFeedback(` ¡Módulo Incompatible! Ese elemento no pertenece a la caja de ${cajaId.toUpperCase()}.`);
      setDraggedOptionId(null);
      return;
    }

    setBancoOpciones(prev => prev.filter(opt => opt.id !== draggedOptionId));
    setCajasAsignadas(prev => ({
      ...prev,
      [cajaId]: [...prev[cajaId], opcionSeleccionada]
    }));

    setDraggedOptionId(null);

    const totalClasificados = Object.values({
      ...cajasAsignadas,
      [cajaId]: [...cajasAsignadas[cajaId], opcionSeleccionada]
    }).flat().length;

    if (totalClasificados === opciones.length) {
      setIsSuccess(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

const iniciarSimulacion = () => {
  setIsSimulating(true);
  setIsDone(false); 
  setPasosActivos([1]); 
  
  setTimeout(() => {
    setPasosActivos([1, 2]); 

    setTimeout(() => {
      setPasosActivos([1, 2, 3]);
      
      
      setIsSimulating(false); 
      setIsDone(true);     
    }, 2500);
  }, 2500);
};

  return (
    <div className="quiz-sim-container">
      <div className="quiz-sim-header">
        <h2>Clasifica los elementos en las cajas</h2>
      </div>

      <div className="quiz-sim-body">
        <p className="quiz-sim-question-text">
          {instructions}
        </p>

        <div className="quiz-sim-note">
          Tiempo de actividad: {formatElapsedTime(elapsedSeconds)}
        </div>

        {errorFeedback && (
          <div className="quiz-sim-feedback quiz-sim-feedback-error">
            {errorFeedback}
          </div>
        )}

        {!isSuccess && bancoOpciones.length > 0 && (
          <div className="quiz-sim-panel">
            <div className="quiz-sim-panel-title">Elementos por clasificar</div>
            <div className="quiz-sim-options-container">
              {bancoOpciones.map(opt => (
                <div
                  key={opt.id}
                  draggable
                  onDragStart={() => handleDragStart(opt.id)}
                  className="quiz-sim-option-card"
                >
                  {opt.texto}
                </div>
              ))}
            </div>
          </div>
        )}

       <div className="quiz-sim-boxes-grid">
  {cajas && cajas.map(caja => {
    // Evaluar si cada paso individual está activo de manera acumulativa
    const esEntradaActiva = caja.id === 'entrada' && pasosActivos.includes(1);
    const esProcesoActivo = caja.id === 'proceso' && pasosActivos.includes(2);
    const esSalidaActiva = caja.id === 'salida' && pasosActivos.includes(3);
    const estaCajaFija = esEntradaActiva || esProcesoActivo || esSalidaActiva;

    return (
      <div
        key={caja.id}
        onDragOver={handleDragOver}
        onDrop={() => handleDropOnCaja(caja.id)}
        className={`quiz-sim-box-card ${estaCajaFija ? `quiz-sim-box-active-${caja.id}` : ''}`}
      >
        <div className="quiz-sim-box-title">
          {estaCajaFija ? `■ ${caja.label.toUpperCase()} ■` : caja.label}
        </div>
        <div className="quiz-sim-box-dropzone">
          {cajasAsignadas[caja.id]?.map(item => (
            <div key={item.id} className="quiz-sim-box-item">
              {item.texto}
            </div>
          ))}

          {/* Las terminales ahora se renderizan y permanecen fijas de forma independiente */}
         {estaCajaFija && settings.salidaSimulacion && settings.salidaSimulacion[caja.id] && (
  <div className={`quiz-sim-status status-${caja.id}`}>
    {settings.salidaSimulacion[caja.id]}
  </div>
)}

          {(!cajasAsignadas[caja.id] || cajasAsignadas[caja.id].length === 0) && !estaCajaFija && (
            <div className="quiz-sim-status">Arrastra un elemento aquí</div>
          )}
        </div>
      </div>
    );
  })}
</div>

        {isSuccess && (
          <div className="quiz-sim-footer">
            <div className="quiz-sim-feedback quiz-sim-feedback-success">
              Todos los elementos están clasificados.
            </div>
            {!isDone && !isSimulating ? (
  <button className="quiz-sim-action-btn" onClick={iniciarSimulacion}>
    Ejecutar simulación
  </button>
) : (
  <div className="quiz-sim-status">
    {isSimulating ? "Simulando proceso..." : "Simulación completada"}
  </div>
)}
          </div>
        )}
      </div>

      <style>{`
        .quiz-sim-container, .quiz-sim-container * {
          font-family: 'Jersey 20', sans-serif;
        }
        .quiz-sim-container {
          background-color: #FFFFFF;
          padding: 28px;
          max-width: 780px;
          margin: 0 auto;
          color: #1F2937;
          margin-bottom: 16px;
          border-radius: 12px;
  box-shadow: 0 4px 0 #e5e5e5;
  border: 2px solid #e5e5e5;
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
        .quiz-sim-panel {
          background-color: #F8FAFC;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 16px;
        }
        .quiz-sim-panel-title {
          font-size: 16px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4B5563;
          margin-bottom: 12px;
        }
        .quiz-sim-options-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .quiz-sim-option-card {
          width: 250px;
          flex: 1 1 50px;
          padding: 16px 18px;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          background-color: #FFFFFF;
          text-align: center;
          font-weight: 600;
          color: #111827;
          cursor: grab;
          transition: all 0.2s ease;
        }
        .quiz-sim-option-card:hover {
          background-color: #F9FAFB;
          border-color: #C7D2FE;
        }
        .quiz-sim-option-card:hover {
          background-color: #F9FAFB;
          border-color: #C7D2FE;
        }
        .quiz-sim-boxes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .quiz-sim-box-card {
          background-color: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 23px;
        }
        .quiz-sim-box-title {
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          text-align: center;
          border-bottom: 1px solid #E5E7EB;
          padding-bottom: 10px;
        }
        .quiz-sim-box-dropzone {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: flex-start;
          align-items: center;
          padding: 14px;
          background-color: #F8FAFC;
          border: 2px dashed #D1D5DB;
          border-radius: 12px;
        }
        .quiz-sim-box-item {
          width: 100%;
          padding: 14px;
          background-color: #FFFFFF;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          color: #1F2937;
          font-weight: 600;
          text-align: center;
        }
        .quiz-sim-status {
          width: 100%;
          padding: 14px;
          background-color: #F3F4F6;
          border: 1px solid #D1D5DB;
          border-radius: 12px;
          text-align: center;
          color: #374151;
          font-size: 16px;
        }
        .quiz-sim-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .quiz-sim-action-btn {
          background-color: #2D3354;
          color: #FFFFFF;
          border: none;
          padding: 12px 36px;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          font-weight: 700;
        }
        .quiz-sim-action-btn:hover {
          opacity: 0.92;
        }
        @media (min-width: 768px) {
          .quiz-sim-boxes-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 600px) {
          .quiz-sim-container {
            padding: 22px;
          }
          .quiz-sim-options-container {
            gap: 10px;
          }
          .quiz-sim-option-card {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default TresCajasSimulador;