import { useState, useEffect } from 'react';
import { Plus, Settings, Check, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inicio = ({ user}) => {
    const colors = {
        primary: '#2D3354',
        background: '#F0F2F5',
        sidebarBg: '#F8F9FA',
        cardBg: '#FFFFFF',
        accent: '#5D69A1'
    };
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    return (
        <div style={styles.mainWrapper(colors.background)}>
             
            {/* Sidebar Izquierda */}
            <aside style={styles.sidebar(colors.sidebarBg)}>
                <div style={{ 
                              fontFamily: "'Jersey 20', sans-serif", 
                              fontSize: isMobile ? '38px' : '45px', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              userSelect: 'none',
                              marginLeft: '20px',
                              marginBottom: '40px'
                            }}>
                             <Link to="/" style={{textDecoration: 'none'}}>
                              <span style={{ 
                                color: '#E5E5E7', 
                                WebkitTextStroke: '1px #2D3354' 
                              }}>
                                {isMobile ? 'Alg' : 'Algorit'}
                              </span>
                              <span style={{ 
                                color: '#2D3354'
                              }}>
                                +
                              </span>
                              </Link>
                            </div>
                <div style={styles.sidebarHeader}>
                    <h3 style={styles.sectionTitle}>Proyectos</h3>
                    <Plus size={20} style={{ cursor: 'pointer' }} />
                </div>
                
                <div style={styles.projectList}>
                    <p style={styles.projectItem}>GustaPan</p>
                    <p style={styles.projectItem}>jOneFootball</p>
                </div>

                <div style={styles.userProfile}>
                    <img 
                        src="https://via.placeholder.com/40" 
                        alt="Profile" 
                        style={styles.avatar} 
                    />
                    <span style={styles.username}>{user?.username}</span>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main style={styles.contentArea}>
                <header style={styles.topNav}>
                    <div style={styles.tabs}>
                        <span style={styles.activeTab}>Dashboard</span>
                        <span style={styles.inactiveTab}>Niveles</span>
                    </div>
                    <button style={styles.settingsBtn}><Settings size={18} /></button>
                </header>

                <div style={styles.dashboardGrid}>
                    {/* El Mapa de Progreso (SVG/Diagrama) */}
                    <div style={styles.progressMap}>
                        <div style={styles.nodeActive}>
                            Principios básicos <span style={styles.badge}>50%</span>
                        </div>
                        <div style={styles.connector}>
                            <div style={styles.lineVertical}></div>
                            <div style={styles.nodeCheck}><Check size={20} color="white" /></div>
                            <div style={styles.lineHorizontal}></div>
                            <div style={styles.nodeCheck}><Check size={20} color="white" /></div>
                            <div style={styles.lineVerticalShort}></div>
                            <div style={styles.nodePlay}><Play size={24} color="white" fill="white" /></div>
                        </div>
                    </div>

                    {/* Lista de Módulos */}
                    <div style={styles.moduleList}>
                        <h1 style={styles.mainHeading}>Algoritmos I</h1>
                        <div style={styles.moduleCard}>
                            <div style={styles.checkCircle}><Check size={16} color="white" /></div>
                            <span>Principios básicos</span>
                        </div>
                        <div style={styles.moduleCard}>
                            <div style={styles.checkCircle}><Check size={16} color="white" /></div>
                            <span>Estructuras condicionales</span>
                        </div>
                        <div style={styles.moduleCard}>
                            <div style={styles.checkCircle}><Check size={16} color="white"/></div>
                            <span>Estructuras repetitivas</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
const styles = {
    mainWrapper: (bg) => ({
        display: 'flex',
        height: '100vh',
        backgroundColor: bg,
        fontFamily: 'Inter, sans-serif'
    }),
    sidebar: (bg) => ({
        width: '240px',
        backgroundColor: bg,
        borderRight: '1px solid #E0E0E0',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0'
    }),
    sidebarHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 20px',
        marginBottom: '30px',
        alignItems: 'center',
        color: '#666'
    },
    sectionTitle: { fontSize: '14px', fontWeight: 'bold' },
    projectList: { flex: 1, padding: '0 20px' },
    projectItem: { color: '#888', marginBottom: '15px', fontSize: '14px', cursor: 'pointer' },
    userProfile: {
        padding: '20px',
        borderTop: '1px solid #E0E0E0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    avatar: { borderRadius: '50%', width: '35px', height: '35px' },
    username: { fontSize: '14px', fontWeight: 'bold', color: '#2D3354' },
    contentArea: {
        flex: 1,
        margin: '15px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    topNav: {
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #F0F0F0'
    },
    tabs: { display: 'flex', gap: '25px' },
    activeTab: { fontWeight: 'bold', color: '#2D3354', borderBottom: '2px solid #2D3354', paddingBottom: '5px' },
    inactiveTab: { color: '#AAA', cursor: 'pointer' },
    settingsBtn: { background: '#2D3354', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' },
    dashboardGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        alignItems: 'center',
        padding: '40px'
    },
    mainHeading: { fontSize: '42px', color: '#2D3354', marginBottom: '30px', fontStyle: 'italic', fontFamily: 'serif' },
    moduleCard: {
        backgroundColor: '#FFFFFF',
        padding: '15px 25px',
        borderRadius: '15px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        color: '#2D3354',
        fontWeight: '500'
    },
    checkCircle: { background: '#5D69A1', borderRadius: '8px', padding: '4px' },
    // Estilos del Mapa Visual (Representación simplificada)
    progressMap: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    nodeActive: {
        background: '#434D82',
        color: 'white',
        padding: '12px 25px',
        borderRadius: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
    },
    badge: { background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' },
    nodeCheck: { background: '#434D82', borderRadius: '50%', padding: '10px', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
    nodePlay: { background: '#434D82', borderRadius: '20px', padding: '15px 25px', border: '4px solid white' },
    lineVertical: { width: '4px', height: '40px', background: '#434D82' },
    lineHorizontal: { width: '60px', height: '4px', background: '#434D82' }
};
export default Inicio;