// backend/controladores/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ───────────────── helpers de sanitización ─────────────────
const toStr = (v) => (v === undefined || v === null) ? '' : String(v).trim();
const normEmail = (v) => toStr(v).toLowerCase();
const normUsername = (v) => toStr(v);
const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Registro público de adoptantes
exports.registrarse = async (req, res) => {
  try {
    const rawUsername = req.body?.username;
    const rawEmail = req.body?.email;
    const password = req.body?.password;

    const username = normUsername(rawUsername);
    const email = normEmail(rawEmail);

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Validar existencia de email o username (forzando string plano)
    const existeEmail = await User.findOne({ email });
    if (existeEmail) {
      return res.status(400).json({
        success: false,
        message: 'El correo ya está registrado'
      });
    }

    const existeUsername = await User.findOne({ username });
    if (existeUsername) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de usuario ya está en uso'
      });
    }

    // Crear usuario como adoptante
    const nuevo = new User({
      username,
      email,
      password,      // el hash lo hace el modelo en pre('save')
      role: 'adoptante'
    });

    await nuevo.save();

    res.status(201).json({
      success: true,
      message: 'Registro exitoso',
      user: {
        id: nuevo._id,
        username: nuevo.username,
        email: nuevo.email,
        role: nuevo.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};


// Obtener todos los usuarios (admin y adminFundacion)
exports.getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.userRole === 'admin') {
      users = await User.find().select('-password');
    } else if (req.userRole === 'adminFundacion') {
      users = await User.find({ role: { $in: ['adminFundacion', 'adoptante'] } }).select('-password');
    } else {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver todos los usuarios'
      });
    }

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validaciones de acceso
    if (req.userRole === 'adoptante' && req.userId !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este perfil'
      });
    }

    if (req.userRole === 'adminFundacion' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes ver usuarios administradores del sistema'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Crear un nuevo usuario (admin y adminFundacion)
exports.createUser = async (req, res) => {
  try {
    const username = normUsername(req.body?.username);
    const email = normEmail(req.body?.email);
    const password = req.body?.password;
    const role = toStr(req.body?.role);

    const user = new User({ username, email, password, role });
    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el usuario',
      error: error.message
    });
  }
};


// Actualizar un usuario (admin puede editar todos, adminFundacion solo adoptantes)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validación de roles
    if (req.userRole === 'adminFundacion' && user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes modificar usuarios admin del sistema'
      });
    }

    // Si adoptante, solo se puede modificar a sí mismo
    if (req.userRole === 'adoptante' && req.userId !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes modificar tu propio perfil'
      });
    }

    const updates = { ...req.body };

    // Normalizaciones seguras si llegan desde cliente
    if (updates.email !== undefined) updates.email = normEmail(updates.email);
    if (updates.username !== undefined) updates.username = normUsername(updates.username);

    // Si actualiza contraseña, encriptarla
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Eliminar un usuario (solo admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo el administrador del sistema puede eliminar usuarios'
      });
    }

    const { id } = req.params;
    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID inválido' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
      error: error.message
    });
  }
};

// Obtener mi perfil (usuario autenticado)
exports.getMiPerfil = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener tu perfil',
      error: error.message
    });
  }
};

// Actualizar mi perfil (usuario autenticado)
exports.actualizarMiPerfil = async (req, res) => {
  try {
    const rawUsername = req.body?.username;
    const password = req.body?.password;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const newUsername = normUsername(rawUsername);

    if (newUsername && newUsername !== user.username) {
      const existe = await User.findOne({ username: newUsername });
      if (existe) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso por otro usuario'
        });
      }
      user.username = newUsername;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en actualizarMiPerfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar tu perfil',
      error: error.message
    });
  }
};

// Obtener todos los usuarios por rol (uso interno para backend: notificaciones, etc.)
exports.getUsersByRole = async (req, res) => {
  try {
    const rolesValidos = ['admin', 'adminFundacion', 'adoptante'];
    const rolParam = toStr(req.params?.rol);

    if (!rolesValidos.includes(rolParam)) {
      return res.status(400).json({
        success: false,
        message: 'Rol no válido'
      });
    }

    // Filtro seguro con string plano
    const usuarios = await User.find({ role: rolParam }).select('-password');

    res.status(200).json({
      success: true,
      data: usuarios
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios por rol',
      error: error.message
    });
  }
};
