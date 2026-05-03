import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './ProtectedRoutes.jsx';
import Admin from './components/Admin';
import ResetPassword from './components/Recuperar';
import Recuperacion from './components/Recuperacion';
import Inicio from './components/Inicio';
import CodeEditor from './components/CodeEditor';
import { useState } from 'react';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  

 const handleLogout = () => {
    localStorage.clear(); 
    setUser(null);
  };
  
  return (
    <Router>
      <div className="app-container">

        <Routes>
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
<Route element={<ProtectedRoute isAllowed={!!user && user.rol !== 'admin'}/>}>
  <Route path="/inicio" element={<Inicio user={user} />} />
</Route>

          <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />
          <Route path="/editor" element={<CodeEditor />} />
          
          <Route path="*" element={<h1>404 - No encontrado</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;