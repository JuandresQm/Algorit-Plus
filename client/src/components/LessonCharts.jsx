import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const LessonCharts = ({ 
  entries = [], 
  units = [], 
  actividades = [], // 🌟 Nueva prop para recibir actividades
  entregas = [],    // 🌟 Nueva prop para recibir entregas
  colors = {}, 
  isMobile = false 
}) => {
  // Estado para controlar la pestaña activa ('lessons' o 'deliveries')
  const [activeTab, setActiveTab] = useState('lessons');

  // ==========================================
  // 1. PROCESAMIENTO DE DATOS: LECCIONES (TAB 1)
  // ==========================================
  const labels = useMemo(() => units.map((u) => u.title), [units]);

  const grades = useMemo(() => {
    return units.map((u) => {
      const e = entries.find((it) => Number(it.lessonId) === Number(u.lessonId) || it.title === u.title) || {};
      return safeNumber(e.score ?? e.grade ?? e.nota ?? e.calificacion ?? 0);
    });
  }, [units, entries]);

  const times = useMemo(() => {
    return units.map((u) => {
      const e = entries.find((it) => Number(it.lessonId) === Number(u.lessonId) || it.title === u.title) || {};
      return safeNumber(e.totalTimeSeconds / 60 ?? 0); 
    });
  }, [units, entries]);

  // ==========================================
  // 2. PROCESAMIENTO DE DATOS: ENTREGAS (TAB 2)
  // ==========================================
  const deliveryLabels = useMemo(() => actividades.map((a) => a.titulo), [actividades]);

  // Nota promedio obtenida por actividad
  const deliveryGrades = useMemo(() => {
    return actividades.map((a) => {
      const matchingEntregas = entregas.filter(
        (e) => Number(e.actividadId) === Number(a.id) || e.actividad?.titulo === a.titulo
      );
      // Solo tomamos en cuenta las entregas que ya han sido calificadas (tienen nota numérica)
      const graded = matchingEntregas.filter((e) => e.nota !== undefined && e.nota !== null && !isNaN(Number(e.nota)));
      
      if (graded.length === 0) return 0;
      const total = graded.reduce((sum, e) => sum + safeNumber(e.nota), 0);
      return Math.round((total / graded.length) * 10) / 10; // Redondea a 1 decimal
    });
  }, [actividades, entregas]);

  // Tiempo promedio invertido en segundos transformado a minutos
  const deliveryTimes = useMemo(() => {
    return actividades.map((a) => {
      const matchingEntregas = entregas.filter(
        (e) => Number(e.actividadId) === Number(a.id) || e.actividad?.titulo === a.titulo
      );
      
      if (matchingEntregas.length === 0) return 0;
      const totalSeconds = matchingEntregas.reduce((sum, e) => sum + safeNumber(e.tiempoEmpleado ?? e.tiempo ?? 0), 0);
      return (totalSeconds / matchingEntregas.length) / 60; // Promedio general en minutos
    });
  }, [actividades, entregas]);

  // ==========================================
  // CONFIGURACIÓN DE CONJUNTOS DE DATOS (DATASETS)
  // ==========================================
  const gradeData = {
    labels,
    datasets: [
      {
        label: 'Notas',
        data: grades,
        backgroundColor: colors.accent || '#4f5988',
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };

  const timeData = {
    labels,
    datasets: [
      {
        label: 'Tiempo (min)',
        data: times,
        borderColor: colors.primary || '#2D3354',
        backgroundColor: 'rgba(45,51,84,0.06)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const deliveryGradeData = {
    labels: deliveryLabels,
    datasets: [
      {
        label: 'Nota Promedio',
        data: deliveryGrades,
        backgroundColor: '#4f5988',
        borderRadius: 8,
        barThickness: 18,
      },
    ],
  };

  const deliveryTimeData = {
    labels: deliveryLabels,
    datasets: [
      {
        label: 'Tiempo Promedio (min)',
        data: deliveryTimes,
        borderColor: colors.primary || '#2D3354',
        backgroundColor: 'rgba(45,51,84,0.06)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  // ==========================================
  // OPCIONES DE LAS GRÁFICAS (CHART OPTIONS)
  // ==========================================
  const gradeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#2D3354',
        bodyColor: '#333',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        ticks: { color: '#666', maxRotation: 0, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#666' },
        grid: { color: '#f0f0f0' },
        beginAtZero: true,
      },
    },
  };

  const timeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#2D3354',
        bodyColor: '#333',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        usePointStyle: true,
        callbacks: {
          label: (context) => {
            const totalSeconds = Math.round(context.parsed.y * 60);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return ` Tiempo: ${minutes}:${String(seconds).padStart(2, '0')}`;
          }
        }
      },
    },
    scales: {
      x: {
        
        ticks: { color: '#666', maxRotation: 0, minRotation: 0 },
        grid: { display: false },
      },
      y: {
        ticks: { 
          color: '#666',
          callback: (value) => {
            const totalSeconds = Math.round(value * 60);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
          }
        },
        grid: { color: '#f0f0f0' },
        beginAtZero: true,
      },
    },
  };

  // Estilos inline compartidos para mantener la consistencia estética
  const tabButtonStyle = (isActive) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? (colors.primary || '#2D3354') : '#FFFFFF',
    color: isActive ? '#FFFFFF' : '#666666',
    border: '2px solid',
    borderColor: isActive ? (colors.primary || '#2D3354') : '#e5e5e5',
    borderRadius: '12px',
    fontWeight: '300',
    fontSize: '16px',
    boxShadow: isActive ? '0 4px 0 #1e2238' : '0 4px 0 #e5e5e5',
    transition: 'all 0.15s ease',
    outline: 'none',
    fontFamily: "'Jersey 20', sans-serif",
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* 🔘 CONTENEDOR DE PESTAÑAS (TABS) */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('lessons')} 
          style={tabButtonStyle(activeTab === 'lessons')}
        >
          Lecciones
        </button>
        <button 
          onClick={() => setActiveTab('deliveries')} 
          style={tabButtonStyle(activeTab === 'deliveries')}
        >
          Entregas
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL DE ACUERDO AL TAB ACTIVO */}
      {activeTab === 'lessons' ? (
        <>
          {/* Grafica 1: Notas de Lecciones */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5', width: '99%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: colors.primary || '#2D3354' }}>Notas por lección</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Promedios o puntuaciones registradas</p>
              </div>
            </div>
            <div style={{ height: isMobile ? '220px' : '260px' }}>
              <Bar data={gradeData} options={gradeOptions} />
            </div>
          </div>

          {/* Grafica 2: Tiempos de Lecciones */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5', width: '99%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: colors.primary || '#2D3354' }}>Tiempo por lección</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Minutos invertidos por lección</p>
              </div>
            </div>
            <div style={{ height: isMobile ? '220px' : '260px' }}>
              <Line data={timeData} options={timeOptions} />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Grafica 3: Notas de las Entregas Recibidas */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5', width: '99%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: colors.primary || '#2D3354' }}>Notas promedio por actividad</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Rendimiento global de las entregas evaluadas</p>
              </div>
            </div>
            <div style={{ height: isMobile ? '220px' : '260px' }}>
              <Bar data={deliveryGradeData} options={gradeOptions} />
            </div>
          </div>

          {/* Grafica 4: Tiempos promedio de las Entregas Recibidas */}
          <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5', width: '99%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: colors.primary || '#2D3354' }}>Tiempo promedio por actividad</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Minutos promedio invertidos por los estudiantes</p>
              </div>
            </div>
            <div style={{ height: isMobile ? '220px' : '260px' }}>
              <Line data={deliveryTimeData} options={timeOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonCharts;