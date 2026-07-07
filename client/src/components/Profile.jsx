import { useState, useEffect } from 'react';
import api from '../api/axios';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { Award } from 'lucide-react';

const Profile = () => {
  const [form, setForm] = useState({ name: '', lastname: '', email: '', username: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [exp, setExp] = useState(0);
  const [nivel, setNivel] = useState(1);
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState('');
  const navigate = useNavigate();
  const apiBase = api.defaults.baseURL || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || window.location.origin;

  const colors = {
    primary: '#2D3354',
    background: '#F0F2F5',
    inputBg: '#F0F2F5',
    textSecondary: '#666666'
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/perfil');
        const u = res.data.user;
        setForm({ name: u.name || '', lastname: u.lastname || '', email: u.email || '', username: u.username || '' });
        setAvatarPreview(u.avatar || null);
        setExp(u.exp || 0);
        setNivel(u.nivel || 1);
        setRol(u.rol || '');
        setLogros(Array.isArray(u.logros) ? u.logros : []);
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el perfil',
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
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
const [isHovered, setIsHovered] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('lastname', form.lastname);
      data.append('email', form.email);
      data.append('username', form.username);
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await api.put('/perfil', data, { headers: { 'Content-Type': 'multipart/form-data' } });
     Swal.fire({
  title: '¡Éxito!',
  text: 'Perfil actualizado con éxito',
  icon: 'success',
  confirmButtonColor: '#2D3354', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});

      if (res.data && res.data.user) {
        try {
          const stored = JSON.parse(localStorage.getItem('user')) || {};
          const merged = { ...stored, ...res.data.user };
          localStorage.setItem('user', JSON.stringify(merged));
          try {
            window.dispatchEvent(new CustomEvent('userUpdated', { detail: merged }));
          } catch (evErr) {}
        } catch (e) {}
      }
      navigate('/inicio');
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo actualizar',
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
// Opción Limpia y Legible
let avatarSrc = avatarPreview;

if (avatarPreview && !avatarPreview.startsWith('blob:') && !avatarPreview.startsWith('http')) {
    const slash = avatarPreview.startsWith('/') ? '' : '/';
    avatarSrc = `${apiBase}${slash}${avatarPreview}`;
}

  return (
    <div style={{ backgroundColor: colors.background, minHeight: '100vh', fontFamily: "'Jersey 20', sans-serif" }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', padding: '36px 20px',  }}>
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', padding: 28,  boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px' }}>
          <h2 style={{ margin: 0, color: colors.primary }}>Mi Perfil</h2>
          <p style={{ color: colors.textSecondary }}>Actualiza tu información y foto de perfil</p>

          <div style={{ display: 'flex', gap: 28, marginTop: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 160, textAlign: 'center' }}>
    <input 
      type="file" 
      id="avatar-upload"
      accept="image/*" 
      onChange={handleFile} 
      style={{ display: 'none' }} 
    />
    
    <label 
      htmlFor="avatar-upload" 
      style={{ 
        position: 'relative', 
        display: 'inline-block', 
        width: 140, 
        height: 140, 
        borderRadius: '50%', 
        cursor: 'pointer',
        overflow: 'hidden',
        border: '4px solid #F0F2F5',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
      }}

      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img 
        src={avatarSrc} 
        alt="avatar" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          display: 'block'
        }} 
      />
      

      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '500',
          opacity: isHovered ? 1 : 0, 
          transition: 'opacity 0.2s ease',
          borderRadius: '50%'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginBottom: '4px' }}>
          <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
          <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/>
        </svg>
        <span>Cambiar foto</span>
      </div>
    </label>
  </div>
           <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
  {/* Sección: Nombre y Apellido */}
  <div style={{ 
    display: 'flex', 
    gap: 16, 
    flexDirection: isMobile ? 'column' : 'row'
  }}>
    {/* Campo: Nombre */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
      <label htmlFor="name" style={{ color: colors.textSecondary, fontSize: '16px', fontWeight: 500 }}>
        Nombre
      </label>
      <input 
        name="name" 
        placeholder="Nombre" 
        value={form.name} 
        onChange={handleChange} 
        style={{ padding: 12, borderRadius: 10, border: '1px solid #E6E9EF', background: colors.inputBg, width: '100%', boxSizing: 'border-box', fontFamily: "'Jersey 20', sans-serif", fontSize: '16px' }} 
      />
    </div>

    {/* Campo: Apellido */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
      <label htmlFor="lastname" style={{ color: colors.textSecondary, fontSize: '16px', fontWeight: 500 }}>
        Apellido
      </label>
      <input 
        name="lastname" 
        placeholder="Apellido" 
        value={form.lastname} 
        onChange={handleChange} 
        style={{ padding: 12, borderRadius: 10, border: '1px solid #E6E9EF', background: colors.inputBg, width: '100%', boxSizing: 'border-box', fontFamily: "'Jersey 20', sans-serif", fontSize: '16px' }} 
      />
    </div>
  </div>

  {/* Sección: Usuario y Email */}
  <div style={{ 
    display: 'flex', 
    gap: 16, 
    flexDirection: isMobile ? 'column' : 'row'
  }}>
    {/* Campo: Usuario */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
      <label htmlFor="username" style={{ color: colors.textSecondary, fontSize: '16px', fontWeight: 500 }}>
        Usuario
      </label>
      <input 
        name="username" 
        placeholder="Usuario" 
        value={form.username} 
        onChange={handleChange} 
        style={{ padding: 12, borderRadius: 10, border: '1px solid #E6E9EF', background: colors.inputBg, width: '100%', boxSizing: 'border-box', fontFamily: "'Jersey 20', sans-serif", fontSize: '16px' }} 
      />
    </div>

    {/* Campo: Email */}
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
      <label htmlFor="email" style={{ color: colors.textSecondary, fontSize: '16px', fontWeight: 500 }}>
        Email
      </label>
      <input 
        name="email" 
        placeholder="Email" 
        value={form.email} 
        onChange={handleChange} 
        style={{ padding: 12, borderRadius: 10, border: '1px solid #E6E9EF', background: colors.inputBg, width: '100%', boxSizing: 'border-box', fontFamily: "'Jersey 20', sans-serif", fontSize: '16px' }} 
      />
    </div>
  </div>

  {/* Botones de Acción */}
  <div style={{ 
    display: 'flex', 
    gap: 12, 
    marginTop: 12,
    flexDirection: isMobile ? 'column' : 'row' 
  }}>
    <button 
      type="submit" 
      disabled={loading} 
      style={{ 
        flex: isMobile ? 1 : 'none',
        padding: '12px 24px', 
        borderRadius: 12, 
        border: 'none', 
        background: colors.primary, 
        color: 'white', 
        cursor: 'pointer',
        opacity: loading ? 0.7 : 1,
        fontFamily: "'Jersey 20', sans-serif",
        fontSize: '16px'
      }}
    >
      {loading ? 'Guardando...' : 'Guardar'}
    </button>
    <button 
      type="button" 
      onClick={() => navigate('/inicio')} 
      style={{ 
        flex: isMobile ? 1 : 'none',
        padding: '12px 24px', 
        borderRadius: 12, 
        border: '1px solid #E6E9EF', 
        background: 'transparent', 
        color: colors.primary,
        cursor: 'pointer',
        fontFamily: "'Jersey 20', sans-serif",
        fontSize: '16px'
      }}
    >
      Cancelar
    </button>
  </div>
</form>
          </div>
        </div>
      </div>
      {rol === 'usuario' && (
        <div style={{ display: 'flex', justifyContent: 'center', }} >
        <div style={{ width: '100%', maxWidth: 900, background: '#fff', padding: 28,  boxShadow: '0 4px 0 #e5e5e5', border: '2px solid #e5e5e5',
    borderRadius: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ flex: '0 0 220px', background: '#FAFBFD', padding: 16, borderRadius: 12, border: '1px solid #E6E9EF' }}>
          <div style={{ fontSize: 14, color: colors.textSecondary }}>Nivel</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, background: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>{nivel}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>Experiencia</div>
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 10, background: '#E9EDF7', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.round((exp % 500) / 5))}%`, height: '100%', background: colors.primary }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: colors.textSecondary }}>{exp} XP</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, background: '#FAFBFD', padding: 16, borderRadius: 12, border: '1px solid #E6E9EF' }}>
          <div style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>Logros conseguidos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {logros.length === 0 && <div style={{ color: colors.textSecondary }}>Aún no tienes logros.</div>}
            {logros.map((l) => (
              <div key={l.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8, background: '#fff', borderRadius: 10, border: '1px solid #EFEFF2' }}>
<div style={{ width: 42, height: 42, borderRadius: 8, background: '#FFF6E6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D79A2B' }}>
  <Award size={24} strokeWidth={2.5} />
</div>                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.primary }}>{l.nombre}</div>
                  <div style={{ fontSize: 12, color: colors.textSecondary }}>{l.UsuarioLogro?.fecha_desbloqueo ? new Date(l.UsuarioLogro.fecha_desbloqueo).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
      </div>
      </div>
        )}
    </div>
  );
};

export default Profile;
