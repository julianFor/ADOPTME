// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authJwt'); // tu archivo
const DashboardController = require('../controllers/dashboardController');

// Guard de roles: admin o adminFundacion
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.userRole) return res.status(401).json({ message: 'Sin rol' });
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ message: 'Rol no autorizado' });
  }
  next();
};

// Todas las rutas requieren token y rol permitido
const withAuth = [verifyToken, allowRoles('admin', 'adminFundacion')];

/** KPIs (tarjetas) */
router.get('/summary', withAuth, DashboardController.getSummary);

/** Series temporales (tabs del gráfico) */
router.get('/activity/adopcion', withAuth, DashboardController.getActivityAdopcion);
router.get('/activity/publicacion', withAuth, DashboardController.getActivityPublicacion);
router.get('/activity/donaciones', withAuth, DashboardController.getActivityDonaciones);

/** Tabla: procesos en curso */
router.get('/processes/in-progress', withAuth, DashboardController.getProcessesInProgress);



/** ---- ADOPTANTE DASHBOARD ---- */
const withAuthAdoptante = [verifyToken, allowRoles('adoptante', 'admin', 'adminFundacion')];

// KPIs adoptante
router.get('/adoptante/summary', withAuthAdoptante, DashboardController.getAdoptanteSummary);

// Tabla: mis procesos en curso
router.get('/adoptante/processes/in-progress', withAuthAdoptante, DashboardController.getMyProcessesInProgress);

// Tabla: mis solicitudes de publicación
router.get('/adoptante/solicitudes-publicacion', withAuthAdoptante, DashboardController.getMyPublicationRequests);

module.exports = router;
