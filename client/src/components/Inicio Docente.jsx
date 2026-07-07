import { useState, useEffect } from 'react';
import { Plus, Settings, Check, Circle, Share2, Edit3, LogOut, Zap, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';import { Link, useNavigate } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [actividades, setActividades] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [enunciado, setEnunciado] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [actividadSearchTerm, setActividadSearchTerm] = useState('');
  const [actividadPage, setActividadPage] = useState(1);
  
  const [entregaSearchTerm, setEntregaSearchTerm] = useState('');
  const [entregaEstadoFiltro, setEntregaEstadoFiltro] = useState('');
  const [entregaActividadFiltro, setEntregaActividadFiltro] = useState('');
  const [entregaPage, setEntregaPage] = useState(1);
  
  const itemsPerPage = 5; // Límite de elementos por página
  const navigate = useNavigate();

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

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [actividadesRes, entregasRes] = await Promise.all([
        api.get('/actividades'),
        api.get('/entregas')
      ]);
      setActividades(actividadesRes.data.actividades || []);
      setEntregas(entregasRes.data.entregas || []);
    } catch (error) {
      console.error('Error cargando datos del docente:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las actividades o entregas',
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
    } finally {
      setLoading(false);
    }
  };

  // LÓGICA: Filtrado y Paginación de Actividades Creadas
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

  // LÓGICA: Filtrado y Paginación de Entregas Recibidas
  const entregasFiltradas = (entregas || []).filter((entrega) => {
    // 1. Filtro por nombre de actividad (Buscador manual)
    const tituloActividad = (entrega?.actividad?.titulo || '').toLowerCase();
    const matchesSearch = tituloActividad.includes(entregaSearchTerm.toLowerCase());
    
    // 2. Filtro rápido por estado (Pendiente vs Calificado)
    const estado = String(entrega?.estado || 'pendiente').toLowerCase();
    const matchesEstado = entregaEstadoFiltro === '' || 
      (entregaEstadoFiltro === 'pendiente' ? estado === 'pendiente' : estado === 'calificado');
      
    // 3. Filtro de selección por Actividad específica
    const matchesActividadSelect = entregaActividadFiltro === '' || String(entrega?.actividadId) === entregaActividadFiltro;

    return matchesSearch && matchesEstado && matchesActividadSelect;
  });
  const totalPaginasEntregas = Math.max(1, Math.ceil(entregasFiltradas.length / itemsPerPage));
  const entregaPageSafe = Math.min(entregaPage, totalPaginasEntregas);
  const entregasPaginadas = entregasFiltradas.slice(
    (entregaPageSafe - 1) * itemsPerPage,
    entregaPageSafe * itemsPerPage
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setTitulo('');
    setEnunciado('');
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!titulo.trim() || !enunciado.trim()) {
      Swal.fire({
        title: 'Completa los campos',
        text: 'Título y enunciado son obligatorios',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2D3354',
        didOpen: (popup) => {
          popup.style.boxShadow = '0 6px 0 #e5e5e5';
          popup.style.border = '2px solid #e5e5e5';
          popup.style.borderRadius = '16px';
          popup.style.fontFamily = '"Jersey 20", sans-serif';
        }
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/actividades/${editingId}`, { titulo, enunciado });
        Swal.fire({
  title: 'Actividad actualizada',
  text: 'Los cambios se han guardado correctamente.',
  icon: 'success',
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#2D3354',
  didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});
      } else {
        await api.post('/actividades', { titulo, enunciado });
        Swal.fire({
  title: 'Actividad creada',
  text: 'La actividad se ha registrado correctamente.',
  icon: 'success',
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
      limpiarFormulario();
      await cargarDatos();
    } catch (error) {
      console.error('Error guardando actividad:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo guardar la actividad',
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditar = (actividad) => {
    setEditingId(actividad.id);
    setTitulo(actividad.titulo || '');
    setEnunciado(actividad.enunciado || '');
  };

  const handleEliminar = async (id) => {
   const result = await Swal.fire({
  title: '¿Eliminar actividad?',
  text: 'Esta acción no se puede deshacer.',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Sí, eliminar',
  cancelButtonText: 'Cancelar',
  confirmButtonColor: '#2D3354', 
  cancelButtonColor: '#7a7a7a',
  didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/actividades/${id}`);
      await cargarDatos();
      if (editingId === id) limpiarFormulario();
     Swal.fire({
  title: 'Actividad eliminada',
  text: 'La actividad ha sido borrada permanentemente.',
  icon: 'success',
  confirmButtonText: 'Aceptar',
  confirmButtonColor: '#2D3354',
  didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo eliminar la actividad',
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

  const handleRevisar = (entrega) => {
    navigate('/editor/revision', {
      state: {
        reviewData: {
          nombre: entrega.estudiante?.name || '',
          apellido: entrega.estudiante?.lastname || '',
          tiempoEmpleado: entrega.tiempoEmpleado ?? 0,
          codigoEnviado: entrega.codigoEnviado || '',
          entregaId: entrega.id,
          actividadTitulo: entrega.actividad?.titulo || 'Actividad'
        }
      }
    });
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
      
        <div style={styles.dashboardGrid(isMobile)}>
         <div style={styles.progressMap(isMobile)}>
          <h2 style={styles.mainHeading}>{editingId ? 'Editar actividad' : 'Crear actividad'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Título"
                required
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <textarea
                placeholder="Enunciado"
                required
                value={enunciado}
                onChange={(event) => setEnunciado(event.target.value)}
                style={{ ...styles.input, minWidth: '100%', minHeight: '120px', resize: 'vertical' }}
              />
            </div>
<div style={{ 
  display: 'flex', 
  gap: '10px', 
  flexWrap: 'wrap', 
  justifyContent: 'center',
  margin: '0 auto',        
  maxWidth: 'max-content' 
}}>              <button type="submit" style={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Guardando...' : editingId ? 'Actualizar actividad' : 'Guardar actividad'}
              </button>
              {editingId ? (
                <button type="button" onClick={limpiarFormulario} style={styles.secondaryButton}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
         </div>


         <div style={styles.sidebarColumn}>
         <div style={styles.moduleListWrapper}>
          {/* SECCIÓN DE ACTIVIDADES */}
<div style={styles.moduleSection}>
  <div style={styles.moduleHeader}>
    <h2 style={styles.mainHeading}>Actividades</h2>
  </div>
  <div>
    {/* Buscador de Actividades */}
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

    {loading ? (
      <p style={styles.emptyStateText}>Cargando actividades...</p>
    ) : actividadesFiltradas.length > 0 ? (
      <>
        {actividadesPaginadas.map((actividad) => (
          <div key={actividad.id} style={styles.moduleCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ ...styles.activityTitle, fontSize: '16px', fontWeight: '600', margin: 0 }}>{actividad.titulo}</h4>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{actividad.enunciado}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => handleEditar(actividad)} style={styles.iconButton} title="Editar actividad">
                  <Edit3 size={16} />
                </button>
                <button type="button" onClick={() => handleEliminar(actividad.id)} style={styles.iconButtonDanger} title="Eliminar actividad">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Paginación de Actividades */}
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
          {/* SECCIÓN DE ENTREGAS */}
<div style={styles.moduleSection}>
  <div style={styles.moduleHeader}>
    <h2 style={styles.mainHeading}>Entregas</h2>
  </div>
  <div>
    {/* Fila de Filtros Avanzados para el Docente */}
    <div style={styles.filterRow}>
      {/* Buscador de entregas por título de actividad */}
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

      {/* Select de Filtrado por Actividad Específica */}
      <select
        value={entregaActividadFiltro}
        onChange={(e) => { setEntregaActividadFiltro(e.target.value); setEntregaPage(1); }}
        style={styles.filterSelect}
      >
        <option value="">Todas las actividades</option>
        {actividades.map(act => (
          <option key={act.id} value={String(act.id)}>{act.titulo}</option>
        ))}
      </select>

      {/* Select de Filtrado por Estado */}
      <select
        value={entregaEstadoFiltro}
        onChange={(e) => { setEntregaEstadoFiltro(e.target.value); setEntregaPage(1); }}
        style={styles.filterSelect}
      >
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendientes</option>
        <option value="calificado">Calificadas</option>
      </select>
    </div>

    {loading ? (
      <p style={styles.emptyStateText}>Cargando entregas...</p>
    ) : entregasFiltradas.length > 0 ? (
      <>
        {entregasPaginadas.map((entrega) => (
          <div key={entrega.id} style={styles.moduleCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ ...styles.activityTitle, fontSize: '16px', fontWeight: '600', margin: 0 }}>{entrega.actividad?.titulo || 'Actividad'}</h4>
                <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>
                  {entrega.estudiante ? `${entrega.estudiante.name} ${entrega.estudiante.lastname} (@${entrega.estudiante.username})` : 'Estudiante'}
                </p>
                <p style={{ margin: '4px 0 0', color: '#4f5988', fontSize: '13px' }}>Estado: {entrega.estado || 'pendiente'}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={styles.badge}>{entrega.nota ?? 'Sin calificar'}</span>
                {!entrega.nota && (
                  <button type="button" onClick={() => handleRevisar(entrega)} style={styles.revisionButton}>
                    Revisar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Paginación de Entregas */}
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
  revisionButton: {
    backgroundColor: '#2D3354',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '7px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  sectionTitle: { fontSize: '16px', fontWeight: 'bold' },
  userProfile: {
    padding: '20px',
    borderTop: '1px solid #E0E0E0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: 'auto'
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
    sidebarColumn: {
    flex: 1,              
    display: 'flex',
    flexDirection: 'column',
    gap: '24px', 
  },
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
    background: '#4f5988',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '170px',
    display: isMobile ? 'block' : 'inline-block',
    margin: isMobile ? '0 auto' : '0'
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
   input: {
        width: '100%', padding: '12px 0', backgroundColor: 'transparent',
        border: 'none', outline: 'none', fontSize: '16px', fontFamily: "'Jersey 20', sans-serif"
    },
     inputWrapper: {
        display: 'flex', alignItems: 'center', backgroundColor: '#F0F2F5',
        borderRadius: '8px', padding: '0 12px'
    },
  primaryButton: {
    backgroundColor: '#2D3554',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontFamily: "'Jersey 20', sans-serif",
    fontSize: '15px'
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    color: '#2D3554',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontFamily: "'Jersey 20', sans-serif",
    fontSize: '15px'
  },
  iconButton: {
    border: '1px solid #D1D5DB',
    backgroundColor: '#FFFFFF',
    color: '#2D3554',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer'
  },
  iconButtonDanger: {
    border: '1px solid #FECACA',
    backgroundColor: '#FEF2F2',
    color: '#B91C1C',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer'
  },
  badge: {
    backgroundColor: '#EEF2FF',
    color: '#4f5988',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '13px',
    fontWeight: '700'
  },
  emptyStateText: {
    color: '#666',
    fontSize: '15px',
    margin: 0
  },
  activityTitle: {
    color: '#2D3354'
  },
  filterRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    width: '100%'
  },
  filterInputWrapper: {
    flex: 1,
    minWidth: '200px',
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
    minWidth: '150px',
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
};
export default Inicio;