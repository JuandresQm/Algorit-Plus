import { Environment } from './environment.js';

class ReturnSignal {
    constructor(value) {
        this.value = value;
    }
}

class Interpreter {
    constructor(onPrint, onReadRequest, onError, options = {}) {
        this.environment = new Environment();
        this.onPrint = onPrint; // Callback para Mostrar<<
        this.onReadRequest = onReadRequest; // Callback para Leer>>
        this.onError = onError;
        this.resolveInput = null;
        this.recordTemplates = new Map();
        this.variableDefinitions = new Map();
        this.maxSteps = options.maxSteps ?? 20000;
        this.maxTimeMs = options.maxTimeMs ?? 1000;
        this.steps = 0;
        this.startTime = null;
    }

    resetExecutionLimits() {
        this.steps = 0;
        this.startTime = Date.now();
        this.pausedTimeMs = 0;
        this.pauseStart = null;
    }

    getElapsedExecutionTime() {
        const now = Date.now();
        const pausedMs = this.pauseStart ? this.pausedTimeMs + (now - this.pauseStart) : this.pausedTimeMs;
        return now - this.startTime - pausedMs;
    }

    pauseExecutionTimer() {
        if (!this.pauseStart) {
            this.pauseStart = Date.now();
        }
    }

    resumeExecutionTimer() {
        if (this.pauseStart) {
            this.pausedTimeMs += Date.now() - this.pauseStart;
            this.pauseStart = null;
        }
    }

    checkExecutionLimits(node) {
        this.steps += 1;
        if (this.steps > this.maxSteps) {
            const line = node?.line || node?.token?.line || 1;
            throw new Error(`Límite de ejecución alcanzado: posible bucle infinito o programa demasiado largo en línea ${line}`);
        }

        if (this.getElapsedExecutionTime() > this.maxTimeMs) {
            const line = node?.line || node?.token?.line || 1;
            throw new Error(`Tiempo de ejecución excedido: posible bucle infinito o bloqueo en línea ${line}`);
        }
    }

    // --- PUNTO DE ENTRADA ---
async run(programNode) {
        this.resetExecutionLimits();
    try {
        if (programNode.subalgorithms && programNode.subalgorithms.length > 0) {
            for (const sub of programNode.subalgorithms) {
                this.environment.define(sub.name, sub);
            }
        }

        if (programNode.registros && programNode.registros.length > 0) {
            for (const reg of programNode.registros) {
                this.recordTemplates.set(reg.nombre, reg.campos);
            }
        }

        // 3. DECLARACIÓN DE VARIABLES (Tu lógica original mejorada)
        // Buscamos los bloques 'VarBlock' dentro del cuerpo para inicializarlos
        for (const stmt of programNode.body) {
            if (stmt.type === 'VarBlock') {
                this.executeVarBlock(stmt);
            }
        }

        // 4. EJECUCIÓN DEL CUERPO
        // Ejecutamos todo lo que NO sea una declaración de variable
        for (const stmt of programNode.body) {
            if (stmt.type !== 'VarBlock') {
                await this.execute(stmt);
            }
        }

    } catch (error) {
        if (typeof this.onError === 'function') {
            this.onError(`Error de ejecución: ${error.message}`, error.line);
        } else {
            throw error;
        }
    }
}
    // --- MOTOR DE EJECUCIÓN ---
    async execute(node) {
        if (!node) return;
        this.checkExecutionLimits(node);

        switch (node.type) {
            case 'Program': {
                for (const stmt of node.body) {
                    await this.execute(stmt);
                }
                break;
            }

           case 'PrintStatement': {
    const evaluatedExpressions = [];
    for (const expr of node.expressions) {
        evaluatedExpressions.push(await this.evaluate(expr));
    }
    const finalOutput = evaluatedExpressions.join("");
    this.onPrint(finalOutput);
    break;
}

            case 'ExpressionStatement': {
                await this.evaluate(node.expression);
                break;
            }

            case 'ReadStatement': {
                await this.executeRead(node);
                break;
            }

            case 'Assignment': {
                const val = await this.evaluate(node.value);
                await this.assignValue(node.target, val);
                break;
            }

            case 'VarBlock': {
                this.executeVarBlock(node);
                break;
            }

            case 'Return': {
                throw new ReturnSignal(await this.evaluate(node.value));
            }

            case 'IfStatement': {
                if (await this.evaluate(node.condition)) {
                    for (const stmt of node.thenBranch) await this.execute(stmt);
                } else if (node.elseBranch) {
                    for (const stmt of node.elseBranch) await this.execute(stmt);
                }
                break;
            }

            case 'WhileStatement': {
                while (await this.evaluate(node.condition)) {
                    this.checkExecutionLimits(node);
                    for (const stmt of node.body) await this.execute(stmt);
                }
                break;
            }

case 'SwitchStatement': {
    // 1. Evaluamos la condición global (la que va entre paréntesis)
    const globalCondition = await this.evaluate(node.condition);
    let matched = false;

    // 2. Recorremos cada uno de los casos definidos
    for (const caseNode of node.cases) {
        // Evaluamos el valor del caso actual para comparar
        const caseValue = await this.evaluate(caseNode.value);

        // Si coinciden (usando nuestra nueva lógica de igualdad '=')
        if (globalCondition === caseValue) {
            // Ejecutamos todas las instrucciones dentro de ese caso
            for (const stmt of caseNode.body) {
                await this.execute(stmt);
            }
            matched = true;
            break;
        }
    }

    if (!matched && node.defaultCase) {
        for (const stmt of node.defaultCase) {
            await this.execute(stmt);
        }
    }
    break;
}

case 'SubAlgorithm': {
    // Los subalgoritmos se "registran", no se ejecutan de inmediato.
    this.environment.define(node.name, node);
    break;
}
            case 'ForStatement': {
                const start = await this.evaluate(node.startValue);
                const end = await this.evaluate(node.endValue);
                this.environment.assign(node.variable, start);

                while (this.environment.get(node.variable) <= end) {
                    this.checkExecutionLimits(node);
                    for (const stmt of node.body) await this.execute(stmt);
                    this.environment.assign(node.variable, this.environment.get(node.variable) + 1);
                }
                break;
            }

            case 'RepeatStatement': {
                do {
                    this.checkExecutionLimits(node);
                    for (const stmt of node.body) await this.execute(stmt);
                } while (!await this.evaluate(node.condition));
                break;
            }
        }
    }

    // --- EVALUACIÓN DE EXPRESIONES ---
    async evaluate(node) {
        this.checkExecutionLimits(node);
        switch (node.type) {
            case 'Literal': return node.value;
            case 'Identifier': return this.environment.get(node.value);
            case 'VarBlock': {
                this.executeVarBlock(node);
                return null;
            }
            case 'BinaryExpression': {
                const left = await this.evaluate(node.left);
                const right = await this.evaluate(node.right);
                return this.applyOperator(left, node.operator, right);
            }

            case 'ArrayAccess': {
                const arr = await this.evaluate(node.object);
                if (!Array.isArray(arr)) {
                    throw new Error(`El objeto '${node.object?.value || '??'}' no es un arreglo.`);
                }
                const idx = await this.evaluate(node.index);
                if (typeof idx !== 'number' || Number.isNaN(idx)) {
                    throw new Error(`Indice de arreglo inválido: ${idx}`);
                }
                if (idx < 1 || idx > arr.length) {
                    throw new Error(`Índice fuera de rango: ${idx}`);
                }
                return arr[idx - 1]; // Ajuste Base 1
            }

            case 'MemberAccess': {
                let obj = await this.evaluate(node.object);
                obj = this.resolveAliasObject(obj);
                if (obj === null || typeof obj !== 'object') {
                    throw new Error(`No se puede acceder a '${node.property}', el objeto no es un registro válido.`);
                }
                if (!(node.property in obj)) {
                    throw new Error(`El campo '${node.property}' no existe en el registro.`);
                }
                return obj[node.property];
            }

            case 'CallExpression': {
                const callee = await this.evaluate(node.callee);
                return await this.executeSubAlgorithm(callee, node.arguments);
            }

            default:
                throw new Error(`Tipo de nodo desconocido: ${node.type}`);
        }
    }

    applyOperator(left, op, right) {
        switch (op) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '%':
            case 'mod': return left % right;
            case '=': return left == right;
            case '!=':
            case '<>': return left != right;
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case 'Y': return left && right;
            case 'O': return left || right;
            default: throw new Error(`Operador desconocido: ${op}`);
        }
    }

    // --- SISTEMA DE LECTURA ---
async executeRead(node) {
    const targetName = this.getTargetName(node.target);
    this.onReadRequest(targetName);

    this.pauseExecutionTimer();
    const userInput = await new Promise(resolve => {
        this.resolveInput = resolve;
    });
    this.resumeExecutionTimer();
    
    const castedValue = this.castValue(userInput);
    await this.assignValue(node.target, castedValue);
}

    provideInput(value) {
        if (this.resolveInput) {
            this.resolveInput(value);
            this.resolveInput = null;
        }
    }

    async assignValue(target, value) {
        if (target.type === 'Identifier') {
            this.environment.assign(target.value, value);
        } else if (target.type === 'ArrayAccess') {
            const arr = await this.evaluate(target.object);
            if (!Array.isArray(arr)) {
                throw new Error(`El objeto objetivo no es un arreglo.`);
            }
            const idx = await this.evaluate(target.index);
            if (typeof idx !== 'number' || Number.isNaN(idx)) {
                throw new Error(`Indice de arreglo inválido: ${idx}`);
            }
            if (idx < 1 || idx > arr.length) {
                throw new Error(`Índice fuera de rango: ${idx}`);
            }
            arr[idx - 1] = value;
        } else if (target.type === 'MemberAccess') {
            let obj = await this.evaluate(target.object);
            obj = this.resolveAliasObject(obj);
            obj[target.property] = value;
        }
    }

    getTargetName(target) {
        if (target.type === 'Identifier') return target.value;
        if (target.type === 'ArrayAccess') return `${this.getTargetName(target.object)}[...]`;
        if (target.type === 'MemberAccess') return `${this.getTargetName(target.object)}.${target.property}`;
        return "dato";
    }

    resolveAliasObject(value) {
        if (!value || typeof value !== 'object' || !value.__isAliasProxy) {
            return value;
        }

        const aliasType = value.__recordType;
        const aliasName = value.__aliasName;

        if (aliasName && this.environment.has(aliasName)) {
            const candidateDef = this.variableDefinitions.get(aliasName);
            if (candidateDef && candidateDef.type === aliasType && candidateDef.size === value.__parentArraySize) {
                const externalVar = this.environment.get(aliasName);
                if (value.__parentIndex != null) {
                    if (!Array.isArray(externalVar)) {
                        throw new Error(`Alias de subregistro de tipo '${aliasType}' no es un arreglo.`);
                    }
                    return externalVar[value.__parentIndex - 1];
                }
                return externalVar;
            }
        }

        const candidates = [];
        for (const [name, def] of this.variableDefinitions.entries()) {
            if (def.type === aliasType && this.arraySizesEqual(def.size, value.__parentArraySize)) {
                candidates.push(name);
            }
        }

        if (candidates.length === 0) {
            throw new Error(`No se encontró variable maestra para el subregistro de tipo '${aliasType}'.`);
        }
        if (candidates.length > 1) {
            throw new Error(`Ambigüedad en subregistro: hay varias variables de tipo '${aliasType}' con el mismo tamaño.`);
        }

        const externalVar = this.environment.get(candidates[0]);
        if (value.__parentIndex != null) {
            if (!Array.isArray(externalVar)) {
                throw new Error(`Alias de subregistro de tipo '${aliasType}' no es un arreglo.`);
            }
            return externalVar[value.__parentIndex - 1];
        }
        return externalVar;
    }

    arraySizesEqual(a, b) {
        if (a === b) return true;
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        return a.every((value, index) => value === b[index]);
    }

    castValue(val) {
        const lower = val.toLowerCase();
        if (lower === 'verdadero') return true;
        if (lower === 'falso') return false;
        if (!isNaN(val) && val.trim() !== "") return Number(val);
        return val;
    }

    executeVarBlock(varBlock) {
        const aliasCandidates = new Map();
        for (const variable of varBlock.variables) {
            aliasCandidates.set(variable.name, variable);
        }

        for (const variable of varBlock.variables) {
            let valueToStore = null;

            if (this.recordTemplates.has(variable.type)) {
                const template = this.recordTemplates.get(variable.type);
                if (variable.size !== null) {
                    valueToStore = this.createArrayFromSizes(variable.size, () =>
                        this.createRecordInstance(template, variable.type, {
                            varName: variable.name,
                            arraySize: variable.size
                        }, aliasCandidates)
                    );
                } else {
                    valueToStore = this.createRecordInstance(template, variable.type, {
                        varName: variable.name,
                        arraySize: null
                    }, aliasCandidates);
                }
            } else {
                const defaultValue = this.defaultValueForType(variable.type);
                if (variable.size !== null) {
                    valueToStore = this.createArrayFromSizes(variable.size, () => defaultValue);
                } else {
                    valueToStore = defaultValue;
                }
            }

            this.environment.define(variable.name, valueToStore);
            this.variableDefinitions.set(variable.name, { type: variable.type, size: variable.size });
        }
    }

    createArrayFromSizes(sizes, createLeaf) {
        if (!sizes || sizes.length === 0) return createLeaf();
        const [size, ...rest] = sizes;
        return Array.from({ length: Number(size) }, () => this.createArrayFromSizes(rest, createLeaf));
    }

    createRecordInstance(fields, recordType = null, meta = null, aliasCandidates = null) {
        const recordObject = { __recordType: recordType, __recordMeta: meta };
        for (const field of fields) {
            const fieldType = field.tipo || field.type || 'null';
            if (this.recordTemplates.has(fieldType) && aliasCandidates?.has(field.nombre) && aliasCandidates.get(field.nombre).type === fieldType) {
                recordObject[field.nombre] = {
                    __isAliasProxy: true,
                    __recordType: fieldType,
                    __parentIndex: meta?.index ?? null,
                    __parentArraySize: meta?.arraySize ?? null,
                    __aliasName: field.nombre
                };
            } else if (this.recordTemplates.has(fieldType)) {
                recordObject[field.nombre] = this.createRecordInstance(this.recordTemplates.get(fieldType), fieldType, null, aliasCandidates);
            } else {
                recordObject[field.nombre] = this.defaultValueForType(fieldType);
            }
        }
        return recordObject;
    }

    defaultValueForType(type) {
        switch (type.toLowerCase()) {
            case 'entero':
            case 'real':
                return 0;
            case 'cadena':
            case 'caracter':
                return "";
            case 'booleano':
                return false;
            default:
                return null;
        }
    }

    isAssignable(node) {
        return ['Identifier', 'ArrayAccess', 'MemberAccess'].includes(node.type);
    }

    async executeSubAlgorithm(sub, argNodes) {
        if (!sub || sub.type !== 'SubAlgorithm') {
            throw new Error(`Subalgoritmo inválido: ${sub?.name || 'desconocido'}`);
        }

        if (sub.params.length !== argNodes.length) {
            throw new Error(`Subalgoritmo '${sub.name}' esperaba ${sub.params.length} parámetro(s), recibió ${argNodes.length}.`);
        }

        const previousEnvironment = this.environment;
        const argValues = [];
        for (const argNode of argNodes) {
            argValues.push(await this.evaluate(argNode));
        }

        const callEnvironment = new Environment(previousEnvironment);
        this.environment = callEnvironment;

        const outputParams = [];

        for (let i = 0; i < sub.params.length; i++) {
            const paramDef = sub.params[i];
            const argNode = argNodes[i];
            const argValue = argValues[i];

            if (sub.isFunction || paramDef.mode === 'E') {
                callEnvironment.define(paramDef.name, argValue);
            } else if (paramDef.mode === 'S') {
                if (!this.isAssignable(argNode)) {
                    throw new Error(`El parámetro '${paramDef.name}' debe ser una variable para modo S`);
                }
                callEnvironment.define(paramDef.name, null);
                outputParams.push({ name: paramDef.name, target: argNode });
            } else if (paramDef.mode === 'E/S') {
                if (!this.isAssignable(argNode)) {
                    throw new Error(`El parámetro '${paramDef.name}' debe ser una variable para modo E/S`);
                }
                callEnvironment.define(paramDef.name, argValue);
                outputParams.push({ name: paramDef.name, target: argNode });
            } else {
                throw new Error(`Modo de parámetro inválido: ${paramDef.mode}`);
            }
        }

        let returnValue;
        try {
            for (const stmt of sub.body) {
                await this.execute(stmt);
            }
        } catch (error) {
            if (error instanceof ReturnSignal) {
                returnValue = error.value;
            } else {
                throw error;
            }
        } finally {
            this.environment = previousEnvironment;
        }

        for (const output of outputParams) {
            const valueToWrite = callEnvironment.get(output.name);
            await this.assignValue(output.target, valueToWrite);
        }

        return returnValue;
    }

    async evaluateArrayAccess(node) {
        const array = this.environment.get(node.name);
        const index = await this.evaluate(node.index);
 
        return array[index - 1]; 
    }

    getCurrentVariables() {
        const variables = [];
        for (const [name, def] of this.variableDefinitions.entries()) {
            const value = this.environment.get(name);
            variables.push({
                name,
                type: def.type,
                size: def.size,
                value: this.formatValue(value)
            });
        }
        return variables;
    }

    formatValue(value) {
        if (value === null || value === undefined) return 'nulo';
        if (typeof value === 'boolean') return value ? 'Verdadero' : 'Falso';
        if (Array.isArray(value)) {
            return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
        }
        if (typeof value === 'object' && value.__recordType) {
            // Es un registro
            const fields = Object.keys(value).filter(k => !k.startsWith('__'));
            return `{${fields.map(f => `${f}: ${this.formatValue(value[f])}`).join(', ')}}`;
        }
        return String(value);
    }
}

export { Interpreter };