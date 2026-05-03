import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

function Recuperacion() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#2D3354',
        background: '#E5E5E7',
        textSecondary: '#666666',
        inputBg: '#F0F2F5'
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await api.post('/recuperar', { identifier });
            
            if (res.status === 200) {
                Swal.fire({
                    title: 'Correo enviado',
                    text: 'Si los datos son correctos, recibirás un enlace de recuperación en breve.',
                    icon: 'success',
                    confirmButtonColor: colors.primary
                }).then(() => {
                    navigate('/acceso');
                });
            }
        } catch (err) {
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'No se pudo procesar la solicitud',
                icon: 'error',
                confirmButtonColor: colors.primary
            });
        } finally {
            setLoading(false);
        }
    };

    // Lógica Responsive para el Logo
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Jersey 20', sans-serif", margin: 0 }}>
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
                    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                        <Link to="/acceso" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: colors.primary, fontSize: '14px', fontWeight: 'bold' }}>
                            <ArrowLeft size={16} /> Volver al login
                        </Link>
                    </div>

                    <h2 style={{ color: colors.primary, marginBottom: '10px' }}>Recuperar cuenta</h2>
                    <p style={{ color: colors.textSecondary, marginBottom: '25px', fontSize: '14px' }}>
                        Ingresa tu usuario o el correo electrónico asociado a tu cuenta para enviarte un enlace de recuperación.
                    </p>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Usuario o correo</label>
                            <div style={styles.inputWrapper}>
                                <User size={18} style={styles.icon} color={colors.textSecondary} />
                                <input 
                                    type="text"
                                    required 
                                    placeholder="Usuario o correo electrónico" 
                                    style={styles.input}
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)} 
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={styles.submitBtn(colors.primary, loading)}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#F8F9FA', borderRadius: '10px' }}>
                        <p style={{ fontSize: '12px', color: colors.textSecondary, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Mail size={14} /> El enlace expirará en 15 minutos.
                        </p>
                    </div>
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
    submitBtn: (color, loading) => ({
        width: '100%', padding: '14px', backgroundColor: loading ? '#ccc' : color, color: 'white',
        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold',
        cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(45, 51, 84, 0.3)'
    })
};

export default Recuperacion;