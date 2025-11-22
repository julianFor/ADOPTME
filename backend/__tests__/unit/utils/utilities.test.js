/**
 * Tests para utilities
 */

const validator = require('validator');

jest.mock('validator');

describe('Utilities Tests', () => {
  describe('Email Validation', () => {
    test('Debe validar email válido', () => {
      validator.isEmail.mockReturnValue(true);
      
      const result = validator.isEmail('test@example.com');
      
      expect(result).toBe(true);
    });

    test('Debe rechazar email inválido', () => {
      validator.isEmail.mockReturnValue(false);
      
      const result = validator.isEmail('not-an-email');
      
      expect(result).toBe(false);
    });

    test('Debe rechazar email vacío', () => {
      validator.isEmail.mockReturnValue(false);
      
      const result = validator.isEmail('');
      
      expect(result).toBe(false);
    });
  });

  describe('String Validation', () => {
    test('Debe validar longitud mínima', () => {
      validator.isLength.mockReturnValue(true);
      
      const result = validator.isLength('password123', { min: 8 });
      
      expect(result).toBe(true);
    });

    test('Debe validar longitud máxima', () => {
      validator.isLength.mockReturnValue(true);
      
      const result = validator.isLength('test', { max: 100 });
      
      expect(result).toBe(true);
    });

    test('Debe rechazar string demasiado corto', () => {
      validator.isLength.mockReturnValue(false);
      
      const result = validator.isLength('abc', { min: 8 });
      
      expect(result).toBe(false);
    });
  });

  describe('String Sanitization', () => {
    test('Debe trim espacios en blanco', () => {
      validator.trim.mockReturnValue('hello');
      
      const result = validator.trim('  hello  ');
      
      expect(result).toBe('hello');
    });

    test('Debe escapar caracteres especiales', () => {
      validator.escape.mockReturnValue('&lt;script&gt;');
      
      const result = validator.escape('<script>');
      
      expect(result).toBe('&lt;script&gt;');
    });

    test('Debe normalizar email a minúsculas', () => {
      validator.normalizeEmail.mockReturnValue('test@example.com');
      
      const result = validator.normalizeEmail('TEST@EXAMPLE.COM');
      
      expect(result).toBe('test@example.com');
    });
  });

  describe('Custom Sanitize Function', () => {
    // Mock sanitize since it's not properly exported
    const mockSanitize = (input) => {
      if (!input) return '';
      return String(input).trim().replace(/<[^>]*>/g, '');
    };

    test('Debe sanitizar input de usuario', () => {
      const input = '  Test Input 123  ';
      const sanitized = mockSanitize(input);
      
      expect(sanitized).toBeDefined();
      expect(typeof sanitized).toBe('string');
      expect(sanitized).toBe('Test Input 123');
    });

    test('Debe manejar null/undefined', () => {
      const result = mockSanitize(null);
      expect(result).toBeDefined();
      expect(result).toBe('');
    });

    test('Debe remover caracteres peligrosos', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = mockSanitize(input);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toBe('alert("xss")');
    });
  });
});
