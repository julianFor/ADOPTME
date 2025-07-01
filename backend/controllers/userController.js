const User = require('../models/User');
const bcrypt = require('bcryptjs');


// Registro público de adoptantes
exports.registrarse = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validación básica
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios'
      });
    }

    // Validar existencia de email o username
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
      password,
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
        const user = await User.findById(req.params.id).select('-password');
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
        const { username, email, password, role } = req.body;

        // ⚠️ NO encriptamos aquí la contraseña, lo hará el modelo con pre('save')
        const user = new User({
            username,
            email,
            password,
            role
        });

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
        const user = await User.findById(req.params.id);
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

        const updates = req.body;

        // Si actualiza contraseña, encriptarla
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
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

        const deletedUser = await User.findByIdAndDelete(req.params.id);
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
    const { username, password } = req.body;
    console.log('Datos recibidos:', { username, password });

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (username && username !== user.username) {
      const existe = await User.findOne({ username });
      if (existe) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso por otro usuario'
        });
      }
      user.username = username;
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
    console.error('Error en actualizarMiPerfil:', error); // 🔴 Aquí verás el error real
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar tu perfil',
      error: error.message
    });
  }
};
