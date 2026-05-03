import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const colors = {
        primary: '#2D3354',
        background: '#E5E5E7',
        textSecondary: '#666666',
        inputBg: '#F0F2F5'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return Swal.fire({
                title: 'Error',
                text: 'Las contraseñas no coinciden',
                icon: 'warning',
                confirmButtonColor: colors.primary
            });
        }

        try {
            const res = await api.post(`/recuperar/${token}`, { password });

            if (res.status === 200) {
                Swal.fire({
                    title: '¡Éxito!',
                    text: 'Tu contraseña ha sido actualizada correctamente',
                    icon: 'success',
                    confirmButtonColor: colors.primary
                }).then(() => {
                    navigate('/acceso'); 
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: 'El enlace es inválido o ha expirado' + (err.response?.data?.message ? `: ${err.response?.data?.message}` : ''),
                icon: 'error',
                confirmButtonColor: colors.primary
            });
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{minHeight: '100vh', fontFamily: "'Jersey 20', sans-serif", margin: 0 }}>
            <nav style={navStyles(isMobile)}>
                <div style={logoStyles(isMobile)}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <span style={{ color: '#E5E5E7', WebkitTextStroke: '1px #2D3354' }}>
                            {isMobile ? 'Alg' : 'Algorit'}
                        </span>
                        <span style={{ color: '#2D3354' }}>+</span>
                    </Link>
                </div>
            </nav>

            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={{ color: colors.primary, marginBottom: '10px' }}>Nueva Contraseña</h2>
                    <p style={{ color: colors.textSecondary, marginBottom: '25px', fontSize: '14px' }}>
                        Ingresa tu nueva clave de acceso para Algorit+
                    </p>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        {/* Nueva Contraseña */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nueva Contraseña</label>
                            <div style={styles.inputWrapper}>
                                <Lock size={18} style={styles.icon} color={colors.textSecondary} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    style={styles.input}
                                    onChange={e => setPassword(e.target.value)} 
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

                        {/* Confirmar Contraseña */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Confirmar Contraseña</label>
                            <div style={styles.inputWrapper}>
                                <CheckCircle size={18} style={styles.icon} color={colors.textSecondary} />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Repite tu contraseña"
                                    required
                                    style={styles.input}
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                />
                            </div>
                        </div>

                        <button type="submit" style={styles.submitBtn(colors.primary)}>
                            Actualizar Contraseña
                        </button>
                    </form>

                    <p style={styles.footerText}>
                        <Link to="/acceso" style={styles.link(colors.primary)}>Volver al inicio de sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const navStyles = (isMobile) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: isMobile ? '10px 20px' : '10px 50px',  
                backgroundColor: '#EEEEEE',
        borderBottom: '1px solid #ccc' 
});

const logoStyles = (isMobile) => ({
    fontFamily: "'Jersey 20', sans-serif", fontSize: isMobile ? '38px' : '45px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none'
});

const styles = {
    container:{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '80vh', padding: '20px'
    },
    card: {
        backgroundColor: '#fff', padding: '40px', borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px',
        textAlign: 'center'
    },
    form: { textAlign: 'left' },
    inputGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#333' },
    inputWrapper: {
        display: 'flex', alignItems: 'center', backgroundColor: '#F0F2F5',
        borderRadius: '8px', padding: '0 12px'
    },
    icon: { marginRight: '10px' },
    input: {
        width: '100%', padding: '12px 0', backgroundColor: 'transparent',
        border: 'none', outline: 'none', fontSize: '14px'
    },
    eyeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#666' },
    submitBtn: (color) => ({
        width: '100%', padding: '14px', backgroundColor: color, color: 'white',
        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 12px rgba(45, 51, 84, 0.3)'
    }),
    footerText: { marginTop: '25px', fontSize: '14px', color: '#666' },
    link: (color) => ({ color: color, fontWeight: 'bold', textDecoration: 'none' })
};

export default ResetPassword;