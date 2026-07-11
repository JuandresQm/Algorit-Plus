import { useState, useEffect } from 'react';
import { Plus, Settings, Check, Circle, Share2, Edit3, LogOut, Zap, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';
import LessonCharts from './LessonCharts';

const Inicio = ({ user, onLogout }) => {
  const colors = {
    primary: '#2D3354',
    background: '#F0F2F5',
    sidebarBg: '#F8F9FA',
    cardBg: '#FFFFFF',
    accent: '#4f5988'
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectError, setProjectError] = useState(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [streakCount, setStreakCount] = useState(user?.currentStreak ?? 0);
  const [lastActionDate, setLastActionDate] = useState(user?.lastActionDate || null);
  const [activeModuleTab, setActiveModuleTab] = useState('I');
  const [mainTab, setMainTab] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('inicio-main-tab') || 'lecciones';
    }
    return 'lecciones';
  });
  const [actividades, setActividades] = useState([]);
  const [actividadesLoading, setActividadesLoading] = useState(false);
  const [entregas, setEntregas] = useState([]);
  const [entregasLoading, setEntregasLoading] = useState(false);
  const [actividadSearchTerm, setActividadSearchTerm] = useState('');
  const [actividadPage, setActividadPage] = useState(1);
  const [entregaSearchTerm, setEntregaSearchTerm] = useState('');
  const [entregaEstadoFiltro, setEntregaEstadoFiltro] = useState('');
  const [entregaPage, setEntregaPage] = useState(1);
  const itemsPerPage = 5;


  const algoritmo1Units = [
    { key: 'alg1-u1', title: 'Unidad I: Introducción a los Algoritmos', lessonId: 1 },
    { key: 'alg1-u2', title: 'Unidad II: Estructuras Condicionales', lessonId: 2 },
    { key: 'alg1-u3', title: 'Unidad III: Ciclos Repetitivos', lessonId: 3 },
    { key: 'alg1-u4', title: 'Unidad IV: Subalgoritmos', lessonId: 4 },
    { key: 'alg1-u5', title: 'Unidad V: Introducción a las estructuras de Datos Estáticas(Arreglos)', lessonId: 5 }
  ];

  const algoritmo2Units = [
    { key: 'alg2-u1', title: 'Unidad I: Estructuras de Datos Estáticas (Arreglos)', lessonId: 6 },
    { key: 'alg2-u2', title: 'Unidad II: Registros', lessonId: 7 },
    { key: 'alg2-u3', title: 'Unidad III: Arreglo de Registros', lessonId: 8 }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('inicio-main-tab', mainTab);
    }
  }, [mainTab]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión actual?',
      text: 'Se borrarán tus datos de acceso de este navegador.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2D3354',
      cancelButtonColor: 'rgb(184, 5, 5)',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
    });

    if (!result.isConfirmed) return;

    const logId = localStorage.getItem('logId');
    if (logId) {
      api.post('/logout', { logId }).catch((err) => console.error('Error al cerrar bitácora', err));
    }

    if (onLogout) onLogout();
    navigate('/');

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Sesión cerrada correctamente',
      showConfirmButton: false,
      timer: 2000
    });
  };

  const apiBase = api.defaults.baseURL || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || window.location.origin;
  const allUnits = [...algoritmo1Units, ...algoritmo2Units];
  const showLevelUpToast = (newLevel) => {
    if (!newLevel) return;

    const storageKey = user?.id ? `algorit_last_level_${user.id}` : 'algorit_last_level';
    const previousLevel = Number(localStorage.getItem(storageKey) || 0);
    const currentLevel = Number(newLevel);

    if (!previousLevel) {
      localStorage.setItem(storageKey, String(currentLevel));
      return;
    }

    if (currentLevel <= previousLevel) {
      localStorage.setItem(storageKey, String(currentLevel));
      return;
    }

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `¡Subiste a nivel ${currentLevel}!`,
      text: 'Sigue así para seguir avanzando.',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#E5E5E7',
      color: '#2D3354',
      didOpen: (toast) => {
        toast.style.padding = '16px';
      }
    });

    localStorage.setItem(storageKey, String(currentLevel));
  };

  const profileAvatar = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${apiBase}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`
    : 'https://via.placeholder.com/40?text=U';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/progreso');
        setProgressEntries(response.data.progress || []);
      } catch (error) {
        setErrorLoading('No se pudo cargar el progreso. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await api.get('/perfil');
        const userProfile = response.data.user || {};
        setStreakCount(userProfile.currentStreak ?? userProfile.streakCount ?? 0);
        setLastActionDate(userProfile.lastActionDate || null);
        showLevelUpToast(userProfile.nivel ?? userProfile.level ?? userProfile.nivelUsuario ?? 1);
      } catch (error) {
        console.warn('No se pudo cargar la racha del usuario:', error?.message || error);
      }
    };

    fetchStreak();
  }, []);

const refreshProjects = async () => {
  try {
    const response = await api.get('/proyectos');
    setProjects(response.data.projects || []);
  } catch (error) {
    console.error('Error cargando proyectos:', error);
  }
};

useEffect(() => {
  refreshProjects();
}, []);

  const refreshActividades = async () => {
    try {
      setActividadesLoading(true);
      const response = await api.get('/actividades/estudiante');
      setActividades(response.data.actividades || []);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setActividades([]);
    } finally {
      setActividadesLoading(false);
    }
  };

  useEffect(() => {
    refreshActividades();
  }, []);

  const refreshEntregas = async () => {
    try {
      setEntregasLoading(true);
      const response = await api.get('/entregas/estudiante');
      setEntregas(response.data.entregas || []);
    } catch (error) {
      console.error('Error cargando entregas:', error);
      setEntregas([]);
    } finally {
      setEntregasLoading(false);
    }
  };

  useEffect(() => {
    refreshEntregas();
  }, []);

  const abrirActividadEnEditor = (actividadId) => {
    navigate(`/editor?activityId=${actividadId}`);
  };

const VerEstadoEntrega = async (entrega) => {


const estadoFormateado = entrega.estado 
    ? entrega.estado.charAt(0).toUpperCase() + entrega.estado.slice(1).toLowerCase()
    : 'Pendiente';


 const formatearTiempoCompleto = (totalSegundos) => {
  if (!totalSegundos || isNaN(totalSegundos)) return '00:00:00';
  
  const segundosEnteros = parseInt(totalSegundos, 10);

  const horas = Math.floor(segundosEnteros / 3600);
  const minutos = Math.floor((segundosEnteros % 3600) / 60);
  const segundos = segundosEnteros % 60;

  const horStr = String(horas).padStart(2, '0');
  const minStr = String(minutos).padStart(2, '0');
  const segStr = String(segundos).padStart(2, '0');

  return `${horStr}:${minStr}:${segStr}`;
};

  const tiempoFormateado = formatearTiempoCompleto(entrega.tiempoEmpleado);

  // Mostrar el SweetAlert
  await Swal.fire({
    title: 'Estado de la Entrega',
    icon: 'info',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#2D3354',
    html: `
      <div style="text-align: left; margin-top: 15px; font-size: 1rem; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
        <div style="display: flex; border-bottom: 1px solid #e5e5e5; padding: 10px 15px;">
          <strong style="width: 140px; color: #555;">Estado:</strong>
          <span>${estadoFormateado}</span>
        </div>
        <div style="display: flex; border-bottom: 1px solid #e5e5e5; padding: 10px 15px; background: #f9f9f9;">
          <strong style="width: 140px; color: #555;">Nota:</strong>
          <span style="font-weight: bold; color: ${entrega.nota  >= 55 ? '#2e7d32' : '#c62828'}">
            ${entrega.nota !== undefined && entrega.nota !== null ? entrega.nota : 'Sin calificar'}
          </span>
        </div>
        <div style="display: flex; border-bottom: 1px solid #e5e5e5; padding: 10px 15px;">
          <strong style="width: 140px; color: #555;">Tiempo Empleado:</strong>
          <span style="font-variant-numeric: tabular-nums;">${tiempoFormateado}</span>
        </div>
        <div style="display: flex; padding: 10px 15px; background: #f9f9f9; flex-direction: column;">
          <strong style="color: #555; margin-bottom: 5px;">Observaciones:</strong>
          <p style="margin: 0; color: #666; font-style: italic; font-size: 0.95rem;">
            ${entrega.observaciones || 'Sin observaciones por el momento.'}
          </p>
        </div>
      </div>
    `,
    didOpen: (popup) => {
      popup.style.boxShadow = '0 6px 0 #e5e5e5';
      popup.style.border = '2px solid #e5e5e5';
      popup.style.borderRadius = '16px';
      popup.style.fontFamily = '"Jersey 20", sans-serif';
    }
  });
};

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setProjectError('Ingresa un nombre para el proyecto.');
      return;
    }
    setProjectError(null);
    setProjectLoading(true);
    try {
      if (editingProjectId) {
        await api.put(`/proyectos/${editingProjectId}`, { title: newProjectName.trim() });
      } else {
        await api.post('/proyectos', { title: newProjectName.trim() });
      }
      setNewProjectName('');
      setEditingProjectId(null);
      setShowNewProjectForm(false);
      await refreshProjects();
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      setProjectError(error.response?.data?.message || 'No se pudo guardar el proyecto. Intenta de nuevo.');
    } finally {
      setProjectLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setNewProjectName(project.title || '');
    setEditingProjectId(project.id);
    setShowNewProjectForm(true);
  };

  const handleCancelEdit = () => {
    setNewProjectName('');
    setEditingProjectId(null);
    setProjectError(null);
    setShowNewProjectForm(false);
  };

  const handleDeleteProject = async (projectId) => {
   const result = await Swal.fire({
  title: 'Eliminar proyecto',
  text: '¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar',
  confirmButtonColor: '#2D3354', 
  didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }});

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.delete(`/proyectos/${projectId}`);
      await refreshProjects();
      Swal.fire({
  title: 'Eliminado',
  text: 'El proyecto ha sido eliminado.',
  icon: 'success',
  confirmButtonColor: '#2D3354', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el proyecto. Intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2D3354',
        didOpen: (popup) => {
          popup.style.boxShadow = '0 6px 0 #e5e5e5';
          popup.style.border = '2px solid #e5e5e5';
          popup.style.borderRadius = '16px';
          popup.style.fontFamily = '"Jersey 20", sans-serif';
        }
      });
    }
  };

  const handleOpenProject = (projectId) => {
    navigate(`/editor?projectId=${projectId}`);
  };

  const handleShareProject = async (project) => {
    try {
      const shareUrl = `${window.location.origin}/compartir?projectId=${project.id}`;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      Swal.fire({ title: 'Enlace copiado', text: 'Pega el enlace para enviarlo al usuario.', icon: 'success', confirmButtonColor: '#2D3354', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  } });
    } catch (error) {
      console.error('Error copiando enlace:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo copiar el enlace.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2D3354',
        didOpen: (popup) => {
          popup.style.boxShadow = '0 6px 0 #e5e5e5';
          popup.style.border = '2px solid #e5e5e5';
          popup.style.borderRadius = '16px';
          popup.style.fontFamily = '"Jersey 20", sans-serif';
        }
      });
    }
  };

  const getProgressStatus = (unit) => {
    const entry = progressEntries.find((item) => item.lessonId === unit.lessonId || item.title === unit.title);
    return entry ? entry.completed : false;
  };

  const nextLessonUnit = allUnits.find((unit) => !getProgressStatus(unit)) || allUnits[allUnits.length - 1];

  function computePercent(units) {
    const completed = units.filter((unit) => getProgressStatus(unit)).length;
    return units.length ? Math.round((completed / units.length) * 100) : 0;
  }

  const percentAlg1 = computePercent(algoritmo1Units);
  const percentAlg2 = computePercent(algoritmo2Units);
  const percentTotal = computePercent(allUnits);

  const displayedUnits = activeModuleTab === 'I' ? algoritmo1Units : algoritmo2Units;
  const displayedModuleTitle = activeModuleTab === 'I' ? 'Algoritmo I' : 'Algoritmo II';

  const totalCompleted = allUnits.filter((unit) => getProgressStatus(unit)).length;
  const totalUnits = algoritmo1Units.length + algoritmo2Units.length;
const daysOfWeek = ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'];

 const getWeeklyCalendar = () => {
  const calendar = [];
  

  let lastActionStr = '';
  if (lastActionDate) {
    lastActionStr = typeof lastActionDate === 'string' 
      ? lastActionDate.split('T')[0] 
      : new Date(lastActionDate).toISOString().split('T')[0];
  }

  const completedDates = new Set();
  if (streakCount > 0 && lastActionStr) {
    const [year, month, day] = lastActionStr.split('-').map(Number);
    
       const anchorDate = new Date(year, month - 1, day);

    for (let i = 0; i < streakCount; i++) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - i);
      
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      
      completedDates.add(`${y}-${m}-${dayNum}`);
    }
  }

  for (let i = 6; i >= 0; i--) {
    const date = new Date(); 
    date.setDate(date.getDate() - i); 
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const dayName = date.toLocaleDateString('es-ES', { 
      weekday: 'short' 
    });
  
    const isToday = i === 0;
    let status = 'pending';
    
    if (completedDates.has(dateString)) {
      status = 'completed';
    } else if (!isToday && dateString < lastActionStr) {
      status = 'failed';
    } else if (!isToday && streakCount === 0) {
      status = 'failed';
    }

    calendar.push({ dayName, isToday, status });
  }
  return calendar;
};

  const calendarDays = getWeeklyCalendar();

  const actividadesFiltradas = (actividades || []).filter((actividad) => {
    const titulo = (actividad?.titulo || '').toLowerCase();
    return titulo.includes(actividadSearchTerm.toLowerCase());
  });
  const totalPaginasActividades = Math.max(1, Math.ceil(actividadesFiltradas.length / itemsPerPage));
  const actividadPageSafe = Math.min(actividadPage, totalPaginasActividades);
  const actividadesPaginadas = actividadesFiltradas.slice(
    (actividadPageSafe - 1) * itemsPerPage,
    actividadPageSafe * itemsPerPage
  );

  const entregasFiltradas = (entregas || []).filter((entrega) => {
    const tituloActividad = (entrega?.actividad?.titulo || '').toLowerCase();
    const matchesSearch = tituloActividad.includes(entregaSearchTerm.toLowerCase());
    const estado = String(entrega?.estado || 'pendiente').toLowerCase();
    const matchesEstado = entregaEstadoFiltro === '' ||
      (entregaEstadoFiltro === 'pendiente' ? estado === 'pendiente' : estado !== 'pendiente');
    return matchesSearch && matchesEstado;
  });
  const totalPaginasEntregas = Math.max(1, Math.ceil(entregasFiltradas.length / itemsPerPage));
  const entregaPageSafe = Math.min(entregaPage, totalPaginasEntregas);
  const entregasPaginadas = entregasFiltradas.slice(
    (entregaPageSafe - 1) * itemsPerPage,
    entregaPageSafe * itemsPerPage
  );

  const renderUnitRow = (unit) => {
    const completed = getProgressStatus(unit);

    return (
      <div key={unit.key} style={styles.moduleCard}>
        <div style={completed ? styles.checkCircle : styles.statusCircle}>
          {completed ? <Check size={16} color="white" /> : <Circle size={16} color="#4f5988" />}
        </div>
        <span>{unit.title}</span>
      </div>
    );
  };

  return (
    <div style={styles.mainWrapper(colors.background, isMobile)}>
      <aside style={styles.sidebar(colors.sidebarBg, isMobile)}>
        <div
          style={{
            fontFamily: "'Jersey 20', sans-serif",
            fontSize: isMobile ? '38px' : '45px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            userSelect: 'none',
            marginLeft: '20px',
            marginBottom: '40px'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ color: '#E5E5E7', WebkitTextStroke: '1px #2D3354' }}>{isMobile ? 'Alg' : 'Algorit'}</span>
            <span style={{ color: '#2D3354' }}>+</span>
          </Link>
        </div>

        <div style={styles.sidebarHeader}>
          <h3 style={styles.sectionTitle}>Proyectos</h3>
          <button
            type="button"
            onClick={() => setShowNewProjectForm((prev) => !prev)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f5988' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {showNewProjectForm && (
          <div style={styles.newProjectForm}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder={editingProjectId ? 'Editar nombre del proyecto' : 'Nuevo proyecto'}
              style={styles.newProjectInput}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={projectLoading}
                style={styles.createProjectBtn}
              >
                {editingProjectId ? 'Guardar' : 'Crear'}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={styles.cancelProjectBtn}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        <div style={styles.projectList}>
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} style={styles.projectItemRow}>
                <p
                  style={styles.projectItem}
                  onClick={() => handleOpenProject(project.id)}
                >
                  {project.title}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleEditProject(project)}
                    style={styles.editProjectBtn}
                    title="Editar nombre"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    style={styles.deleteProjectBtn}
                    title="Eliminar proyecto"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareProject(project)}
                    style={styles.shareProjectBtn}
                    title="Compartir proyecto"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={styles.noProjectsText}>Aún no tienes proyectos. Crea uno nuevo.</p>
          )}
          {projectError && <p style={styles.projectError}>{projectError}</p>}
        </div>

        <div style={styles.userProfile}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/perfil')} title="Ver perfil">
            <img src={profileAvatar} alt="Perfil" crossOrigin="anonymous" style={styles.avatar} />
            <span style={styles.username}>{user?.username}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={styles.logoutBtn}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main style={styles.contentArea(isMobile)}>
        <header style={styles.topNav(isMobile)}>
          <div style={styles.tabs}>
            <span
              onClick={() => setMainTab('lecciones')}
              style={mainTab === 'lecciones' ? styles.activeTab : styles.inactiveTab}
            >
              Lecciones
            </span>
            <span
              onClick={() => setMainTab('actividades')}
              style={mainTab === 'actividades' ? styles.activeTab : styles.inactiveTab}
            >
              Actividades y Estadísticas
            </span>
          </div>
        </header>

        <div style={styles.dashboardGrid(isMobile)}>
          {/* Left column: muestra progreso o actividades según la pestaña activa */}
          {mainTab === 'lecciones' ? (
            <div style={styles.progressMap(isMobile)}>
            <div style={styles.mapHeader}>
              <div>
                <h2 style={styles.mapTitle}>Plan de Evaluación</h2>
                <p style={styles.mapSubtitle}>Progreso total de Algoritmos I y II</p>
              </div>
              <div style={styles.overallBadge}>{percentTotal}%</div>
            </div>

            <div style={styles.progressCards}>
              <div style={styles.progressCard}>
                <div style={styles.progressCardTitle}>Algoritmo I</div>
                <div style={styles.progressBarBackground}>
                  <div style={{ ...styles.progressBarFill, width: `${percentAlg1}%` }} />
                </div>
                <span style={styles.progressText}>{percentAlg1}% completado</span>
              </div>
              <div style={styles.progressCard}>
                <div style={styles.progressCardTitle}>Algoritmo II</div>
                <div style={styles.progressBarBackground}>
                  <div style={{ ...styles.progressBarFill, width: `${percentAlg2}%` }} />
                </div>
                <span style={styles.progressText}>{percentAlg2}% completado</span>
              </div>
            </div>

            <div style={styles.summaryBox}>
              <span style={styles.summaryLabel}>Lecciones completadas</span>
              <strong style={styles.summaryValue}>{totalCompleted}/{totalUnits}</strong>
            </div>

          

            <div style={styles.startLessonWrapper}>
              <div>
                <p style={styles.startLessonLabel}>Última lección disponible</p>
                <p style={styles.startLessonSubtitle}>{nextLessonUnit.title}</p>
              </div>
              <button
                type="button"
                style={styles.startLessonBtn(isMobile)}
                onClick={() => navigate(`/leccion/${nextLessonUnit.lessonId}`)}
              >
                Iniciar lección
              </button>
            </div>
            </div>
          ) : (
            
            <div style={styles.progressMap(isMobile)}>
              <div>
                <h2 style={styles.mapTitle}>Estadísticas</h2>
              </div>
              <div style={styles.streakCard}>
                <div style={styles.streakBox}>
                  <span style={styles.summaryLabel}>Racha diaria</span> <br />
                  <strong style={styles.summaryValue}>
                    <Zap
                      size={30}
                      strokeWidth={2.5}
                      fill={streakCount > 0 ? '#4f5988' : 'none'}
                      color="#4f5988"
                      style={{ marginRight: '6px' }}
                    /> {streakCount} día{streakCount === 1 ? '' : 's'}
                  </strong>
                  <br />
                  {lastActionDate && (
                    <span style={styles.streakHint}>
                      Última acción: {new Date(lastActionDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                    </span>
                  )}
                </div>

                <hr style={styles.divider} />

                <div style={styles.calendarContainer}>
                  {calendarDays.map((day, index) => (
                    <div key={index} style={styles.dayColumn}>
                      <span style={{
                        ...styles.dayLabel,
                        color: day.isToday ? '#4f5988' : '#afafaf',
                        fontWeight: day.isToday ? 'bold' : 'normal'
                      }}>
                        {day.dayName}
                      </span>

                      <div style={{
                        ...styles.circle,
                        ...styles[day.status]
                      }}>
                        {day.status === 'completed' && '✓'}
                        {day.status === 'failed' && '×'}
                        {day.status === 'pending' && ''}
                      </div>
                    </div>
                  ))}
                </div>

                <p style={styles.footerText}>
                  Si no practicas por un día, volverá a 0.
                </p>
              </div>

              <div style={{ marginTop: '8px' }}>
                <LessonCharts entries={progressEntries} units={allUnits} colors={colors} isMobile={isMobile} actividades={actividades} // 👈 Agrega esto
  entregas={entregas} />
              </div>
            </div>
          )}
            {errorLoading && <div style={styles.errorMessage}>{errorLoading}</div>}
            {loading && <div style={styles.loadingMessage}>Cargando progreso...</div>}
     {mainTab === 'lecciones' && (
  <div style={styles.moduleListWrapper}>
    <div style={styles.moduleSection}>
      <div style={styles.moduleHeader}>
        <h1 style={styles.mainHeading}>{displayedModuleTitle}</h1>
        <div style={styles.moduleTabs}>
          <button
            type="button"
            onClick={() => setActiveModuleTab('I')}
            style={activeModuleTab === 'I' ? styles.moduleTabButtonActive : styles.moduleTabButton}
          >
            Algoritmo I
          </button>
          <button
            type="button"
            onClick={() => setActiveModuleTab('II')}
            style={activeModuleTab === 'II' ? styles.moduleTabButtonActive : styles.moduleTabButton}
          >
            Algoritmo II
          </button>
        </div>
      </div>
      {displayedUnits.map(renderUnitRow)}
    </div>
  </div>
)}

{mainTab === 'actividades' && (
  
  <div style={styles.sidebarColumn}>
  
  
  <div style={styles.moduleListWrapper}>
    
    

    <div style={styles.moduleSection}>
            <div style={styles.moduleHeader}>

      <h2 style={styles.mainHeading}>Centro de actividades</h2>
      </div>
      <div>
        <div style={styles.filterRow}>
          <div style={styles.filterInputWrapper}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar actividad..."
              value={actividadSearchTerm}
              onChange={(e) => { setActividadSearchTerm(e.target.value); setActividadPage(1); }}
              style={styles.filterInput}
            />
          </div>
        </div>
        {actividadesLoading ? (
          <p style={styles.emptyStateText}>Cargando actividades...</p>
        ) : actividadesFiltradas.length > 0 ? (
          <>
            {actividadesPaginadas.map((actividad) => (
              <div key={actividad.id} style={styles.moduleCard}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  width: '100%',
                  padding: '8px 4px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...styles.activityTitle, fontSize: '16px', fontWeight: '600', margin: 0 }}>{actividad.titulo}</h4>
                  </div>
                  {!entregas.some(entrega => entrega.actividadId === actividad.id) ? (
                    <button 
                      type="button"
                      style={{ 
                        display: 'inline-block',
                        width: 'auto',
                        backgroundColor: '#2D3554',
                        color: '#ffffff',
                        fontSize: '14px', 
                        fontFamily: "'Jersey 20', sans-serif",        
                        padding: '6px 14px',       
                        borderRadius: '6px',      
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        boxShadow: '0 4px 0 #1e2238', 
  border: '2px solid #2D3354',
                      }}
                      onClick={() => abrirActividadEnEditor(actividad.id)}
                    >
                      Iniciar
                    </button>
                  ) : (
                    <span style={{ 
                      fontSize: '14px', 
                      fontFamily: "'Jersey 20', sans-serif", 
                      color: '#2e7d32', 
                      fontWeight: 'bold' 
                    }}>
                      ✓ Entregado
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div style={styles.paginationRow}>
              <button type="button" onClick={() => setActividadPage((prev) => Math.max(1, prev - 1))} disabled={actividadPageSafe === 1} style={styles.paginationButton(actividadPageSafe === 1)}>
                <ChevronLeft size={16} />
              </button>
              <span style={styles.paginationInfo}>Página {actividadPageSafe} de {totalPaginasActividades}</span>
              <button type="button" onClick={() => setActividadPage((prev) => Math.min(totalPaginasActividades, prev + 1))} disabled={actividadPageSafe === totalPaginasActividades} style={styles.paginationButton(actividadPageSafe === totalPaginasActividades)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <p style={styles.emptyStateText}>No se encontraron actividades con ese nombre.</p>
        )}
      </div>
    </div>

  </div>
<div style={styles.moduleListWrapper}>
    
    

    <div style={styles.moduleSection}>
            <div style={styles.moduleHeader}>

      <h2 style={styles.mainHeading}>Tus entregas</h2>
      </div>
      <div>
        <div style={styles.filterRow}>
          <div style={styles.filterInputWrapper}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Buscar por actividad..."
              value={entregaSearchTerm}
              onChange={(e) => { setEntregaSearchTerm(e.target.value); setEntregaPage(1); }}
              style={styles.filterInput}
            />
          </div>
          <select
            value={entregaEstadoFiltro}
            onChange={(e) => { setEntregaEstadoFiltro(e.target.value); setEntregaPage(1); }}
            style={styles.filterSelect}
          >
            <option value="">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="Calificadas">Calificadas</option>
          </select>
        </div>
        {entregasLoading ? (
          <p style={styles.emptyStateText}>Cargando tus entregas...</p>
        ) : entregasFiltradas.length > 0 ? (
          <>
            {entregasPaginadas.map((entrega) => (
              <div key={entrega.id} style={styles.moduleCard}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  width: '100%',
                  padding: '8px 4px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ ...styles.activityTitle, fontSize: '16px', fontWeight: '600', margin: 0 }}>{entrega.actividad?.titulo || 'Actividad'}</h4>
                  </div>
                  <button 
                    type="button"
                    style={{ 
                      display: 'inline-block',
                      width: 'auto',
                      backgroundColor: '#2D3554',
                      color: '#ffffff',
                      fontSize: '14px', 
                      fontFamily: "'Jersey 20', sans-serif",        
                      padding: '6px 14px',       
                      borderRadius: '6px',      
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onClick={() => VerEstadoEntrega(entrega)}
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))}
            <div style={styles.paginationRow}>
              <button type="button" onClick={() => setEntregaPage((prev) => Math.max(1, prev - 1))} disabled={entregaPageSafe === 1} style={styles.paginationButton(entregaPageSafe === 1)}>
                <ChevronLeft size={16} />
              </button>
              <span style={styles.paginationInfo}>Página {entregaPageSafe} de {totalPaginasEntregas}</span>
              <button type="button" onClick={() => setEntregaPage((prev) => Math.min(totalPaginasEntregas, prev + 1))} disabled={entregaPageSafe === totalPaginasEntregas} style={styles.paginationButton(entregaPageSafe === totalPaginasEntregas)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <p style={styles.emptyStateText}>No se encontraron entregas con esos filtros.</p>
        )}
      </div>
    </div>

  </div>
  </div>



)}
          </div>
      </main>
    </div>
  );
};

const styles = {
mainWrapper: (bg, isMobile) => ({
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  minHeight: '100vh',
  backgroundColor: bg,
  fontFamily: "'Jersey 20', sans-serif",
  paddingLeft: isMobile ? '0' : '260px', 
}),
  sidebar: (bg, isMobile) => ({
    width: isMobile ? '100%' : '260px',
    backgroundColor: bg,
    borderRight: isMobile ? 'none' : '1px solid #E0E0E0',
    borderBottom: isMobile ? '1px solid #E0E0E0' : 'none',
    display: 'flex',
    flexDirection: 'column',
    padding: isMobile ? '16px 0' : '20px 0',
height: isMobile ? '100%' : '100vh',
   zIndex: 1000,
   position: isMobile ? 'relative' : 'fixed', 
  top: 0,
  left: 0,
   boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5'
  }),
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    marginBottom: '30px',
    alignItems: 'center',
    color: '#666'
  },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold' },
  projectList: { flex: 1, padding: '0 20px' },
  newProjectForm: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px 15px' },
  newProjectInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '14px'
  },
  createProjectBtn: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#2D3554',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer'
  },
  projectItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  projectItem: { color: '#2D3554', marginBottom: 0, fontSize: '16px', cursor: 'pointer', flex: 1, fontWeight: '600' },
  deleteProjectBtn: {
    border: 'none',
    background: 'transparent',
    color: '#e11d48',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1,
    padding: 0
  },
  editProjectBtn: {
    border: 'none',
    background: 'transparent',
    color: '#2D3554',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareProjectBtn: {
    border: 'none',
    background: 'transparent',
    color: '#2D3554',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelProjectBtn: {
    border: '1px solid #d1d5db',
    background: 'white',
    color: '#475569',
    borderRadius: '12px',
    padding: '10px 14px',
    cursor: 'pointer'
  },
  noProjectsText: { color: '#64748b', fontSize: '16px', margin: '0 0 10px 0' },
  projectError: { color: '#b91c1c', fontSize: '16px', marginTop: '6px' },
  userProfile: {
    padding: '20px',
    borderTop: '1px solid #E0E0E0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  },
  avatar: { borderRadius: '50%', width: '35px', height: '35px' },
  logoutBtn: {
    border: 'none',
    background: 'transparent',
    color: '#5D3354',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  username: { fontSize: '14px', fontWeight: 'bold', color: '#2D3354' },
  contentArea: (isMobile) => ({
    flex: 1,
    margin: isMobile ? '10px' : '15px',
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
     fontFamily: "'Jersey 20', sans-serif",
  }),
  topNav: (isMobile) => ({
    padding: isMobile ? '12px 18px' : '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #F0F0F0'
  }),
  tabs: { display: 'flex', gap: '25px' },
  activeTab: { fontWeight: 'bold', color: '#2D3354', borderBottom: '2px solid #2D3354', paddingBottom: '5px' },
  inactiveTab: { color: '#AAA', cursor: 'pointer' },
  settingsBtn: { background: '#2D3354', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' },
  dashboardGrid: (isMobile) => ({
    flex: 1,
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
    alignItems: 'start',
    padding: isMobile ? '15px' : '40px',
    gap: '30px',
  }),
  progressMap: (isMobile) => ({
    backgroundColor: '#F7F8FC',
    borderRadius: '24px',
    padding: isMobile ? '20px' : '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minHeight: isMobile ? 'auto' : '540px',
     boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px'
  }),
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px'
  },
  mapTitle: { margin: 0, fontSize: '28px', color: '#2D3354' },
  mapSubtitle: { margin: 0, color: '#666', fontSize: '16px' },
  overallBadge: {
    background: '#2D3354',
    color: 'white',
    borderRadius: '20px',
    padding: '12px 20px',
    fontWeight: '700',
    fontSize: '16px'
  },
  progressCards: { display: 'grid', gap: '18px' },
  progressCard: {
    background: '#FFFFFF',
    borderRadius: '18px',
    padding: '18px 22px',
    boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px'
  },
  progressCardTitle: { fontSize: '16px', fontWeight: '700', color: '#2D3354', marginBottom: '12px' },
  progressBarBackground: { width: '100%', height: '12px', borderRadius: '999px', background: '#E9EAF3', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '999px', background: '#4f5988' },
  progressText: { fontSize: '16px', color: '#666', marginTop: '10px', display: 'block' },
  summaryBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    background: '#2D3354',
    color: 'white',
    borderRadius: '18px'
  },
  summaryLabel: { fontSize: '16px' },
  summaryValue: { fontSize: '24px' },
  loadingMessage: { color: '#4f5988', fontWeight: '600' },
  errorMessage: { color: '#B00020', fontWeight: '600' },
  moduleListWrapper: { display: 'flex', flexDirection: 'column', gap: '26px',  boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px'},
  moduleSection: { backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '24px', boxShadow: '0 12px 30px rgba(0,0,0,0.05)' },
  moduleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' },
  moduleTabs: { display: 'flex', gap: '10px', flexWrap: 'wrap',  },
  moduleTabButton: { padding: '10px 16px', borderRadius: '14px', border: '1px solid #d1d5db', backgroundColor: '#f8fafc', color: '#475569', cursor: 'pointer', fontFamily: "'Jersey 20', sans-serif", fontWeight: '600' },
  moduleTabButtonActive: { padding: '10px 16px', borderRadius: '14px', border: '1px solid #4f5988', backgroundColor: '#eef2ff', color: '#2D3354', cursor: 'pointer', fontWeight: '700', fontFamily: "'Jersey 20', sans-serif" },
  mainHeading: { fontSize: '28px', color: '#2D3354', marginBottom: '0', fontFamily: "'Jersey 20', sans-serif" },
  startLessonWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '18px',
    padding: '18px 22px',
    boxShadow: '0 10px 26px rgba(0,0,0,0.04)',
    gap: '18px',
    flexWrap: 'wrap',
  boxShadow: '0 4px 0 #e5e5e5', 
  border: '2px solid #e5e5e5',
    borderRadius: '16px'
  },
  startLessonLabel: { margin: 0, fontSize: '16px', color: '#666', fontWeight: '600' },
  startLessonSubtitle: { margin: '6px 0 0', color: '#2D3354', fontSize: '16px', fontWeight: '700' },
  startLessonBtn: (isMobile) => ({
    border: 'none',
    borderRadius: '16px',
    padding: '12px 26px',
    background: '#2D3354',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '170px',
    display: isMobile ? 'block' : 'inline-block',
    margin: isMobile ? '0 auto' : '0',
    boxShadow: '0 4px 0 #1e2238', 
  border: '2px solid #2D3354',
    borderRadius: '16px'
  }),
  moduleCard: {
    backgroundColor: '#F5F6FB',
    padding: '16px 18px',
    borderRadius: '16px',
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    color: '#2D3354',
    fontWeight: '600',  boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px'
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  filterInputWrapper: {
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#F5F6FB',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '8px 10px'
  },
  filterInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontFamily: "'Jersey 20', sans-serif"
  },
  filterSelect: {
    minWidth: '140px',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '8px 10px',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontFamily: "'Jersey 20', sans-serif"
  },
  paginationRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '12px'
  },
  paginationButton: (disabled) => ({
    border: 'none',
    borderRadius: '8px',
    padding: '6px 10px',
    backgroundColor: disabled ? '#cbd5e1' : '#2D3554',
    color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),
  paginationInfo: {
    color: '#475569',
    fontSize: '14px'
  },
  checkCircle: { 
    background: '#4f5988', 
    borderRadius: '50%', 
    width: '32px',      
    height: '32px',      
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexShrink: 0,
  },
 statusCircle: {
    border: '2px solid #4f5988',
    borderRadius: '50%', 
    width: '32px',      
    height: '32px',     
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  streakCard: {
    fontFamily: '"Jersey 20", sans-serif',
    border: '2px solid #e5e5e5',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '360px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 0 #e5e5e5',
    width: '100%',
    display: 'block',
    margin: '0 auto'
  },
  streakBox: {
    textAlign: 'left',
    marginBottom: '16px',
  },
  streakHint: {
    fontSize: '16px',
    color: '#afafaf',
  },
  divider: {
    border: '0',
    borderTop: '2px solid #e5e5e5',
    margin: '16px 0',
  },
  calendarContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  dayColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  dayLabel: {
    fontSize: '16px',
    fontWeight: '700',
  },
  circle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  completed: {
    backgroundColor: '#4f5988',
    color: '#ffffff',
  },
  failed: {
    backgroundColor: '#afafaf',
    color: '#ffffff',
  },
  pending: {
    backgroundColor: '#e5e5e5',
    color: 'transparent',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#4b4b4b',
    fontWeight: '600',
    margin: '0',
  },
  sidebarColumn: {
    flex: 1,              
    display: 'flex',
    flexDirection: 'column',
    gap: '24px', 
  },
};
export default Inicio;