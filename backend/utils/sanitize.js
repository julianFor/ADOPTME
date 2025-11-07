const mongoose = require('mongoose');

// Sanitiza un ID de MongoDB
const sanitizeMongoId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id) ? id : null;
  } catch {
    return null;
  }
};

// Sanitiza una cadena para búsqueda regex
const sanitizeRegexString = (str) => {
  if (typeof str !== 'string') return '';
  // Using replaceAll with regex is the correct approach for escaping special characters
  return str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Sanitiza parámetros de consulta
const sanitizeQueryParams = (params) => {
  const sanitized = {};
  
  if (params.q && typeof params.q === 'string') {
    sanitized.q = sanitizeRegexString(params.q);
  }
  
  if (params.categoria && typeof params.categoria === 'string') {
    sanitized.categoria = params.categoria;
  }
  
  if (params.urgencia && typeof params.urgencia === 'string') {
    sanitized.urgencia = params.urgencia;
  }
  
  if (params.estado && typeof params.estado === 'string') {
    sanitized.estado = params.estado;
  }
  
  // Sanitizar parámetros de paginación
  sanitized.limit = Math.min(Math.max(Number.parseInt(params.limit) || 12, 1), 100);
  sanitized.page = Math.max(Number.parseInt(params.page) || 1, 1);
  
  // Validar orden
  if (params.sort && typeof params.sort === 'string') {
    const validSortFields = ['-fechaPublicacion', 'fechaPublicacion', '-urgencia', 'urgencia'];
    sanitized.sort = validSortFields.includes(params.sort) ? params.sort : '-fechaPublicacion';
  }
  
  return sanitized;
};

// Sanitiza datos para actualización
const sanitizeUpdateData = (data) => {
  const sanitized = {};
  const allowedFields = [
    'titulo',
    'categoria',
    'urgencia',
    'descripcionBreve',
    'objetivo',
    'recibido',
    'fechaLimite',
    'estado',
    'visible'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  }

  return sanitized;
};

module.exports = {
  sanitizeMongoId,
  sanitizeRegexString,
  sanitizeQueryParams,
  sanitizeUpdateData
};