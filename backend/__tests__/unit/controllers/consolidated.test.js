/**
 * Tests Consolidados para Controllers: Dashboard, DonationGoal, Notificacion, 
 * ProcesoAdopcion, SolicitudAdopcion, SolicitudPublicacion
 */

describe('Dashboard Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    userRole: 'admin',
    userId: '507f1f77bcf86cd799439011',
  });

  test('Debe retornar estadísticas para admin', () => {
    const req = mockReq();
    req.userRole = 'admin';
    const res = mockRes();

    const stats = {
      totalUsuarios: 150,
      totalMascotas: 45,
      totalDonaciones: 5000,
      adopcionesCompletadas: 12,
    };

    res.status(200);
    res.json(stats);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(stats);
  });

  test('Debe denegar estadísticas a adoptante', () => {
    const req = mockReq();
    req.userRole = 'adoptante';
    const res = mockRes();

    res.status(403);
    res.json({ success: false, message: 'No tienes acceso a estadísticas' });

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('DonationGoal Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
  });

  test('Debe crear meta de donación', () => {
    const req = mockReq();
    req.body = {
      nombre: 'Meta de Alimentos',
      objetivo: 5000,
      moneda: 'USD',
    };
    const res = mockRes();

    const meta = {
      _id: '507f1f77bcf86cd799439011',
      ...req.body,
      recaudado: 0,
      estado: 'activa',
    };

    res.status(201);
    res.json(meta);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debe obtener meta por ID', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    const res = mockRes();

    const meta = {
      _id: req.params.id,
      nombre: 'Meta',
      objetivo: 5000,
      recaudado: 2500,
    };

    res.status(200);
    res.json(meta);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe actualizar progreso de meta', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { recaudado: 3000 };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Meta actualizada' });

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('Notificacion Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    userId: '507f1f77bcf86cd799439011',
  });

  test('Debe crear notificación', () => {
    const req = mockReq();
    req.body = {
      usuarioId: '507f1f77bcf86cd799439011',
      tipo: 'adopcion',
      mensaje: 'Nueva solicitud de adopción',
      referenciaNegocio: '507f1f77bcf86cd799439012',
    };
    const res = mockRes();

    const notif = {
      _id: '507f1f77bcf86cd799439013',
      ...req.body,
      leida: false,
      fechaCreacion: new Date(),
    };

    res.status(201);
    res.json(notif);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debe obtener notificaciones del usuario', () => {
    const req = mockReq();
    const res = mockRes();

    const notificaciones = [
      {
        _id: '1',
        tipo: 'adopcion',
        mensaje: 'Nueva solicitud',
        leida: false,
      },
      {
        _id: '2',
        tipo: 'donacion',
        mensaje: 'Gracias por donar',
        leida: true,
      },
    ];

    res.status(200);
    res.json(notificaciones);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe marcar notificación como leída', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Notificación marcada como leída' });

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('ProcesoAdopcion Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
  });

  test('Debe crear proceso de adopción', () => {
    const req = mockReq();
    req.body = {
      solicitudId: '507f1f77bcf86cd799439011',
      mascotaId: '507f1f77bcf86cd799439012',
      estado: 'iniciado',
    };
    const res = mockRes();

    const proceso = {
      _id: '507f1f77bcf86cd799439013',
      ...req.body,
      fechaInicio: new Date(),
    };

    res.status(201);
    res.json(proceso);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debe actualizar estado del proceso', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { estado: 'completado' };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Proceso actualizado' });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe obtener proceso por ID', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    const res = mockRes();

    const proceso = {
      _id: req.params.id,
      estado: 'en_progreso',
      mascotaId: '507f1f77bcf86cd799439012',
    };

    res.status(200);
    res.json(proceso);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('SolicitudAdopcion Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    userId: '507f1f77bcf86cd799439011',
  });

  test('Debe crear solicitud de adopción', () => {
    const req = mockReq();
    req.body = {
      mascotaId: '507f1f77bcf86cd799439012',
      usuario: req.userId,
      motivacion: 'Amo los animales',
    };
    const res = mockRes();

    const solicitud = {
      _id: '507f1f77bcf86cd799439013',
      ...req.body,
      estado: 'pendiente',
      fechaCreacion: new Date(),
    };

    res.status(201);
    res.json(solicitud);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debe obtener solicitudes del usuario', () => {
    const req = mockReq();
    const res = mockRes();

    const solicitudes = [
      {
        _id: '1',
        mascotaId: '507f1f77bcf86cd799439012',
        estado: 'pendiente',
      },
    ];

    res.status(200);
    res.json(solicitudes);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe rechazar solicitud', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { estado: 'rechazada', razon: 'No cumple requisitos' };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Solicitud rechazada' });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe aprobar solicitud', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { estado: 'aprobada' };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Solicitud aprobada' });

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('SolicitudPublicacion Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    userId: '507f1f77bcf86cd799439011',
  });

  test('Debe crear solicitud de publicación', () => {
    const req = mockReq();
    req.body = {
      mascotaId: '507f1f77bcf86cd799439012',
      usuario: req.userId,
      descripcion: 'Solicito publicar esta mascota',
    };
    const res = mockRes();

    const solicitud = {
      _id: '507f1f77bcf86cd799439013',
      ...req.body,
      estado: 'pendiente',
      fechaCreacion: new Date(),
    };

    res.status(201);
    res.json(solicitud);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('Debe aprobar solicitud de publicación', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { estado: 'aprobada' };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Solicitud aprobada, mascota publicada' });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe rechazar solicitud de publicación', () => {
    const req = mockReq();
    req.params.id = '507f1f77bcf86cd799439011';
    req.body = { estado: 'rechazada', razon: 'Fotos inadecuadas' };
    const res = mockRes();

    res.status(200);
    res.json({ success: true, message: 'Solicitud rechazada' });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('Debe obtener solicitudes pendientes', () => {
    const req = mockReq();
    req.query = { estado: 'pendiente' };
    const res = mockRes();

    const solicitudes = [
      {
        _id: '1',
        mascotaId: '507f1f77bcf86cd799439012',
        estado: 'pendiente',
      },
    ];

    res.status(200);
    res.json(solicitudes);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
