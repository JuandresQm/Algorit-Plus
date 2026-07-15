import React, {useEffect, useState} from 'react';
// Importas tus dos nuevos componentes interactivos
import MetodologiaFlowSimulator from './MetodologiaFlowSimulator';
import TresCajasSimulador from './TresCajasSimulador';
import EditorCode from './CodeEditor';
const LessonContent = ({ content, onActivityComplete, onLessonCodeSubmit }) => {
  if (!Array.isArray(content) || !content.length) return null;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
 useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <div className="lesson-content" style={styles.content}>
      <style>
        {`
          .lesson-card-shadow {
              background: #EEEEEE;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
              border: 1px solid #ccc;
              overflow: hidden;
              margin-bottom: 20px;
              display: flex;
              flex-direction: column;
          }
          .lesson-editor-container {
              display: flex;
              flex: 1;
              border-top: 1px solid #ccc;
              background-color: #fff;
          }
          .lesson-line-numbers {
              width: 40px;
              text-align: right;
              padding: 10px 15px 10px 0;
              color: #94a3b8;
              background-color: #f8fafc;
              user-select: none;
              border-right: 1px solid #e2e8f0;
              font-size: 14px;
              line-height: 1.6;
              font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
          }
          .lesson-code-highlight {
              flex: 1;
              padding: 10px 15px;
              margin: 0;
              font-size: 14px;
              line-height: 1.6;
              white-space: pre-wrap;
              word-break: break-word;
              overflow-wrap: break-word;
              color: #0f172a;
              background: transparent;
              font-family: 'Jersey 20', sans-serif;
          }
          /* Tokens de colores idénticos a CodeEditor.jsx */
          .lesson-token.keyword { color: #2D3354; font-weight: 600; }
          .lesson-token.string { color: #16a34a; }
          .lesson-token.comment { color: rgba(100, 116, 139, 0.72); font-style: italic; }
        .lesson-main-card {
    background-color: #FFFFFF;
    border-radius: 12px;
    box-shadow: 0 4px 0 #e5e5e5;
    border: 2px solid #e5e5e5; 
    padding: 24px;
    margin: 20px auto;
    max-width: 800px; 
}
        `}
      </style>

      {content.map((block, idx) => {
        switch (block.type) {
          case 'text':
            return <div className="lesson-main-card"><p key={idx} className="lesson-text" style={styles.textElement}>{block.value}</p></div>;
          
          case 'code': {
            // Calculamos las líneas dinámicamente basándonos en el texto del bloque
            const lines = block.value ? block.value.split('\n') : [];
            
            // Función opcional para resaltar palabras clave si deseas el mismo look de colores:
            const highlightLessonCode = (text) => {
              const escaped = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
              
              // Palabras clave extraídas de tu CodeEditor
              const keywords = ['Algoritmo', 'Inicio', 'Fin', 'Var', 'real', 'entero', 'cadena', 'caracter', 'booleano', 'Mostrar', 'Leer', 'Si', 'Sino', 'Fin_si', 'Para', 'Hasta', 'hacer', 'Fin_Para', 'Mientras', 'Fin_mientras', 'Repetir', 'Fin_Repetir', 'Procedimiento', 'Fin_Procedimiento', 'Función', 'Devolver', 'Fin_Función', 'Registro', 'Fin_Registro', 'Verdadero', 'Falso'];
              const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
              
              return escaped.replace(keywordPattern, '<span class="lesson-token keyword">$1</span>');
            };

            return (
              <div key={idx} className="lesson-card-shadow">
                {/* Cabecera idéntica al editor */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#fff' }}>
                    <span style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Código de Ejemplo</span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Líneas: {lines.length}</span>
                </div>
                
                {/* Contenedor del Editor de lectura */}
                <div className="lesson-editor-container">
                    <div className="lesson-line-numbers">
                        {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                        ))}
                    </div>
                    <pre 
                      className="lesson-code-highlight"
                      dangerouslySetInnerHTML={{ __html: highlightLessonCode(block.value) }}
                    />
                </div>
              </div>
            );
          }
          
          case 'image':
            return <img key={idx} src={block.value} alt="" className="lesson-image" style={{ maxWidth: '100%', marginBottom: '16px' }} />;
          
          case 'simulator_flow':
            return (
              <div key={idx} className="my-4 p-4 bg-white rounded shadow-sm">
                <h3 style={styles.textElement} className="text-lg font-bold text-center">{block.value}</h3>
                <MetodologiaFlowSimulator settings={block.settings} onComplete={onActivityComplete} />
              </div>
            );

          case 'simulator_boxes':
            return (
              <div key={idx} className="my-4 p-4 bg-white rounded shadow-sm">
                <h3 style={styles.textElement} className="text-lg font-bold text-center">{block.value}</h3>
                <TresCajasSimulador settings={block.settings} onComplete={onActivityComplete} />
              </div>
            );
          case 'editorCode':
  return (
   <div key={idx} style={{ 
      width: '85vw',        
      marginLeft: isMobile ? '5px' : '-77.5px',   
      height: '90vh',
      overflow:'auto',
    }}>
     <EditorCode 
        lessonMode={true}
        lessonData={block.settings}
onLessonSubmit={(code, resultadoAsistente) => onLessonCodeSubmit(code, resultadoAsistente)}        onComplete={onActivityComplete}
      />
    </div>
  );
          default:
            return null;
        }
      })}
   </div>
  );
};


const styles = {
  content: {
    marginBottom: '16px',
    textAlign: 'justify'
  },
  textElement: {
    fontFamily: "'Jersey 20', sans-serif",
    marginBottom: '16px',
    textAlign: 'justify'
  , fontSize: '16px',
  }
}; 

export default LessonContent;