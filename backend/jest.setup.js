/**
 * Setup Inicial para Jest
 * Configuración global de mocks y utilidades
 */

// Mock de variables de entorno ANTES de cualquier require
process.env.JWT_SECRET = 'test_secret_key_123';
process.env.MONGODB_URI = 'mongodb://test:test@localhost:27017/adoptme_test';
process.env.CLOUDINARY_NAME = 'test_cloudinary';
process.env.CLOUDINARY_API_KEY = 'test_api_key';
process.env.CLOUDINARY_API_SECRET = 'test_api_secret';
process.env.PORT = '3000';

// Suprimir logs en tests (pero guardar originales)
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock global de Mongoose
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  
  return {
    ...originalModule,
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    Schema: class {
      constructor(definition, options) {
        this.definition = definition;
        this.options = options;
        this.pre = jest.fn(function() { return this; });
        this.post = jest.fn(function() { return this; });
        this.methods = {};
        this.statics = {};
      }
      pre() { return this; }
      post() { return this; }
    },
    model: jest.fn((name, schema) => {
      class MockModel {
        constructor(data = {}) {
          Object.assign(this, data);
          this._id = data._id || Math.random().toString(36).substr(2, 9);
        }
        
        static async find(query = {}) {
          return [];
        }
        
        static async findById(id) {
          return id ? { _id: id } : null;
        }
        
        static async findOne(query = {}) {
          return null;
        }
        
        static async findByIdAndUpdate(id, update, options = {}) {
          return { _id: id, ...update };
        }
        
        static async findByIdAndDelete(id) {
          return { _id: id };
        }
        
        static async countDocuments(query = {}) {
          return 0;
        }
        
        static async deleteMany(query = {}) {
          return { deletedCount: 0 };
        }
        
        static async create(data) {
          return new this(data);
        }
        
        static async updateMany(filter, update) {
          return { modifiedCount: 0, matchedCount: 0 };
        }
        
        async save() {
          return this;
        }
        
        async deleteOne() {
          return { deletedCount: 1 };
        }
        
        async updateOne(update) {
          Object.assign(this, update);
          return { modifiedCount: 1 };
        }
        
        toObject() {
          return { ...this };
        }
        
        toJSON() {
          return { ...this };
        }
      }
      
      return MockModel;
    }),
    connection: {
      close: jest.fn().mockResolvedValue(true),
      on: jest.fn(),
      once: jest.fn()
    }
  };
});

// Mock de Express
jest.mock('express', () => {
  const mockRouter = {
    get: jest.fn().mockReturnValue(mockRouter),
    post: jest.fn().mockReturnValue(mockRouter),
    put: jest.fn().mockReturnValue(mockRouter),
    patch: jest.fn().mockReturnValue(mockRouter),
    delete: jest.fn().mockReturnValue(mockRouter),
    use: jest.fn().mockReturnValue(mockRouter)
  };

  const mockApp = {
    ...mockRouter,
    listen: jest.fn(),
    use: jest.fn().mockReturnValue(mockApp)
  };

  return {
    __esModule: true,
    default: jest.fn(() => mockApp),
    Router: jest.fn(() => mockRouter),
    json: jest.fn(),
    urlencoded: jest.fn(),
    static: jest.fn()
  };
});

// Mock de CORS
jest.mock('cors', () => {
  return jest.fn(() => (req, res, next) => next());
});

// Mock de DOTENV
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock de Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test_message_id' })
  }))
}));

// Mock de Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test_public_id'
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
      unsigned_upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg'
      })
    },
    search: {
      expression: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ resources: [] })
    }
  }
}));

// Mock de Multer
jest.mock('multer', () => {
  return jest.fn(() => ({
    single: jest.fn(),
    array: jest.fn(),
    fields: jest.fn()
  }));
});

// Mock de JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mocked_token_' + JSON.stringify(payload)),
  verify: jest.fn((token, secret) => ({ id: 'user_123', role: 'adoptante' })),
  decode: jest.fn((token) => ({ id: 'user_123', role: 'adoptante' }))
}));

// Mock de Bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt_123'),
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock de Validator
jest.mock('validator', () => ({
  isEmail: jest.fn((email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }),
  isLength: jest.fn((str, options) => {
    return str.length >= (options?.min || 0) && str.length <= (options?.max || 999);
  }),
  trim: jest.fn((str) => str.trim()),
  escape: jest.fn((str) => str),
  normalizeEmail: jest.fn((email) => email.toLowerCase().trim())
}));

// Mock de Multer Cloudinary Storage
jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn()
}));

// Utilidades globales para tests
global.testHelpers = {
  createMockUser: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'adoptante',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockMascota: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439012',
    nombre: 'Firulais',
    especie: 'perro',
    raza: 'Labrador',
    fechaNacimiento: new Date('2020-01-15'),
    sexo: 'macho',
    tamano: 'grande',
    descripcion: 'Perro amable',
    origen: 'fundacion',
    disponible: true,
    publicada: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockDonation: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439013',
    monto: 100,
    moneda: 'USD',
    estado: 'completada',
    donante: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockNeed: (overrides = {}) => ({
    _id: '507f1f77bcf86cd799439014',
    titulo: 'Alimento para perros',
    descripcion: 'Necesitamos 100kg',
    cantidad: 100,
    unidad: 'kg',
    cantidadCubierta: 0,
    estado: 'pendiente',
    prioridad: 'normal',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    userId: '507f1f77bcf86cd799439011',
    userRole: 'adoptante',
    ...overrides
  }),

  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnValue({}),
      send: jest.fn().mockReturnValue({}),
      redirect: jest.fn().mockReturnValue({}),
      sendStatus: jest.fn().mockReturnValue({}),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn()
    };
    return res;
  },

  createMockNext: () => jest.fn()
};

// Setup para afterEach
afterEach(() => {
  jest.clearAllMocks();
});

module.exports = {};
