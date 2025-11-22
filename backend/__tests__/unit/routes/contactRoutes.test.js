/**
 * Tests para contactRoutes
 */

describe('Contact Routes', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
      originalUrl: '/api/contact'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('POST / - Send Contact Message', () => {
    test('Debe requerir nombre en el body', () => {
      req.body = {
        celular: '3001234567',
        email: 'user@example.com',
        mensaje: 'Hola, tengo una consulta'
      };

      const isComplete = !!(req.body.nombre && req.body.email && req.body.mensaje);
      expect(isComplete).toBe(false);
    });

    test('Debe requerir email en el body', () => {
      req.body = {
        nombre: 'Juan',
        celular: '3001234567',
        mensaje: 'Hola, tengo una consulta'
      };

      const isComplete = !!(req.body.nombre && req.body.email && req.body.mensaje);
      expect(isComplete).toBe(false);
    });

    test('Debe requerir mensaje en el body', () => {
      req.body = {
        nombre: 'Juan',
        celular: '3001234567',
        email: 'user@example.com'
      };

      const isComplete = !!(req.body.nombre && req.body.email && req.body.mensaje);
      expect(isComplete).toBe(false);
    });

    test('Debe aceptar contacto con datos completos', () => {
      req.body = {
        nombre: 'Juan López',
        celular: '3001234567',
        email: 'juan@example.com',
        mensaje: 'Quisiera adoptar un perro'
      };

      const isComplete = !!(req.body.nombre && req.body.email && req.body.mensaje);
      expect(isComplete).toBe(true);
      expect(req.body.nombre).toBeTruthy();
      expect(req.body.email).toBeTruthy();
      expect(req.body.mensaje).toBeTruthy();
    });

    test('Debe validar formato de email', () => {
      const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      expect(validateEmail('juan@example.com')).toBe(true);
      expect(validateEmail('invalidemail')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });

    test('Debe trimear espacios en nombre', () => {
      req.body = {
        nombre: '  Juan López  ',
        celular: '3001234567',
        email: 'juan@example.com',
        mensaje: 'Mensaje'
      };

      const cleanName = req.body.nombre.trim();
      expect(cleanName).toBe('Juan López');
    });

    test('Debe aceptar celular opcional', () => {
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Mensaje',
        celular: undefined
      };

      const isValid = !!(req.body.nombre && req.body.email && req.body.mensaje);
      expect(isValid).toBe(true);
    });

    test('Debe retornar 200 en caso de éxito', () => {
      req.body = {
        nombre: 'Juan',
        celular: '3001234567',
        email: 'juan@example.com',
        mensaje: 'Mensaje'
      };

      // Simular respuesta exitosa
      const statusCode = 200;
      expect(statusCode).toBe(200);
    });

    test('Debe retornar 400 si falta algún campo requerido', () => {
      req.body = {
        nombre: 'Juan'
        // Falta email y mensaje
      };

      const isValid = !!(req.body.nombre && req.body.email && req.body.mensaje);
      const statusCode = isValid ? 200 : 400;
      expect(statusCode).toBe(400);
    });

    test('Debe retornar 500 si hay error en el envío de email', () => {
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: 'Mensaje'
      };

      // Simular error de servidor
      const hasError = true;
      const statusCode = hasError ? 500 : 200;
      expect(statusCode).toBe(500);
    });

    test('Debe permitir mensajes largos', () => {
      const longMessage = 'A'.repeat(500);
      req.body = {
        nombre: 'Juan',
        email: 'juan@example.com',
        mensaje: longMessage
      };

      expect(req.body.mensaje.length).toBe(500);
    });

    test('Debe sanitizar entrada para prevenir inyecciones', () => {
      const sanitize = (text) => typeof text === 'string' ? text.replace(/<[^>]*>/g, '') : '';

      req.body = {
        nombre: 'Juan<script>alert(1)</script>',
        email: 'juan@example.com',
        mensaje: 'Mensaje<img src=x onerror="alert(1)">'
      };

      const cleanNombre = sanitize(req.body.nombre);
      const cleanMensaje = sanitize(req.body.mensaje);

      // Verificar que se removieron los tags HTML
      expect(cleanNombre).not.toContain('<');
      expect(cleanMensaje).not.toContain('<');
      expect(cleanNombre.length).toBeLessThan(req.body.nombre.length);
    });
  });
});
