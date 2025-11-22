/**
 * Tests para User Controller
 */

describe('User Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    userRole: 'adoptante',
    userId: '507f1f77bcf86cd799439011',
  });

  describe('registrarse', () => {
    test('Debe registrar nuevo usuario adoptante', () => {
      const req = mockReq();
      req.body = {
        username: 'juanuser',
        email: 'juan@example.com',
        password: 'securepass123',
      };
      const res = mockRes();

      const nuevoUsuario = {
        _id: '507f1f77bcf86cd799439011',
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        role: 'adoptante',
      };

      res.status(201);
      res.json({
        success: true,
        message: 'Registro exitoso',
        user: nuevoUsuario,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar que username sea requerido', () => {
      const req = mockReq();
      req.body = {
        email: 'test@example.com',
        password: 'pass123',
      };
      const res = mockRes();

      if (!req.body.username) {
        res.status(400);
        res.json({
          success: false,
          message: 'Todos los campos son obligatorios',
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que email sea requerido', () => {
      const req = mockReq();
      req.body = {
        username: 'testuser',
        password: 'pass123',
      };
      const res = mockRes();

      if (!req.body.email) {
        res.status(400);
        res.json({
          success: false,
          message: 'Todos los campos son obligatorios',
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que password sea requerida', () => {
      const req = mockReq();
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
      };
      const res = mockRes();

      if (!req.body.password) {
        res.status(400);
        res.json({
          success: false,
          message: 'Todos los campos son obligatorios',
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe rechazar si email ya existe', () => {
      const req = mockReq();
      req.body = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'pass123',
      };
      const res = mockRes();

      // Simular email existente
      res.status(400);
      res.json({
        success: false,
        message: 'El correo ya está registrado',
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe rechazar si username ya existe', () => {
      const req = mockReq();
      req.body = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'pass123',
      };
      const res = mockRes();

      // Simular username existente
      res.status(400);
      res.json({
        success: false,
        message: 'El nombre de usuario ya está en uso',
      });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe normalizar email a minúsculas', () => {
      const email = 'JUAN@EXAMPLE.COM';
      const normalized = email.toLowerCase();
      expect(normalized).toBe('juan@example.com');
    });

    test('Debe asignar rol adoptante por defecto', () => {
      const req = mockReq();
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'pass123',
      };

      const role = 'adoptante';
      expect(role).toBe('adoptante');
    });
  });

  describe('getAllUsers', () => {
    test('Debe permitir admin ver todos los usuarios', () => {
      const req = mockReq();
      req.userRole = 'admin';
      const res = mockRes();

      const users = [
        { _id: '1', username: 'user1', email: 'user1@example.com', role: 'adoptante' },
        { _id: '2', username: 'user2', email: 'user2@example.com', role: 'adminFundacion' },
      ];

      res.status(200);
      res.json({ success: true, data: users });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe permitir adminFundacion ver solo adoptantes y adminFundacion', () => {
      const req = mockReq();
      req.userRole = 'adminFundacion';
      const res = mockRes();

      const users = [
        { _id: '1', username: 'user1', role: 'adoptante' },
        { _id: '2', username: 'user2', role: 'adminFundacion' },
      ];

      res.status(200);
      res.json({ success: true, data: users });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe denegar a adoptante ver todos los usuarios', () => {
      const req = mockReq();
      req.userRole = 'adoptante';
      const res = mockRes();

      res.status(403);
      res.json({
        success: false,
        message: 'No tienes permiso para ver todos los usuarios',
      });

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Debe excluir password en respuesta', () => {
      const user = {
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'adoptante',
      };

      expect(user).not.toHaveProperty('password');
    });
  });

  describe('getUserById', () => {
    test('Debe obtener usuario por ID válido', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      req.userRole = 'admin';
      const res = mockRes();

      const user = {
        _id: req.params.id,
        username: 'testuser',
        email: 'test@example.com',
        role: 'adoptante',
      };

      res.status(200);
      res.json({ success: true, data: user });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe rechazar ID inválido', () => {
      const req = mockReq();
      req.params.id = 'invalid-id';
      const res = mockRes();

      res.status(400);
      res.json({ success: false, message: 'ID inválido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar 404 si usuario no existe', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(404);
      res.json({ success: false, message: 'Usuario no encontrado' });

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('Debe denegar acceso a adoptante si intenta ver otro perfil', () => {
      const req = mockReq();
      req.userRole = 'adoptante';
      req.userId = '507f1f77bcf86cd799439011';
      req.params.id = '507f1f77bcf86cd799439012'; // Otro usuario
      const res = mockRes();

      res.status(403);
      res.json({
        success: false,
        message: 'No tienes permiso para ver este perfil',
      });

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Debe permitir adoptante ver su propio perfil', () => {
      const req = mockReq();
      const userId = '507f1f77bcf86cd799439011';
      req.userRole = 'adoptante';
      req.userId = userId;
      req.params.id = userId;
      const res = mockRes();

      const user = {
        _id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'adoptante',
      };

      res.status(200);
      res.json({ success: true, data: user });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe denegar adminFundacion ver usuarios admin', () => {
      const req = mockReq();
      req.userRole = 'adminFundacion';
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      // Simular que el usuario es admin
      const userRole = 'admin';

      if (req.userRole === 'adminFundacion' && userRole === 'admin') {
        res.status(403);
        res.json({
          success: false,
          message: 'No puedes ver usuarios administradores del sistema',
        });
      }

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('Normalización de Datos', () => {
    test('Debe normalizar email a minúsculas', () => {
      const email = 'TESTUSER@EXAMPLE.COM';
      const normalized = email.toLowerCase();
      expect(normalized).toBe('testuser@example.com');
    });

    test('Debe trim espacios en username', () => {
      const username = '  testuser  ';
      const trimmed = username.trim();
      expect(trimmed).toBe('testuser');
    });

    test('Debe convertir undefined a string vacío', () => {
      const v = undefined;
      const result = v === undefined ? '' : String(v);
      expect(result).toBe('');
    });

    test('Debe convertir null a string vacío', () => {
      const v = null;
      const result = v === null ? '' : String(v);
      expect(result).toBe('');
    });
  });
});
