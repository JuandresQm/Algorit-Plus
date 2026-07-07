import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../api/axios';

const ImportProject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const didImportRef = useRef(false);

  useEffect(() => {
    if (didImportRef.current) return;
    didImportRef.current = true;

    const params = new URLSearchParams(location.search);
    const projectId = params.get('projectId');

    const doImport = async () => {
      if (!projectId) {
        Swal.fire({
          title: 'Error',
          text: 'Falta projectId en la URL',
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
        navigate('/inicio');
        return;
      }

      try {
        const response = await api.post('/proyectos/compartir', { projectId });
        const imported = response.data.project;
        Swal.fire({
          title: 'Proyecto importado',
          text: 'Se ha creado una copia en tu cuenta.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2D3354',
          didOpen: (popup) => {
            popup.style.boxShadow = '0 6px 0 #e5e5e5';
            popup.style.border = '2px solid #e5e5e5';
            popup.style.borderRadius = '16px';
            popup.style.fontFamily = '"Jersey 20", sans-serif';
          }
        });
        // Open editor with the new proyecto id
        navigate(`/editor?projectId=${imported.id}`);
      } catch (error) {
        console.error('Error importando proyecto:', error);
        const msg = error.response?.data?.message || 'No se pudo compartir el proyecto.';
        Swal.fire({
          title: 'Error',
          text: msg,
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
        navigate('/inicio');
      }
    };

    doImport();
  }, [location.search, navigate]);

  return null;
};

export default ImportProject;
