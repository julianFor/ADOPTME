const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Registro con validación de roles y logs detallados
exports.register = async (req, res) => {
  try {
    console.log('🔵 [register] Iniciando registro con datos:', req.body);

    const { name, username, email, password, confirmPassword, contactNumber, role } = req.body;

    // Validaciones básicas
    if (!name || !username || !email || !password || !confirmPassword) {
      console.log('🔴 [register] Faltan campos obligatorios');
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    if (password !== confirmPassword) {
      console.log('🔴 [register] Contraseñas no coinciden');
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }

    // Definir roles permitidos
    const allowedRoles = ['admin', 'adminFundacion', 'adoptante'];
    const requestedRole = role || 'adoptante';

    // Validar rol
    if (!allowedRoles.includes(requestedRole)) {
      console.log('🔴 [register] Rol no permitido:', requestedRole);
      return res.status(400).json({
        success: false,
        message: 'Rol no permitido'
      });
    }

    // Solo admin puede asignar roles privilegiados
    if (['admin', 'adminFundacion'].includes(requestedRole)) {
      console.log('🟠 [register] Intentando registrar rol privilegiado:', requestedRole);
      if (!req.user || req.user.role !== 'admin') {
        console.log('🔴 [register] Usuario no autorizado para asignar rol:', requestedRole);
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para asignar este rol'
        });
      }
    }

    // Verificar si el usuario ya existe
    console.log('🔵 [register] Buscando usuario existente...');
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      console.log('🔴 [register] Usuario ya existe:', {
        emailExists: existingUser.email === email,
        usernameExists: existingUser.username === username
      });
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'El correo ya está registrado' 
          : 'El nombre de usuario ya existe'
      });
    }

    // Crear usuario
    console.log('🟢 [register] Creando nuevo usuario...');
    const user = await User.create({
      name,
      username,
      email,
      password,
      contactNumber,
      role: requestedRole
    });

    // Generar token JWT
    const tokenPayload = { 
      id: user._id, 
      role: user.role 
    };
    console.log('🔵 [register] Generando token con payload:', tokenPayload);
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    console.log('🟢 [register] Usuario registrado exitosamente:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('🔴 [register] Error en registro:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });

    // Manejo especial para errores de duplicado (por si fallan las validaciones anteriores)
    if (error.code === 11000) {
      console.log('🔴 [register] Error de duplicado en MongoDB:', error.keyValue);
      return res.status(400).json({
        success: false,
        message: Object.keys(error.keyValue)[0] + ' ya está en uso'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};

// Login con logs detallados
exports.login = async (req, res) => {
  try {
    console.log('🔵 [login] Intento de login con email:', req.body.email);

    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      console.log('🔴 [login] Faltan credenciales');
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // Buscar usuario
    console.log('🔵 [login] Buscando usuario en BD...');
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('🔴 [login] Usuario no encontrado para email:', email);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Validar contraseña
    console.log('🔵 [login] Comparando contraseñas...');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('🔴 [login] Contraseña incorrecta para usuario:', user._id);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const tokenPayload = {
      id: user._id,
      role: user.role
    };
    console.log('🔵 [login] Generando token con payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    console.log('🟢 [login] Login exitoso para usuario:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('🔴 [login] Error en login:', {
      message: error.message,
      stack: error.stack,
      emailAttempt: req.body.email
    });

    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
};