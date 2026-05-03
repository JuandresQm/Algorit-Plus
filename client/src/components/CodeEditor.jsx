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

  // Función para extraer línea de un mensaje de error
  const extractLineFromError = (errorText) => {
    const match = errorText.match(/Línea (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };
 const [consoleHistory, setConsoleHistory] = useState([{ type: 'output', text: 'Esperando ejecución...' }]);
  // useEffect para hacer scroll automático al final de la consola cuando cambie el historial
  useEffect(() => {
    if (consoleHistoryRef.current) {
      consoleHistoryRef.current.scrollTop = consoleHistoryRef.current.scrollHeight;
    }
  }, [consoleHistory]);

  // 2. ESTADO DE LA CONSOLA: Guardamos el historial y lo que el usuario tipea

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

// Inicialización del motor
const { executeCode, sendInputToInterpreter } = useAlgorit(onPrint, onReadRequest, onError);

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

  // Calculamos cuántas líneas tiene el código actualmente para renderizar los números
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
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                line-height: 1.6;
            }

            .code-textarea {
                flex: 1;
                padding: 10px 15px;
                border: none;
                outline: none;
                resize: none;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                line-height: 1.6;
                color: #334155;
                white-space: pre;
                background: transparent;
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
                font-family: 'Consolas', 'Monaco', monospace;
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

        {/* Botón de Ejecutar (Preparando el terreno) */}
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

            <AccordionItem icon={<Database size={18} />} title="Variables" color="#3b82f6" />
            <AccordionItem icon={<Box size={18} />} title="Procedimientos" color="#f97316" />
            <AccordionItem icon={<Code size={18} />} title="Funciones" color="#14b8a6" />
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
                {/* Textarea donde el usuario escribe */}
                <textarea 
                    ref={editorRef}
                    className="code-textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                />
            </div>
        </div>

        {/* --- COLUMNA 3: CONSOLA INTERACTIVA --- */}
<div className="algorit-console card-shadow" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', borderColor: '#1e293b' }}>
    
<div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', // Separa el título de los botones
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

const AccordionItem = ({ icon, title, color }) => (
  <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
      padding: '12px 15px', backgroundColor: '#ffffff', 
      border: `1px solid ${color}40`, borderRadius: '8px',
      cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155', fontWeight: '600' }}>
          <div style={{ color: color }}>{icon}</div>
          {title}
      </div>
      <ChevronDown size={18} color={color} />
  </div>
);

export default CodeEditorView;