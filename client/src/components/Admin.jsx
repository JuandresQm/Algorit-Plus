import React, { useState, useEffect } from 'react';
import UsersTable from './UsersTable';
const LogsTable = React.lazy(() => import('./LogsTable'));
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Admin = ({onLogout}) => {
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const navigate = useNavigate();
const [activeTab, setActiveTab] = useState(localStorage.getItem('adminTab') || 'users');

useEffect(() => {
  localStorage.setItem('adminTab', activeTab);
}, [activeTab]);
  const colors = {
    primary: '#2D3354',
    sidebar: '#E5E5E7',
    content: '#EEEEEE',
    white: '#FFFFFF'
  };

  // Ajuste responsive
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBackup = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/admin/backup', {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob', 
        });


        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
         const ahora = new Date();
const fecha = ahora.toISOString().slice(0, 10);
const hora = ahora.toLocaleTimeString('en-GB').replace(/:/g, '-'); 

        link.setAttribute('download', `backup-algorit-${fecha}--${hora}.sql`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        alert("Error al descargar el respaldo:" + error.message);
    }
};
const confirmLogout = () => {
      Swal.fire({
        title: '¿Cerrar sesión actual?',
        text: "Se borrarán tus datos de acceso de este navegador.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2D3354', 
        cancelButtonColor: 'rgb(184, 5, 5)',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const logId = localStorage.getItem('logId');
          if (logId) {
        axios.post('/logout', { logId })
            .catch(err => console.error("Error al cerrar bitácora", err));
    }
          onLogout();
          navigate('/');   
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Sesión cerrada correctamente',
            showConfirmButton: false,
            timer: 2000
          });
        }
      });
    };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: isMobile ? 'column' : 'row' }}>
             
        
      {/* SIDEBAR */}
      <aside style={{
        width: isMobile ? '100%' : '250px',
        backgroundColor: colors.sidebar,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderRight: '1px solid #ccc'
      }}>
        <Link to={"/"} style={{ textDecoration: 'none' }}>
        <div style={{ 
          fontFamily: "'Jersey 20', sans-serif", 
          fontSize: isMobile ? '38px' : '45px', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none'
        }}>
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
        </div>
        </Link>
        <button 
          onClick={() => setActiveTab('users')}
          style={btnStyle(activeTab === 'users', colors)}
        >
          Gestión de Usuarios
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          style={btnStyle(activeTab === 'logs', colors)}
        >
          Bitácora de Conexión
        </button>
        <button style={btnStyle(false, colors)} onClick={handleBackup}>
          Respaldar DB
        </button>
        <button style={btnStyle(false, colors)} onClick={confirmLogout}>
          Cerrar sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ flex: 1, backgroundColor: colors.content, padding: isMobile ? '20px' : '40px' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: colors.primary }}>
            {activeTab === 'users' ? 'Gestión de Usuarios' : 'Bitácora del Sistema'}
          </h1>
        </header>

        <div style={{ 
          backgroundColor: colors.white, 
          borderRadius: '8px', 
          padding: '20px', 
          overflowX: 'auto',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'users' ? <UsersTable colors={colors} /> : <LogsTable colors={colors} />}
        </div>
      </main>
    </div>
  );
};

// Estilo dinámico para los botones de la sidebar
const btnStyle = (active, colors) => ({
  backgroundColor: active ? colors.primary : 'transparent',
  color: active ? '#fff' : colors.primary,
  border: `2px solid ${colors.primary}`,
  padding: '12px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: '0.3s'
});

export default Admin;