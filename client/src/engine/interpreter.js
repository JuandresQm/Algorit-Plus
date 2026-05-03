import { Environment } from './environment.js';

class ReturnSignal {
    constructor(value) {
        this.value = value;
    }
}

class Interpreter {
    constructor(onPrint, onReadRequest, onError) {
        this.environment = new Environment();
        this.onPrint = onPrint; // Callback para Mostrar<<
        this.onReadRequest = onReadRequest; // Callback para Leer>>
        this.onError = onError;
        this.resolveInput = null;
        this.recordTemplates = new Map();
    }

    // --- PUNTO DE ENTRADA ---
async run(programNode) {
    try {
        // 1. CARGA DE SUBALGORITMOS (Hoisting)
        // Guardamos las funciones/procedimientos en el environment antes de ejecutar nada
        if (programNode.subalgorithms && programNode.subalgorithms.length > 0) {
            for (const sub of programNode.subalgorithms) {
                this.environment.set(sub.name, sub);
            }
        }

        if (programNode.registros && programNode.registros.length > 0) {
            for (const reg of programNode.registros) {
                // Guardamos el molde del registro para usarlo en executeVarBlock
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
    this.environment.set(node.name, node);
    break;
}
            case 'ForStatement': {
                const start = await this.evaluate(node.startValue);
                const end = await this.evaluate(node.endValue);
                this.environment.set(node.variable, start);

                while (this.environment.get(node.variable) <= end) {
                    for (const stmt of node.body) await this.execute(stmt);
                    this.environment.set(node.variable, this.environment.get(node.variable) + 1);
                }
                break;
            }

            case 'RepeatStatement': {
                do {
                    for (const stmt of node.body) await this.execute(stmt);
                } while (!await this.evaluate(node.condition));
                break;
            }
        }
    }

    // --- EVALUACIÓN DE EXPRESIONES ---
    async evaluate(node) {
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
                const idx = await this.evaluate(node.index);
                return arr[idx - 1]; // Ajuste Base 1
            }

            case 'MemberAccess': {
                const obj = await this.evaluate(node.object);
                return obj[node.property];
            }

            case 'CallExpression': {
                return await this.executeSubAlgorithm(node.callee, node.arguments);
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

    const userInput = await new Promise(resolve => {
        this.resolveInput = resolve; 
    });
    
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
            this.environment.set(target.value, value);
        } else if (target.type === 'ArrayAccess') {
            const arr = await this.evaluate(target.object);
            const idx = await this.evaluate(target.index);
            arr[idx - 1] = value;
        } else if (target.type === 'MemberAccess') {
            const obj = await this.evaluate(target.object);
            obj[target.property] = value;
        }
    }

    getTargetName(target) {
        if (target.type === 'Identifier') return target.value;
        if (target.type === 'ArrayAccess') return `${this.getTargetName(target.object)}[...]`;
        if (target.type === 'MemberAccess') return `${this.getTargetName(target.object)}.${target.property}`;
        return "dato";
    }

    castValue(val) {
        const lower = val.toLowerCase();
        if (lower === 'verdadero') return true;
        if (lower === 'falso') return false;
        if (!isNaN(val) && val.trim() !== "") return Number(val);
        return val;
    }

    executeVarBlock(varBlock) {
        for (const variable of varBlock.variables) {
            let defaultValue;
            let valueToStore = null;

            if (this.recordTemplates.has(variable.type)) {
                if (variable.size !== null) {
                    valueToStore = new Array(Number(variable.size)).fill(null).map(() => this.createRecordInstance(this.recordTemplates.get(variable.type)));
                } else {
                    valueToStore = this.createRecordInstance(this.recordTemplates.get(variable.type));
                }
            } else {
                switch (variable.type.toLowerCase()) {
                    case 'entero':
                    case 'real':
                        defaultValue = 0;
                        break;
                    case 'cadena':
                    case 'caracter':
                        defaultValue = "";
                        break;
                    case 'booleano':
                        defaultValue = false;
                        break;
                    default:
                        defaultValue = null;
                }

                if (variable.size !== null) {
                    valueToStore = new Array(Number(variable.size)).fill(defaultValue);
                } else {
                    valueToStore = defaultValue;
                }
            }

            this.environment.set(variable.name, valueToStore);
        }
    }

    createRecordInstance(fields) {
        const recordObject = {};
        for (const field of fields) {
            const fieldType = field.tipo || field.type || 'null';
            if (this.recordTemplates.has(fieldType)) {
                recordObject[field.nombre] = this.createRecordInstance(this.recordTemplates.get(fieldType));
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
                callEnvironment.set(paramDef.name, argValue);
            } else if (paramDef.mode === 'S') {
                if (!this.isAssignable(argNode)) {
                    throw new Error(`El parámetro '${paramDef.name}' debe ser una variable para modo S`);
                }
                callEnvironment.set(paramDef.name, null);
                outputParams.push({ name: paramDef.name, target: argNode });
            } else if (paramDef.mode === 'E/S') {
                if (!this.isAssignable(argNode)) {
                    throw new Error(`El parámetro '${paramDef.name}' debe ser una variable para modo E/S`);
                }
                callEnvironment.set(paramDef.name, argValue);
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
}

export { Interpreter };