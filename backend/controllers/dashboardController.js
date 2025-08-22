// controllers/dashboardController.js
const Mascota = require('../models/Mascota');
const SolicitudAdopcion = require('../models/SolicitudAdopcion');
const SolicitudPublicacion = require('../models/SolicitudPublicacion');
const ProcesoAdopcion = require('../models/ProcesoAdopcion');
const User = require('../models/User');
const Donation = require('../models/Donation');


const MESES_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const startOfMonth = (d = new Date()) => {
  const x = new Date(d);
  x.setDate(1); x.setHours(0,0,0,0);
  return x;
};
const endOfMonth = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return x;
};

const getLastNMonths = (n = 6) => {
  // Devuelve array de objetos [{year,month,label}], del más antiguo al más reciente
  const now = new Date();
  const items = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    items.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1, // 1..12
      label: MESES_ES[d.getMonth()]
    });
  }
  return items;
};

// Genera series mensuales por conteo
const monthlyCountSeries = async ({ Model, dateField = 'createdAt', match = {}, months = 6 }) => {
  const monthsDef = getLastNMonths(months);
  const first = new Date(monthsDef[0].year, monthsDef[0].month - 1, 1, 0, 0, 0, 0);
  const last = endOfMonth(new Date());

  const pipeline = [
    { $match: { ...match, [dateField]: { $gte: first, $lte: last } } },
    {
      $group: {
        _id: {
          y: { $year: `$${dateField}` },
          m: { $month: `$${dateField}` }
        },
        count: { $sum: 1 }
      }
    }
  ];
  const rows = await Model.aggregate(pipeline);

  const map = new Map(rows.map(r => [`${r._id.y}-${r._id.m}`, r.count]));
  const series = monthsDef.map(mo => ({
    name: mo.label,
    val: map.get(`${mo.year}-${mo.month}`) || 0
  }));
  return series;
};

// Genera series mensuales por suma de un campo numérico
const monthlySumSeries = async ({ Model, amountField = 'monto', dateField = 'fecha', match = {}, months = 6 }) => {
  const monthsDef = getLastNMonths(months);
  const first = new Date(monthsDef[0].year, monthsDef[0].month - 1, 1, 0, 0, 0, 0);
  const last = endOfMonth(new Date());

  const pipeline = [
    { $match: { ...match, [dateField]: { $gte: first, $lte: last } } },
    {
      $group: {
        _id: {
          y: { $year: `$${dateField}` },
          m: { $month: `$${dateField}` }
        },
        total: { $sum: `$${amountField}` }
      }
    }
  ];
  const rows = await Model.aggregate(pipeline);
  const map = new Map(rows.map(r => [`${r._id.y}-${r._id.m}`, r.total]));
  const series = monthsDef.map(mo => ({
    name: mo.label,
    val: map.get(`${mo.year}-${mo.month}`) || 0
  }));
  return series;
};

// Cuenta si todas las etapas reales están aprobadas
const allEtapasAprobadas = (p) =>
  Boolean(
    p?.entrevista?.aprobada &&
    p?.visita?.aprobada &&
    p?.compromiso?.aprobada &&
    p?.entrega?.aprobada
  );

// --------- Endpoints ---------

// KPIs de las tarjetas
exports.getSummary = async (req, res) => {
  try {
    const now = new Date();
    const iniMes = startOfMonth(now);
    const finMes = endOfMonth(now);

    // Mascotas
    const totalMascotasDisp = await Mascota.countDocuments({ disponible: true });
    const mascotasCreadasEsteMes = await Mascota.countDocuments({ createdAt: { $gte: iniMes, $lte: finMes } });

    // Solicitudes de adopción
    const totalSolAdop = await SolicitudAdopcion.countDocuments({});
    const solAdopEsteMes = await SolicitudAdopcion.countDocuments({ createdAt: { $gte: iniMes, $lte: finMes } });

    // Solicitudes de publicación
    const totalSolPub = await SolicitudPublicacion.countDocuments({});
    const solPubEsteMes = await SolicitudPublicacion.countDocuments({ createdAt: { $gte: iniMes, $lte: finMes } });

    // Adopciones completadas (finalizado:true o todas etapas aprobadas)
    const adopCompletadas = await ProcesoAdopcion.countDocuments({
      $or: [
        { finalizado: true },
        { 'entrevista.aprobada': true, 'visita.aprobada': true, 'compromiso.aprobada': true, 'entrega.aprobada': true }
      ]
    });

    return res.json({
      mascotasDisponibles: { total: totalMascotasDisp, creacionesEsteMes: mascotasCreadasEsteMes },
      solicitudesAdopcion: { total: totalSolAdop, creacionesEsteMes: solAdopEsteMes },
      solicitudesPublicacion: { total: totalSolPub, creacionesEsteMes: solPubEsteMes },
      adopcionesCompletadas: { total: adopCompletadas }
    });
  } catch (err) {
    console.error('Dashboard.getSummary error:', err);
    return res.status(500).json({ message: 'Error al obtener resumen', error: err.message });
  }
};

// Serie: Solicitudes de adopción por mes
exports.getActivityAdopcion = async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const series = await monthlyCountSeries({
      Model: SolicitudAdopcion,
      dateField: 'createdAt',
      match: {},
      months
    });
    return res.json({ series });
  } catch (err) {
    console.error('Dashboard.getActivityAdopcion error:', err);
    return res.status(500).json({ message: 'Error al obtener serie de adopción', error: err.message });
  }
};

// Serie: Solicitudes de publicación por mes
exports.getActivityPublicacion = async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const series = await monthlyCountSeries({
      Model: SolicitudPublicacion,
      dateField: 'createdAt',
      match: {},
      months
    });
    return res.json({ series });
  } catch (err) {
    console.error('Dashboard.getActivityPublicacion error:', err);
    return res.status(500).json({ message: 'Error al obtener serie de publicación', error: err.message });
  }
};

// Serie: Donaciones (suma de montos) por mes
exports.getActivityDonaciones = async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const series = await monthlySumSeries({
      Model: Donation,
      amountField: 'monto',
      dateField: 'fecha', // tu modelo usa "fecha"
      match: {},
      months
    });
    return res.json({ currency: 'COP', series });
  } catch (err) {
    console.error('Dashboard.getActivityDonaciones error:', err);
    return res.status(500).json({ message: 'Error al obtener serie de donaciones', error: err.message });
  }
};

// Tabla: Procesos en curso
exports.getProcessesInProgress = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));
    // En curso = no finalizado y sin etapa rechazada (si existe esa marca)
    const match = { finalizado: false, $or: [{ etapaRechazada: { $exists: false } }, { etapaRechazada: null }] };

    const procesos = await ProcesoAdopcion.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({
        path: 'solicitud',
        populate: [
          { path: 'mascota', model: 'Mascota', select: 'nombre' },
          { path: 'adoptante', model: 'User', select: 'username email' } // no hay "nombreCompleto" en User
        ],
        select: 'mascota adoptante createdAt'
      })
      .lean();

    const rows = procesos.map(p => {
      const aprobadas =
        (p?.entrevista?.aprobada ? 1 : 0) +
        (p?.visita?.aprobada ? 1 : 0) +
        (p?.compromiso?.aprobada ? 1 : 0) +
        (p?.entrega?.aprobada ? 1 : 0);

      // Índice de etapa actual (0..3). Si todas aprobadas, nos quedamos en la última.
      let etapaActualIndex = 0;
      if (!p?.entrevista?.aprobada) etapaActualIndex = 0;
      else if (!p?.visita?.aprobada) etapaActualIndex = 1;
      else if (!p?.compromiso?.aprobada) etapaActualIndex = 2;
      else etapaActualIndex = 3;

      const mascota = p?.solicitud?.mascota
        ? { _id: p.solicitud.mascota._id, nombre: p.solicitud.mascota.nombre }
        : { _id: null, nombre: '—' };

      const adoptante = p?.solicitud?.adoptante
        ? { _id: p.solicitud.adoptante._id, nombre: p.solicitud.adoptante.username }
        : { _id: null, nombre: '—' };

      return {
        _id: String(p._id),
        mascota,
        adoptante,
        etapaActualIndex,
        aprobadas,             // reales
        fecha: p.createdAt
      };
    });

    return res.json({ totalEtapas: 4, rows });
  } catch (err) {
    console.error('Dashboard.getProcessesInProgress error:', err);
    return res.status(500).json({ message: 'Error al obtener procesos', error: err.message });
  }
};


// KPIs adoptante (tarjetas del dashboard de usuario)
exports.getAdoptanteSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Total de solicitudes de adopción del usuario
    const totalSolAdopUser = await SolicitudAdopcion.countDocuments({ adoptante: userId });

    // Total de solicitudes de publicación del usuario
    const totalSolPubUser = await SolicitudPublicacion.countDocuments({ adoptante: userId });

    // Publicaciones en AdoptMe (mascotas creadas/ligadas al usuario externo y publicadas)
    // Assumption: cuando se aprueba una solicitud de publicación, se crea una Mascota con:
    //   origen: 'externo', publicada: true, publicadaPor: userId
    const totalPublicacionesUser = await Mascota.countDocuments({
      origen: 'externo',
      publicada: true,
      publicadaPor: userId
    });

    return res.json({
      solicitudesAdopcion: { total: totalSolAdopUser },
      solicitudesPublicacion: { total: totalSolPubUser },
      publicacionesAdoptMe: { total: totalPublicacionesUser }
    });
  } catch (err) {
    console.error('Dashboard.getAdoptanteSummary error:', err);
    return res.status(500).json({ message: 'Error al obtener resumen de adoptante', error: err.message });
  }
};

// Tabla izquierda: "Mis Procesos de Adopción en Curso"
exports.getMyProcessesInProgress = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));

    // Traemos procesos NO finalizados cuyos procesos pertenezcan a solicitudes de este usuario
    const procesos = await ProcesoAdopcion.find({ finalizado: false })
      .sort({ createdAt: -1 })
      .populate({
        path: 'solicitud',
        match: { adoptante: userId },
        populate: [
          { path: 'mascota', model: 'Mascota', select: 'nombre' },
          { path: 'adoptante', model: 'User', select: 'username email' }
        ],
        select: 'mascota adoptante createdAt'
      })
      .limit(limit)
      .lean();

    // Filtra sólo los que sí correspondan al usuario (por el match de arriba)
    const propios = procesos.filter(p => p.solicitud);

    const rows = propios.map(p => {
      const aprobadas =
        (p?.entrevista?.aprobada ? 1 : 0) +
        (p?.visita?.aprobada ? 1 : 0) +
        (p?.compromiso?.aprobada ? 1 : 0) +
        (p?.entrega?.aprobada ? 1 : 0);

      let etapaActualIndex = 0;
      if (!p?.entrevista?.aprobada) etapaActualIndex = 0;
      else if (!p?.visita?.aprobada) etapaActualIndex = 1;
      else if (!p?.compromiso?.aprobada) etapaActualIndex = 2;
      else etapaActualIndex = 3;

      const mascota = p?.solicitud?.mascota
        ? { _id: p.solicitud.mascota._id, nombre: p.solicitud.mascota.nombre }
        : { _id: null, nombre: '—' };

      const adoptante = p?.solicitud?.adoptante
        ? { _id: p.solicitud.adoptante._id, nombre: p.solicitud.adoptante.username }
        : { _id: null, nombre: '—' };

      return {
        _id: String(p._id),
        mascota,
        adoptante,
        etapaActualIndex,
        aprobadas,   // reales (el front suma +1 por "Solicitud")
        fecha: p.createdAt
      };
    });

    return res.json({ totalEtapas: 4, rows });
  } catch (err) {
    console.error('Dashboard.getMyProcessesInProgress error:', err);
    return res.status(500).json({ message: 'Error al obtener procesos del adoptante', error: err.message });
  }
};

// Tabla derecha: "Mis Solicitudes de Publicación"
exports.getMyPublicationRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 10)));

    const solicitudes = await SolicitudPublicacion.find({ adoptante: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Normaliza las filas para la tabla (mascota, especie, estado, fecha, id)
    const rows = solicitudes.map(s => ({
      _id: String(s._id),
      mascota: s?.mascota?.nombre || '—',
      especie: s?.mascota?.especie || '—',
      estado: s?.estado || 'pendiente',
      fecha: s?.createdAt
    }));

    return res.json({ rows });
  } catch (err) {
    console.error('Dashboard.getMyPublicationRequests error:', err);
    return res.status(500).json({ message: 'Error al obtener solicitudes de publicación del adoptante', error: err.message });
  }
};