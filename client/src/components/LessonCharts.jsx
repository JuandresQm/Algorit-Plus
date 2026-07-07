import React, { useMemo } from 'react';
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

const LessonCharts = ({ entries = [], units = [], colors = {}, isMobile = false }) => {
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
    return safeNumber(e.totalTimeSeconds/60 ?? 0); 
  });
}, [units, entries]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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

      <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5', width: '99%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: colors.primary || '#2D3354' }}>Tiempo por lección</h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Minutos invertidos por lección</p>
          </div>
        </div>
        <div style={{ height: isMobile ? '220px' : '260px'}}>
          <Line data={timeData} options={timeOptions} />
        </div>
      </div>
    </div>
  );
};

export default LessonCharts;
