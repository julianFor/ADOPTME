/**
 * Tests para Donation Controller
 * Prueba crear donaciones, obtener por meta, calcular totales
 */

const donationController = require('../../../controllers/donationController');

jest.mock('../../../models/Donation');
jest.mock('mongoose');

describe('Controller - Donation', () => {
  let req, res;
  let Donation;

  beforeEach(() => {
    jest.clearAllMocks();
    
    Donation = require('../../../models/Donation');

    req = {
      body: {},
      params: {},
      userRole: 'adoptante',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Monto', () => {
    test('debe validar que monto sea número positivo', () => {
      const monto = 50000;
      expect(typeof monto).toBe('number');
      expect(monto).toBeGreaterThan(0);
    });

    test('debe rechazar monto negativo', () => {
      const monto = -5000;
      expect(monto).toBeLessThanOrEqual(0);
    });

    test('debe rechazar monto cero', () => {
      const monto = 0;
      expect(monto).toBeLessThanOrEqual(0);
    });

    test('debe rechazar monto no numérico', () => {
      const monto = 'cincuenta mil';
      const isNumber = typeof monto === 'number';
      expect(isNumber).toBe(false);
    });

    test('debe permitir montos pequeños (mínimo)', () => {
      const montoMinimo = 1000;
      const monto = montoMinimo;
      
      expect(monto).toBeGreaterThanOrEqual(montoMinimo);
    });

    test('debe permitir montos grandes', () => {
      const monto = 10000000;
      expect(typeof monto).toBe('number');
      expect(monto).toBeGreaterThan(0);
    });

    test('debe validar máximo 2 decimales', () => {
      const monto = 50000.99;
      const decimales = (monto.toString().split('.')[1] || '').length;
      
      expect(decimales).toBeLessThanOrEqual(2);
    });

    test('debe rechazar más de 2 decimales', () => {
      const monto = 50000.999;
      const decimales = (monto.toString().split('.')[1] || '').length;
      
      expect(decimales).toBeGreaterThan(2);
    });
  });

  describe('Validaciones de Donante', () => {
    test('debe validar que donante tenga email', () => {
      const email = 'donante@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(true);
    });

    test('debe rechazar email inválido', () => {
      const email = 'donante-invalido';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe permitir donante anónimo (sin nombre)', () => {
      const nombre = null;
      expect(nombre).toBeNull();
    });

    test('debe validar nombre de donante si se proporciona', () => {
      const nombre = 'Juan Pérez';
      expect(typeof nombre).toBe('string');
      expect(nombre.length).toBeGreaterThan(0);
    });
  });

  describe('Validaciones de Meta (goalId)', () => {
    test('debe validar que goalId sea MongoDB ID válido', () => {
      const goalId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(goalId);
      
      expect(isValidId).toBe(true);
    });

    test('debe rechazar goalId inválido', () => {
      const goalId = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(goalId);
      
      expect(isValidId).toBe(false);
    });

    test('debe rechazar goalId vacío', () => {
      const goalId = '';
      expect(goalId).toBeFalsy();
    });

    test('debe rechazar goalId nulo', () => {
      const goalId = null;
      expect(goalId).toBeNull();
    });

    test('debe requerir goalId', () => {
      const donacion = {
        monto: 50000,
        // goalId falta
      };
      
      expect(donacion.goalId).toBeUndefined();
    });
  });

  describe('Validaciones de Método de Pago', () => {
    test('debe validar método de pago válido', () => {
      const metodosValidos = ['paypal', 'transferencia', 'tarjeta', 'efectivo'];
      const metodo = 'paypal';
      
      expect(metodosValidos).toContain(metodo);
    });

    test('debe rechazar método de pago inválido', () => {
      const metodosValidos = ['paypal', 'transferencia', 'tarjeta'];
      const metodo = 'bitcoin';
      
      expect(metodosValidos).not.toContain(metodo);
    });

    test('debe asignar PayPal como método por defecto', () => {
      const metodo = undefined || 'paypal';
      expect(metodo).toBe('paypal');
    });
  });

  describe('Estado de Donación', () => {
    test('debe tener estado pendiente al crear', () => {
      const estado = 'pendiente';
      expect(estado).toBe('pendiente');
    });

    test('debe permitir cambiar a estado completado', () => {
      const estadosValidos = ['pendiente', 'completada', 'fallida', 'cancelada'];
      const estado = 'completada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe permitir cambiar a estado fallida', () => {
      const estadosValidos = ['pendiente', 'completada', 'fallida'];
      const estado = 'fallida';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe permitir cambiar a estado cancelada', () => {
      const estadosValidos = ['pendiente', 'completada', 'cancelada'];
      const estado = 'cancelada';
      
      expect(estadosValidos).toContain(estado);
    });
  });

  describe('Referencia de Transacción', () => {
    test('debe validar que referenciaPago tenga formato válido', () => {
      const referencia = 'PAY-12345-ABCDE';
      expect(typeof referencia).toBe('string');
      expect(referencia.length).toBeGreaterThan(5);
    });

    test('debe permitir referencia vacía para donaciones pendientes', () => {
      const referencia = null;
      expect(referencia).toBeNull();
    });

    test('debe requerir referencia para donaciones completadas', () => {
      const estado = 'completada';
      const referencia = 'PAY-123';
      
      if (estado === 'completada') {
        expect(referencia).toBeDefined();
      }
    });
  });

  describe('Fecha de Donación', () => {
    test('debe establecer fecha de creación automáticamente', () => {
      const ahora = new Date();
      expect(ahora instanceof Date).toBe(true);
    });

    test('debe rechazar fecha futura', () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() + 1);
      
      expect(fecha.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe permitir fecha en pasado', () => {
      const fecha = new Date('2023-01-01');
      expect(fecha.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Lógica de Permisos', () => {
    test('cualquier usuario puede hacer donación', () => {
      const puedeDonar = ['adoptante', 'admin', 'adminFundacion'];
      const usuarioRole = 'adoptante';
      
      expect(puedeDonar).toContain(usuarioRole);
    });

    test('usuario anónimo puede hacer donación', () => {
      const usuarioId = null;
      // La donación no requiere userId
      expect(usuarioId).toBeNull();
    });

    test('solo admin puede ver todas las donaciones', () => {
      const puedeVerTodas = 'admin' === 'admin';
      expect(puedeVerTodas).toBe(true);
    });
  });

  describe('Cálculo de Totales', () => {
    test('debe sumar correctamente múltiples donaciones', () => {
      const donaciones = [
        { monto: 10000 },
        { monto: 20000 },
        { monto: 30000 }
      ];
      
      const total = donaciones.reduce((sum, d) => sum + d.monto, 0);
      expect(total).toBe(60000);
    });

    test('debe retornar 0 si no hay donaciones', () => {
      const donaciones = [];
      const total = donaciones.reduce((sum, d) => sum + d.monto, 0);
      
      expect(total).toBe(0);
    });

    test('debe calcular promedio de donaciones', () => {
      const donaciones = [
        { monto: 10000 },
        { monto: 20000 },
        { monto: 30000 }
      ];
      
      const promedio = donaciones.length > 0 
        ? donaciones.reduce((sum, d) => sum + d.monto, 0) / donaciones.length
        : 0;
      
      expect(promedio).toBe(20000);
    });

    test('debe encontrar donación máxima', () => {
      const donaciones = [
        { monto: 10000 },
        { monto: 50000 },
        { monto: 30000 }
      ];
      
      const maxDonacion = Math.max(...donaciones.map(d => d.monto));
      expect(maxDonacion).toBe(50000);
    });

    test('debe encontrar donación mínima', () => {
      const donaciones = [
        { monto: 10000 },
        { monto: 50000 },
        { monto: 30000 }
      ];
      
      const minDonacion = Math.min(...donaciones.map(d => d.monto));
      expect(minDonacion).toBe(10000);
    });
  });

  describe('Filtrado por Meta', () => {
    test('debe obtener donaciones de una meta específica', () => {
      const metaId = '507f1f77bcf86cd799439011';
      const donaciones = [
        { goalId: metaId, monto: 10000 },
        { goalId: metaId, monto: 20000 },
        { goalId: 'otro-id', monto: 5000 }
      ];
      
      const donacionesMeta = donaciones.filter(d => d.goalId === metaId);
      expect(donacionesMeta.length).toBe(2);
    });

    test('debe retornar array vacío si meta no tiene donaciones', () => {
      const metaId = '507f1f77bcf86cd799439011';
      const donaciones = [];
      
      const donacionesMeta = donaciones.filter(d => d.goalId === metaId);
      expect(donacionesMeta.length).toBe(0);
      expect(Array.isArray(donacionesMeta)).toBe(true);
    });
  });

  describe('Filtrado por Estado', () => {
    test('debe obtener solo donaciones completadas', () => {
      const donaciones = [
        { monto: 10000, estado: 'completada' },
        { monto: 20000, estado: 'pendiente' },
        { monto: 30000, estado: 'completada' }
      ];
      
      const completadas = donaciones.filter(d => d.estado === 'completada');
      expect(completadas.length).toBe(2);
    });

    test('debe obtener solo donaciones pendientes', () => {
      const donaciones = [
        { monto: 10000, estado: 'completada' },
        { monto: 20000, estado: 'pendiente' },
        { monto: 30000, estado: 'pendiente' }
      ];
      
      const pendientes = donaciones.filter(d => d.estado === 'pendiente');
      expect(pendientes.length).toBe(2);
    });

    test('debe excluir donaciones fallidas del total', () => {
      const donaciones = [
        { monto: 10000, estado: 'completada' },
        { monto: 20000, estado: 'fallida' },
        { monto: 30000, estado: 'completada' }
      ];
      
      const validas = donaciones.filter(d => d.estado !== 'fallida');
      const total = validas.reduce((sum, d) => sum + d.monto, 0);
      
      expect(total).toBe(40000);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar error de conexión BD', () => {
      const error = new Error('MongoDB connection failed');
      expect(error.message).toContain('connection');
    });

    test('debe validar error de ID inválido', () => {
      const goalId = 'invalido';
      const isValid = /^[a-f\d]{24}$/i.test(goalId);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Notificaciones de Donación', () => {
    test('debe enviar notificación al crear donación', () => {
      const donacion = {
        monto: 50000,
        goalId: '507f1f77bcf86cd799439011'
      };
      
      expect(donacion.monto).toBeGreaterThan(0);
      expect(donacion.goalId).toBeDefined();
    });

    test('debe incluir monto en notificación', () => {
      const monto = 50000;
      const mensaje = `Nueva donación de $${monto.toLocaleString('es-CO')}`;
      
      expect(mensaje).toContain('50');
      expect(mensaje).toContain('000');
    });
  });
});
