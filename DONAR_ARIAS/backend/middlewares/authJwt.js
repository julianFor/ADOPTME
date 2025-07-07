const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/User');

// Verificación de token JWT
const verifyToken = (req, res, next) => {
  console.log('\n🔐 [authJwt] Verificando token para:', req.originalUrl);

  try {
    // Obtener token desde los headers
    const token =
      req.headers['x-access-token'] ||
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    console.log('[authJwt] Token recibido:', token ? '***' + token.slice(-8) : 'NO ENVIADO');

    if (!token) {
      return res.status(403).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, config.secret);

    // Asignar datos al request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email || 'SinEmail';

    console.log('[authJwt] Token válido para usuario con rol:', req.userRole);
    next();

  } catch (error) {
    console.error('[authJwt] Error al verificar token:', error.name, error.message);
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.name
    });
  }
};

module.exports = {
  verifyToken
};
