import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './ProtectedRoutes.jsx';
import Admin from './components/Admin';
import ResetPassword from './components/Recuperar';
import Recuperacion from './components/Recuperacion';
import Inicio from './components/Inicio';
import LessonPage from './components/LessonPage';
import CodeEditor from './components/CodeEditor';
import Profile from './components/Profile';
import ImportProject from './components/ImportProject';
import InicioDocente from './components/Inicio Docente';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  useEffect(() => {
    const handler = (e) => {
      if (e && e.detail) setUser(e.detail);
    };
    const storageHandler = (ev) => {
      if (ev.key === 'user') {
        try {
          setUser(JSON.parse(ev.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener('userUpdated', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('userUpdated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);
  

 const handleLogout = () => {
    localStorage.clear(); 
    setUser(null);
  };
  
  return (
    <Router>
      <div className="app-container">

        <Routes>
          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
          {/* Usuario no tiene sesión activa */}
        <Route element={<ProtectedRoute isAllowed={!user} redirectTo="/" requireToken={false} />}>
          <Route path="/acceso" element={<Login setUser={setUser} />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/recuperar/:token" element={<ResetPassword />} />
          <Route path="/recuperar" element={<Recuperacion />} />
        </Route>
        {/* Usuario es administrador */}
        <Route element={<ProtectedRoute isAllowed={!!user && user.rol === 'admin'} requireToken={true} />}>
          <Route path="/admin" element={<Admin onLogout={handleLogout} />} />
        </Route>
{/* Usuario tiene la sesión activa */}
<Route element={<ProtectedRoute isAllowed={!!user && user.rol === 'usuario'} requireToken={true} />}>
  <Route path="/inicio" element={<Inicio user={user} onLogout={handleLogout} />} />
  <Route path="/leccion/:id" element={<LessonPage  />} />
  <Route path="/editor" element={<CodeEditor />} />
  <Route path="/compartir" element={<ImportProject />} />
</Route>
        <Route element={<ProtectedRoute isAllowed={!!user && user.rol === 'docente'} requireToken={true} />}>
          <Route path="/docente" element={<InicioDocente user={user} onLogout={handleLogout}/>} />
          <Route path="/editor/revision" element={<CodeEditor user={user} />} />
        </Route>
          
           
           <Route element={<ProtectedRoute isAllowed={!!user && (user.rol === 'docente' || user.rol === 'usuario')} requireToken={true} />}>
            <Route path="/perfil" element={<Profile />} />
           </Route>


          <Route path="*" element={<h1>404 - No encontrado</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;