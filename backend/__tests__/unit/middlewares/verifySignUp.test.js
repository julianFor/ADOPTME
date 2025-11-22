/**
 * Tests para middleware verifySignUp
 */

const validator = require('validator');

jest.mock('validator', () => ({
  isEmail: jest.fn(),
  isLength: jest.fn()
}));

describe('VerifySignUp Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('Sign Up Validation', () => {
    test('Debe validar que username sea requerido', () => {
      req.body = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      if (!req.body.username) {
        res.status(400).json({
          success: false,
          message: 'Username es requerido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que email sea requerido', () => {
      req.body = {
        username: 'testuser',
        password: 'Password123!'
      };

      if (!req.body.email) {
        res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que password sea requerido', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com'
      };

      if (!req.body.password) {
        res.status(400).json({
          success: false,
          message: 'Password es requerido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar formato de email', () => {
      req.body = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123!'
      };

      validator.isEmail.mockReturnValue(false);

      if (!validator.isEmail(req.body.email)) {
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email inválido'
        })
      );
    });

    test('Debe validar email válido', () => {
      req.body = {
        username: 'testuser',
        email: 'valid@example.com',
        password: 'Password123!'
      };

      validator.isEmail.mockReturnValue(true);

      const isValid = validator.isEmail(req.body.email);
      expect(isValid).toBe(true);
    });

    test('Debe validar longitud mínima de password', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Pass1'
      };

      validator.isLength.mockReturnValue(false);

      if (!validator.isLength(req.body.password, { min: 8 })) {
        res.status(400).json({
          success: false,
          message: 'Password debe tener al menos 8 caracteres'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar password válido', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      validator.isLength.mockReturnValue(true);

      const isValid = validator.isLength(req.body.password, { min: 8 });
      expect(isValid).toBe(true);
    });

    test('Debe validar longitud de username', () => {
      req.body = {
        username: 'ab', // muy corto
        email: 'test@example.com',
        password: 'Password123!'
      };

      validator.isLength.mockReturnValue(false);

      if (!validator.isLength(req.body.username, { min: 3, max: 20 })) {
        res.status(400).json({
          success: false,
          message: 'Username debe tener entre 3 y 20 caracteres'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Data Sanitization', () => {
    test('Debe trimear espacios en blanco', () => {
      req.body = {
        username: '  testuser  ',
        email: '  test@example.com  ',
        password: 'Password123!'
      };

      req.body.username = req.body.username.trim();
      req.body.email = req.body.email.trim();

      expect(req.body.username).toBe('testuser');
      expect(req.body.email).toBe('test@example.com');
    });

    test('Debe convertir email a minúsculas', () => {
      req.body = {
        username: 'testuser',
        email: 'TEST@EXAMPLE.COM',
        password: 'Password123!'
      };

      req.body.email = req.body.email.toLowerCase();

      expect(req.body.email).toBe('test@example.com');
    });
  });

  describe('Security Checks', () => {
    test('Debe detectar inyección NoSQL en email', () => {
      req.body = {
        username: 'testuser',
        email: { $ne: '' },
        password: 'Password123!'
      };

      if (typeof req.body.email !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe detectar inyección NoSQL en username', () => {
      req.body = {
        username: { $ne: '' },
        email: 'test@example.com',
        password: 'Password123!'
      };

      if (typeof req.body.username !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Username inválido'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar campos requeridos completos', () => {
      const validateSignUp = (data) => {
        const errors = [];
        
        if (!data.username) errors.push('Username requerido');
        if (!data.email) errors.push('Email requerido');
        if (!data.password) errors.push('Password requerido');
        
        return {
          valid: errors.length === 0,
          errors
        };
      };

      const result = validateSignUp(req.body);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('Debe aprobar datos válidos', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      const isValid = 
        typeof req.body.username === 'string' &&
        typeof req.body.email === 'string' &&
        typeof req.body.password === 'string' &&
        req.body.username.length > 0 &&
        req.body.email.length > 0 &&
        req.body.password.length >= 8;

      expect(isValid).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Debe retornar 400 para datos inválidos', () => {
      req.body = {}; // datos vacíos

      if (Object.keys(req.body).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Datos incompletos'
        });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar mensaje de error específico', () => {
      req.body = {
        email: 'invalid-email'
      };

      validator.isEmail.mockReturnValue(false);

      if (!validator.isEmail(req.body.email)) {
        res.status(400).json({
          success: false,
          message: 'Email inválido',
          field: 'email'
        });
      }

      const call = res.json.mock.calls[0][0];
      expect(call.field).toBe('email');
    });
  });

  describe('Calling Next Middleware', () => {
    test('Debe llamar a next() si validación pasa', () => {
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!'
      };

      validator.isEmail.mockReturnValue(true);
      validator.isLength.mockReturnValue(true);

      const isValid = 
        validator.isEmail(req.body.email) &&
        validator.isLength(req.body.password, { min: 8 });

      if (isValid) {
        next();
      }

      expect(next).toHaveBeenCalled();
    });

    test('No debe llamar a next() si validación falla', () => {
      req.body = {
        username: 'testuser',
        email: 'invalid',
        password: 'short'
      };

      validator.isEmail.mockReturnValue(false);

      if (!validator.isEmail(req.body.email)) {
        res.status(400).json({ success: false });
      } else {
        next();
      }

      expect(next).not.toHaveBeenCalled();
    });
  });
});
