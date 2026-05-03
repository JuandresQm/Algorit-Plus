import { Lexer } from '../engine/lexer';
import { Parser } from '../engine/parser';
import { Interpreter } from '../engine/interpreter';
import { useRef } from 'react';
export const useAlgorit = (onPrint, onReadRequest, onError) => {
    

    const interpreterRef = useRef(null);

    const executeCode = async (code) => {
        try {
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            const parser = new Parser(tokens);
            const ast = parser.parse();

            if (parser.errors.length > 0) {
                throw parser.errors[0];
            }

            // Pasamos los callbacks al instanciar el Intérprete
            interpreterRef.current = new Interpreter(onPrint, onReadRequest, onError); 
            await interpreterRef.current.run(ast);

            
            return { error: false };

        } catch (error) {
            return { 
                error: true, 
                line: error.line || (error.token ? error.token.line : 1), 
                msg: error.message 
            };
        }
    };

    // Esta función la llamarás desde tu componente de React cuando el usuario presione Enter en el input
  const sendInputToInterpreter = (value) => {
        if (interpreterRef.current) {
            interpreterRef.current.provideInput(value); 
        }
    };

    return { executeCode, sendInputToInterpreter };
};