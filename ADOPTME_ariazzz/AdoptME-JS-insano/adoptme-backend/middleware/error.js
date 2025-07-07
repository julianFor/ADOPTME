const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Si es un error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: messages
    });
  }

  // Si es un error de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token no válido'
    });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Error en el servidor'
  });
};

module.exports = errorHandler;