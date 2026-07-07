import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';

const UsersTable = ({ colors }) => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    
    const usersPerPage = 10; 
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUsers(res.data);
            } catch (error) {
                console.error("Error al cargar usuarios", error);
            }
        };
        fetchUsers();
    }, [token]);

    // --- LÓGICA DE FILTRADO ---
    const filteredUsers = users.filter(user => {
        const matchesName = user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === "" || user.rol === selectedRole;
        return matchesName && matchesRole;
    });

    // --- LÓGICA DE PAGINACIÓN ---
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/admin/user/role/${userId}`,
                { rol: newRole },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
Swal.fire({
  title: '¡Éxito!',
  text: `Rol actualizado a ${newRole}`,
  icon: 'success',
  confirmButtonColor: '#2D3354', didOpen: (popup) => {
    popup.style.boxShadow = '0 6px 0 #e5e5e5';
    popup.style.border = '2px solid #e5e5e5';
    popup.style.borderRadius = '16px';
    popup.style.fontFamily = '"Jersey 20", sans-serif';
  }
});            setUsers(users.map(user => user.id === userId ? { ...user, rol: newRole } : user));
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo actualizar el rol',
                icon: 'error',
                confirmButtonColor: '#2D3354'
            });
        }
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif'}}>
            {/* --- BARRA DE FILTROS --- */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '20px', 
                flexWrap: 'wrap',
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '8px'
            }}>
                {/* Buscador por Nombre */}
                <div style={{ flex: 2, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por usuario..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 35px',
                            borderRadius: '5px',
                            border: `1px solid ${colors.primary}44`,
                            outline: 'none',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* Buscador por Rol */}
                <div style={{ flex: 1, position: 'relative' }}>
                    <Users size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <select 
                        value={selectedRole}
                        onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 35px',
                            borderRadius: '6px',
                            border: `1px solid ${colors.primary}44`,
                            backgroundColor: 'white',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">Todos los roles</option>
                        <option value="usuario">Usuario</option>
                        <option value="docente">Docente</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            </div>

            {/* --- TABLA --- */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.primary}`, color: colors.primary }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Rol Actual</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {currentUsers.length > 0 ? (
                        currentUsers.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{user.id}</td>
                                <td style={{ padding: '12px' }}><strong>{user.username}</strong></td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        backgroundColor: user.rol === 'docente' ? '#3a5485' : user.rol === 'admin' ? '#2D3354' : '#eee', 
                                        color: user.rol === 'usuario' ? '#333' : '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.rol.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {user.rol === 'admin' ? (
                                        <span style={{ color: '#888', fontStyle: 'italic' }}>Administrador</span>
                                    ) : (
                                        <select 
                                            value={user.rol}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            style={{ padding: '5px', borderRadius: '4px', border: `1px solid ${colors.primary}` }}
                                        >
                                            <option value="usuario">USUARIO</option>
                                            <option value="docente">DOCENTE</option>
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>No se encontraron usuarios con esos criterios.</td></tr>
                    )}
                </tbody>
            </table>

            {/* --- PAGINACIÓN --- */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '20px' }}>
                <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    style={paginationButtonStyle(currentPage === 1, colors.primary)}
                >
                    <ChevronLeft size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary, fontWeight: 'bold' }}>
                    <span>Página</span>
                    <input 
                        type="number"
                        min="1"
                        max={totalPages || 1}
                        value={currentPage}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPages) paginate(val);
                            else if (e.target.value === "") setCurrentPage("");
                        }}
                        onBlur={() => { if (currentPage === "") setCurrentPage(1); }}
                        style={{
                            width: '50px', padding: '5px', textAlign: 'center', borderRadius: '5px',
                            border: `2px solid ${colors.primary}`, color: colors.primary, fontWeight: 'bold'
                        }}
                    />
                    <span>de {totalPages || 1}</span>
                </div>

                <button 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === totalPages || totalPages === 0}
                    style={paginationButtonStyle(currentPage === totalPages || totalPages === 0, colors.primary)}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

const paginationButtonStyle = (disabled, color) => ({
    backgroundColor: disabled ? '#ccc' : color,
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: '0.3s'
});

export default UsersTable;