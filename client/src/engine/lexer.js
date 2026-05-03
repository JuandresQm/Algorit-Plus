import { TokenType, KEYWORDS } from './Constants.js';

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }

    // Funciones de ayuda
    peek() { return this.position >= this.input.length ? '\0' : this.input[this.position]; }
    peekNext() { return this.position + 1 >= this.input.length ? '\0' : this.input[this.position + 1]; }
    advance() {
        const char = this.peek();
        if (char === '\n') { this.line++; this.column = 1; } 
        else { this.column++; }
        this.position++;
        return char;
    }

    // Saltar espacios y comentarios según el manual
    skipWhitespaceAndComments() {
        while (true) {
            const char = this.peek();
            if (char === ' ' || char === '\t' || char === '\r' || char === '\n') {
                this.advance();
            } else if (char === '/' && this.peekNext() === '/') {
                // Comentario de una línea (//)
                while (this.peek() !== '\n' && this.peek() !== '\0') this.advance();
            } else if (char === '/' && this.peekNext() === '*') {
                // Comentario de bloque (/* */)
                this.advance(); this.advance();
                while (!(this.peek() === '*' && this.peekNext() === '/') && this.peek() !== '\0') {
                    this.advance();
                }
                if (this.peek() !== '\0') { this.advance(); this.advance(); }
            } else {
                break;
            }
        }
    }

tokenize() {
    const tokens = [];
    this.skipWhitespaceAndComments();

    while (this.position < this.input.length) {
        const char = this.peek();
        const startLine = this.line;

        // 1. IDENTIFICADORES, PALABRAS RESERVADAS Y OPERADORES DE TEXTO
        if (/[a-zA-Z_]/.test(char)) {
            let text = '';
            while (/[a-zA-Z0-9_]/.test(this.peek())) text += this.advance();

            // --- LÓGICA ESPECIAL PARA PALABRAS COMPUESTAS (En caso, Otro Caso) ---
            if (text === 'En' || text === 'Otro') {
                // Guardamos el estado actual por si lo que sigue NO es "caso"
                const savedPosition = this.position;
                const savedColumn = this.column;
                const savedLine = this.line;

                this.skipWhitespaceAndComments(); // Saltamos el espacio temporalmente

                let nextWord = '';
                while (/[a-zA-Z0-9_]/.test(this.peek())) nextWord += this.advance();

                if (nextWord.toLowerCase() === 'caso') {
                    text += ' ' + nextWord; // Formamos "En caso" o "Otro Caso"[cite: 8]
                } else {
                    // No era "caso", restauramos la posición original
                    this.position = savedPosition;
                    this.column = savedColumn;
                    this.line = savedLine;
                }
            }

            // Prioridad 1: Operadores Lógicos y Aritméticos de texto[cite: 4]
            if (['Y', 'O', 'mod'].includes(text)) {
                tokens.push({ type: TokenType.OPERATOR, value: text, line: startLine });
            } 
            // Prioridad 2: Valores Booleanos y Nulos[cite: 4]
            else if (['V', 'F', 'Verdadero', 'Falso', 'true', 'false', 'Null', 'nulo', 'vacio'].includes(text)) {
                const boolValue = ['V', 'Verdadero', 'true'].includes(text) ? true : 
                                  ['F', 'Falso', 'false'].includes(text) ? false : null;
                tokens.push({ type: TokenType.BOOLEAN, value: boolValue, line: startLine });
            }
            // Prioridad 3: Palabras Reservadas (Incluye ahora las compuestas)
            else if (KEYWORDS.has(text)) {
                tokens.push({ type: TokenType.KEYWORD, value: text, line: startLine });
            } 
            // Prioridad 4: Identificadores[cite: 4]
            else {
                tokens.push({ type: TokenType.IDENTIFIER, value: text, line: startLine });
            }
        }
        
        // 2. NÚMEROS (Enteros y Reales)[cite: 4]
        else if (/[0-9]/.test(char)) {
            let num = '';
            while (/[0-9.]/.test(this.peek())) num += this.advance();
            tokens.push({ type: TokenType.NUMBER, value: parseFloat(num), line: startLine });
        }
        
        // 3. CADENAS DE TEXTO ("...")[cite: 4]
        else if (char === '"') {
            let str = '';
            this.advance(); 
            while (this.peek() !== '"' && this.peek() !== '\0') {
                str += this.advance();
            }
            this.advance(); 
            tokens.push({ type: TokenType.STRING, value: str, line: startLine });
        }
        
        // 4. CARACTERES ('...')[cite: 4]
        else if (char === "'") {
            this.advance(); 
            let charVal = this.advance();
            this.advance(); 
            tokens.push({ type: TokenType.STRING, value: charVal, line: startLine });
        }
        
        // 5. OPERADORES DOBLES Y SIMPLES[cite: 4]
        else if (['<', '>', '!', '=', '+', '-', '*', '/', '%'].includes(char)) {
            let opValue = this.advance();
            const nextChar = this.peek();

            const esCompuesto = 
                (opValue === '<' && (nextChar === '<' || nextChar === '=' || nextChar === '>')) || 
                (opValue === '>' && (nextChar === '>' || nextChar === '=')) ||
                (opValue === '!' && nextChar === '=');

            if (esCompuesto) {
                opValue += this.advance();
            }
            tokens.push({ type: TokenType.OPERATOR, value: opValue, line: startLine });
        }
        
        // 6. PUNTUACIÓN[cite: 4]
        else if ([';', ':', ',', '.', '[', ']', '(', ')'].includes(char)) {
            tokens.push({ type: TokenType.PUNCTUATION, value: this.advance(), line: startLine });
        }
        
        // 7. ERROR: Carácter desconocido
        else {
            console.error(`Caracter no reconocido en la línea ${this.line}: ${char}`);
            this.advance();
        }

        this.skipWhitespaceAndComments();
    }

    tokens.push({ type: TokenType.EOF, value: null, line: this.line });
    return tokens;
}

}
export { Lexer };