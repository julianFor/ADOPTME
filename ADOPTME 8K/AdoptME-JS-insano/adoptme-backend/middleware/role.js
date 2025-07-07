const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            console.error('Intento de verificar rol sin token válido');
            return res.status(500).json({
                success: false,
                message: 'Error al verificar rol'
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            console.log(`Acceso denegado para ${req.userEmail} (${req.userRole}) en ruta ${req.path}`);
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para esta acción',
            });
        }

        next();
    };
};

// Funciones específicas por rol (opcionales)
const isAdmin = (req, res, next) => checkRole('admin')(req, res, next);
const isAdminFundacion = (req, res, next) => checkRole('adminFundacion')(req, res, next);
const isAdoptante = (req, res, next) => checkRole('adoptante')(req, res, next);

module.exports = {
    checkRole,
    isAdmin,
    isAdminFundacion,
    isAdoptante
};
