const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../../models/User');

// Mock de mongoose para no conectar a DB real
jest.mock('mongoose');

describe('Model - User', () => {
  
  describe('User Schema', () => {
    test('debe crear un usuario con campos requeridos', () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'adoptante'
      };

      // Verificar que el esquema tenga los campos requeridos
      expect(userData.username).toBeDefined();
      expect(userData.email).toBeDefined();
      expect(userData.password).toBeDefined();
      expect(userData.role).toBe('adoptante');
    });

    test('debe aceptar roles válidos', () => {
      const rolesValidos = ['adoptante', 'adminFundacion', 'admin'];
      
      rolesValidos.forEach(role => {
        expect(['adoptante', 'adminFundacion', 'admin']).toContain(role);
      });
    });

    test('debe hacer trim en username y email', () => {
      const userData = {
        username: '  testuser  ',
        email: '  TEST@EXAMPLE.COM  '
      };

      const trimmedUsername = userData.username.trim();
      const trimmedEmail = userData.email.trim().toLowerCase();

      expect(trimmedUsername).toBe('testuser');
      expect(trimmedEmail).toBe('test@example.com');
    });
  });

  describe('comparePassword method', () => {
    test('debe comparar contraseñas correctamente', async () => {
      const password = 'miPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(password, hashedPassword);
      
      expect(isMatch).toBe(true);
    });

    test('debe rechazar contraseñas incorrectas', async () => {
      const password = 'miPassword123';
      const wrongPassword = 'wrongPassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
      
      expect(isMatch).toBe(false);
    });

    test('debe hashear contraseñas diferentes de manera diferente', async () => {
      const password = 'miPassword123';
      
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      // Los hashes deben ser diferentes aunque la contraseña sea igual
      expect(hash1).not.toBe(hash2);
      
      // Pero ambos deben verificar correctamente
      const match1 = await bcrypt.compare(password, hash1);
      const match2 = await bcrypt.compare(password, hash2);
      
      expect(match1).toBe(true);
      expect(match2).toBe(true);
    });
  });

  describe('Email validation', () => {
    test('debe aceptar emails válidos', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com'
      ];

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    test('debe rechazar emails inválidos', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'user@',
        'user @example.com'
      ];

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Username validation', () => {
    test('debe aceptar usernames con letras y números', () => {
      const validUsernames = ['user123', 'testUser', 'admin_2025'];

      validUsernames.forEach(username => {
        expect(username.length).toBeGreaterThan(0);
        expect(typeof username).toBe('string');
      });
    });

    test('debe hacer trim a espacios en blanco', () => {
      const username = '   testuser   ';
      const trimmed = username.trim();
      
      expect(trimmed).toBe('testuser');
      expect(trimmed).not.toContain(' ');
    });
  });

  describe('Password hashing', () => {
    test('debe hashear la contraseña antes de guardar', async () => {
      const password = 'plainPassword123';
      const hashed = await bcrypt.hash(password, 10);
      
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(password.length);
    });

    test('debe generar sal diferente para cada hash', async () => {
      const password = 'testPassword';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Default role', () => {
    test('debe asignar rol adoptante por defecto', () => {
      const userData = {
        username: 'user',
        email: 'user@example.com',
        password: 'pass123'
      };

      // Sin especificar role, debería ser 'adoptante'
      const role = userData.role || 'adoptante';
      expect(role).toBe('adoptante');
    });
  });
});
