import { TokenType, KEYWORDS } from './Constants.js';
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
    }

    // --- NAVEGACIÓN ---
    peek() { return this.tokens[this.current]; }
    previous() { return this.tokens[this.current - 1]; }
    isAtEnd() { return this.peek().type === 'EOF'; }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    peekNext() {
        return this.tokens[this.current + 1] || { type: 'EOF', value: null };
    }

    check(type, value = null) {
        if (this.isAtEnd()) return false;
        if (value) return this.peek().type === type && this.peek().value === value;
        return this.peek().type === type;
    }

    match(type, value = null) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    consume(type, message, value = null) {
        if (this.check(type, value)) return this.advance();
        throw this.error(this.peek(), message);
    }

    consumeType() {
        if (this.check('IDENTIFIER') || this.check('KEYWORD')) {
            return this.advance();
        }
        throw this.error(this.peek(), "Se esperaba tipo de dato o registro");
    }

    isParamLabelToken(index = this.current) {
        const token = this.tokens[index];
        if (!token) return false;
        if (token.type !== 'IDENTIFIER' && token.type !== 'KEYWORD') return false;
        if (['E', 'S', 'E/S'].includes(token.value)) return true;
        if (token.value === 'E' && this.tokens[index + 1] && this.tokens[index + 1].type === 'OPERATOR' && this.tokens[index + 1].value === '/' && this.tokens[index + 2] && this.tokens[index + 2].type === 'IDENTIFIER' && this.tokens[index + 2].value === 'S') {
            return true;
        }
        return false;
    }

    parseParamMode() {
        if (!this.check('IDENTIFIER') && !this.check('KEYWORD')) {
            throw this.error(this.peek(), "Se esperaba etiqueta de parámetro (E, S, E/S)");
        }

        let mode = this.advance().value;
        if (mode === 'E' && this.check('OPERATOR', '/') && this.peekNext().type === 'IDENTIFIER' && this.peekNext().value === 'S') {
            this.advance();
            this.advance();
            mode = 'E/S';
        }

        if (!['E', 'S', 'E/S'].includes(mode)) {
            throw this.error(this.previous(), "Se esperaba etiqueta de parámetro 'E', 'S' o 'E/S'");
        }

        return mode;
    }

    getParamLocalName(node) {
        if (node.type === 'Identifier') return node.value;
        if (node.type === 'MemberAccess') return node.property;
        if (node.type === 'ArrayAccess') {
            if (node.object.type === 'Identifier') return node.object.value;
            if (node.object.type === 'MemberAccess') return node.object.property;
        }
        return `param_${this.current}`;
    }

    error(token, message) {
        return {
            line: token.line,
            message: `Error de sintaxis: ${message} (En '${token.value || 'EOF'}')`
        };
    }

    // --- GRAMÁTICA PRINCIPAL ---
parse() {
    try {
        const program = this.program(); // 1. El algoritmo principal
        const subalgorithms = [];

        // 2. Después del 'Fin', buscamos Procedimientos o Funciones
        while (!this.isAtEnd()) {
            if (this.check('KEYWORD', 'Procedimiento') || this.check('KEYWORD', 'Función')) {
                subalgorithms.push(this.subAlgorithmDeclaration());
            } else {
                // Saltar cualquier ruido o errores fuera de los bloques
                this.advance();
            }
        }
        
        program.subalgorithms = subalgorithms;
        return program;
    } catch (err) {
        this.errors.push(err);
        return null;
    }
}

program() {
    const startToken = this.consume('KEYWORD', "Se esperaba 'Algoritmo'", 'Algoritmo');
    const nombre = this.consume('IDENTIFIER', "Se esperaba nombre del algoritmo").value;
    
    // Los registros siguen yendo aquí, antes del Inicio
    const registros = [];
    while (this.check('KEYWORD', 'Registro')) {
        registros.push(this.registroDeclaration());
    }

    this.consume('KEYWORD', "Se esperaba 'Inicio'", 'Inicio');

    const body = [];
    while (!this.check('KEYWORD', 'Fin') && !this.isAtEnd()) {
        body.push(this.statement());
    }

    this.consume('KEYWORD', "Se esperaba 'Fin'", 'Fin');
    
    return { type: 'Program', name: nombre, registros, body, line: startToken.line };
}

    registroDeclaration() {
        this.consume('KEYWORD', "Se esperaba 'Registro'", 'Registro');
        this.consume('PUNCTUATION', "Se esperaba ':'", ':');
        const nombreRegistro = this.consume('IDENTIFIER', "Se esperaba el nombre del registro").value;
        this.consume('PUNCTUATION', "Se esperaba ';'", ';');

        const campos = [];
        while (!this.check('KEYWORD', 'Fin_Registro') && !this.isAtEnd()) {
            const nombreCampo = this.consume('IDENTIFIER', "Se esperaba nombre del campo").value;
            this.consume('PUNCTUATION', "Se esperaba ':'", ':');
            const tipoCampo = this.advance().value; 
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');
            campos.push({ nombre: nombreCampo, tipo: tipoCampo });
        }

        this.consume('KEYWORD', "Se esperaba 'Fin_Registro'", 'Fin_Registro');
        return { type: 'Registro', nombre: nombreRegistro, campos };
    }

    statement() {
if (this.match('KEYWORD', 'Var')) {
        return this.varDeclaration();
    }
// Mostrar<<
if (this.match('KEYWORD', 'Mostrar')) {
    this.consume('OPERATOR', "Se esperaba '<<'", '<<'); 
    
    const expressions = []; 
    expressions.push(this.expression());
    
    // Mientras haya una coma, seguimos recogiendo expresiones
    while (this.match('PUNCTUATION', ',')) {
        expressions.push(this.expression());
    }

    this.consume('PUNCTUATION', "Falta ';' al final", ';');
    // Enviamos el arreglo 'expressions' al nodo
    return { type: 'PrintStatement', expressions: expressions, line: this.previous().line };
}

// Leer>>
if (this.match('KEYWORD', 'Leer')) {
    this.consume('OPERATOR', "Se esperaba '>>'", '>>');
    const target = this.parseAccess(); // Para soportar Leer>> NR[1].campo;
    this.consume('PUNCTUATION', "Falta ';' al final", ';');
    return { type: 'ReadStatement', target, line: this.previous().line };
}

        // Si (condicion) entonces;
        if (this.match('KEYWORD', 'Si')) {
            this.consume('PUNCTUATION', "Se esperaba '('", '(');
            const condition = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            this.consume('KEYWORD', "Se esperaba 'entonces'", 'entonces');
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');

            const thenBranch = [];
            while (!this.check('KEYWORD', 'Sino') && !this.check('KEYWORD', 'Fin_si')) {
                thenBranch.push(this.statement());
            }

            let elseBranch = null;
            if (this.match('KEYWORD', 'Sino')) {
                elseBranch = [];
                while (!this.check('KEYWORD', 'Fin_si')) {
                    elseBranch.push(this.statement());
                }
            }
            this.consume('KEYWORD', "Se esperaba 'Fin_si'", 'Fin_si');
            return { type: 'IfStatement', condition, thenBranch, elseBranch, line: this.previous().line };
        }

        // Mientras (condicion) hacer;
        if (this.match('KEYWORD', 'Mientras')) {
            this.consume('PUNCTUATION', "Se esperaba '('", '(');
            const condition = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            this.consume('KEYWORD', "Se esperaba 'hacer'", 'hacer');
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');

            const body = [];
            while (!this.check('KEYWORD', 'Fin_mientras')) {
                body.push(this.statement());
            }
            this.consume('KEYWORD', "Se esperaba 'Fin_mientras'", 'Fin_mientras');
            return { type: 'WhileStatement', condition, body, line: this.previous().line };
        }

        // Para (Var = Ini Hasta Fin) hacer;
        if (this.match('KEYWORD', 'Para')) {
            this.consume('PUNCTUATION', "Se esperaba '('", '(');
            const variable = this.consume('IDENTIFIER', "Se esperaba variable").value;
            this.consume('OPERATOR', "Se esperaba '='", '=');
            const startValue = this.expression();
            this.consume('KEYWORD', "Se esperaba 'Hasta'", 'Hasta');
            const endValue = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            this.consume('KEYWORD', "Se esperaba 'hacer'", 'hacer');
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');

            const body = [];
            while (!this.check('KEYWORD', 'Fin_Para')) {
                body.push(this.statement());
            }
            this.consume('KEYWORD', "Se esperaba 'Fin_Para'", 'Fin_Para');
            return { type: 'ForStatement', variable, startValue, endValue, body, line: this.previous().line };
        }

        // Repetir... Hasta(cond); Fin_Repetir
        if (this.match('KEYWORD', 'Repetir')) {
            const body = [];
            while (!this.check('KEYWORD', 'Hasta')) {
                body.push(this.statement());
            }
            this.consume('KEYWORD', "Se esperaba 'Hasta'", 'Hasta');
            this.consume('PUNCTUATION', "Se esperaba '('", '(');
            const condition = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');
            this.consume('KEYWORD', "Se esperaba 'Fin_Repetir'", 'Fin_Repetir');
            return { type: 'RepeatStatement', body, condition, line: this.previous().line };
        }

        // En caso (condición) sea; Caso (valor); ... Fin_caso
if (this.match('KEYWORD', 'En caso')) {
    this.consume('PUNCTUATION', "Se esperaba '('", '(');
    const condition = this.expression();
    this.consume('PUNCTUATION', "Se esperaba ')'", ')');
    this.consume('KEYWORD', "Se esperaba 'sea'", 'sea');
    this.consume('PUNCTUATION', "Se esperaba ';'", ';');

    const cases = [];
    let defaultCase = null;

    while (!this.check('KEYWORD', 'Fin_caso') && !this.isAtEnd()) {
        if (this.match('KEYWORD', 'Caso')) {
            this.consume('PUNCTUATION', "Se esperaba '('", '(');
            const caseValue = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');
            
            const caseBody = [];
            while (!this.check('KEYWORD', 'Caso') && !this.check('KEYWORD', 'Otro Caso') && !this.check('KEYWORD', 'Fin_caso')) {
                caseBody.push(this.statement());
            }
            cases.push({ value: caseValue, body: caseBody });
        } else if (this.match('KEYWORD', 'Otro Caso')) {
            this.consume('PUNCTUATION', "Se esperaba ';'", ';');
            defaultCase = [];
            while (!this.check('KEYWORD', 'Fin_caso')) {
                defaultCase.push(this.statement());
            }
        }
    }
    this.consume('KEYWORD', "Se esperaba 'Fin_caso'", 'Fin_caso');
    return { type: 'SwitchStatement', condition, cases, defaultCase, line: this.previous().line };
}
        // Asignación o llamada a subalgoritmo
        const target = this.parseAccess();
        if (this.match('OPERATOR', '=')) {
            const value = this.expression();
            this.consume('PUNCTUATION', "Falta ';'", ';');
            return { type: 'Assignment', target, value, line: this.previous().line };
        }

        if (target.type === 'CallExpression') {
            this.consume('PUNCTUATION', "Falta ';' al final", ';');
            return { type: 'ExpressionStatement', expression: target, line: target.line };
        }

        throw this.error(this.peek(), `Comando '${this.peek().value}' no reconocido`);
    
    }

    // --- MANEJO DE ACCESO (Vectores y Registros) ---

   parseAccess(initialExpr = null) {
    let expr = initialExpr || this.primary();

    while (true) {
        if (this.match('PUNCTUATION', '[')) {
            const index = this.expression();
            this.consume('PUNCTUATION', "Se esperaba ']'", ']');
            expr = { type: 'ArrayAccess', object: expr, index };
        } else if (this.match('PUNCTUATION', '.')) {
            const property = this.consume('IDENTIFIER', "Se esperaba campo").value;
            expr = { type: 'MemberAccess', object: expr, property };
        } else if (this.match('PUNCTUATION', '(')) {
            const args = [];
            if (!this.check('PUNCTUATION', ')')) {
                do {
                    args.push(this.expression());
                } while (this.match('PUNCTUATION', ','));
            }
            this.consume('PUNCTUATION', "Se esperaba ')'", ')');
            expr = { type: 'CallExpression', callee: expr, arguments: args, line: this.previous().line };
        } else {
            break;
        }
    }
    return expr;
}

expression() {
    return this.logicalOr();
}

logicalOr() {
    let expr = this.logicalAnd();
    while (this.match('OPERATOR', 'O')) {
        const operator = this.previous().value;
        const right = this.logicalAnd();
        expr = { type: 'BinaryExpression', left: expr, operator, right };
    }
    return expr;
}

// Nivel 5: Y Lógico
    logicalAnd() {
        let expr = this.equality();
        while (this.match('OPERATOR', 'Y')) {
            const operator = this.previous().value;
            const right = this.equality();
            expr = { type: 'BinaryExpression', left: expr, operator, right, line: this.previous().line };
        }
        return expr;
    }

    // Nivel 4: Igualdad (=, !=, <>)
    equality() {
        let expr = this.comparison();
        while (this.match('OPERATOR', '=') || this.match('OPERATOR', '!=') || this.match('OPERATOR', '<>')) {
            const operator = this.previous().value;
            const right = this.comparison();
            expr = { type: 'BinaryExpression', left: expr, operator, right, line: this.previous().line };
        }
        return expr;
    }

    // Nivel 4: Comparación (<, >, <=, >=)
    comparison() {
        let expr = this.addition();
        while (this.match('OPERATOR', '<') || this.match('OPERATOR', '>') || 
               this.match('OPERATOR', '<=') || this.match('OPERATOR', '>=')) {
            const operator = this.previous().value;
            const right = this.addition();
            expr = { type: 'BinaryExpression', left: expr, operator, right, line: this.previous().line };
        }
        return expr;
    }

addition() {
    let expr = this.multiplication();
    while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
        const operator = this.previous().value;
        const right = this.multiplication();
        expr = { type: 'BinaryExpression', left: expr, operator, right };
    }
    return expr;
}

multiplication() {
    let expr = this.primary();
    while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/') || 
           this.match('OPERATOR', '%') || this.match('OPERATOR', 'mod')) {
        const operator = this.previous().value;
        const right = this.primary();
        expr = { type: 'BinaryExpression', left: expr, operator, right };
    }
    return expr;
}

primary() {
    if (this.match('PUNCTUATION', '(')) {
        const expr = this.expression();
        this.consume('PUNCTUATION', "Se esperaba ')' después de la expresión", ')');
        return expr;
    }
    
    if (this.match('NUMBER')) return { type: 'Literal', value: this.previous().value };
    if (this.match('STRING')) return { type: 'Literal', value: this.previous().value };
    if (this.match('BOOLEAN')) return { type: 'Literal', value: this.previous().value };

    if (this.match('IDENTIFIER')) {
        const identifier = { type: 'Identifier', value: this.previous().value };
        return this.parseAccess(identifier);
    }
    
    throw this.error(this.peek(), "Se esperaba una expresión");
}
varDeclaration() {
    const vars = [];
    // Procesamos la línea de declaración hasta el ';'
    do {
        const nameToken = this.consume('IDENTIFIER', "Se esperaba el nombre de la variable");

        const sizes = [];
        // Soporte para arreglos pegados al nombre: nombre[tamaño][tamaño]
        while (this.match('PUNCTUATION', '[')) {
            sizes.push(this.consume('NUMBER', "Se esperaba tamaño del arreglo").value);
            this.consume('PUNCTUATION', "Se esperaba ']'", ']');
        }

        this.consume('PUNCTUATION', "Se esperaba ':' después del nombre", ':');

        const typeToken = this.consumeType();

        const typeSizes = [];
        // Soporte para arreglos definidos en el tipo: nombre: Tipo[tamaño][tamaño]
        while (this.match('PUNCTUATION', '[')) {
            typeSizes.push(this.consume('NUMBER', "Se esperaba tamaño del arreglo").value);
            this.consume('PUNCTUATION', "Se esperaba ']'", ']');
        }

        if (sizes.length > 0 && typeSizes.length > 0) {
            if (sizes.length !== typeSizes.length || sizes.some((value, index) => value !== typeSizes[index])) {
                throw this.error(this.peek(), "Los tamaños del arreglo deben ser consistentes en la variable y el tipo");
            }
        }

        const resolvedSizes = sizes.length > 0 ? sizes : typeSizes.length > 0 ? typeSizes : null;

        vars.push({ 
            name: nameToken.value, 
            type: typeToken.value, 
            size: resolvedSizes 
        });

    } while (this.match('PUNCTUATION', ',')); // Soporte para: Var a:entero, b:cadena;

    this.consume('PUNCTUATION', "Se esperaba ';' al final de la declaración", ';');
    
    return { type: 'VarBlock', variables: vars };
}
subAlgorithmDeclaration() {
    const isFunction = this.match('KEYWORD', 'Función');
    if (!isFunction) this.consume('KEYWORD', "Se esperaba 'Procedimiento'", 'Procedimiento');
    
    const name = this.consume('IDENTIFIER', "Se esperaba nombre").value;
    
    // Parámetros: Función Nombre (a, b);
    this.consume('PUNCTUATION', "Se esperaba '('", '(');
    const params = [];
    if (!this.check('PUNCTUATION', ')')) {
        if (isFunction) {
            do {
                const paramName = this.consume('IDENTIFIER', "Se esperaba nombre del parámetro").value;
                let paramType = null;
                if (this.match('PUNCTUATION', ':')) {
                    const typeToken = this.consumeType();
                    paramType = typeToken.value;
                }
                params.push({ name: paramName, type: paramType, mode: 'E' });
            } while (this.match('PUNCTUATION', ','));
        } else {
            while (!this.check('PUNCTUATION', ')') && !this.isAtEnd()) {
                const mode = this.parseParamMode();
                this.consume('PUNCTUATION', "Se esperaba ':'", ':');

                do {
                    const paramNode = this.parseAccess();
                    params.push({ name: this.getParamLocalName(paramNode), target: paramNode, mode });
                } while (this.match('PUNCTUATION', ',') && !this.isParamLabelToken(this.current));

                if (this.check('PUNCTUATION', ',') && this.isParamLabelToken(this.current + 1)) {
                    this.advance();
                }
            }
        }
    }
    this.consume('PUNCTUATION', "Se esperaba ')'", ')');

    let returnType = null;
    if (isFunction && this.match('PUNCTUATION', ':')) {
        const returnTypeToken = this.consumeType();
        returnType = returnTypeToken.value;
    }

    this.consume('PUNCTUATION', "Se esperaba ';'", ';');

    this.consume('KEYWORD', "Se esperaba 'Inicio'", 'Inicio');

    const body = [];
    let returnFound = false;
    while (!this.check('KEYWORD', 'Fin_Procedimiento') && !this.check('KEYWORD', 'Fin_Función')) {
        // Soporte para Var local dentro del subalgoritmo
        if (this.match('KEYWORD', 'Var')) {
            body.push(this.varDeclaration());
        } else if (this.match('KEYWORD', 'Devolver')) {
            const val = this.expression();
            this.consume('PUNCTUATION', "Falta ';'", ';');
            body.push({ type: 'Return', value: val });
            returnFound = true;
        } else {
            body.push(this.statement());
        }
    }
    this.advance();

    if (isFunction && !returnFound) {
        throw this.error(this.peek(), `La función '${name}' debe finalizar con Devolver`);
    }

    return { type: 'SubAlgorithm', name, params, body, isFunction, returnType };
}
}
export { Parser };