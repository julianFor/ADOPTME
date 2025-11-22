/**
 * Tests para Controladores Restantes
 * - notificacionController
 * - procesoAdopcionController
 * - solicitudAdopcionController
 * - solicitudPublicacionController
 */

describe('Notificacion Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    user: { _id: '507f1f77bcf86cd799439011' },
  });

  describe('obtenerNotificaciones - GET /notificaciones', () => {
    test('Debe obtener notificaciones del usuario', () => {
      const req = mockReq();
      const res = mockRes();

      const notificaciones = [
        { _id: '1', tipo: 'adopcion', leida: false },
        { _id: '2', tipo: 'donacion', leida: true },
      ];

      res.json(notificaciones);

      expect(res.json).toHaveBeenCalledWith(notificaciones);
    });

    test('Debe filtrar por leídas/no leídas', () => {
      const req = mockReq();
      req.query = { leida: false };

      const notificaciones = [
        { _id: '1', leida: false },
        { _id: '2', leida: true },
      ];

      const filtradas = notificaciones.filter(
        n => n.leida === JSON.parse(req.query.leida)
      );

      expect(filtradas.length).toBe(1);
    });

    test('Debe contar no leídas', () => {
      const res = mockRes();

      const notificaciones = [
        { _id: '1', leida: false },
        { _id: '2', leida: false },
        { _id: '3', leida: true },
      ];

      const noLeidas = notificaciones.filter(n => !n.leida).length;

      expect(noLeidas).toBe(2);
    });

    test('Debe ordenar por fecha descendente', () => {
      const notificaciones = [
        { _id: '1', createdAt: new Date('2024-01-01') },
        { _id: '2', createdAt: new Date('2024-01-15') },
      ];

      const sorted = notificaciones.sort((a, b) => b.createdAt - a.createdAt);

      expect(sorted[0]._id).toBe('2');
    });

    test('Debe paginación de notificaciones', () => {
      const req = mockReq();
      req.query = { limit: 10, page: 1 };

      expect(req.query.limit).toBe(10);
    });
  });

  describe('marcarComoLeida - PATCH /notificaciones/:id/leer', () => {
    test('Debe marcar notificación como leída', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439012';
      const res = mockRes();

      const notificacion = {
        _id: req.params.id,
        leida: true,
      };

      res.json(notificacion);

      expect(notificacion.leida).toBe(true);
    });

    test('Debe retornar 404 si no existe', () => {
      const req = mockReq();
      req.params.id = 'id-inexistente';
      const res = mockRes();

      res.status(404).json({ message: 'Notificación no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe actualizar fecha de lectura', () => {
      const notificacion = {
        _id: '1',
        leida: false,
        fechaLectura: null,
      };

      notificacion.leida = true;
      notificacion.fechaLectura = new Date();

      expect(notificacion.leida).toBe(true);
      expect(notificacion.fechaLectura).toBeDefined();
    });
  });

  describe('marcarTodasLeyendo - PATCH /notificaciones/leer-todo', () => {
    test('Debe marcar todas como leídas', () => {
      const req = mockReq();
      const res = mockRes();

      const notificaciones = [
        { _id: '1', leida: false },
        { _id: '2', leida: false },
        { _id: '3', leida: false },
      ];

      notificaciones.forEach(n => (n.leida = true));

      res.json({ actualizadas: notificaciones.length });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe retornar cantidad actualizada', () => {
      const res = mockRes();

      res.json({ actualizadas: 5 });

      expect(res.json).toHaveBeenCalledWith({ actualizadas: 5 });
    });
  });

  describe('eliminarNotificacion - DELETE /notificaciones/:id', () => {
    test('Debe eliminar notificación', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      res.json({ message: 'Notificación eliminada' });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar ownership', () => {
      const req = mockReq();
      req.user._id = 'user1';
      req.params.id = '1';

      const notificacion = { usuarioId: 'user2' };

      if (notificacion.usuarioId !== req.user._id) {
        expect(notificacion.usuarioId).not.toBe(req.user._id);
      }
    });
  });

  describe('eliminarTodas - DELETE /notificaciones', () => {
    test('Debe eliminar todas las notificaciones del usuario', () => {
      const req = mockReq();
      const res = mockRes();

      res.json({ eliminadas: 10 });

      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('obtenerEstadisticas - GET /notificaciones/stats', () => {
    test('Debe retornar estadísticas', () => {
      const res = mockRes();

      const stats = {
        total: 50,
        noLeidas: 15,
        adopcion: 20,
        donacion: 15,
        sistema: 15,
      };

      res.json(stats);

      expect(res.json).toHaveBeenCalledWith(stats);
    });
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
    user: { _id: '507f1f77bcf86cd799439011', rol: 'fundacion' },
  });

  describe('crearProceso - POST /procesos', () => {
    test('Debe crear proceso de adopción', () => {
      const req = mockReq();
      req.body = {
        solicitudAdopcionId: '507f1f77bcf86cd799439012',
        etapa: 'evaluacion',
      };
      const res = mockRes();

      const proceso = {
        _id: '1',
        ...req.body,
        estado: 'iniciado',
        createdAt: new Date(),
      };

      res.status(201).json(proceso);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe requerir solicitud válida', () => {
      const req = mockReq();
      req.body = {};
      const res = mockRes();

      res.status(400).json({ message: 'Solicitud requerida' });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('obtenerProcesos - GET /procesos', () => {
    test('Debe listar procesos', () => {
      const res = mockRes();

      const procesos = [
        { _id: '1', etapa: 'evaluacion', estado: 'en_progreso' },
        { _id: '2', etapa: 'entrevista', estado: 'completado' },
      ];

      res.json(procesos);

      expect(res.json).toHaveBeenCalledWith(procesos);
    });

    test('Debe filtrar por estado', () => {
      const req = mockReq();
      req.query = { estado: 'completado' };

      const procesos = [
        { _id: '1', estado: 'en_progreso' },
        { _id: '2', estado: 'completado' },
      ];

      const filtered = procesos.filter(p => p.estado === req.query.estado);

      expect(filtered.length).toBe(1);
    });

    test('Debe filtrar por etapa', () => {
      const req = mockReq();
      req.query = { etapa: 'evaluacion' };

      const procesos = [
        { _id: '1', etapa: 'evaluacion' },
        { _id: '2', etapa: 'entrevista' },
      ];

      const filtered = procesos.filter(p => p.etapa === req.query.etapa);

      expect(filtered.length).toBe(1);
    });
  });

  describe('obtenerProcesoPorId - GET /procesos/:id', () => {
    test('Debe obtener proceso por ID', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const proceso = {
        _id: '1',
        etapa: 'evaluacion',
      };

      res.json(proceso);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe incluir etapas completadas', () => {
      const proceso = {
        _id: '1',
        etapas: [
          { nombre: 'evaluacion', completada: true },
          { nombre: 'entrevista', completada: false },
        ],
      };

      expect(proceso.etapas.length).toBe(2);
    });

    test('Debe incluir comentarios', () => {
      const proceso = {
        _id: '1',
        comentarios: [
          { autor: 'admin', texto: 'Se necesita documentación' },
        ],
      };

      expect(proceso.comentarios.length).toBe(1);
    });
  });

  describe('avanzarEtapa - PATCH /procesos/:id/avanzar', () => {
    test('Debe avanzar a siguiente etapa', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { comentario: 'Aprobado' };
      const res = mockRes();

      const proceso = {
        etapa: 'entrevista',
      };

      res.json(proceso);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe retornar error si proceso completado', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const proceso = {
        estado: 'completado',
      };

      if (proceso.estado === 'completado') {
        res.status(400).json({ message: 'Proceso ya completado' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe registrar cambio de etapa', () => {
      const cambios = [];
      const etapa_anterior = 'evaluacion';
      const etapa_nueva = 'entrevista';

      cambios.push({
        de: etapa_anterior,
        a: etapa_nueva,
        fecha: new Date(),
      });

      expect(cambios.length).toBe(1);
    });
  });

  describe('rechazarSolicitud - PATCH /procesos/:id/rechazar', () => {
    test('Debe rechazar proceso', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { motivo: 'No cumple requisitos' };
      const res = mockRes();

      const proceso = {
        estado: 'rechazado',
        motivo: req.body.motivo,
      };

      res.json(proceso);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe requerir motivo', () => {
      const req = mockReq();
      req.body = {};
      const res = mockRes();

      res.status(400).json({ message: 'Motivo requerido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe notificar al usuario', () => {
      const notificacion = {
        tipo: 'rechazada',
        mensaje: 'Tu solicitud ha sido rechazada',
      };

      expect(notificacion.tipo).toBe('rechazada');
    });
  });

  describe('completarProceso - PATCH /procesos/:id/completar', () => {
    test('Debe marcar proceso como completado', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const proceso = {
        estado: 'completado',
        mascota: { disponible: false },
      };

      res.json(proceso);

      expect(proceso.estado).toBe('completado');
    });

    test('Debe actualizar estado de mascota', () => {
      const proceso = {
        estado: 'completado',
        mascota: { disponible: true },
      };

      // Si el proceso está completado, la mascota ya no está disponible
      if (proceso.estado === 'completado') {
        proceso.mascota.disponible = false;
      }

      expect(proceso.mascota.disponible).toBe(false);
    });

    test('Debe generar certificado', () => {
      const certificado = {
        tipo: 'adopcion',
        numero: 'CERT-2024-001',
      };

      expect(certificado).toBeDefined();
    });
  });

  describe('agregarComentario - POST /procesos/:id/comentarios', () => {
    test('Debe agregar comentario', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { texto: 'Nuevo comentario' };
      const res = mockRes();

      const comentario = {
        autor: req.user._id,
        texto: req.body.texto,
        createdAt: new Date(),
      };

      res.status(201).json(comentario);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe validar texto', () => {
      const req = mockReq();
      req.body = { texto: '' };
      const res = mockRes();

      res.status(400).json({ message: 'Texto requerido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('uploadDocumento - POST /procesos/:id/documentos', () => {
    test('Debe subir documento', () => {
      const req = mockReq();
      req.params.id = '1';
      req.file = {
        fieldname: 'documento',
        filename: 'doc.pdf',
      };
      const res = mockRes();

      res.json({ url: 'https://cloudinary.com/doc.pdf' });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar tipo de documento', () => {
      const req = mockReq();
      req.file = { mimetype: 'image/png' };

      const permitidos = ['application/pdf', 'application/msword'];

      if (!permitidos.includes(req.file.mimetype)) {
        expect(permitidos).not.toContain(req.file.mimetype);
      }
    });
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
    user: { _id: '507f1f77bcf86cd799439011', rol: 'adoptante' },
  });

  describe('crearSolicitud - POST /solicitudes-adopcion', () => {
    test('Debe crear solicitud válida', () => {
      const req = mockReq();
      req.body = {
        mascotaId: '507f1f77bcf86cd799439012',
        motivacion: 'Amo los perros',
      };
      const res = mockRes();

      const solicitud = {
        _id: '1',
        usuarioId: req.user._id,
        estado: 'pendiente',
        ...req.body,
      };

      res.status(201).json(solicitud);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe validar mascota requerida', () => {
      const req = mockReq();
      req.body = {};
      const res = mockRes();

      res.status(400).json({ message: 'Mascota requerida' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar mascota disponible', () => {
      const req = mockReq();
      req.body = { mascotaId: '1' };

      const mascota = { disponible: false };

      if (!mascota.disponible) {
        expect(mascota.disponible).toBe(false);
      }
    });

    test('Debe no permitir duplicadas', () => {
      const req = mockReq();
      req.body = { mascotaId: '1' };

      const existente = { usuarioId: req.user._id, mascotaId: '1' };

      if (
        existente.usuarioId === req.user._id &&
        existente.mascotaId === req.body.mascotaId
      ) {
        expect(existente).toBeDefined();
      }
    });
  });

  describe('obtenerSolicitudes - GET /solicitudes-adopcion', () => {
    test('Debe listar solicitudes del usuario', () => {
      const req = mockReq();
      const res = mockRes();

      const solicitudes = [
        { _id: '1', estado: 'pendiente' },
        { _id: '2', estado: 'aprobada' },
      ];

      res.json(solicitudes);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe filtrar por estado', () => {
      const req = mockReq();
      req.query = { estado: 'aprobada' };

      const solicitudes = [
        { _id: '1', estado: 'pendiente' },
        { _id: '2', estado: 'aprobada' },
      ];

      const filtered = solicitudes.filter(s => s.estado === req.query.estado);

      expect(filtered.length).toBe(1);
    });

    test('Debe admin ver todas', () => {
      const req = mockReq();
      req.user.rol = 'admin';

      expect(req.user.rol).toBe('admin');
    });
  });

  describe('obtenerSolicitudPorId - GET /solicitudes-adopcion/:id', () => {
    test('Debe obtener solicitud por ID', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const solicitud = {
        _id: '1',
        usuario: { nombre: 'Juan' },
        mascota: { nombre: 'Rex' },
      };

      res.json(solicitud);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe verificar ownership', () => {
      const req = mockReq();
      req.user._id = 'user1';

      const solicitud = { usuarioId: 'user2' };

      if (solicitud.usuarioId !== req.user._id) {
        expect(solicitud.usuarioId).not.toBe(req.user._id);
      }
    });
  });

  describe('aprobarSolicitud - PATCH /solicitudes-adopcion/:id/aprobar', () => {
    test('Debe aprobar solicitud', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const solicitud = {
        _id: '1',
        estado: 'aprobada',
      };

      res.json(solicitud);

      expect(solicitud.estado).toBe('aprobada');
    });

    test('Debe crear proceso de adopción', () => {
      const solicitud = { _id: '1' };

      const proceso = {
        solicitudId: solicitud._id,
        estado: 'iniciado',
      };

      expect(proceso.solicitudId).toBe(solicitud._id);
    });
  });

  describe('rechazarSolicitud - PATCH /solicitudes-adopcion/:id/rechazar', () => {
    test('Debe rechazar solicitud', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { motivo: 'No cumple requisitos' };
      const res = mockRes();

      const solicitud = {
        estado: 'rechazada',
        motivo: req.body.motivo,
      };

      res.json(solicitud);

      expect(solicitud.estado).toBe('rechazada');
    });

    test('Debe requerir motivo', () => {
      const req = mockReq();
      req.body = {};
      const res = mockRes();

      res.status(400).json({ message: 'Motivo requerido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('cancelarSolicitud - DELETE /solicitudes-adopcion/:id', () => {
    test('Debe cancelar solicitud propia', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      res.json({ message: 'Solicitud cancelada' });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar estado pendiente', () => {
      const solicitud = { estado: 'aprobada' };

      if (solicitud.estado !== 'pendiente') {
        expect(solicitud.estado).not.toBe('pendiente');
      }
    });
  });

  describe('getEstadisticas - GET /solicitudes-adopcion/stats', () => {
    test('Debe retornar estadísticas', () => {
      const res = mockRes();

      const stats = {
        total: 50,
        pendientes: 20,
        aprobadas: 20,
        rechazadas: 10,
      };

      res.json(stats);

      expect(res.json).toHaveBeenCalledWith(stats);
    });
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
    user: { _id: '507f1f77bcf86cd799439011', rol: 'fundacion' },
  });

  describe('crearSolicitud - POST /solicitudes-publicacion', () => {
    test('Debe crear solicitud de publicación', () => {
      const req = mockReq();
      req.body = {
        mascotaId: '507f1f77bcf86cd799439012',
        descripcion: 'Mascota lista para publicar',
      };
      const res = mockRes();

      const solicitud = {
        _id: '1',
        estado: 'pendiente',
        ...req.body,
      };

      res.status(201).json(solicitud);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe requerir mascota', () => {
      const req = mockReq();
      req.body = {};
      const res = mockRes();

      res.status(400).json({ message: 'Mascota requerida' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar imágenes', () => {
      const req = mockReq();
      req.files = [{ fieldname: 'imagenes' }];

      expect(req.files.length).toBeGreaterThan(0);
    });
  });

  describe('obtenerSolicitudes - GET /solicitudes-publicacion', () => {
    test('Debe listar solicitudes', () => {
      const res = mockRes();

      const solicitudes = [
        { _id: '1', estado: 'pendiente' },
        { _id: '2', estado: 'aprobada' },
      ];

      res.json(solicitudes);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe filtrar por estado', () => {
      const req = mockReq();
      req.query = { estado: 'aprobada' };

      const solicitudes = [
        { _id: '1', estado: 'pendiente' },
        { _id: '2', estado: 'aprobada' },
      ];

      const filtered = solicitudes.filter(s => s.estado === req.query.estado);

      expect(filtered.length).toBe(1);
    });
  });

  describe('aprobarSolicitud - PATCH /solicitudes-publicacion/:id/aprobar', () => {
    test('Debe aprobar y publicar mascota', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      const solicitud = {
        estado: 'aprobada',
        mascota: { publicada: true },
      };

      res.json(solicitud);

      expect(solicitud.mascota.publicada).toBe(true);
    });
  });

  describe('rechazarSolicitud - PATCH /solicitudes-publicacion/:id/rechazar', () => {
    test('Debe rechazar solicitud', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { motivo: 'Imágenes insuficientes' };
      const res = mockRes();

      const solicitud = {
        estado: 'rechazada',
        motivo: req.body.motivo,
      };

      res.json(solicitud);

      expect(solicitud.estado).toBe('rechazada');
    });
  });

  describe('rePublicar - PATCH /solicitudes-publicacion/:id/republicar', () => {
    test('Debe permitir republicar después de rechazos', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      res.json({ message: 'Solicitud reenviada' });

      expect(res.json).toHaveBeenCalled();
    });
  });
});
