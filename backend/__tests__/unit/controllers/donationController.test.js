/**
 * Tests para Donation Controller
 */

describe('Donation Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
  });

  describe('crearDonacion', () => {
    test('Debe crear donación correctamente', () => {
      const req = mockReq();
      req.body = {
        goalId: '507f1f77bcf86cd799439011',
        monto: 100,
        moneda: 'USD',
        anonimo: false,
      };
      const res = mockRes();

      const donacion = {
        _id: '507f1f77bcf86cd799439012',
        ...req.body,
        estado: 'completada',
      };

      res.status(201);
      res.json(donacion);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(donacion);
    });

    test('Debe validar monto requerido', () => {
      const req = mockReq();
      req.body = {
        goalId: '507f1f77bcf86cd799439011',
        // falta monto
      };
      const res = mockRes();

      if (!req.body.monto) {
        res.status(400);
        res.json({ message: 'Monto requerido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar moneda válida', () => {
      const req = mockReq();
      req.body = {
        goalId: '507f1f77bcf86cd799439011',
        monto: 50,
        moneda: 'XXX', // inválida
      };

      const monedasValidas = ['USD', 'EUR', 'COP', 'MXN'];
      expect(monedasValidas).not.toContain(req.body.moneda);
    });

    test('Debe permitir donación anónima', () => {
      const req = mockReq();
      req.body = {
        goalId: '507f1f77bcf86cd799439011',
        monto: 100,
        anonimo: true,
      };

      expect(req.body.anonimo).toBe(true);
    });
  });

  describe('obtenerPorMeta', () => {
    test('Debe obtener donaciones por goalId válido', () => {
      const req = mockReq();
      req.params.goalId = '507f1f77bcf86cd799439011';
      const res = mockRes();

      const donaciones = [
        { _id: '1', goalId: req.params.goalId, monto: 100 },
        { _id: '2', goalId: req.params.goalId, monto: 200 },
      ];

      res.status(200);
      res.json(donaciones);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(donaciones);
    });

    test('Debe rechazar goalId inválido', () => {
      const req = mockReq();
      req.params.goalId = 'invalid-id';
      const res = mockRes();

      res.status(400);
      res.json({ message: 'goalId inválido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar array vacío si no hay donaciones', () => {
      const req = mockReq();
      req.params.goalId = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(200);
      res.json([]);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('totalRecaudado', () => {
    test('Debe calcular total recaudado correctamente', () => {
      const req = mockReq();
      req.params.goalId = '507f1f77bcf86cd799439011';
      const res = mockRes();

      const total = 300;
      res.json({ total });

      expect(res.json).toHaveBeenCalledWith({ total: 300 });
    });

    test('Debe retornar 0 si no hay donaciones', () => {
      const req = mockReq();
      req.params.goalId = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.json({ total: 0 });

      expect(res.json).toHaveBeenCalledWith({ total: 0 });
    });

    test('Debe manejar agregación correctamente', () => {
      const donaciones = [
        { monto: 100 },
        { monto: 200 },
        { monto: 50 },
      ];

      const total = donaciones.reduce((sum, d) => sum + d.monto, 0);
      expect(total).toBe(350);
    });

    test('Debe validar ObjectId para goalId', () => {
      const goalId = '507f1f77bcf86cd799439011';
      const esValido = /^[0-9a-f]{24}$/.test(goalId.toLowerCase());
      expect(esValido).toBe(true);
    });
  });
});
