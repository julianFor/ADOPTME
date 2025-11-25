/**
 * Test final para ejecutar directamente el código del modelo User.js
 * Este test está específicamente diseñado para ejecutar las líneas 32-39 y 45
 */

// Mock mongoose y bcryptjs de manera que permitan la ejecución real
jest.mock('mongoose', () => {
  const mockSchema = function(definition) {
    this.definition = definition;
    this.methods = {};
    this.statics = {};
    this._preHooks = [];
    this._postHooks = [];
    
    this.pre = function(event, fn) {
      this._preHooks.push({ event, fn });
      return this;
    };
    
    this.post = function(event, fn) {
      this._postHooks.push({ event, fn });
      return this;
    };
    
    return this;
  };
  
  const mockModel = function(name, schema) {
    function UserModel(data = {}) {
      Object.assign(this, data);
      
      // Simular mongoose document methods
      this.isModified = function(field) {
        return this._modifiedFields && this._modifiedFields.includes(field);
      };
      
      this.save = async function() {
        // Ejecutar pre-save hooks
        for (const hook of schema._preHooks || []) {
          if (hook.event === 'save') {
            await new Promise((resolve, reject) => {
              hook.fn.call(this, (error) => {
                if (error) reject(error);
                else resolve();
              });
            });
          }
        }
        return this;
      };
      
      // Agregar métodos del schema
      Object.assign(this, schema.methods || {});
    }
    
    UserModel.create = async function(data) {
      const instance = new UserModel(data);
      instance._modifiedFields = ['password']; // Simular que password fue modificada
      await instance.save();
      return instance;
    };
    
    UserModel.findOne = jest.fn();
    UserModel.find = jest.fn();
    UserModel.findById = jest.fn();
    UserModel.schema = schema;
    
    return UserModel;
  };
  
  return {
    Schema: mockSchema,
    model: mockModel,
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      once: jest.fn()
    }
  };
});

// Mock real de bcryptjs que ejecute el código
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockImplementation(async (rounds) => {
    // Simular tiempo de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1));
    return `salt_${rounds}`;
  }),
  hash: jest.fn().mockImplementation(async (password, salt) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    return `hashed_${password}_with_${salt}`;
  }),
  compare: jest.fn().mockImplementation(async (candidate, hashed) => {
    await new Promise(resolve => setTimeout(resolve, 1));
    return hashed.includes(candidate);
  })
}));

const bcrypt = require('bcryptjs');

describe('User Model - Real Execution Coverage', () => {
  let User;
  
  beforeAll(() => {
    // Clear module cache to force re-import with our mocks
    delete require.cache[require.resolve('../../../models/User.js')];
    User = require('../../../models/User.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should execute pre-save hook with real User model (lines 32-39)', async () => {
    const userData = {
      nombre: 'Test User Coverage',
      email: 'coverage@test.com',
      password: 'originalPassword123',
      rol: 'adoptante',
      telefono: '1234567890'
    };

    // This will trigger the pre-save hook in the real User model
    const user = await User.create(userData);

    // Verify the pre-save hook executed (lines 32-39)
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('originalPassword123', 'salt_10');
    expect(user.password).toBe('hashed_originalPassword123_with_salt_10');
  });

  test('should execute comparePassword method (line 45)', async () => {
    const userData = {
      nombre: 'Test User Compare',
      email: 'compare@test.com', 
      password: 'testPassword456',
      rol: 'adoptante'
    };

    const user = await User.create(userData);
    
    // This will execute the comparePassword method (line 45)
    const isMatch = await user.comparePassword('testPassword456');
    
    expect(bcrypt.compare).toHaveBeenCalledWith('testPassword456', user.password);
    expect(isMatch).toBe(true);
  });

  test('should handle password not modified scenario', async () => {
    // Create user instance without triggering save
    const user = new User({
      nombre: 'No Modify Test',
      email: 'nomodify@test.com',
      password: 'alreadyHashedPassword',
      rol: 'adoptante'
    });

    // Simulate password not being modified
    user._modifiedFields = ['nombre']; // Only name was modified
    
    const originalPassword = user.password;
    await user.save();
    
    // Password should remain unchanged
    expect(user.password).toBe(originalPassword);
    expect(bcrypt.genSalt).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  test('should handle errors in pre-save hook', async () => {
    // Make bcrypt.genSalt throw an error
    bcrypt.genSalt.mockRejectedValueOnce(new Error('Salt generation error'));
    
    const user = new User({
      nombre: 'Error Test',
      email: 'error@test.com',
      password: 'errorPassword',
      rol: 'adoptante'
    });

    user._modifiedFields = ['password'];
    
    await expect(user.save()).rejects.toThrow('Salt generation error');
  });

  test('should handle errors in comparePassword', async () => {
    const user = new User({
      password: 'hashedPassword'
    });

    // Make bcrypt.compare throw an error
    bcrypt.compare.mockRejectedValueOnce(new Error('Compare error'));
    
    await expect(user.comparePassword('anyPassword')).rejects.toThrow('Compare error');
  });

  test('should execute multiple user operations', async () => {
    const users = [];
    
    // Create multiple users to increase execution count
    for (let i = 0; i < 3; i++) {
      const userData = {
        nombre: `User ${i}`,
        email: `user${i}@test.com`,
        password: `password${i}`,
        rol: 'adoptante'
      };
      
      const user = await User.create(userData);
      users.push(user);
    }

    // Verify all users were created and password hooks executed
    expect(bcrypt.genSalt).toHaveBeenCalledTimes(3);
    expect(bcrypt.hash).toHaveBeenCalledTimes(3);
    
    // Test comparePassword for all users
    for (let i = 0; i < users.length; i++) {
      const isValid = await users[i].comparePassword(`password${i}`);
      expect(isValid).toBe(true);
    }
    
    expect(bcrypt.compare).toHaveBeenCalledTimes(3);
  });

  test('should test different password scenarios', async () => {
    const user = await User.create({
      nombre: 'Password Test',
      email: 'passtest@test.com',
      password: 'mySecretPassword',
      rol: 'adoptante'
    });

    // Test correct password
    let result = await user.comparePassword('mySecretPassword');
    expect(result).toBe(true);

    // Test incorrect password  
    bcrypt.compare.mockResolvedValueOnce(false);
    result = await user.comparePassword('wrongPassword');
    expect(result).toBe(false);

    // Verify calls
    expect(bcrypt.compare).toHaveBeenCalledWith('mySecretPassword', user.password);
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongPassword', user.password);
  });

  test('should verify user model structure and methods', () => {
    const user = new User({
      nombre: 'Structure Test',
      email: 'structure@test.com',
      password: 'structurePassword',
      rol: 'adoptante',
      telefono: '9876543210',
      direccion: 'Test Address',
      documentoIdentidad: 'ID123456',
      activo: true,
      fechaRegistro: new Date()
    });

    // Verify all properties are set
    expect(user.nombre).toBe('Structure Test');
    expect(user.email).toBe('structure@test.com');
    expect(user.password).toBe('structurePassword');
    expect(user.rol).toBe('adoptante');
    expect(user.telefono).toBe('9876543210');
    expect(user.direccion).toBe('Test Address');
    expect(user.documentoIdentidad).toBe('ID123456');
    expect(user.activo).toBe(true);
    expect(user.fechaRegistro).toBeInstanceOf(Date);

    // Verify methods exist
    expect(typeof user.comparePassword).toBe('function');
    expect(typeof user.save).toBe('function');
    expect(typeof user.isModified).toBe('function');
  });
});