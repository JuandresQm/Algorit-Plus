export const TokenType = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    OPERATOR: 'OPERATOR',
    PUNCTUATION: 'PUNCTUATION',
    BOOLEAN: 'BOOLEAN', // <-- Añadido para que coincida con tu Parser
    EOF: 'EOF'
};

// Palabras reservadas del manual de sintaxis
export const KEYWORDS = new Set([
    'Algoritmo', 'Inicio', 'Fin', 'Var',
    'real', 'entero', 'cadena', 'caracter', 'booleano',
    'Mostrar', 'Leer',
    'Si', 'entonces', 'Sino', 'Fin_si',
    'En caso', 'sea', 'Caso', 'Otro Caso', 'Fin_caso',
    'Para', 'Hasta', 'hacer', 'Fin_Para',
    'Mientras', 'Fin_mientras',
    'Repetir', 'Fin_Repetir',
    'Procedimiento', 'Fin_Procedimiento',
    'Función', 'Devolver', 'Fin_Función',
    'Registro', 'Fin_Registro',
    'V', 'F', 'Verdadero', 'Falso', 'true', 'false', 'Null', 'nulo', 'vacio',
    'Y', 'O', 'mod'
]);