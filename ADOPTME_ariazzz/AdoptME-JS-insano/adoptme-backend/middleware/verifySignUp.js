const User = require('../models/User');

// Verifica si el username o email ya existen
const checkduplicateUsernameOrEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.email }
            ]
        }).exec();

        if (user) {
            return res.status(400).json({
                success: false,
                message: 'El usuario o el correo electrónico ya existen.'
            });
        }

        next();
    } catch (err) {
        console.error('[verifySignUp] Error en checkduplicateUsernameOrEmail:', err);
        res.status(500).json({
            success: false,
            message: 'Error al verificar credenciales.',
            error: err.message
        });
    }
};

// Verifica si el rol proporcionado es válido
const checkRolesExisted = (req, res, next) => {
    const validRoles = ['admin', 'adminFundacion', 'adoptante'];

    if (req.body.role && !validRoles.includes(req.body.role)) {
        return res.status(400).json({
            success: false,
            message: `Rol no válido: ${req.body.role}`
        });
    }

    next();
};

module.exports = {
    checkduplicateUsernameOrEmail,
    checkRolesExisted
};
