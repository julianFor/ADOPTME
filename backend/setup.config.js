/**
 * Setup global para pruebas
 * Configura mocks, variables globales y utilidades
 */

// Mock para Cloudinary
jest.mock('../config/cloudinary.js', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/test/image.jpg' }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Mock para Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
  })
}));

// Mock para MongoDB - Mongoose connection
jest.mock('../config/db.js', () => ({
  connect: jest.fn().mockResolvedValue(true)
}));

// Aumentar timeout para tests
jest.setTimeout(30000);

// Variables globales de prueba
global.testData = {
  validUser: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!'
  },
  validMascota: {
    nombre: 'Firulais',
    especie: 'perro',
    raza: 'Labrador',
    fechaNacimiento: new Date('2020-01-15'),
    sexo: 'macho',
    tamano: 'grande',
    descripcion: 'Perro amable',
    origen: 'fundacion'
  },
  validDonation: {
    amount: 100,
    currency: 'USD',
    status: 'completed'
  },
  validNeed: {
    titulo: 'Alimento para perros',
    descripcion: 'Necesitamos 100kg de alimento',
    cantidad: 100,
    unidad: 'kg'
  }
};

module.exports = {};
