import { Link } from 'react-router-dom';
import academic from "../assets/academic.svg";
import code from "../assets/code.svg";
import medal from "../assets/medal.svg";
/* import googleIcon from '../assets/google.svg'; */
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';;

function Home({ user, onLogout }) {
  const navigate = useNavigate();

  // Paleta de colores
  const colors = {
    primary: '#2D3354', 
    background: '#E5E5E7',
    white: '#EEEEEE', 
    textSecondary: '#666666' 
  };
  
      {/* NAVBAR */}
      const btnNav = (color) => ({
    backgroundColor: color,
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: 'Jersey 20',
    fontWeight: 'bold'
  });

  // Lógica Responsive para el Logo
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
const handleStartClick = () => {
        if (!user) {
            navigate('/acceso');
        } else if (user.rol === 'admin') {
            navigate('/admin');
        } else {
            navigate('/inicio');
        }
    };
  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Jersey 20', sans-serif", margin: 0 }}>
      
      {/* NAVBAR */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: isMobile ? '10px 20px' : '10px 50px', 
        gap: '20px',
        flexWrap: 'wrap', 
        backgroundColor: '#EEEEEE',
        borderBottom: '1px solid #ccc'

      }}>
        
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


        <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    gap: isMobile ? '10px' : '20px',
    flexWrap: 'wrap' 
  }}>
    {user ? (
      <>
        <span onClick={handleStartClick} style={{ 
          color: colors.primary, 
          fontWeight: 'bold',
          fontSize: isMobile ? '14px' : '16px',
          cursor: 'pointer'
        }}>
          Hola, {user.username}
        </span>
        
        <button 
          onClick={confirmLogout}
          style={btnNav(colors.primary)}
        >
          Cerrar sesión
        </button>
      </>
    ) : (
      <>
        <Link to="/acceso">
          <button style={btnNav(colors.primary)}>Iniciar sesión</button>
        </Link>
        
        <Link to="/registro">
          <button style={btnNav(colors.primary)}>Registrar</button>
        </Link>
      </>
    )}
  </div>
      </nav>

      {/* HERO SECTION */}
      <header style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h1 style={{ color: '#333', fontSize: '2.5rem', marginBottom: '10px' }}>
          Aprender algoritmos es más sencillo que nunca
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '1.5rem', marginBottom: '30px', fontFamily: 'sans-serif', }}>
          Trabaja tus proyectos en <br /> nuestro entorno de desarrollo
        </p>

        <button onClick={handleStartClick} style={btnGoogle()}>
        {(!user || user.rol !== 'admin') ? "Empezar ahora" : "Ver panel administrador"}
        </button>
        
      {/*   <div style={{ margin: '20px 0', color: colors.textSecondary }}>— o —</div>
        
        <button style={btnOutline(colors.primary)}>Ver más opciones</button> */}
      </header>

      <section style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'Wrap',
        gap: '30px', 
        padding: '40px',
        backgroundColor: colors.white,
        fontFamily: 'sans-serif', 
      }}>
        <FeatureCard 
          icon={<img src={academic} alt="" style={{ width: '80px' }} />}
          title="Aprende paso a paso" 
          color={colors.primary} 
        />
        <FeatureCard 
          icon={<img src={code} alt="" style={{ width: '80px' }} />}
          title="Interfaz de desarrollo" 
          color={colors.primary} 
        />
        <FeatureCard 
          icon={<img src={medal} alt="" style={{ width: '80px' }} />}
          title="Desafíos y logros" 
          color={colors.primary} 
        />
      </section>
    </div>
  );
}

// Componente pequeño para las tarjetas
function FeatureCard({ icon, title, color }) {
  return (
    <div style={{ 
      backgroundColor: '#FFFFFF',
      textAlign: 'center', 
      padding: '40px 20px', 
      width: '280px',
      borderRadius: '15px', 
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', 
      border: '1px solid #f0f0f0',
      transition: 'transform 0.3s ease'
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>{icon}</div>
      <h3 style={{ 
        color: color, 
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        lineHeight: '1.4'
      }}>
        {title}
      </h3>
    </div>
  );
}


const btnGoogle = () => ({
  backgroundColor: '#2D3354',
  color: 'white',
  padding: '12px 25px',
  border: 'none',
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '1rem',
  textDecoration: 'none',
});

/* const btnOutline = (color) => ({
  backgroundColor: 'transparent',
  color: color,
  border: `2px solid ${color}`,
  padding: '10px 40px',
  borderRadius: '4px',
  fontWeight: 'bold',
  cursor: 'pointer'
}); */

export default Home;