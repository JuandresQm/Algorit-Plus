import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

const LogsTable = ({ colors }) => {
    const [logs, setLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    
    const logsPerPage = 10;
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('/admin/logs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setLogs(res.data);
            } catch (error) {
                console.error("Error al cargar la bitácora", error);
            }
        };
        fetchLogs();
    }, [token]);

    // --- LÓGICA DE FILTRADO ---
    const filteredLogs = logs.filter(log => {
        const matchesUser = log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = selectedAction === "" || log.action === selectedAction;
        return matchesUser && matchesAction;
    });

    // --- LÓGICA DE PAGINACIÓN (Basada en logs filtrados) ---
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    // Resetear a la página 1 cuando se cambia un filtro
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handleActionChange = (e) => {
        setSelectedAction(e.target.value);
        setCurrentPage(1);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showDetails = (action, details) => {
        Swal.fire({
            title: action,
            text: details || "No hay detalles registrados para esta acción.",
            icon: 'info',
            confirmButtonColor: colors.primary,
            confirmButtonText: 'Cerrar'
        });
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* --- SECCIÓN DE FILTROS --- */}
            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                marginBottom: '20px', 
                flexWrap: 'wrap',
                backgroundColor: '#f9f9f9',
                padding: '15px',
                borderRadius: '8px'
            }}>
                {/* Buscador de Usuario */}
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '10px', color: '#888' }} />
                    <input 
                        type="text" 
                        placeholder="Buscar por usuario..."
                        value={searchTerm}
                        onChange={handleSearchChange}
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

                {/* Filtro de Acción */}
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: '1', minWidth: '200px' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '10px', color: '#888' }} />
                    <select 
                        value={selectedAction}
                        onChange={handleActionChange}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 35px',
                            borderRadius: '5px',
                            border: `1px solid ${colors.primary}44`,
                            outline: 'none',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todas las acciones</option>
                        <option value="Inicio de sesión">Inicio de sesión</option>
                        <option value="Cierre de sesión">Cierre de sesión</option>
                        <option value="Edición">Edición</option>
                        <option value="Descarga de Respaldo">Descarga de respaldo</option>
                        <option value="Registro">Registro</option>
                        <option value="Cambio de Contraseña">Cambio de contraseña</option>
                    </select>
                </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ borderBottom: `2px solid ${colors.primary}`, color: colors.primary }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Usuario</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Acción</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>IP</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Entrada</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Salida</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Duración</th>
                    </tr>
                </thead>
                <tbody>
                    {currentLogs.length > 0 ? (
                        currentLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}><strong>{log.user?.username || 'N/A'}</strong></td>
                                <td 
                                    style={{ padding: '10px', cursor: 'pointer', color: colors.primary, fontWeight: '500', textDecoration: 'underline' }}
                                    onClick={() => showDetails(log.action, log.details)}
                                >
                                    {log.action}
                                </td>
                                <td style={{ padding: '10px', color: '#666' }}>{log.ipAddress}</td>
                                <td style={{ padding: '10px' }}>{new Date(log.loginTime).toLocaleString()}</td>
                                <td style={{ padding: '10px' }}>
                                    {log.logoutTime ? new Date(log.logoutTime).toLocaleString() : '---'}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                    {log.duration || 'En línea'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No se encontraron registros con los filtros aplicados</td></tr>
                    )}
                </tbody>
            </table>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '20px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    style={paginationButtonStyle(currentPage === 1, colors.primary)}
                >
                    <ChevronLeft size={20} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary, fontWeight: '600' }}>
                    <span>Página</span>
                    <input 
                        type="number"
                        min="1"
                        max={totalPages || 1}
                        value={currentPage}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPages ) {
                                paginate(val);
                            } else if (e.target.value === "") {
                                setCurrentPage(""); 
                            }
                        }}
                        onBlur={() => {
                            if (currentPage === "") setCurrentPage(1);
                        }}
                        style={{
                            width: '50px',
                            padding: '5px',
                            textAlign: 'center',
                            borderRadius: '5px',
                            border: `2px solid ${colors.primary}`,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: colors.primary,
                            outline: 'none'
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

export default LogsTable;