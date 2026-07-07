import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
/* import googleIcon from '../assets/google.svg'; */
import { User, Mail, Lock, Eye, EyeOff, UserCircle } from 'lucide-react';
import Swal from 'sweetalert2';

function Register() {
    const [formData, setFormData] = useState({
        name: '', lastname: '', email: '', username: '', password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#2D3354',
        background: '#F0F2F5',
        white: '#E5E5E7',
        inputBg: '#F0F2F5',
        textSecondary: '#666666'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/registro', formData);
            if (res.status === 201) {
                navigate('/acceso'); 
                Swal.fire({
                    title: 'Registro exitoso',
                    text: "Tu cuenta ha sido creada. ¡Inicia sesión para comenzar!",
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                    confirmButtonColor: '#2D3354', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
                });

            }
        } catch (err) {
            const mensajeError = err.response?.data?.message || 'Algo salió mal';
            Swal.fire({
      title: 'Error de acceso',
      text: mensajeError,
      icon: 'error',
      confirmButtonText: 'Reintentar',
      confirmButtonColor: '#2D3354', 
    background: '#E5E5E7'
    });
        }
    };
 // Lógica Responsive para el Logo
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

    return (
          <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Jersey 20', sans-serif", margin: 0 }}>
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
              </nav>
        <div style={styles.container}>
            <div style={styles.card}>
                 <h2 style={{ color: colors.primary, marginBottom: '10px' }}>Regístrate</h2>

              {/*   <p style={styles.subtitle}>Regístrate con:</p>
                <button style={styles.googleBtn}>
                    <img src={googleIcon} alt="G" style={{ width: '18px', marginRight: '10px' }} />
                    Google
                </button>

                <div style={styles.divider}></div> */}

                <form onSubmit={handleSubmit} style={styles.form}>
                 <div style={styles.row}>
    <div style={styles.inputGroup}>
        <label style={styles.label}>Nombre</label>
        <div style={styles.inputWrapper}>
            <User size={18} style={styles.icon} color={colors.textSecondary} />
            <input 
                type="text"
                minLength={3} 
                maxLength={20}
                required
                placeholder="Nombre" 
                style={styles.inputWithIcon}
                onChange={e => setFormData({...formData, name: e.target.value})} 
            />
        </div>
    </div>
    <div style={styles.inputGroup}>
        <label style={styles.label}>Apellido</label>
        <div style={styles.inputWrapper}>
            <User size={18} style={styles.icon} color={colors.textSecondary} />
            <input 
                type="text" 
                minLength={3}
                maxLength={20}
                required
                placeholder="Apellido" 
                style={styles.inputWithIcon}
                onChange={e => setFormData({...formData, lastname: e.target.value})} 
            />
        </div>
    </div>
</div>

{/* Usuario */}
<div style={styles.inputGroup}>
    <label style={styles.label}>Usuario</label>
    <div style={styles.inputWrapper}>
        <UserCircle size={18} style={styles.icon} color={colors.textSecondary} />
        <input 
            type="text"
            minLength={3}
            maxLength={20}
            required 
            placeholder="Usuario" 
            style={styles.inputWithIcon}
            onChange={e => setFormData({...formData, username: e.target.value})} 
        />
    </div>
</div>

{/* Correo */}
<div style={styles.inputGroup}>
    <label style={styles.label}>Correo</label>
    <div style={styles.inputWrapper}>
        <Mail size={18} style={styles.icon} color={colors.textSecondary} />
        <input 
            type="email"
            required 
            placeholder="Correo" 
            style={styles.inputWithIcon}
            onChange={e => setFormData({...formData, email: e.target.value})} 
        />
    </div>
</div>

                   <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.icon} color={colors.textSecondary} />
                <input 
                    type={showPassword ? "text" : "password"} 
                    minLength={6}
                    maxLength={100}
                    required
                    placeholder="Contraseña" 
                    style={styles.inputWithIcon}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>

                    <button type="submit" style={styles.submitBtn(colors.primary)}>
                        Continuar
                    </button>
                </form>

                <p style={styles.footerText}>
                    ¿Tienes una cuenta? <Link to="/acceso" style={{ color: colors.primary, fontWeight: 'bold', textDecoration: 'none' }}>Inicia sesión</Link>
                </p>
            </div>
        </div>
        </div>
    );
}

// Estilos en objeto para mantener orden
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        marginTop: '-50px'
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px' 
    },
    subtitle: { color: '#666', marginBottom: '15px', fontSize: '16px' },
    googleBtn: {
        width: '100%',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0F2F5',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    divider: { height: '1px', backgroundColor: '#EEE', margin: '25px 0' },
    form: { textAlign: 'left' },
    row: { display: 'flex', gap: '15px', marginBottom: '15px' },
    inputGroup: { marginBottom: '15px', flex: 1 },
    label: { display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '5px', color: '#333' },
    input: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#F0F2F5',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none'
    },
    submitBtn: (color) => ({
        width: '100%',
        padding: '14px',
        backgroundColor: color,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        boxShadow: '0 4px 12px rgba(45, 51, 84, 0.3)'
    }),
    footerText: { marginTop: '20px', fontSize: '16px', color: '#666' },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: '8px',
        padding: '0 10px'
    },
    icon: {
        marginRight: '10px'
    },
    inputWithIcon: {
        width: '100%',
        padding: '12px 0',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
        fontSize: '14px'
    },
    eyeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#666',
        padding: '5px',
        display: 'flex',
        alignItems: 'center'
    }
};

export default Register;