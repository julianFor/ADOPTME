// __tests__/integration/integration.setup.js
// ============================================
// Setup global para tests de integración
// Proporciona utilidades, mocks y helpers compartidos
// ============================================

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ==========================================
// MOCKS GLOBALES DE MODELOS
// ==========================================

// Mock de User.save() y métodos de búsqueda
const mockUserModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

// Mock de Mascota
const mockMascotaModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
};

// Mock de SolicitudAdopcion
const mockSolicitudAdopcionModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
  countDocuments: jest.fn(),
};

// Mock de ProcesoAdopcion
const mockProcesoAdopcionModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
};

// Mock de SolicitudPublicacion
const mockSolicitudPublicacionModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  updateOne: jest.fn(),
  create: jest.fn(),
};

// Mock de Donation
const mockDonationModel = {
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  countDocuments: jest.fn(),
};

// Mock de DonationGoal
const mockDonationGoalModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

// Mock de Need
const mockNeedModel = {
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

// Mock de Notificacion
const mockNotificacionModel = {
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

// ==========================================
// UTILIDADES DE TESTING
// ==========================================

/**
 * Genera un JWT válido
 */
function generarToken(userId, role = 'admin', expiresIn = '24h') {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn }
  );
}

/**
 * Crea un usuario mockeado con datos completos
 */
function crearUsuarioMock(overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    username: 'usuario_test_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'hashedPassword123',
    role: 'adoptante',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn(function() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.toJSON;
      return obj;
    }),
    toJSON: jest.fn(function() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.toJSON;
      return obj;
    }),
    ...overrides
  };
}

/**
 * Crea una mascota mockeada
 */
function crearMascotaMock(overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    nombre: 'Luna',
    especie: 'perro',
    raza: 'Labrador',
    tamano: 'grande',
    edad: 2,
    descripcion: 'Mascota hermosa',
    imagenes: ['https://example.com/img1.jpg'],
    estado: 'disponible',
    fechaIngreso: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: jest.fn(function() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.toJSON;
      return obj;
    }),
    ...overrides
  };
}

/**
 * Crea una solicitud de adopción mockeada
 */
function crearSolicitudAdopcionMock(mascotaId, adoptanteId, overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    mascota: mascotaId || new mongoose.Types.ObjectId(),
    adoptante: adoptanteId || new mongoose.Types.ObjectId(),
    nombreCompleto: 'Juan Pérez',
    cedula: '1234567890',
    email: 'juan@example.com',
    telefono: '3001234567',
    direccion: 'Cra 5 #10-20',
    ciudad: 'Bogotá',
    tipoVivienda: 'apartamento',
    tenenciaVivienda: 'alquilada',
    hayNinos: false,
    otrasMascotas: false,
    motivoAdopcion: 'Quiero darle un hogar',
    estado: 'pendiente',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Crea un proceso de adopción mockeado
 */
function crearProcesoAdopcionMock(solicitudId, overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    solicitud: solicitudId || new mongoose.Types.ObjectId(),
    etapa: 'entrevista',
    estado: 'en_proceso',
    fechaInicio: new Date(),
    fechaFinalizacion: null,
    resultados: {
      entrevista: { aprobado: true, fecha: new Date() },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Crea una solicitud de publicación mockeada
 */
function crearSolicitudPublicacionMock(mascotaId, overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    mascota: mascotaId || new mongoose.Types.ObjectId(),
    estado: 'pendiente',
    titulo: 'Se busca adopción para Luna',
    descripcion: 'Hermosa mascota buscando hogar',
    motivoPublicacion: 'Mascota rescatada',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Crea una donación mockeada
 */
function crearDonacionMock(donadorId, overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    donador: donadorId || new mongoose.Types.ObjectId(),
    monto: 50000,
    metodoPago: 'paypal',
    referencia: 'TXN-' + Date.now(),
    estado: 'completada',
    fechaDonacion: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Crea una necesidad mockeada
 */
function crearNecesidadMock(overrides = {}) {
  const id = new mongoose.Types.ObjectId();
  return {
    _id: id,
    id: id.toString(),
    titulo: 'Comida para perros',
    descripcion: 'Se necesita comida premium',
    categoria: 'alimento',
    cantidad: 20,
    unidad: 'kg',
    urgencia: 'alta',
    estado: 'activa',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}

/**
 * Limpia mocks después de cada test
 */
function limpiarMocks() {
  jest.clearAllMocks();
}

/**
 * Verifica que una acción genera una notificación
 */
function esperarNotificacion(accion, tipo) {
  return expect(accion).toHaveBeenCalledWith(
    expect.objectContaining({
      tipo: tipo
    })
  );
}

/**
 * Simula una cadena completa de eventos
 */
async function simularFlujoCompleto(pasos) {
  const resultados = [];
  for (const paso of pasos) {
    try {
      const resultado = await paso();
      resultados.push({ exito: true, resultado });
    } catch (error) {
      resultados.push({ exito: false, error: error.message });
    }
  }
  return resultados;
}

// ==========================================
// HELPERS DE VALIDACIÓN
// ==========================================

/**
 * Valida que un usuario tiene todos los campos requeridos
 */
function validarUsuarioCompleto(usuario) {
  expect(usuario).toHaveProperty('_id');
  expect(usuario).toHaveProperty('username');
  expect(usuario).toHaveProperty('email');
  expect(usuario).toHaveProperty('role');
  expect(usuario).toHaveProperty('createdAt');
}

/**
 * Valida que una mascota tiene todos los campos requeridos
 */
function validarMascotaCompleta(mascota) {
  expect(mascota).toHaveProperty('_id');
  expect(mascota).toHaveProperty('nombre');
  expect(mascota).toHaveProperty('especie');
  expect(mascota).toHaveProperty('estado');
}

/**
 * Valida que una solicitud tiene todos los campos requeridos
 */
function validarSolicitudCompleta(solicitud) {
  expect(solicitud).toHaveProperty('_id');
  expect(solicitud).toHaveProperty('mascota');
  expect(solicitud).toHaveProperty('adoptante');
  expect(solicitud).toHaveProperty('estado');
}

/**
 * Valida que un proceso tiene todos los campos requeridos
 */
function validarProcesoCompleto(proceso) {
  expect(proceso).toHaveProperty('_id');
  expect(proceso).toHaveProperty('solicitud');
  expect(proceso).toHaveProperty('etapa');
  expect(proceso).toHaveProperty('estado');
}

// ==========================================
// EXPORTAR UTILIDADES
// ==========================================

module.exports = {
  // Generadores de datos
  crearUsuarioMock,
  crearMascotaMock,
  crearSolicitudAdopcionMock,
  crearProcesoAdopcionMock,
  crearSolicitudPublicacionMock,
  crearDonacionMock,
  crearNecesidadMock,
  
  // Utilidades JWT
  generarToken,
  
  // Limpieza
  limpiarMocks,
  
  // Validadores
  validarUsuarioCompleto,
  validarMascotaCompleta,
  validarSolicitudCompleta,
  validarProcesoCompleto,
  
  // Helpers
  esperarNotificacion,
  simularFlujoCompleto,
  
  // Mocks
  mockUserModel,
  mockMascotaModel,
  mockSolicitudAdopcionModel,
  mockProcesoAdopcionModel,
  mockSolicitudPublicacionModel,
  mockDonationModel,
  mockDonationGoalModel,
  mockNeedModel,
  mockNotificacionModel,
};
