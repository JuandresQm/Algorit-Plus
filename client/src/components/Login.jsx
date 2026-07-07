import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
function Login({ setUser }) {
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#2D3354',
        background: '#F0F2F5',
        textSecondary: '#666666',
        inputBg: '#F0F2F5'
    };


const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await api.post('/acceso', formData);
        
        if (res.status === 200) {
            const { user, token, logId } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('logId', logId);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            navigate('/');                
        }
    } catch (err) {
        err
           Swal.fire({
              title: 'Error de acceso',
              text: "Credenciales incorrectas",
              icon: 'error',
              confirmButtonText: 'Reintentar',
              confirmButtonColor: '#2D3354',
              background: '#E5E5E7',
              didOpen: (popup) => {
                popup.style.boxShadow = '0 6px 0 #e5e5e5';
                popup.style.border = '2px solid #e5e5e5';
                popup.style.borderRadius = '16px';
                popup.style.fontFamily = '"Jersey 20", sans-serif';
              }
            });
    }
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
                                    <h2 style={{ color: colors.primary, marginBottom: '10px' }}>Inicio de sesión</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    {/* Usuario o Correo */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Usuario o correo</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} style={styles.icon} color={colors.textSecondary} />
                            <input 
                                type="text"
                                required 
                                placeholder="Usuario o correo" 
                                style={styles.input}
                                onChange={e => setFormData({...formData, identifier: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* Contraseña */}
                    <div style={styles.inputGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={styles.label}>Contraseña</label>
                        </div>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} style={styles.icon} color={colors.textSecondary} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Contraseña"
                                required
                                minLength={6}
                                maxLength={100} 
                                style={styles.input}
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
                    ¿No tienes una cuenta? <Link to="/registro" style={styles.link(colors.primary)}>Regístrate</Link>
                </p>
                <div style={{ marginTop: '10px' }}>
<Link to="/recuperar" style={styles.footerText}>
                    ¿Olvidaste la contraseña?
                </Link>
                </div>
                

            </div>
        </div>
        </div>
    );
}

const styles = {
    container:{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', padding: '20px', marginTop: '-100px'
    },
    card: {
        backgroundColor: '#fff', padding: '40px', borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px',
        textAlign: 'center', boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px' 
    },
    form: { textAlign: 'left' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#333' },
        inputWrapper: {
        display: 'flex', alignItems: 'center', backgroundColor: '#F0F2F5',
        borderRadius: '8px', padding: '0 12px'
    },
    icon: { marginRight: '10px' },
    input: {
        width: '100%', padding: '12px 0', backgroundColor: 'transparent',
        border: 'none', outline: 'none', fontSize: '16px'
    },
    eyeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#666' },
    submitBtn: (color) => ({
        width: '100%', padding: '14px', backgroundColor: color, color: 'white',
        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(45, 51, 84, 0.3)'
    }),
    footerText: { marginTop: '25px', fontSize: '16px', color: '#666', textDecoration: 'none' },
    link: (color) => ({ color: color, fontWeight: 'bold', textDecoration: 'none' })
};

export default Login;