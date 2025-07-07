const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

// Roles permitidos en AdoptMe
const ROLES = {
  ADMIN: 'admin',
  ADMINFUNDACION: 'adminFundacion',
  ADOPTANTE: 'adoptante'
};

// Función para verificar permisos
const checkPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Registro de usuarios (solo admin y adminFundacion pueden registrar adoptantes)
exports.signup = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios"
      });
    }

    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || ROLES.ADOPTANTE
    });

    const savedUser = await user.save();

    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      config.secret,
      { expiresIn: config.jwtExpiration }
    );

    const userData = savedUser.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: userData
    });

  } catch (error) {
    console.error('[AuthController] Error en registro:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `El ${field} ya está en uso`,
        field
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: error.message
    });
  }
};

// Login (signin)
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos"
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.secret,
      { expiresIn: config.jwtExpiration }
    );

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Autenticación exitosa",
      token,
      user: userData
    });

  } catch (error) {
    console.error('[AuthController] Error en login:', error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message
    });
  }
};

// Obtener usuario por ID (admin puede ver todos, adminFundacion y adoptante solo su propio perfil)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validaciones de acceso
    if (req.userRole === 'adoptante' && req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este perfil'
      });
    }

    if (req.userRole === 'adminFundacion' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes ver perfiles de administradores del sistema'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario'
    });
  }
};
// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validación de permisos
    if (req.userRole === 'adoptante' && req.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes modificar tu propio perfil'
      });
    }

    if (req.userRole === 'adminFundacion' && userToUpdate.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes modificar administradores del sistema'
      });
    }

    // Campos permitidos
    const allowedFields = ['username', 'email'];
    if (req.userRole === 'admin') {
      allowedFields.push('role');
    }

    const filteredUpdates = {};
    for (const key of allowedFields) {
      if (updates[key]) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Si se actualiza password
    if (updates.password) {
      filteredUpdates.password = bcrypt.hashSync(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, { new: true }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario'
    });
  }
};
// Eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores del sistema pueden eliminar usuarios'
      });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario'
    });
  }
};
