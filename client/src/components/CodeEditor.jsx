import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Folder, Plus, Database, Box, Code, Terminal, ChevronDown, Play, Eraser, Save } from 'lucide-react';
import { useAlgorit } from '../hooks/useAlgorit';
import api from '../api/axios';
import Swal from 'sweetalert2';
function CodeEditorView({ reviewMode = false, reviewData = null, onCloseReview = null }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 1. ESTADO DEL EDITOR: Guardamos el código que el usuario escribe
  const [code, setCode] = useState('');
  const [savedCode, setSavedCode] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [projectError, setProjectError] = useState(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activeActividad, setActiveActividad] = useState(null);
  const [isSubmittingEntrega, setIsSubmittingEntrega] = useState(false);
  const [actividadStartTime, setActividadStartTime] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
const [segundosTranscurridos, setSegundosTranscurridos] = useState(0);

useEffect(() => {
  if (!actividadStartTime) return;


  const calcularSegundos = () => {
    return Math.max(0, Math.floor((Date.now() - actividadStartTime) / 1000));
  };

  const handleGradeSubmit = async () => {
    if (!reviewData || !reviewData.id) return;
    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      Swal.fire('Nota inválida', 'Ingresa una nota entre 0 y 100', 'warning');
      return;
    }
    try {
      setIsSubmittingGrading(true);
      await api.put(`/entregas/${reviewData.id}/calificar`, {
        estado: 'clasificado',
        nota: numericGrade,
        observaciones: observaciones || ''
      });
      await Swal.fire({ title: 'Calificación guardada', text: 'La entrega fue calificada correctamente.', icon: 'success', confirmButtonColor: '#2D3354' });
      if (typeof onCloseReview === 'function') onCloseReview();
    } catch (error) {
      console.error('Error calificando entrega:', error);
      Swal.fire('Error', error.response?.data?.message || 'No se pudo calificar la entrega', 'error');
    } finally {
      setIsSubmittingGrading(false);
    }
  };

  setSegundosTranscurridos(calcularSegundos());

  const intervalo = setInterval(() => {
    setSegundosTranscurridos(calcularSegundos());
  }, 1000);

  return () => clearInterval(intervalo);
}, [actividadStartTime]);

const formatearCronometro = (totalSegundos) => {
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const minStr = String(minutos).padStart(2, '0');
  const segStr = String(segundos).padStart(2, '0');

  if (horas > 0) {
    const horStr = String(horas).padStart(2, '0');
    return `${horStr}:${minStr}:${segStr}`;
  }
  return `${minStr}:${segStr}`;
};

  useEffect(() => {
    // si venimos en modo revisión cargamos el código del estudiante
    if (reviewMode && reviewData) {
      const studentCode = reviewData.codigoEnviado || '';
      setCode(studentCode);
      setSavedCode(studentCode);
    } else {
      setCode('');
      setSavedCode('');
    }
  }, []);

  const hasUnsavedChanges = selectedProject && code !== savedCode;
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
useEffect(() => {
  hasUnsavedChangesRef.current = hasUnsavedChanges;
}, [hasUnsavedChanges]);

const mostrarAlertaCambiosSinGuardar = async () => {
  const confirmado = await Swal.fire({
    title: '¿Deseas continuar?',
    html: 'Tienes cambios sin guardar.<br />' +
          '<strong>Si continúas, se perderán los cambios de este proyecto.</strong><br />' +
          '¿Deseas continuar sin guardar?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2D3354', 
    cancelButtonColor: '#7a7a7a',
    didOpen: (popup) => {
      popup.style.boxShadow = '0 6px 0 #e5e5e5';
      popup.style.border = '2px solid #e5e5e5';
      popup.style.borderRadius = '16px';
      popup.style.fontFamily = '"Jersey 20", sans-serif';
    }
  });
  return confirmado.isConfirmed;
};

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/proyectos');
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const loadProject = async (projectId) => {
    try {
      const response = await api.get(`/proyectos/${projectId}`);
      setSelectedProject(response.data);
      const projectCode = response.data.code || '';
      setCode(projectCode);
      setSavedCode(projectCode);
      setProjectError(null);
    } catch (error) {
      console.error('Error cargando proyecto:', error);
      setProjectError('No se pudo cargar el proyecto seleccionado.');
    }
  };

  

  useEffect(() => {
    const activityId = searchParams.get('activityId');
    const projectId = searchParams.get('projectId');

    const initialize = async () => {
      if (activityId) {
        if (hasUnsavedChanges) {
          const continuar = await mostrarAlertaCambiosSinGuardar();
          if (!continuar) {
            if (selectedProject) {
              navigate(`/editor?projectId=${selectedProject.id}&activityId=${activityId}`, { replace: true });
            }
            return;
          }
        }

        try {
          const response = await api.get('/actividades/estudiante');
          const actividad = response.data.actividades?.find((item) => String(item.id) === String(activityId));
            {reviewMode && reviewData ? (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '12px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f5988', textTransform: 'uppercase' }}>Revisión de entrega</div>
                  <button style={{ background: '#eef2ff', border: '1px solid #d1e3ff', color: '#2D3354', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>Delegar a la IA</button>
                </div>
                <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '10px' }}>{reviewData.estudiante?.name} {reviewData.estudiante?.lastname} (@{reviewData.estudiante?.username})</div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>Tiempo empleado: {reviewData.tiempoEmpleado ? formatearCronometro(reviewData.tiempoEmpleado) : '—'}</div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Nota (0-100)</label>
                  <input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', padding: '8px 10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Observaciones</label>
                  <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '8px 10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button onClick={handleGradeSubmit} disabled={isSubmittingGrading} style={{ background: '#2D3354', color: 'white', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{isSubmittingGrading ? 'Enviando...' : 'Entregar'}</button>
                </div>
              </div>
            ) : (
              <>
                <AccordionItem icon={<Database size={18} />} title="Variables" color="#3b82f6">
                  {variables.length > 0 ? (
                    <div>
                      {variables.map((variable, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{variable.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Tipo: {variable.type}{variable.size ? ` (${Array.isArray(variable.size) ? '[' + variable.size.join('][') + ']' : variable.size})` : ''}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                            Valor: {variable.value || 'nulo'} 
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      No hay variables definidas
                    </div>
                  )}
                </AccordionItem>
                <AccordionItem icon={<Box size={18} />} title="Subalgoritmos" color="#f97316">
                  {subalgorithms.length > 0 ? (
                    <div>
                      {subalgorithms.map((sub, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{sub.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {sub.isFunction ? 'Función' : 'Procedimiento'} {sub.returnType ? `: ${sub.returnType}` : ''}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                            Parámetros: {sub.params.length > 0 ? sub.params.map(param => {
                                const paramName = param.name || (param.target?.value ?? param.target?.property ?? '');
                                const paramType = param.type ? `: ${param.type}` : '';
                                const paramMode = param.mode ? ` (${param.mode})` : '';
                                return `${paramName}${paramType}${paramMode}`;
                              }).join(', ') : 'Sin parámetros'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      No hay subalgoritmos definidos
                    </div>
                  )}
                </AccordionItem>
              </>
            )}
    setActiveActividad(null);
    setActividadStartTime(null);
    navigate(`/editor?projectId=${project.id}`);
  };

  const handleEntregarActividad = async () => {
  if (!activeActividad || !selectedProject) {
    return;
  }

  const confirmado = await Swal.fire({
    title: '¿Deseas entregar la actividad?',
html: 'Se enviará la actividad con el código actual.<br />' +
        '<strong>Esta acción no se puede deshacer.</strong><br />' +
        'Solo se permite una entrega por actividad.',    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, entregar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2D3354', 
    cancelButtonColor: '#7a7a7a',
    didOpen: (popup) => {
      popup.style.boxShadow = '0 6px 0 #e5e5e5';
      popup.style.border = '2px solid #e5e5e5';
      popup.style.borderRadius = '16px';
      popup.style.fontFamily = '"Jersey 20", sans-serif';
    }
  });

  if (!confirmado.isConfirmed) {
    return;
  }

  try {
    setIsSubmittingEntrega(true);
    
const segundosCalculados = Math.max(1, Math.round((Date.now() - actividadStartTime) / 1000)) 

await api.post('/entregas', {
  actividadId: activeActividad.id,
  codigoEnviado: code,
  tiempoEmpleado: segundosCalculados
});

    await Swal.fire({
      title: 'Actividad entregada',
      text: 'Tu solución fue enviada correctamente.',
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

    navigate('/inicio');
  } catch (error) {
    console.error('Error entregando actividad:', error);
    
    Swal.fire({
      title: 'No se pudo entregar',
      text: error.response?.data?.message || 'Ocurrió un error al entregar la actividad.',
      icon: 'error',
      confirmButtonColor: '#2D3354',
      didOpen: (popup) => {
        popup.style.boxShadow = '0 6px 0 #e5e5e5';
        popup.style.border = '2px solid #e5e5e5';
        popup.style.borderRadius = '16px';
        popup.style.fontFamily = '"Jersey 20", sans-serif';
      }
    });
  } finally {
    setIsSubmittingEntrega(false);
  }
};

 const handleNavigateHome = async (event) => {
  event.preventDefault();
  if (hasUnsavedChanges) {
    const continuar = await mostrarAlertaCambiosSinGuardar();
    if (!continuar) return;
  }
  navigate('/inicio');
};

  const handleSaveProject = async () => {
    if (!selectedProject) {
      setProjectError('Selecciona un proyecto antes de guardar.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await api.put(`/proyectos/${selectedProject.id}`, { code });
      setSelectedProject(response.data);
      const saved = response.data.code || '';
      setCode(saved);
      setSavedCode(saved);
      await refreshProjects();
      setProjectError(null);
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      if (error.response?.data?.message) {
        setProjectError(error.response.data.message);
      } else {
        setProjectError('No se pudo guardar el proyecto. Intenta de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const editorRef = useRef(null);
const inputRef = useRef(null);
  const consoleHistoryRef = useRef(null);

  const scrollToLine = (lineNumber) => {
    if (editorRef.current) {
      const lineHeight = 22.4;
      const scrollTop = lineHeight * (lineNumber - 1);
      editorRef.current.scrollTop = scrollTop;
      editorRef.current.focus();
    }
  };

  const extractLineFromError = (errorText) => {
    const match = errorText.match(/Línea (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };
 const [consoleHistory, setConsoleHistory] = useState([{ type: 'output', text: 'Esperando ejecución...' }]);
 const [variables, setVariables] = useState([]);
 const [subalgorithms, setSubalgorithms] = useState([]);
  useEffect(() => {
    if (consoleHistoryRef.current) {
      consoleHistoryRef.current.scrollTop = consoleHistoryRef.current.scrollHeight;
    }
  }, [consoleHistory]);



const [consoleInput, setConsoleInput] = useState('');
const [isWaitingInput, setIsWaitingInput] = useState(false);
const [grade, setGrade] = useState(reviewData?.nota ?? '');
const [observaciones, setObservaciones] = useState(reviewData?.observaciones ?? '');
const [isSubmittingGrading, setIsSubmittingGrading] = useState(false);
const onPrint = (value) => {
  setConsoleHistory(prev => [...prev, { type: 'output', text: String(value) }]);
};

const onReadRequest = (targetName) => {
  setConsoleHistory(prev => [...prev, { type: 'system', text: `Esperando entrada para: ${targetName}` }]);
  setIsWaitingInput(true);
};
useEffect(() => {
  if (isWaitingInput && inputRef.current) {
    inputRef.current.focus();
  }
}, [isWaitingInput]);

const onError = (msg, line) => {
  setConsoleHistory(prev => [...prev, { type: 'error', text: `Error de ejecución: ${msg} (Línea ${line})` }]);
};

const onVariablesUpdate = (variables) => {
  setVariables(variables);
};

const onSubalgorithmsUpdate = (subalgorithms) => {
  setSubalgorithms(subalgorithms);
};

// Inicialización del motor
const { executeCode, sendInputToInterpreter } = useAlgorit(
  onPrint,
  onReadRequest,
  onError,
  onVariablesUpdate,
  onSubalgorithmsUpdate
);

// Manejador del botón Ejecutar
const handleRunCode = async () => {
  setConsoleHistory([{ type: 'output', text: '--- Iniciando ejecución ---' }]);
  const result = await executeCode(code);
  
  if (result?.error) {
    onError(result.msg, result.line);
  } else {
    setConsoleHistory(prev => [...prev, { type: 'system', text: '--- Ejecución finalizada ---' }]);
  }
};

// Manejador del input de consola
const handleConsoleSubmit = (e) => {
  e.preventDefault();
  if (consoleInput.trim() === '' || !isWaitingInput) return;

  setConsoleHistory(prev => [...prev, { type: 'input', text: `> ${consoleInput}` }]);
  sendInputToInterpreter(consoleInput);
  setConsoleInput('');
  setIsWaitingInput(false);
};

const highlightRef = useRef(null);
const mirrorRef = useRef(null);

const autocompleteItems = [
  { keyword: 'Algoritmo', insert: 'Algoritmo __CURSOR__\nInicio\n    \nFin', label: 'Algoritmo' },
  { keyword: 'Inicio', insert: 'Inicio\n    __CURSOR__\nFin', label: 'Inicio' },
  { keyword: 'Fin', insert: 'Fin', label: 'Fin' },
  { keyword: 'Var', insert: 'Var __CURSOR__: ;', label: 'Var' },
  { keyword: 'real', insert: 'real', label: 'real' },
  { keyword: 'entero', insert: 'entero', label: 'entero' },
  { keyword: 'cadena', insert: 'cadena', label: 'cadena' },
  { keyword: 'caracter', insert: 'caracter', label: 'caracter' },
  { keyword: 'booleano', insert: 'booleano', label: 'booleano' },
  { keyword: 'Mostrar', insert: 'Mostrar<< "__CURSOR__";', label: 'Mostrar' },
  { keyword: 'Leer', insert: 'Leer>> __CURSOR__;', label: 'Leer' },
  { keyword: 'Si', insert: 'Si (__CURSOR__) entonces;\n    \nFin_si', label: 'Si ...' },
  { keyword: 'Si Sino...', insert: 'Si (__CURSOR__) entonces;\n \n Sino\n    \nFin_si', label: 'Si Sino...' },
  { keyword: 'entonces', insert: 'entonces', label: 'entonces' },
  { keyword: 'Sino', insert: 'Sino\n    \n', label: 'Sino' },
  { keyword: 'Fin_si', insert: 'Fin_si', label: 'Fin_si' },
  { keyword: 'En caso', insert: 'En caso (__CURSOR__) sea;\n    Caso (__CURSOR__);\n        \n    Otro Caso;\n        \nFin_caso', label: 'En caso ...' },
  { keyword: 'sea', insert: 'sea', label: 'sea' },
  { keyword: 'Caso', insert: 'Caso (__CURSOR__);', label: 'Caso' },
  { keyword: 'Otro Caso', insert: 'Otro Caso;', label: 'Otro Caso' },
  { keyword: 'Fin_caso', insert: 'Fin_caso', label: 'Fin_caso' },
  { keyword: 'Para', insert: 'Para (__CURSOR__ Hasta ) hacer;\n    \nFin_Para', label: 'Para ...' },
  { keyword: 'Hasta', insert: 'Hasta', label: 'Hasta' },
  { keyword: 'hacer', insert: 'hacer', label: 'hacer' },
  { keyword: 'Fin_Para', insert: 'Fin_Para', label: 'Fin_Para' },
  { keyword: 'Mientras', insert: 'Mientras (__CURSOR__) hacer;\n    \nFin_mientras', label: 'Mientras ...' },
  { keyword: 'Fin_mientras', insert: 'Fin_mientras', label: 'Fin_mientras' },
  { keyword: 'Repetir', insert: 'Repetir\n    \nHasta(__CURSOR__);\nFin_Repetir', label: 'Repetir ...' },
  { keyword: 'Fin_Repetir', insert: 'Fin_Repetir', label: 'Fin_Repetir' },
  { keyword: 'Procedimiento', insert: 'Procedimiento __CURSOR__ ( );\nInicio\n   \nFin_Procedimiento', label: 'Procedimiento ...' },
  { keyword: 'Fin_Procedimiento', insert: 'Fin_Procedimiento', label: 'Fin_Procedimiento' },
  { keyword: 'Función', insert: 'Función __CURSOR__ ( );\nInicio\n \nDevolver(__CURSOR__);   \nFin_Función', label: 'Función ...' },
  { keyword: 'Devolver', insert: 'Devolver(__CURSOR__);', label: 'Devolver' },
  { keyword: 'Fin_Función', insert: 'Fin_Función', label: 'Fin_Función' },
  { keyword: 'Registro', insert: 'Registro: __CURSOR__;\n    __CURSOR__: ;\nFin_Registro', label: 'Registro ...' },
  { keyword: 'Fin_Registro', insert: 'Fin_Registro', label: 'Fin_Registro' },
  { keyword: 'V', insert: 'Verdadero', label: 'Verdadero' },
  { keyword: 'F', insert: 'Falso', label: 'Falso' },
  { keyword: 'Verdadero', insert: 'Verdadero', label: 'Verdadero' },
  { keyword: 'Falso', insert: 'Falso', label: 'Falso' },
  { keyword: 'true', insert: 'true', label: 'true' },
  { keyword: 'false', insert: 'false', label: 'false' },
  { keyword: 'Null', insert: 'nulo', label: 'null' },
  { keyword: 'nulo', insert: 'nulo', label: 'nulo' },
  { keyword: 'vacio', insert: 'vacio', label: 'vacio' },
  { keyword: 'Y', insert: 'Y', label: 'Y' },
  { keyword: 'O', insert: 'O', label: 'O' },
  { keyword: 'mod', insert: 'mod', label: 'mod' },
  { keyword: 'E:', insert: 'E:', label: 'E:' },
  { keyword: 'S:', insert: 'S:', label: 'S:' },
  { keyword: 'E/S:', insert: 'E/S:', label: 'E/S:' }
];

const reservedWords = autocompleteItems.map(item => item.keyword);

const [suggestions, setSuggestions] = useState([]);
const [suggestionsVisible, setSuggestionsVisible] = useState(false);
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 15, width: 260 });

const getWordAtCursor = (text, cursorPosition) => {
  const beforeCursor = text.slice(0, cursorPosition);
  const match = beforeCursor.match(/([A-Za-zÁÉÍÓÚáéíóúÑñ_]+)$/);
  return match ? { word: match[1], start: cursorPosition - match[1].length, end: cursorPosition } : null;
};

const getCaretCoordinates = (text, cursorPosition) => {
  const editor = editorRef.current;
  const mirror = mirrorRef.current;
  if (!editor || !mirror) return null;

  mirror.innerHTML = '';
  const beforeText = document.createTextNode(text.slice(0, cursorPosition));
  mirror.appendChild(beforeText);

  const cursorSpan = document.createElement('span');
  cursorSpan.textContent = '\u200b';
  mirror.appendChild(cursorSpan);
  mirror.appendChild(document.createTextNode(text.slice(cursorPosition)));

  const spanRect = cursorSpan.getBoundingClientRect();
  const editorRect = editor.getBoundingClientRect();

  return {
    top: spanRect.top - editorRect.top + editor.scrollTop + 22,
    left: Math.max(15, spanRect.left - editorRect.left + editor.scrollLeft),
    width: Math.min(320, editorRect.width - 30)
  };
};

const updateAutocomplete = (text, cursorPosition) => {
  const current = getWordAtCursor(text, cursorPosition || text.length);
  if (!current || current.word.length === 0) {
    setSuggestions([]);
    setSuggestionsVisible(false);
    return;
  }

  const filtered = autocompleteItems
    .filter(item => item.keyword.toLowerCase().startsWith(current.word.toLowerCase()) && item.keyword.toLowerCase() !== current.word.toLowerCase())
    .slice(0, 8);

  if (filtered.length > 0) {
    setSuggestions(filtered);
    setSelectedSuggestionIndex(0);
    setSuggestionsVisible(true);
    const position = getCaretCoordinates(text, cursorPosition);
    if (position) setSuggestionPosition(position);
  } else {
    setSuggestions([]);
    setSuggestionsVisible(false);
  }
};

const applySuggestion = (item) => {
  const editor = editorRef.current;
  if (!editor) return;

  const cursorPosition = editor.selectionStart;
  const current = getWordAtCursor(code, cursorPosition);
  if (!current) return;

  const insertText = item.insert || item.keyword;
  const placeholderIndex = insertText.indexOf('__CURSOR__');
  const finalInsert = insertText.replace(/__CURSOR__/g, '');
  const updatedCode = code.slice(0, current.start) + finalInsert + code.slice(current.end);
  setCode(updatedCode);
  setSuggestionsVisible(false);

  window.requestAnimationFrame(() => {
    if (editor) {
      const cursorOffset = placeholderIndex >= 0 ? placeholderIndex : finalInsert.length;
      const newPosition = current.start + cursorOffset;
      editor.focus();
      editor.setSelectionRange(newPosition, newPosition);
    }
  });
};

const handleEditorChange = (e) => {
  const updatedCode = e.target.value;
  const cursorPosition = e.target.selectionStart;
  setCode(updatedCode);
  updateAutocomplete(updatedCode, cursorPosition);
};

const handleEditorKeyDown = (e) => {
  if (suggestionsVisible && suggestions.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % suggestions.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      applySuggestion(suggestions[selectedSuggestionIndex]);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestionsVisible(false);
      return;
    }
  }
};

const handleEditorBlur = () => {
  setTimeout(() => setSuggestionsVisible(false), 150);
};

const handleEditorFocus = () => {
  updateAutocomplete(code, editorRef.current?.selectionStart ?? code.length);
};

const highlightCode = (text) => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const commentPattern = /\/\*[\s\S]*?\*\/|\/\/.*$/gm;
  const stringPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
  const keywordPattern = new RegExp(`\\b(${reservedWords.join('|')})\\b`, 'gi');

  const commentPlaceholders = [];
  const stringPlaceholders = [];

  const withoutComments = escaped.replace(commentPattern, (match) => {
    const index = commentPlaceholders.length;
    commentPlaceholders.push(match);
    return `___COMMENT_PLACEHOLDER_${index}___`;
  });

  const withoutStrings = withoutComments.replace(stringPattern, (match) => {
    const index = stringPlaceholders.length;
    stringPlaceholders.push(match);
    return `___STRING_PLACEHOLDER_${index}___`;
  });

  const highlightedKeywords = withoutStrings.replace(keywordPattern, '<span class="token keyword">$1</span>');

  const restoredStrings = highlightedKeywords.replace(/___STRING_PLACEHOLDER_(\d+)___/g, (_, index) => {
    return `<span class="token string">${stringPlaceholders[Number(index)]}</span>`;
  });

  return restoredStrings.replace(/___COMMENT_PLACEHOLDER_(\d+)___/g, (_, index) => {
    return `<span class="token comment">${commentPlaceholders[Number(index)]}</span>`;
  });
};

const handleScroll = () => {
  if (editorRef.current && highlightRef.current) {
    highlightRef.current.scrollTop = editorRef.current.scrollTop;
    highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
  }
};

const colors = {
    primary: '#2D3354',
    sidebar: '#E5E5E7',
    content: '#EEEEEE',
    white: '#FFFFFF'
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

 useEffect(() => {
  const handleBeforeUnload = (event) => {
    if (!hasUnsavedChanges) return;
    event.preventDefault();
    event.returnValue = '';
    return '';
  };

  const handlePopState = async () => {
    if (!hasUnsavedChanges) return;
    window.history.pushState(null, null, window.location.pathname);

    const confirmado = await Swal.fire({
      title: '¿Deseas salir?',
      html: 'Tienes cambios sin guardar.<br />' +
            '<strong>Si cambias de página, perderás todo tu progreso.</strong><br />' +
            '¿Deseas continuar de todos modos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Quedarme aquí',
      confirmButtonColor: '#2D3354', 
      cancelButtonColor: '#7a7a7a',
      didOpen: (popup) => {
        popup.style.boxShadow = '0 6px 0 #e5e5e5';
        popup.style.border = '2px solid #e5e5e5';
        popup.style.borderRadius = '16px';
        popup.style.fontFamily = '"Jersey 20", sans-serif';
      }
    });

    if (confirmado.isConfirmed) {
      window.removeEventListener('popstate', handlePopState);
      
      // Usamos -2 para saltarnos el pushState de bloqueo y volver a la página anterior real
      window.history.go(-2); 
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('popstate', handlePopState);
  };
}, [hasUnsavedChanges, selectedProject]);


  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);


  return (
    <>
      <style>
        {`
            .algorit-layout {
                display: flex;
                flex-direction: column;
                gap: 20px;
                padding: 20px;
                background-color: #E5E5E7;
                min-height: 10vh;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            }
        
            @media (min-width: 1024px) {
                .algorit-layout {
                    flex-direction: row;
                    align-items: stretch;
                }
                .algorit-sidebar { flex: 0 0 260px; }
                .algorit-editor { flex: 1; min-width: 450px; }
                .algorit-console { flex: 0 0 320px; height: 450px; min-height: 0; }
            }

            .card-shadow {
                background: #EEEEEE;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                border: 1px solid #ccc;
                overflow: hidden;
            }

            /* Nuevos estilos para el Editor Funcional */
            .editor-container {
                display: flex;
                flex: 1;
                border-top: 1px solid #ccc;
                border-bottom: 1px solid #ccc;
                overflow-y: auto;
                background-color: #fff;
            }

            .line-numbers {
                width: 40px;
                text-align: right;
                padding: 10px 15px 10px 0;
                color: #94a3b8;
                background-color: #f8fafc;
                user-select: none;
                border-right: 1px solid #e2e8f0;
                font-size: 14px;
                line-height: 1.6;
            }

            .editor-content {
                position: relative;
                flex: 1;
                overflow: hidden;
            }

            .code-highlight {
                position: absolute;
                inset: 0;
                padding: 10px 15px;
                margin: 0;
                font-size: 14px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-break: break-word;
                overflow-wrap: break-word;
                color: #0f172a;
                pointer-events: none;
            }

            .token.keyword { color: #2D3354; font-weight: 600; }
            .token.string { color: #16a34a; }
            .token.comment { color: rgba(100, 116, 139, 0.72); font-style: italic; }

            .code-textarea {
                position: relative;
                flex: 1;
                width: 100%;
                height: 100%;
                padding: 10px 15px;
                border: none;
                outline: none;
                resize: none;
                font-size: 14px;
                line-height: 1.6;
                caret-color: #334155;
                background: transparent;
                color: transparent;
                -webkit-text-fill-color: transparent;
                z-index: 1;
                white-space: pre-wrap;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .code-textarea::selection {
                background: rgba(59, 130, 246, 0.25);
            }

            .code-textarea, .code-highlight {
                min-height: 100%;
            }

            .code-textarea::-webkit-scrollbar {
                width: 0;
                height: 0;
            }

            .code-textarea::-webkit-scrollbar-thumb {
                background: transparent;
            }

            .code-textarea::-webkit-scrollbar-track {
                background: transparent;
            }

            .textarea-mirror {
                position: absolute;
                top: 0;
                left: 0;
                visibility: hidden;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow-wrap: break-word;
                width: calc(100% - 30px);
                padding: 10px 15px;
                font-size: 14px;
                line-height: 1.6;
                font-family: inherit;
            }

            .suggestion-list {
                position: absolute;
                z-index: 20;
                max-height: 260px;
                overflow-y: auto;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
            }

            .suggestion-item {
                width: 100%;
                text-align: left;
                border: none;
                background: transparent;
                padding: 10px 14px;
                color: #0f172a;
                cursor: pointer;
                font-size: 13px;
                line-height: 1.4;
                transition: background-color 0.2s ease;
            }

            .suggestion-item:hover,
            .suggestion-item.active {
                background: #e2e8f0;
            }

            .suggestion-item:focus {
                outline: none;
            }

            /* Estilos para el input de la consola */
            .console-input-area {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px dashed #334155;
            }

            .console-input {
                background: transparent;
                border: none;
                color: #e2e8f0;
                font-size: 14px;
                outline: none;
                flex: 1;
            }

            .console-history {
                overflow-y: auto;
                padding-right: 6px;
                min-height: 0;
                max-height: 100%;
                scrollbar-gutter: stable;
            }
            .console-history::-webkit-scrollbar {
                width: 8px;
            }
            .console-history::-webkit-scrollbar-track {
                background: #1e293b;
            }
            .console-history::-webkit-scrollbar-thumb {
                background: #4b5563;
                border-radius: 4px;
            }
            .console-history::-webkit-scrollbar-thumb:hover {
                background: #6b7280;
            }

                .console-input-area.is-waiting {
    border: 1px solid #3b82f6;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.console-error { color: #f87171; font-weight: bold; }
.console-system { color: #60a5fa; font-style: italic; }

.console-inner-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.console-internalbar {
    background-color: #1e293b;
    border-right: 1px solid #334155;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
    gap: 15px;
}

.console-main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    padding-top: 20px;
    padding-bottom: 20px;
    overflow: hidden;
}
        `}
      </style>

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
        <div style={{ fontFamily: "'Jersey 20', sans-serif", fontSize: isMobile ? '38px' : '45px', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                  <a href="/inicio" onClick={handleNavigateHome} style={{textDecoration: 'none', color: 'inherit'}}>
                    <span style={{ color: '#E5E5E7', WebkitTextStroke: '1px #2D3354' }}>
                      {isMobile ? 'Alg' : 'Algorit'}
                    </span>
                    <span style={{ color: '#2D3354' }}>+</span>
                  </a>
</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleRunCode} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#0b9448', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            <Play size={16} fill="currentColor" /> Ejecutar
          </button>
          {!reviewMode && (
            <>
              {activeActividad && (
                <button
                  type="button"
                  onClick={handleEntregarActividad}
                  disabled={isSubmittingEntrega}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0b9448',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: isSubmittingEntrega ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmittingEntrega ? 'Enviando...' : 'Entregar'}
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveProject}
                disabled={!selectedProject || isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: selectedProject ? '#2D3354' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: selectedProject ? 'pointer' : 'not-allowed'
                }}
              >
                <Save size={16} />
              </button>
            </>
          )}
        </div>
      </nav>
     
      <div className="algorit-layout">
        
        {/* --- COLUMNA 1: SIDEBAR --- */}
        <div className="algorit-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {activeActividad ? (
                    <div
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '12px',
                          marginBottom: '12px',
                          userSelect: 'none',
                          WebkitUserSelect: 'none'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f5988', marginBottom: '6px', textTransform: 'uppercase' }}>Actividad asignada</div>
                        {!reviewMode && (
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f5988', marginBottom: '6px', textTransform: 'uppercase' }}>
                            Tiempo: {formatearCronometro(segundosTranscurridos)}
                          </div>
                        )}
                        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>{activeActividad.titulo}</div>
                        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, textAlign: 'justify' }}>{activeActividad.enunciado}</div>
                    </div>
) : (           
            <div className="card-shadow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary, fontWeight: '600' }}>
                        <Folder size={18} />
                        <span>Mis Proyectos</span>
                    </div>
                </div>
                <div style={{ padding: '15px 20px', minHeight: '220px' }}>              
                    {isLoadingProjects ? (
                        <p style={{ margin: 0, color: '#64748b', textAlign: 'center' }}>Cargando proyectos...</p>
                    ) : projects.length > 0 ? (
                        projects.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => handleProjectSelect(project)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: selectedProject?.id === project.id ? '#eef2ff' : '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '12px 14px',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                color: '#334155'
                              }}
                            >
                                <span>{project.title}</span>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : ''}</span>
                            </button>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <Folder size={48} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                            <p style={{ margin: '0 0 5px 0', fontWeight: '500', color: '#64748b' }}>No hay proyectos</p>
                            <p style={{ margin: 0, fontSize: '13px' }}>Crea tu primer proyecto desde Inicio para comenzar.</p>
                        </div>
                    )}
                    {projectError && <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '10px' }}>{projectError}</p>}
                </div>
            </div>
)}
            {reviewMode && reviewData ? (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '12px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f5988', textTransform: 'uppercase' }}>Revisión de entrega</div>
                  <button style={{ background: '#eef2ff', border: '1px solid #d1e3ff', color: '#2D3354', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>Delegar a la IA</button>
                </div>
                <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '10px' }}>{reviewData.estudiante?.name} {reviewData.estudiante?.lastname} (@{reviewData.estudiante?.username})</div>
                <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>Tiempo empleado: {reviewData.tiempoEmpleado ? formatearCronometro(reviewData.tiempoEmpleado) : '—'}</div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Nota (0-100)</label>
                  <input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} style={{ width: '100%', padding: '8px 10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>Observaciones</label>
                  <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} style={{ width: '100%', minHeight: '80px', padding: '8px 10px', marginTop: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button onClick={handleGradeSubmit} disabled={isSubmittingGrading} style={{ background: '#2D3354', color: 'white', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>{isSubmittingGrading ? 'Enviando...' : 'Entregar'}</button>
                </div>
              </div>
            ) : (
              <AccordionItem icon={<Database size={18} />} title="Variables" color="#3b82f6">
            {!reviewMode && (
              <div>
                  {variables.length > 0 ? (
                    <div>
                      {variables.map((variable, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{variable.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Tipo: {variable.type}{variable.size ? ` (${Array.isArray(variable.size) ? '[' + variable.size.join('][') + ']' : variable.size})` : ''}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                            Valor: {variable.value || 'nulo'} 
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      No hay variables definidas
                    </div>
                  )}
      
                  </div>
                  </AccordionItem>
                
                <AccordionItem icon={<Box size={18} />} title="Subalgoritmos" color="#f97316">
                  {subalgorithms.length > 0 ? (
                    <div>
                      {subalgorithms.map((sub, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '6px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: '600', color: '#1e293b' }}>{sub.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {sub.isFunction ? 'Función' : 'Procedimiento'} {sub.returnType ? `: ${sub.returnType}` : ''}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'monospace' }}>
                            Parámetros: {sub.params.length > 0 ? sub.params.map(param => {
                                const paramName = param.name || (param.target?.value ?? param.target?.property ?? '');
                                const paramType = param.type ? `: ${param.type}` : '';
                                const paramMode = param.mode ? ` (${param.mode})` : '';
                                return `${paramName}${paramType}${paramMode}`;
                              }).join(', ') : 'Sin parámetros'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      No hay subalgoritmos definidos
                    </div>
                  )}
                </AccordionItem>
            )}

        {/* --- COLUMNA 2: EDITOR INTERACTIVO --- */}
        <div className="algorit-editor card-shadow" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fff' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>Editor de Pseudocódigo {hasUnsavedChanges && (
        <span style={{ color: '#b91c1c'}}>
          Cambios sin guardar. Se perderán al salir.
        </span>
      )}</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Líneas: {lineCount}</span>
            </div>
            
            <div className="editor-container">
                {/* Números de línea dinámicos */}
                <div className="line-numbers">
                    {lines.map(num => (
                        <div key={num}>{num}</div>
                    ))}
                </div>
                <div className="editor-content">
                    <pre
                        ref={highlightRef}
                        className="code-highlight"
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: highlightCode(code) + '\n' }}
                    />
                    <textarea 
                        ref={editorRef}
                        className="code-textarea"
                        value={code}
                        onChange={handleEditorChange}
                        onKeyDown={handleEditorKeyDown}
                        onBlur={handleEditorBlur}
                        onFocus={handleEditorFocus}
                        onClick={handleEditorFocus}
                        onScroll={handleScroll}
                        spellCheck="false"
                    />
                    <div ref={mirrorRef} className="textarea-mirror" aria-hidden="true" />
                    {suggestionsVisible && suggestions.length > 0 && (
                      <div
                        className="suggestion-list"
                        role="listbox"
                        aria-label="Sugerencias de autocompletado"
                        style={{
                          top: suggestionPosition.top,
                          left: suggestionPosition.left,
                          width: suggestionPosition.width
                        }}
                      >
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={suggestion.keyword}
                            type="button"
                            className={`suggestion-item ${index === selectedSuggestionIndex ? 'active' : ''}`}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              applySuggestion(suggestion);
                            }}
                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- COLUMNA 3: CONSOLA INTERACTIVA --- */}
<div className="algorit-console card-shadow" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
    
<div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: '10px 15px', 
    backgroundColor: '#1e293b', 
    color: '#e2e8f0', 
    fontWeight: '500',
    borderBottom: '1px solid #334155'
}}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Terminal size={18} color="#10b981" />
        <span style={{ fontSize: '14px' }}>Consola de Salida</span>
    </div>

 
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Indicador de Estado de Lectura (Database) */}
        <div title={isWaitingInput ? "Esperando entrada..." : "Sistema listo"} style={{ display: 'flex', alignItems: 'center' }}>
            <Database 
                size={16} 
                color={isWaitingInput ? "#3b82f6" : "#4b5563"} 
                style={{ transition: 'color 0.3s ease' }}
            />
        </div>


        <div style={{ width: '1px', height: '16px', backgroundColor: '#334155' }} />

        <button 
            title="Limpiar consola" 
            onClick={() => setConsoleHistory([])} 
            style={{ 
                background: 'none', 
                border: 'none', 
                color: '#94a3b8', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <Eraser size={18} />
        </button>
    </div>
</div>
    
    {/* Contenedor del Cuerpo (Sidebar + Historial) */}
    <div className="console-inner-layout">
        
        <div className="console-main-content">
            
            <div className="console-history" ref={consoleHistoryRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {consoleHistory.map((item, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            color: item.type === 'input' ? '#e2e8f0' : item.type === 'error' ? '#f87171' : '#10b981',
                            cursor: item.type === 'error' ? 'pointer' : 'default',
                            fontSize: '14px',
                            fontFamily: 'Consolas, monospace'
                        }}
                        onClick={item.type === 'error' ? () => {
                            const line = extractLineFromError(item.text);
                            if (line) scrollToLine(line);
                        } : undefined}
                    >
                        {item.text}
                    </div>
                ))}
            </div>

            <form onSubmit={handleConsoleSubmit} className="console-input-area">
                <span style={{ color: '#e2e8f0' }}>{'>'}</span>
                <input 
                    type="text" 
                    className="console-input"
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    placeholder={isWaitingInput ? "Escriba..." : "Listo."}
                    autoComplete="off"
                    disabled={!isWaitingInput}
                    ref={inputRef}
                />
            </form>
        </div>
    </div>
</div>

  );
};

const AccordionItem = ({ icon, title, color, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ marginBottom: '8px' }}>
      <div 
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '12px 15px', backgroundColor: '#ffffff', 
          border: `1px solid ${color}40`, borderRadius: '8px',
          cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: '600' }}>
          <div style={{ color: color }}>{icon}</div>
          {title}
        </div>
        <ChevronDown 
          size={18} 
          color={color} 
          style={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease' 
          }} 
        />
      </div>
      {isExpanded && (
        <div style={{ 
          padding: '12px 15px', 
          backgroundColor: '#f8fafc', 
          border: `1px solid ${color}20`, 
          borderTop: 'none', 
          borderRadius: '0 0 8px 8px',
          fontSize: '13px',
          color: '#475569'
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;