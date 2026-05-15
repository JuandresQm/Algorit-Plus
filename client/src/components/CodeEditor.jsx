import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Plus, Database, Box, Code, Terminal, ChevronDown, Play, Eraser } from 'lucide-react';
import { useAlgorit } from '../hooks/useAlgorit';
function CodeEditorView() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 1. ESTADO DEL EDITOR: Guardamos el código que el usuario escribe
  const [code, setCode] = useState(
`Algoritmo Test_Integral_Algorit
Inicio
    // 1. Prueba de Variables y Tipos
    Var edad: entero, nota: real, msj: cadena, esEstudiante: booleano;    
    /* 2. Prueba de Asignación y Operadores
       Probamos jerarquía: Paréntesis -> Multiplicación -> Suma -> Relacional */
    nota = (10 + 5) * 2 / 3; 
    esEstudiante = Verdadero;
    msj = "Resultado de nota: ";

    // 3. Prueba de Mostrar con concatenación y comas
    Mostrar << msj, nota;
    Mostrar << "Estado Academico: " + esEstudiante;

    // 4. Prueba de Lectura
    Mostrar << "Ingrese su edad: ";
    Leer >> edad;

    // 5. Estructura Condicional Doble y Operadores Lógicos
    Si (edad >= 18 Y esEstudiante = true) entonces;
        Mostrar << "Usuario mayor de edad y activo";
    Sino
        Mostrar << "No cumple requisitos lógicos";
    Fin_si

    // 6. Estructura de Selección Múltiple (En caso)
    En caso (edad) sea;
        Caso (18);
            Mostrar << "Justo en la mayoria de edad";
        Otro Caso;
            Mostrar << "Edad diferente a 18";
    Fin_caso

    // 7. Prueba de Arreglos (Base 1)
    Var notas[3]:real;
    notas[1] = 15.5;
    notas[2] = 18.0;
    notas[3] = 20;

    // 8. Ciclo Para
    Para (i = 1 Hasta 3) hacer;
        Mostrar << "Nota en posicion "+ i + ": " + notas[i];
    Fin_Para

    // 9. Ciclo Mientras
    Var control: entero;
    control = 1;
    Mientras (control <= 2) hacer;
        Mostrar << "Iteracion Mientras: ", control;
        control = control + 1;
    Fin_mientras

    // 10. Ciclo Repetir
    Repetir
        Mostrar << "Ejecutando Repetir..." + control;
        control = control - 1;
    Hasta(control = 0);
    Fin_Repetir

    
    // 12. Operadores Especiales y Nulos
    Var estado: cadena;
    estado = nulo;
    Si (nota != 0 O estado = vacio) entonces;
        Mostrar << "Prueba finalizada exitosamente";
    Fin_si
Fin`
  );

  // Ref para el textarea del editor
  const editorRef = useRef(null);

  // Ref para el div del historial de consola
  const consoleHistoryRef = useRef(null);

  // Función para hacer scroll a una línea específica
  const scrollToLine = (lineNumber) => {
    if (editorRef.current) {
      const lineHeight = 22.4; // Aproximado basado en line-height: 1.6 y font-size: 14px
      const scrollTop = lineHeight * (lineNumber - 1);
      editorRef.current.scrollTop = scrollTop;
      // También enfocar el textarea
      editorRef.current.focus();
    }
  };

  const extractLineFromError = (errorText) => {
    const match = errorText.match(/Línea (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };
 const [consoleHistory, setConsoleHistory] = useState([{ type: 'output', text: 'Esperando ejecución...' }]);
 const [variables, setVariables] = useState([]);
  // useEffect para hacer scroll automático al final de la consola cuando cambie el historial
  useEffect(() => {
    if (consoleHistoryRef.current) {
      consoleHistoryRef.current.scrollTop = consoleHistoryRef.current.scrollHeight;
    }
  }, [consoleHistory]);



const [consoleInput, setConsoleInput] = useState('');
const [isWaitingInput, setIsWaitingInput] = useState(false);
// Callbacks para el motor
const onPrint = (value) => {
  setConsoleHistory(prev => [...prev, { type: 'output', text: String(value) }]);
};

const onReadRequest = (targetName) => {
  setConsoleHistory(prev => [...prev, { type: 'system', text: `Esperando entrada para: ${targetName}` }]);
  setIsWaitingInput(true);
};

const onError = (msg, line) => {
  setConsoleHistory(prev => [...prev, { type: 'error', text: `Error de ejecución: ${msg} (Línea ${line})` }]);
};

const onVariablesUpdate = (variables) => {
  setVariables(variables);
};

// Inicialización del motor
const { executeCode, sendInputToInterpreter } = useAlgorit(onPrint, onReadRequest, onError, onVariablesUpdate);

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
  { keyword: 'En caso', insert: 'En caso (__CURSOR__) sea\n    Caso (__CURSOR__);\n        \n    Otro Caso;\n        \nFin_caso', label: 'En caso ...' },
  { keyword: 'sea', insert: 'sea', label: 'sea' },
  { keyword: 'Caso', insert: 'Caso (__CURSOR__);', label: 'Caso' },
  { keyword: 'Otro Caso', insert: 'Otro Caso;', label: 'Otro Caso' },
  { keyword: 'Fin_caso', insert: 'Fin_caso', label: 'Fin_caso' },
  { keyword: 'Para', insert: 'Para (__CURSOR__ Hasta ) hacer\n    \nFin_Para', label: 'Para ...' },
  { keyword: 'Hasta', insert: 'Hasta', label: 'Hasta' },
  { keyword: 'hacer', insert: 'hacer', label: 'hacer' },
  { keyword: 'Fin_Para', insert: 'Fin_Para', label: 'Fin_Para' },
  { keyword: 'Mientras', insert: 'Mientras (__CURSOR__) hacer\n    \nFin_mientras', label: 'Mientras ...' },
  { keyword: 'Fin_mientras', insert: 'Fin_mientras', label: 'Fin_mientras' },
  { keyword: 'Repetir', insert: 'Repetir\n    \nHasta(__CURSOR__);\nFin_Repetir', label: 'Repetir ...' },
  { keyword: 'Fin_Repetir', insert: 'Fin_Repetir', label: 'Fin_Repetir' },
  { keyword: 'Procedimiento', insert: 'Procedimiento __CURSOR__ ( );\nInicio\n   \nFin_Procedimiento', label: 'Procedimiento ...' },
  { keyword: 'Fin_Procedimiento', insert: 'Fin_Procedimiento', label: 'Fin_Procedimiento' },
  { keyword: 'Función', insert: 'Función __CURSOR__ ( );\nInicio\n \nDevolver(__CURSOR__);   \nFin_Función', label: 'Función ...' },
  { keyword: 'Devolver', insert: 'Devolver(__CURSOR__);', label: 'Devolver' },
  { keyword: 'Fin_Función', insert: 'Fin_Función', label: 'Fin_Función' },
  { keyword: 'Registro', insert: 'Registro __CURSOR__\n    __CURSOR__: ;\nFin_Registro', label: 'Registro ...' },
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
            }

            .code-textarea::selection {
                background: rgba(59, 130, 246, 0.25);
            }

            .code-textarea, .code-highlight {
                min-height: 100%;
            }

            .code-textarea::-webkit-scrollbar {
                width: 8px;
            }

            .code-textarea::-webkit-scrollbar-thumb {
                background: rgba(148, 163, 184, 0.6);
                border-radius: 9999px;
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
          <Link to="/" style={{textDecoration: 'none'}}>
            <span style={{ color: '#E5E5E7', WebkitTextStroke: '1px #2D3354' }}>
              {isMobile ? 'Alg' : 'Algorit'}
            </span>
            <span style={{ color: '#2D3354' }}>+</span>
          </Link>
        </div>

        {/* Botón de Ejecutar */}
        <button onClick={handleRunCode} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#10b981', color: 'white', border: 'none',
            padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer'
        }}>
  <Play size={16} fill="currentColor" /> Ejecutar
</button>
      </nav>
      <div className="algorit-layout">
        
        {/* --- COLUMNA 1: SIDEBAR --- */}
        <div className="algorit-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="card-shadow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.primary, fontWeight: '600' }}>
                        <Folder size={18} />
                        <span>Mis Proyectos</span>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                        <Plus size={16} /> Nuevo
                    </button>
                </div>
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Folder size={48} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                    <p style={{ margin: '0 0 5px 0', fontWeight: '500', color: '#64748b' }}>No hay proyectos</p>
                    <p style={{ margin: 0, fontSize: '13px' }}>Crea tu primer proyecto</p>
                </div>
            </div>

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
            <AccordionItem icon={<Box size={18} />} title="Procedimientos" color="#f97316">
              <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                Funcionalidad pendiente
              </div>
            </AccordionItem>
            <AccordionItem icon={<Code size={18} />} title="Funciones" color="#14b8a6">
              <div style={{ fontStyle: 'italic', color: '#94a3b8' }}>
                Funcionalidad pendiente
              </div>
            </AccordionItem>
        </div>

        {/* --- COLUMNA 2: EDITOR INTERACTIVO --- */}
        <div className="algorit-editor card-shadow" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fff' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>Editor de Pseudocódigo</span>
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
                />
            </form>
        </div>
    </div>
</div>

      </div>
    </>
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

export default CodeEditorView;