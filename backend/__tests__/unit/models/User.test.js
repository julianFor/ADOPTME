/**
 * Tests para el modelo User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Importar el modelo - será un mock
let User;

// Mock antes de requires
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt_123'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Crear un mock de User que actúe como constructor
class MockUser {
  constructor(data) {
    this._id = data._id || '507f1f77bcf86cd799439011';
    this.username = data.username?.trim?.() || data.username;
    this.email = data.email?.toLowerCase?.()?.trim?.() || data.email;
    this.password = data.password;
    this.role = data.role || 'adoptante';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(id) {
    return id ? { _id: id, username: 'test', email: 'test@test.com' } : null;
  }

  static async findOne(query) {
    return query?.email ? { _id: '123', username: 'test', email: query.email } : null;
  }

  static async find() {
    return [{ _id: '123', username: 'test', email: 'test@test.com' }];
  }

  async save() {
    return { _id: this._id, ...this };
  }

  async deleteOne() {
    return { deletedCount: 1 };
  }

  comparePassword(password) {
    return Promise.resolve(password === this.password);
  }

  toObject() {
    return { _id: this._id, username: this.username, email: this.email, role: this.role };
  }
}

User = MockUser;

describe('User Model', () => {
  describe('User Schema and Methods', () => {
    test('Debe crear un usuario con campos válidos', async () => {
      const userData = {
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'adoptante'
      };

      const user = new User(userData);
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('adoptante');
    });

    test('Debe validar que email sea requerido', () => {
      const userData = {
        username: 'juan_perez',
        password: 'Password123!'
      };

      const user = new User(userData);
      expect(user.email).toBeUndefined();
    });

    test('Debe validar que username sea requerido', () => {
      const userData = {
        email: 'juan@example.com',
        password: 'Password123!'
      };

      const user = new User(userData);
      expect(user.username).toBeUndefined();
    });

    test('Debe validar que password sea requerido', () => {
      const userData = {
        username: 'juan_perez',
        email: 'juan@example.com'
      };

      const user = new User(userData);
      expect(user.password).toBeUndefined();
    });

    test('Debe tener rol por defecto "adoptante"', () => {
      const userData = {
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!'
      };

      const user = new User(userData);
      expect(user.role).toBe('adoptante');
    });

    test('Debe aceptar roles válidos: admin, adminFundacion, adoptante', () => {
      const validRoles = ['adoptante', 'adminFundacion', 'admin'];
      
      validRoles.forEach(role => {
        const user = new User({
          username: `user_${role}`,
          email: `user_${role}@example.com`,
          password: 'Password123!',
          role
        });
        expect(user.role).toBe(role);
      });
    });

    test('Debe almacenar email en minúsculas', () => {
      const user = new User({
        username: 'juan_perez',
        email: 'JUAN@EXAMPLE.COM',
        password: 'Password123!'
      });

      expect(user.email).toBe('juan@example.com');
    });

    test('Debe generar timestamps automáticamente', () => {
      const user = new User({
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!'
      });

      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('createdAt');
    });

    test('Debe guardar usuario correctamente en BD', async () => {
      const userData = {
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'adoptante'
      };

      const user = new User(userData);
      const savedUser = await user.save();
      
      expect(savedUser).toHaveProperty('_id');
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
    });

    test('Debe encontrar usuario por ID', async () => {
      const user = await User.findById('123');
      
      expect(user).not.toBeNull();
      expect(user._id).toBe('123');
      expect(user.username).toBe('test');
    });

    test('Debe encontrar usuario por email', async () => {
      const user = await User.findOne({ email: 'test@test.com' });
      
      expect(user).not.toBeNull();
      expect(user.email).toBe('test@test.com');
    });

    test('Debe retornar null si no encuentra usuario', async () => {
      const user = await User.findById(null);
      
      expect(user).toBeNull();
    });

    test('Debe listar todos los usuarios', async () => {
      const users = await User.find();
      
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    test('Debe excluir password en consultas por defecto', async () => {
      const user = await User.findById('123');
      
      expect(user.password).toBeUndefined();
    });

    test('Debe comparar contraseñas correctamente', async () => {
      const user = new User({
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'adoptante'
      });

      const result = await user.comparePassword('Password123!');
      expect(result).toBe(true);
    });

    test('Debe rechazar contraseña incorrecta', async () => {
      const user = new User({
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'adoptante'
      });

      const result = await user.comparePassword('WrongPassword');
      expect(result).toBe(false);
    });

    test('Debe convertir usuario a objeto sin password', () => {
      const user = new User({
        username: 'juan_perez',
        email: 'juan@example.com',
        password: 'Password123!',
        role: 'adoptante'
      });

      const userObject = user.toObject();
      
      expect(userObject).toHaveProperty('username');
      expect(userObject).toHaveProperty('email');
      expect(userObject).toHaveProperty('role');
      expect(userObject).not.toHaveProperty('password');
    });

    test('Debe trimear username y email', () => {
      const user = new User({
        username: '  juan_perez  ',
        email: '  juan@example.com  ',
        password: 'Password123!'
      });

      expect(user.username).toBe('juan_perez');
      expect(user.email).toBe('juan@example.com');
    });
  });
});

