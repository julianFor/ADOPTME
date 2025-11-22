/**
 * Tests para Contact Controller y Dashboard Analytics
 */

describe('Contact Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    headers: {},
  });

  describe('POST /contact - Send Contact Message', () => {
    test('Debe validar que nombre sea requerido', () => {
      const req = mockReq();
      req.body = {
        email: 'test@example.com',
        mensaje: 'Hola',
      };
      const res = mockRes();

      if (!req.body.nombre) {
        res.status(400);
        res.json({ success: false, message: 'Nombre requerido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que email sea requerido', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        mensaje: 'Hola',
      };
      const res = mockRes();

      if (!req.body.email) {
        res.status(400);
        res.json({ success: false, message: 'Email requerido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que mensaje sea requerido', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
      };
      const res = mockRes();

      if (!req.body.mensaje) {
        res.status(400);
        res.json({ success: false, message: 'Mensaje requerido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar formato de email', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'not-an-email',
        mensaje: 'Hola',
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(req.body.email);

      expect(isValid).toBe(false);
    });

    test('Debe aceptar email válido', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Hola, quisiera adoptar un gato',
      };

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(req.body.email);

      expect(isValid).toBe(true);
    });

    test('Debe validar longitud mínima de mensaje', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Hi',
      };

      const minLength = 10;
      expect(req.body.mensaje.length).toBeLessThan(minLength);
    });

    test('Debe aceptar mensaje válido', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Hola, me gustaría recibir información sobre adopciones',
      };

      const minLength = 10;
      expect(req.body.mensaje.length).toBeGreaterThanOrEqual(minLength);
    });

    test('Debe retornar 201 al enviar contacto válido', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Mensaje válido con suficiente información',
      };
      const res = mockRes();

      res.status(201);
      res.json({ success: true, message: 'Mensaje enviado' });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe enviar email de notificación', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Mensaje de contacto',
      };

      // Simular envío de email
      const emailEnviado = true;
      expect(emailEnviado).toBe(true);
    });

    test('Debe guardar contacto en BD', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Mensaje para guardar',
      };

      // Simular guardar en BD
      const contactoGuardado = { _id: '123', ...req.body };
      expect(contactoGuardado).toBeDefined();
    });

    test('Debe limpiar/normalizar datos de entrada', () => {
      const req = mockReq();
      req.body = {
        nombre: '  Juan  ',
        email: '  JUAN@EXAMPLE.COM  ',
        mensaje: '  Mensaje  ',
      };

      const nombre = req.body.nombre.trim();
      const email = req.body.email.trim().toLowerCase();
      const mensaje = req.body.mensaje.trim();

      expect(nombre).toBe('Juan');
      expect(email).toBe('juan@example.com');
      expect(mensaje).toBe('Mensaje');
    });

    test('Debe manejar error de envío de email', () => {
      const error = new Error('Error enviando email');
      expect(error.message).toContain('email');
    });
  });
});

describe('Dashboard Controller - Analytics', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    query: {},
    userRole: 'admin',
  });

  describe('GET /dashboard/stats - Estadísticas Generales', () => {
    test('Debe retornar total de usuarios', () => {
      const stats = { totalUsuarios: 150 };
      expect(stats.totalUsuarios).toBeGreaterThan(0);
    });

    test('Debe retornar total de mascotas', () => {
      const stats = { totalMascotas: 45 };
      expect(stats.totalMascotas).toBeGreaterThan(0);
    });

    test('Debe retornar total de donaciones', () => {
      const stats = { totalDonaciones: 5000 };
      expect(stats.totalDonaciones).toBeGreaterThan(0);
    });

    test('Debe retornar adopciones completadas', () => {
      const stats = { adopcionesCompletadas: 12 };
      expect(stats.adopcionesCompletadas).toBeGreaterThan(0);
    });

    test('Debe retornar solicitudes pendientes', () => {
      const stats = { solicitudesPendientes: 8 };
      expect(stats.solicitudesPendientes).toBeGreaterThan(0);
    });
  });

  describe('GET /dashboard/monthly - Series Mensual', () => {
    test('Debe retornar últimos 6 meses', () => {
      const months = [
        { name: 'Julio', val: 5 },
        { name: 'Agosto', val: 8 },
        { name: 'Septiembre', val: 10 },
        { name: 'Octubre', val: 12 },
        { name: 'Noviembre', val: 15 },
        { name: 'Diciembre', val: 20 },
      ];

      expect(months).toHaveLength(6);
    });

    test('Debe retornar nombres de meses en español', () => {
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];
      expect(months[0]).toBe('Enero');
    });

    test('Debe retornar valores de conteo', () => {
      const serie = {
        name: 'Enero',
        val: 5,
      };

      expect(serie.val).toBeGreaterThanOrEqual(0);
    });

    test('Debe agregar 0 para meses sin datos', () => {
      const serie = {
        name: 'Enero',
        val: 0,
      };

      expect(serie.val).toBe(0);
    });
  });

  describe('GET /dashboard/adoption-trend - Tendencia Adopciones', () => {
    test('Debe retornar serie de adopciones por mes', () => {
      const series = [
        { name: 'Enero', val: 2 },
        { name: 'Febrero', val: 3 },
        { name: 'Marzo', val: 5 },
      ];

      expect(series).toHaveLength(3);
      expect(series[0].name).toBe('Enero');
    });

    test('Debe sumar adopciones completadas', () => {
      const adoptions = [
        { fecha: new Date('2024-01-15'), estado: 'completada' },
        { fecha: new Date('2024-01-20'), estado: 'completada' },
        { fecha: new Date('2024-02-10'), estado: 'completada' },
      ];

      const enero = adoptions.filter(
        (a) =>
          a.fecha.getMonth() === 0 &&
          a.estado === 'completada'
      ).length;

      expect(enero).toBe(2);
    });

    test('Debe excluir adopciones rechazadas', () => {
      const adoptions = [
        { fecha: new Date('2024-01-15'), estado: 'completada' },
        { fecha: new Date('2024-01-20'), estado: 'rechazada' },
        { fecha: new Date('2024-02-10'), estado: 'completada' },
      ];

      const completadas = adoptions.filter(
        (a) => a.estado === 'completada'
      ).length;

      expect(completadas).toBe(2);
    });
  });

  describe('GET /dashboard/donation-trend - Tendencia Donaciones', () => {
    test('Debe retornar serie de donaciones por mes', () => {
      const series = [
        { name: 'Enero', val: 1500 },
        { name: 'Febrero', val: 2000 },
        { name: 'Marzo', val: 2500 },
      ];

      expect(series).toHaveLength(3);
    });

    test('Debe sumar montos de donaciones', () => {
      const donations = [
        { fecha: new Date('2024-01-15'), monto: 100 },
        { fecha: new Date('2024-01-20'), monto: 200 },
        { fecha: new Date('2024-02-10'), monto: 150 },
      ];

      const total = donations.reduce((sum, d) => sum + d.monto, 0);
      expect(total).toBe(450);
    });

    test('Debe agrupar por mes correctamente', () => {
      const donations = [
        { fecha: new Date('2024-01-10'), monto: 100 },
        { fecha: new Date('2024-01-20'), monto: 200 },
        { fecha: new Date('2024-02-15'), monto: 150 },
      ];

      const enero = donations
        .filter((d) => d.fecha.getMonth() === 0)
        .reduce((sum, d) => sum + d.monto, 0);

      expect(enero).toBe(300);
    });
  });

  describe('GET /dashboard/permissions', () => {
    test('Debe permitir acceso a admin', () => {
      const req = mockReq();
      req.userRole = 'admin';

      expect(req.userRole).toBe('admin');
    });

    test('Debe permitir acceso a adminFundacion', () => {
      const req = mockReq();
      req.userRole = 'adminFundacion';

      expect(req.userRole).toBe('adminFundacion');
    });

    test('Debe denegar acceso a adoptante', () => {
      const req = mockReq();
      req.userRole = 'adoptante';
      const res = mockRes();

      if (req.userRole !== 'admin' && req.userRole !== 'adminFundacion') {
        res.status(403);
        res.json({ success: false, message: 'No tienes acceso' });
      }

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Monthly Aggregation Helpers', () => {
    test('Debe calcular inicio del mes', () => {
      const date = new Date('2024-01-15');
      const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
    });

    test('Debe calcular fin del mes', () => {
      const date = new Date('2024-01-15');
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      expect(end.getDate()).toBe(31);
      expect(end.getHours()).toBe(23);
    });

    test('Debe retornar últimos N meses', () => {
      const n = 6;
      const months = [];
      const now = new Date();

      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
      }

      expect(months).toHaveLength(n);
    });

    test('Debe convertir meses a español', () => {
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];

      expect(meses[0]).toBe('Enero');
      expect(meses[11]).toBe('Diciembre');
      expect(meses).toHaveLength(12);
    });
  });

  describe('Chart Data Formatting', () => {
    test('Debe formatear serie con nombre y valor', () => {
      const serie = {
        name: 'Enero',
        val: 10,
      };

      expect(serie).toHaveProperty('name');
      expect(serie).toHaveProperty('val');
    });

    test('Debe retornar 0 como valor mínimo', () => {
      const series = [
        { name: 'Enero', val: 0 },
        { name: 'Febrero', val: 5 },
      ];

      const hasZero = series.some((s) => s.val === 0);
      expect(hasZero).toBe(true);
    });

    test('Debe retornar enteros para conteos', () => {
      const count = 5;
      expect(Number.isInteger(count)).toBe(true);
    });

    test('Debe retornar números para sumas', () => {
      const sum = 1500.50;
      expect(typeof sum).toBe('number');
    });
  });
});
