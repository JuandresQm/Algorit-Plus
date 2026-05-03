export class Environment {
    constructor(parent = null) {
        this.variables = new Map();
        this.parent = parent;
        // Los registros se pueden guardar como objetos literales dentro de 'variables'
    }

    // --- GESTIÓN BÁSICA ---
    
    set(name, value) {
        if (this.variables.has(name)) {
            this.variables.set(name, value);
        } else if (this.parent) {
            this.parent.set(name, value);
        } else {
            this.variables.set(name, value);
        }
    }

    get(name) {
        if (this.variables.has(name)) {
            return this.variables.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Variable '${name}' no definida.`);
    }

    // --- VECTORES (Base 1 de Algorit+) ---

    getArrayValue(name, index) {
        const array = this.get(name);
        if (!Array.isArray(array)) throw new Error(`'${name}' no es un vector.`);
        
        // Validación de rango para ayudar al estudiante
        if (index < 1 || index > array.length) {
            throw new Error(`Índice ${index} fuera de rango. El vector '${name}' tiene tamaño ${array.length}`);
        }
        return array[index - 1]; 
    }

    setArrayValue(name, index, value) {
        const array = this.get(name);
        if (!Array.isArray(array)) throw new Error(`'${name}' no es un vector.`);
        
        if (index < 1) throw new Error(`Índice ${index} inválido (Base 1)`);
        array[index - 1] = value;
    }

    // --- REGISTROS (Estructuras) ---

    // Maneja casos como: registro.campo = valor o registro.subfijo.campo = valor
    setRegistryValue(alias, field, value) {
        const registro = this.get(alias);
        if (typeof registro !== 'object' || registro === null) {
            throw new Error(`'${alias}' no es un registro válido`);
        }
        
        registro[field] = value;
    }

    getRegistryValue(alias, field) {
        const registro = this.get(alias);
        if (!(field in registro)) {
            throw new Error(`El campo '${field}' no existe en el registro '${alias}'`);
        }
        return registro[field];
    }
    initArray(name, size) {
    this.variables.set(name, new Array(size).fill(0));    
}

getMemberValue(object, field) {
    if (typeof object !== 'object' || object === null) {
        throw new Error("El acceso a campos solo es válido en registros.");
    }
    if (!(field in object)) {
        throw new Error(`El campo '${field}' no existe.`);
    }
    return object[field];
}
}