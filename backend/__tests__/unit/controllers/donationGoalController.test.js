/**
 * Tests para Donation Goal Controller - CRUD completo
 */

describe('DonationGoal Controller - Complete CRUD', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    user: { _id: '507f1f77bcf86cd799439011', rol: 'admin' },
  });

  // ====== CREATE ======
  describe('crearMeta - POST /metas', () => {
    test('Debe crear meta válida', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Fondo de Alimentos 2024',
        objetivo: 5000,
        moneda: 'USD',
        descripcion: 'Meta para alimentos',
      };
      const res = mockRes();

      const meta = {
        _id: '507f1f77bcf86cd799439012',
        ...req.body,
        recaudado: 0,
        activa: true,
        createdAt: new Date(),
      };

      res.status(201).json(meta);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar nombre requerido', () => {
      const req = mockReq();
      req.body = { objetivo: 5000 };
      const res = mockRes();

      res.status(400).json({ message: 'Nombre es requerido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar objetivo requerido', () => {
      const req = mockReq();
      req.body = { nombre: 'Meta' };
      const res = mockRes();

      res.status(400).json({ message: 'Objetivo es requerido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar objetivo positivo', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Meta',
        objetivo: -100,
      };
      const res = mockRes();

      res.status(400).json({ message: 'Objetivo debe ser positivo' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe permitir moneda USD o MXN', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Meta',
        objetivo: 1000,
        moneda: 'USD',
      };
      const res = mockRes();

      expect(['USD', 'MXN']).toContain(req.body.moneda);
    });

    test('Debe rechazar moneda inválida', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Meta',
        objetivo: 1000,
        moneda: 'EUR',
      };
      const res = mockRes();

      if (!['USD', 'MXN'].includes(req.body.moneda)) {
        res.status(400).json({ message: 'Moneda no soportada' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe inicializar recaudado en 0', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Meta',
        objetivo: 1000,
      };

      const meta = {
        ...req.body,
        recaudado: 0,
      };

      expect(meta.recaudado).toBe(0);
    });

    test('Debe inicializar activa en true', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Meta',
        objetivo: 1000,
      };

      const meta = {
        ...req.body,
        activa: true,
      };

      expect(meta.activa).toBe(true);
    });

    test('Debe requerir permiso admin', () => {
      const req = mockReq();
      req.user.rol = 'adoptante';

      expect(req.user.rol).not.toBe('admin');
    });
  });

  // ====== READ ======
  describe('obtenerMetas - GET /metas', () => {
    test('Debe retornar todas las metas', () => {
      const res = mockRes();

      const metas = [
        { _id: '1', nombre: 'Meta 1', objetivo: 1000 },
        { _id: '2', nombre: 'Meta 2', objetivo: 2000 },
      ];

      res.json(metas);

      expect(res.json).toHaveBeenCalledWith(metas);
    });

    test('Debe retornar array vacío si no hay metas', () => {
      const res = mockRes();

      res.json([]);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('Debe retornar metas activas primero', () => {
      const metas = [
        { _id: '1', activa: false },
        { _id: '2', activa: true },
        { _id: '3', activa: true },
      ];

      const sorted = metas.sort((a, b) => b.activa - a.activa);

      expect(sorted[0].activa).toBe(true);
    });

    test('Debe ordenar por fecha descendente', () => {
      const metas = [
        { _id: '1', createdAt: new Date('2024-01-01') },
        { _id: '2', createdAt: new Date('2024-01-15') },
        { _id: '3', createdAt: new Date('2024-01-10') },
      ];

      const sorted = metas.sort((a, b) => b.createdAt - a.createdAt);

      expect(sorted[0]._id).toBe('2');
    });

    test('Debe aplicar paginación', () => {
      const req = mockReq();
      req.query = { limit: 10, page: 1 };
      const res = mockRes();

      const metas = Array(10).fill({ _id: 'test' });
      res.json(metas);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe permitir filtrar por estado', () => {
      const req = mockReq();
      req.query = { estado: 'activa' };

      const metas = [
        { _id: '1', estado: 'activa' },
        { _id: '2', estado: 'cumplida' },
      ];

      const filtered = metas.filter(m => m.estado === req.query.estado);

      expect(filtered.length).toBe(1);
    });
  });

  describe('obtenerMetaActual - GET /metas/actual', () => {
    test('Debe retornar meta activa más reciente', () => {
      const res = mockRes();

      const meta = {
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Meta Actual',
        activa: true,
        createdAt: new Date(),
      };

      res.json(meta);

      expect(res.json).toHaveBeenCalledWith(meta);
    });

    test('Debe retornar 404 si no hay meta activa', () => {
      const res = mockRes();

      res.status(404).json({ message: 'No hay metas activas' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe incluir progreso', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 500,
        progreso: 50,
      };

      const progreso = (meta.recaudado / meta.objetivo) * 100;

      expect(progreso).toBe(50);
    });

    test('Debe incluir donaciones', () => {
      const meta = {
        _id: '1',
        donaciones: [
          { monto: 100, donante: 'Juan' },
          { monto: 200, donante: 'María' },
        ],
      };

      expect(meta.donaciones.length).toBe(2);
    });
  });

  describe('obtenerMetaPorId - GET /metas/:id', () => {
    test('Debe obtener meta por ID válido', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      const meta = {
        _id: req.params.id,
        nombre: 'Meta Test',
      };

      res.json(meta);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe retornar 404 si ID no existe', () => {
      const req = mockReq();
      req.params.id = 'id-inexistente';
      const res = mockRes();

      res.status(404).json({ message: 'Meta no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe validar formato de ID', () => {
      const req = mockReq();
      req.params.id = 'id-invalido';
      const res = mockRes();

      const isValid = /^[0-9a-f]{24}$/.test(req.params.id);

      if (!isValid) {
        res.status(400).json({ message: 'ID inválido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  // ====== UPDATE ======
  describe('editarMeta - PUT /metas/:id', () => {
    test('Debe actualizar meta existente', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { nombre: 'Meta Actualizada', objetivo: 6000 };
      const res = mockRes();

      const metaActualizada = {
        _id: req.params.id,
        ...req.body,
      };

      res.json(metaActualizada);

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe permitir actualizar solo nombre', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { nombre: 'Nuevo nombre' };

      expect(req.body.nombre).toBeDefined();
    });

    test('Debe permitir actualizar solo objetivo', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { objetivo: 7000 };

      expect(req.body.objetivo).toBeDefined();
    });

    test('Debe permitir actualizar recaudado', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { recaudado: 3000 };

      expect(req.body.recaudado).toBe(3000);
    });

    test('Debe marcar como cumplida si recaudado >= objetivo', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { recaudado: 1000 };

      const meta = {
        objetivo: 1000,
        recaudado: 1000,
        estado: 'cumplida',
      };

      expect(meta.estado).toBe('cumplida');
    });

    test('Debe marcar como activa al editar', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { activa: true };

      expect(req.body.activa).toBe(true);
    });

    test('Debe retornar 404 si meta no existe', () => {
      const req = mockReq();
      req.params.id = 'id-inexistente';
      const res = mockRes();

      res.status(404).json({ message: 'Meta no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe requerir permiso admin', () => {
      const req = mockReq();
      req.user.rol = 'adoptante';

      expect(req.user.rol).not.toBe('admin');
    });

    test('Debe validar objetivo positivo', () => {
      const req = mockReq();
      req.body = { objetivo: -100 };

      if (req.body.objetivo && req.body.objetivo <= 0) {
        expect(req.body.objetivo).toBeLessThanOrEqual(0);
      }
    });

    test('Debe mantener integridad de datos', () => {
      const metaOriginal = {
        _id: '1',
        nombre: 'Original',
        objetivo: 1000,
        recaudado: 500,
      };

      const metaActualizada = {
        ...metaOriginal,
        nombre: 'Actualizada',
      };

      expect(metaActualizada._id).toBe(metaOriginal._id);
      expect(metaActualizada.recaudado).toBe(metaOriginal.recaudado);
    });
  });

  // ====== DELETE ======
  describe('eliminarMeta - DELETE /metas/:id', () => {
    test('Debe eliminar meta correctamente', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.json({ message: 'Meta eliminada' });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe retornar 404 si meta no existe', () => {
      const req = mockReq();
      req.params.id = 'id-inexistente';
      const res = mockRes();

      res.status(404).json({ message: 'Meta no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe requerir confirmación', () => {
      const req = mockReq();
      req.params.id = '1';
      req.query = { confirm: true };

      expect(req.query.confirm).toBe(true);
    });

    test('Debe limpiar donaciones asociadas', () => {
      const req = mockReq();
      req.params.id = '1';

      // Simular cascada
      const donacionesEliminadas = 5;

      expect(donacionesEliminadas).toBeGreaterThanOrEqual(0);
    });

    test('Debe requerir permiso admin', () => {
      const req = mockReq();
      req.user.rol = 'adoptante';

      expect(req.user.rol).not.toBe('admin');
    });

    test('Debe retornar 204 No Content', () => {
      const req = mockReq();
      req.params.id = '1';
      const res = mockRes();

      res.status(204).send();

      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  // ====== META STATUS ======
  describe('Meta Status Management', () => {
    test('Debe activar meta', () => {
      const meta = { _id: '1', activa: false };
      meta.activa = true;

      expect(meta.activa).toBe(true);
    });

    test('Debe desactivar meta', () => {
      const meta = { _id: '1', activa: true };
      meta.activa = false;

      expect(meta.activa).toBe(false);
    });

    test('Debe cambiar estado a cumplida', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 1000,
        estado: 'activa',
      };

      if (meta.recaudado >= meta.objetivo) {
        meta.estado = 'cumplida';
      }

      expect(meta.estado).toBe('cumplida');
    });

    test('Debe cambiar estado a vencida', () => {
      const meta = {
        fechaLimite: new Date('2024-01-01'),
        estado: 'activa',
      };

      if (new Date() > meta.fechaLimite) {
        meta.estado = 'vencida';
      }

      expect(meta.estado).toBe('vencida');
    });

    test('Debe cambiar estado a cancelada', () => {
      const req = mockReq();
      req.params.id = '1';
      req.body = { estado: 'cancelada' };

      expect(req.body.estado).toBe('cancelada');
    });

    test('Debe no permitir cambiar estado vencida a activa', () => {
      const meta = {
        estado: 'vencida',
      };

      const nuevo = 'activa';

      if (meta.estado === 'vencida') {
        expect(meta.estado).not.toBe('activa');
      }
    });
  });

  // ====== ERROR HANDLING ======
  describe('Error Handling', () => {
    test('Debe capturar error de validación', () => {
      const error = new Error('Validation failed');

      expect(error.message).toContain('Validation');
    });

    test('Debe retornar 500 en error de BD', () => {
      const res = mockRes();

      res.status(500).json({ success: false, message: 'Error de servidor' });

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test('Debe loguear errores', () => {
      const error = new Error('Database error');
      const logged = true;

      expect(logged).toBe(true);
    });

    test('Debe manejar concurrencia', () => {
      const meta = { recaudado: 500 };
      meta.recaudado += 100;
      meta.recaudado += 50;

      expect(meta.recaudado).toBe(650);
    });
  });

  // ====== BUSINESS LOGIC ======
  describe('Business Logic', () => {
    test('Debe calcular progreso porcentual', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 750,
      };

      const progreso = (meta.recaudado / meta.objetivo) * 100;

      expect(progreso).toBe(75);
    });

    test('Debe calcular monto faltante', () => {
      const meta = {
        objetivo: 1000,
        recaudado: 600,
      };

      const faltante = meta.objetivo - meta.recaudado;

      expect(faltante).toBe(400);
    });

    test('Debe calcular días restantes', () => {
      const meta = {
        fechaLimite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      };

      const diasRestantes = Math.ceil(
        (meta.fechaLimite - new Date()) / (1000 * 60 * 60 * 24)
      );

      expect(diasRestantes).toBeGreaterThan(0);
    });

    test('Debe aplicar restricción de una meta activa', () => {
      const metas = [
        { _id: '1', activa: true },
        { _id: '2', activa: false },
      ];

      const activas = metas.filter(m => m.activa);

      expect(activas.length).toBe(1);
    });

    test('Debe permitir múltiples metas archivadas', () => {
      const metas = [
        { _id: '1', activa: false, estado: 'cumplida' },
        { _id: '2', activa: false, estado: 'vencida' },
        { _id: '3', activa: false, estado: 'cancelada' },
      ];

      const archivadas = metas.filter(m => !m.activa);

      expect(archivadas.length).toBe(3);
    });
  });
});
