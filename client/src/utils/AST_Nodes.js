// --- NODOS DE ESTRUCTURA ---

export class Program {
    constructor(name, body, line) {
        this.type = 'Program';
        this.name = name;
        this.body = body; // Array de statements
        this.line = line;
    }
}

// --- NODOS DE SENTENCIAS (STATEMENTS) ---

export class PrintStatement {
    constructor(expressions, line) {
        this.type = 'PrintStatement';
        this.expressions = expressions; 
        this.line = line;
    }
}

export class ReadStatement {
    constructor(target, line) {
        this.type = 'ReadStatement';
        this.target = target; // Puede ser Identifier, ArrayAccess o MemberAccess
        this.line = line;
    }
}

export class Assignment {
    constructor(target, value, line) {
        this.type = 'Assignment';
        this.target = target;
        this.value = value;
        this.line = line;
    }
}

export class IfStatement {
    constructor(condition, thenBranch, elseBranch, line) {
        this.type = 'IfStatement';
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
        this.line = line;
    }
}

export class WhileStatement {
    constructor(condition, body, line) {
        this.type = 'WhileStatement';
        this.condition = condition;
        this.body = body;
        this.line = line;
    }
}

export class ForStatement {
    constructor(variable, startValue, endValue, body, line) {
        this.type = 'ForStatement';
        this.variable = variable;
        this.startValue = startValue;
        this.endValue = endValue;
        this.body = body;
        this.line = line;
    }
}

export class RepeatStatement {
    constructor(body, condition, line) {
        this.type = 'RepeatStatement';
        this.body = body;
        this.condition = condition;
        this.line = line;
    }
}

// --- NODOS DE EXPRESIONES ---

export class BinaryExpression {
    constructor(left, operator, right, line) {
        this.type = 'BinaryExpression';
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.line = line;
    }
}

export class Literal {
    constructor(value, line) {
        this.type = 'Literal';
        this.value = value;
        this.line = line;
    }
}

export class Identifier {
    constructor(value, line) {
        this.type = 'Identifier';
        this.value = value;
        this.line = line;
    }
}

// --- NODOS DE ACCESO (Vectores y Registros) ---

export class ArrayAccess {
    constructor(object, index, line) {
        this.type = 'ArrayAccess';
        this.object = object; // El nombre del vector
        this.index = index;   // Expresión del índice
        this.line = line;
    }
}

export class MemberAccess {
    constructor(object, property, line) {
        this.type = 'MemberAccess';
        this.object = object;   // El nombre del registro
        this.property = property; // El campo (string)
        this.line = line;
    }
}