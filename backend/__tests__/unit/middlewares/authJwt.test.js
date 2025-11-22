/**
 * Tests para middleware authJwt
 */

const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../../middlewares/authJwt');
const config = require('../../../config/auth.config');

jest.mock('jsonwebtoken');
jest.mock('../../../config/auth.config', () => ({
  secret: 'test_secret_key'
}));

describe('authJwt Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      originalUrl: '/api/test'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    test('Debe verificar token válido en header x-access-token', () => {
      const token = 'valid_token_123';
      const decoded = { id: '123', role: 'adoptante', email: 'test@example.com' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, config.secret);
      expect(req.userId).toBe(decoded.id);
      expect(req.userRole).toBe(decoded.role);
      expect(next).toHaveBeenCalled();
    });

    test('Debe verificar token válido en header Authorization Bearer', () => {
      const token = 'valid_token_123';
      const decoded = { id: '123', role: 'admin', email: 'admin@example.com' };

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, config.secret);
      expect(req.userId).toBe(decoded.id);
      expect(req.userRole).toBe(decoded.role);
      expect(next).toHaveBeenCalled();
    });

    test('Debe retornar 403 si no hay token', () => {
      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token no proporcionado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('Debe retornar 401 si token es inválido', () => {
      const token = 'invalid_token';
      req.headers['x-access-token'] = token;

      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido',
        error: 'JsonWebTokenError'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('Debe retornar 401 si token está expirado', () => {
      const token = 'expired_token';
      req.headers['x-access-token'] = token;

      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token inválido',
        error: 'TokenExpiredError'
      });
    });

    test('Debe asignar userId desde token decodificado', () => {
      const token = 'valid_token';
      const userId = '507f1f77bcf86cd799439011';
      const decoded = { id: userId, role: 'adoptante' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(req.userId).toBe(userId);
    });

    test('Debe asignar userRole desde token decodificado', () => {
      const token = 'valid_token';
      const decoded = { id: '123', role: 'adminFundacion' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(req.userRole).toBe('adminFundacion');
    });

    test('Debe asignar userEmail desde token decodificado', () => {
      const token = 'valid_token';
      const decoded = { id: '123', role: 'admin', email: 'admin@example.com' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(req.userEmail).toBe('admin@example.com');
    });

    test('Debe asignar userEmail por defecto si no viene en token', () => {
      const token = 'valid_token';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(req.userEmail).toBe('SinEmail');
    });

    test('Debe priorizar header x-access-token sobre Authorization', () => {
      const tokenXHeader = 'token_from_x_header';
      const tokenAuthHeader = 'token_from_auth_header';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers['x-access-token'] = tokenXHeader;
      req.headers.authorization = `Bearer ${tokenAuthHeader}`;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(tokenXHeader, config.secret);
    });

    test('Debe extraer token correctamente del Authorization header', () => {
      const token = 'my_token_123';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, config.secret);
    });

    test('Debe manejar error si Authorization header no tiene Bearer', () => {
      req.headers.authorization = 'Invalid format';

      // jwt.verify debería lanzar un error porque 'format' no es un token válido
      jwt.verify.mockImplementation(() => {
        const error = new Error('Invalid token');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      verifyToken(req, res, next);

      // Debería fallar con 401
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('Debe llamar a next() después de verificación exitosa', () => {
      const token = 'valid_token';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers['x-access-token'] = token;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
    });

    test('Debe no llamar a next() si verificación falla', () => {
      req.headers['x-access-token'] = 'invalid';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid');
      });

      verifyToken(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Validation Edge Cases', () => {
    test('Debe manejar token vacío', () => {
      req.headers['x-access-token'] = '';

      verifyToken(req, res, next);

      // Token vacío es considerado como no enviado
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('Debe manejar múltiples Bearer tokens en Authorization', () => {
      const token = 'my_token';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers.authorization = `Bearer Bearer ${token}`;
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      // Toma el segundo elemento después del split
      expect(jwt.verify).toHaveBeenCalled();
    });

    test('Debe preservar datos originales del request', () => {
      const token = 'valid_token';
      const decoded = { id: '123', role: 'adoptante' };

      req.headers['x-access-token'] = token;
      req.customData = 'should_remain';
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);

      expect(req.customData).toBe('should_remain');
    });
  });
});
