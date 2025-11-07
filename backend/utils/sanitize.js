const mongoose = require('mongoose');

// Conjuntos de campos permitidos
const ALLOWED_QUERY_FIELDS = new Set(['estado', 'categoria', 'urgencia', 'q', 'page', 'limit', 'sort']);
const ALLOWED_SORT_FIELDS = new Set(['fechaPublicacion', 'urgencia', 'objetivo', 'recibido']);
const ALLOWED_UPDATE_FIELDS = new Set([
    'titulo', 'categoria', 'urgencia', 'descripcionBreve',
    'objetivo', 'recibido', 'fechaLimite', 'estado', 'visible'
]);

// Sanitiza un ID de MongoDB
const sanitizeMongoId = (id) => {
    try {
        return mongoose.Types.ObjectId.isValid(id) ? id : null;
    } catch {
        return null;
    }
};

// Sanitiza un valor numérico
const sanitizeNumber = (value) => {
    const num = Number.parseInt(value, 10);
    return Number.isNaN(num) || num <= 0 ? null : num;
};

// Sanitiza una cadena de texto
const sanitizeString = (value) => {
    return typeof value === 'string' 
        ? value.replaceAll(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]/g, '')
        : value;
};

// Valida y sanitiza un campo de ordenamiento
const sanitizeSortField = (value) => {
    if (!value) return null;
    const actualField = value.startsWith('-') ? value.slice(1) : value;
    return ALLOWED_SORT_FIELDS.has(actualField) ? value : null;
};

// Sanitiza parámetros de consulta
const sanitizeQueryParams = (query) => {
    const sanitized = {};

    for (const [key, value] of Object.entries(query)) {
        if (!ALLOWED_QUERY_FIELDS.has(key)) continue;

        if (key === 'sort') {
            const sanitizedSort = sanitizeSortField(value);
            if (sanitizedSort) sanitized[key] = sanitizedSort;
        }
        else if (key === 'page' || key === 'limit') {
            const sanitizedNum = sanitizeNumber(value);
            if (sanitizedNum) sanitized[key] = sanitizedNum;
        }
        else {
            sanitized[key] = sanitizeString(value);
        }
    }

    return sanitized;
};

// Sanitiza datos de actualización
const sanitizeUpdateData = (data) => {
    const sanitized = {};

    for (const [key, value] of Object.entries(data)) {
        if (!ALLOWED_UPDATE_FIELDS.has(key)) continue;
        sanitized[key] = typeof value === 'string' 
            ? sanitizeString(value)
            : value;
    }

    return sanitized;
};

module.exports = {
    sanitizeMongoId,
    sanitizeQueryParams,
    sanitizeUpdateData
};