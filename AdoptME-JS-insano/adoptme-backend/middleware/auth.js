const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    // 1. Obtener token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('❌ [Auth] No se proporcionó token');
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Validar estructura (versión flexible)
    if (!decoded || (!decoded.userId && !decoded.id)) {
      console.error('❌ [Auth] Token con estructura inválida:', decoded);
      throw new Error('Estructura de token inválida');
    }

    // 4. Asignar usuario al request (compatible con ambas estructuras)
    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role || 'adoptante' // Valor por defecto
    };

    console.log(`✅ [Auth] Usuario autenticado ID: ${req.user.id}, Rol: ${req.user.role}`);
    next();

  } catch (err) {
    console.error('❌ [Auth] Error:', err.message);
    
    let message = 'Token inválido';
    if (err.name === 'TokenExpiredError') message = 'Token expirado';
    if (err.message === 'Estructura de token inválida') message = err.message;

    return res.status(401).json({ 
      success: false,
      message: `Error de autenticación: ${message}`,
      error: err.message // Opcional: para debug en desarrollo
    });
  }
};