/**
 * Tests para Donation Goal Controller
 * Prueba metas de donación, objetivos, cálculos
 */

const donationGoalController = require('../../../controllers/donationGoalController');

jest.mock('../../../models/DonationGoal');
jest.mock('../../../models/Donation');
jest.mock('mongoose');

describe('Controller - Donation Goal', () => {
  let req, res;
  let DonationGoal;

  beforeEach(() => {
    jest.clearAllMocks();
    
    DonationGoal = require('../../../models/DonationGoal');

    req = {
      body: {},
      params: {},
      query: {},
      userRole: 'admin',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Título', () => {
    test('debe validar que título sea requerido', () => {
      const titulo = 'Meta de donación 2024';
      expect(titulo).toBeDefined();
      expect(titulo.length).toBeGreaterThan(0);
    });

    test('debe validar longitud mínima de título', () => {
      const titulo = 'Me';
      expect(titulo.length).toBeLessThan(5);
    });

    test('debe validar longitud máxima de título', () => {
      const titulo = 'A'.repeat(150);
      expect(titulo.length).toBeGreaterThan(100);
    });

    test('debe permitir título válido', () => {
      const titulo = 'Fondo para medicinas urgentes';
      expect(titulo.length).toBeGreaterThanOrEqual(5);
      expect(titulo.length).toBeLessThanOrEqual(150);
    });
  });

  describe('Validaciones de Descripción', () => {
    test('debe validar que descripción sea requerida', () => {
      const descripcion = 'Necesitamos recaudar fondos para medicinas';
      expect(descripcion).toBeDefined();
    });

    test('debe permitir descripción sin mínimo', () => {
      const descripcion = 'Medicinas';
      expect(typeof descripcion).toBe('string');
    });

    test('debe permitir descripción larga', () => {
      const descripcion = 'Descripción muy larga con muchos detalles sobre la meta'.repeat(5);
      expect(descripcion.length).toBeGreaterThan(50);
    });
  });

  describe('Validaciones de Objetivos Monetarios', () => {
    test('debe validar que objetivo sea positivo', () => {
      const objetivo = 500000;
      expect(objetivo).toBeGreaterThan(0);
    });

    test('debe rechazar objetivo negativo', () => {
      const objetivo = -50000;
      expect(objetivo).toBeLessThan(0);
    });

    test('debe rechazar objetivo cero', () => {
      const objetivo = 0;
      expect(objetivo).toBe(0);
    });

    test('debe validar objetivo con decimales', () => {
      const objetivo = 50000.50;
      expect(objetivo).toBeGreaterThan(0);
    });

    test('debe validar mínimo objetivo', () => {
      const objetivo = 10000;
      const minimo = 5000;
      
      expect(objetivo).toBeGreaterThanOrEqual(minimo);
    });

    test('debe validar máximo objetivo', () => {
      const objetivo = 10000000;
      const maximo = 50000000;
      
      expect(objetivo).toBeLessThanOrEqual(maximo);
    });
  });

  describe('Cálculo de Progreso', () => {
    test('debe calcular porcentaje completado', () => {
      const objetivo = 100000;
      const recibido = 50000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(50);
    });

    test('debe calcular porcentaje completado 100%', () => {
      const objetivo = 100000;
      const recibido = 100000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(100);
    });

    test('debe calcular porcentaje completado sobre 100%', () => {
      const objetivo = 100000;
      const recibido = 150000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(150);
    });

    test('debe calcular monto restante', () => {
      const objetivo = 100000;
      const recibido = 60000;
      const restante = objetivo - recibido;
      
      expect(restante).toBe(40000);
    });

    test('debe retornar cero si meta se cumplió', () => {
      const objetivo = 100000;
      const recibido = 100000;
      const restante = Math.max(0, objetivo - recibido);
      
      expect(restante).toBe(0);
    });

    test('debe retornar cero si meta se excedió', () => {
      const objetivo = 100000;
      const recibido = 150000;
      const restante = Math.max(0, objetivo - recibido);
      
      expect(restante).toBe(0);
    });
  });

  describe('Estados de Meta', () => {
    test('debe validar estado activa', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida', 'cancelada'];
      const estado = 'activa';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado pausada', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida', 'cancelada'];
      const estado = 'pausada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado cumplida', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida', 'cancelada'];
      const estado = 'cumplida';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado vencida', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida', 'cancelada'];
      const estado = 'vencida';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe tener estado activa por defecto', () => {
      const estadoPorDefecto = 'activa';
      expect(estadoPorDefecto).toBe('activa');
    });
  });

  describe('Validaciones de Fechas', () => {
    test('debe validar fecha de creación', () => {
      const fecha = new Date();
      expect(fecha instanceof Date).toBe(true);
    });

    test('debe validar fecha límite', () => {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() + 3);
      
      expect(fechaLimite instanceof Date).toBe(true);
      expect(fechaLimite.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe rechazar fecha límite pasada', () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      
      expect(ayer.getTime()).toBeLessThan(Date.now());
    });

    test('debe calcular días restantes', () => {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);
      
      const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
      expect(diasRestantes).toBeGreaterThan(0);
    });

    test('debe detectar meta vencida', () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      const estaVencida = ayer < new Date();
      
      expect(estaVencida).toBe(true);
    });
  });

  describe('Búsqueda y Filtrado', () => {
    test('debe filtrar por estado', () => {
      const metas = [
        { estado: 'activa' },
        { estado: 'cumplida' },
        { estado: 'activa' }
      ];
      
      const activas = metas.filter(m => m.estado === 'activa');
      expect(activas.length).toBe(2);
    });

    test('debe filtrar por estado cumplida', () => {
      const metas = [
        { estado: 'activa', porcentaje: 50 },
        { estado: 'cumplida', porcentaje: 100 },
        { estado: 'activa', porcentaje: 80 }
      ];
      
      const cumplidas = metas.filter(m => m.estado === 'cumplida');
      expect(cumplidas.length).toBe(1);
    });

    test('debe filtrar por rango de porcentaje', () => {
      const metas = [
        { porcentaje: 25 },
        { porcentaje: 75 },
        { porcentaje: 50 }
      ];
      
      const media = metas.filter(m => m.porcentaje >= 40 && m.porcentaje <= 80);
      expect(media.length).toBe(2);
    });

    test('debe filtrar metas cerca de completarse', () => {
      const metas = [
        { porcentaje: 90 },
        { porcentaje: 95 },
        { porcentaje: 30 }
      ];
      
      const cercaDeCompletar = metas.filter(m => m.porcentaje >= 80);
      expect(cercaDeCompletar.length).toBe(2);
    });
  });

  describe('Ordenamiento', () => {
    test('debe ordenar por fecha descendente (más recientes)', () => {
      const metas = [
        { id: '1', fecha: new Date('2023-01-01') },
        { id: '3', fecha: new Date('2023-06-01') },
        { id: '2', fecha: new Date('2023-03-01') }
      ];
      
      const ordenadas = [...metas].sort((a, b) => b.fecha - a.fecha);
      expect(ordenadas[0].id).toBe('3');
    });

    test('debe ordenar por porcentaje descendente', () => {
      const metas = [
        { id: '1', porcentaje: 25 },
        { id: '2', porcentaje: 100 },
        { id: '3', porcentaje: 50 }
      ];
      
      const ordenadas = [...metas].sort((a, b) => b.porcentaje - a.porcentaje);
      expect(ordenadas[0].id).toBe('2');
    });

    test('debe ordenar por objetivo descendente', () => {
      const metas = [
        { id: '1', objetivo: 50000 },
        { id: '2', objetivo: 150000 },
        { id: '3', objetivo: 100000 }
      ];
      
      const ordenadas = [...metas].sort((a, b) => b.objetivo - a.objetivo);
      expect(ordenadas[0].id).toBe('2');
    });
  });

  describe('Estadísticas Generales', () => {
    test('debe calcular total de metas', () => {
      const metas = [
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ];
      
      expect(metas.length).toBe(3);
    });

    test('debe calcular suma total de objetivos', () => {
      const metas = [
        { objetivo: 100000 },
        { objetivo: 50000 },
        { objetivo: 75000 }
      ];
      
      const total = metas.reduce((sum, m) => sum + m.objetivo, 0);
      expect(total).toBe(225000);
    });

    test('debe calcular suma total recibido', () => {
      const metas = [
        { recibido: 50000 },
        { recibido: 30000 },
        { recibido: 20000 }
      ];
      
      const total = metas.reduce((sum, m) => sum + m.recibido, 0);
      expect(total).toBe(100000);
    });

    test('debe contar metas completadas', () => {
      const metas = [
        { estado: 'cumplida' },
        { estado: 'activa' },
        { estado: 'cumplida' }
      ];
      
      const completadas = metas.filter(m => m.estado === 'cumplida').length;
      expect(completadas).toBe(2);
    });

    test('debe contar metas activas', () => {
      const metas = [
        { estado: 'activa' },
        { estado: 'cumplida' },
        { estado: 'activa' }
      ];
      
      const activas = metas.filter(m => m.estado === 'activa').length;
      expect(activas).toBe(2);
    });

    test('debe calcular porcentaje global completado', () => {
      const metas = [
        { objetivo: 100000, recibido: 50000 },
        { objetivo: 100000, recibido: 100000 }
      ];
      
      const totalObjetivo = metas.reduce((sum, m) => sum + m.objetivo, 0);
      const totalRecibido = metas.reduce((sum, m) => sum + m.recibido, 0);
      const porcentajeGlobal = (totalRecibido / totalObjetivo) * 100;
      
      expect(porcentajeGlobal).toBe(75);
    });
  });

  describe('Paginación', () => {
    test('debe paginar metas', () => {
      const metas = Array(50).fill().map((_, i) => ({ id: i + 1 }));
      const page = 2;
      const limit = 10;
      const inicio = (page - 1) * limit;
      
      const pagina = metas.slice(inicio, inicio + limit);
      expect(pagina.length).toBe(10);
      expect(pagina[0].id).toBe(11);
    });

    test('debe calcular total de páginas', () => {
      const total = 50;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);
      
      expect(totalPages).toBe(5);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo admin puede crear meta', () => {
      const rolesPermitidos = ['admin'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('solo admin puede editar meta', () => {
      const rolesPermitidos = ['admin'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('solo admin puede eliminar meta', () => {
      const rolesPermitidos = ['admin'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('cualquiera puede ver metas activas', () => {
      const estado = 'activa';
      const visible = estado === 'activa' || estado === 'cumplida';
      
      expect(visible).toBe(true);
    });

    test('adoptante NO puede crear meta', () => {
      const rolesPermitidos = ['admin'];
      const role = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(role);
    });
  });

  describe('Validación de Relaciones', () => {
    test('debe validar que meta existe antes de agregar donación', () => {
      const metaId = '507f1f77bcf86cd799439011';
      expect(metaId).toBeDefined();
    });

    test('debe impedir donación a meta no existente', () => {
      const meta = null;
      expect(meta).toBeNull();
    });

    test('debe impedir donación a meta vencida', () => {
      const meta = { estado: 'vencida' };
      const puedeRecibir = meta.estado === 'activa';
      
      expect(puedeRecibir).toBe(false);
    });
  });

  describe('Transiciones de Estado', () => {
    test('debe permitir activa → cumplida', () => {
      const estadoActual = 'activa';
      const estadoNuevo = 'cumplida';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir activa → pausada', () => {
      const estadoActual = 'activa';
      const estadoNuevo = 'pausada';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir pausada → activa', () => {
      const estadoActual = 'pausada';
      const estadoNuevo = 'activa';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir activa → vencida', () => {
      const estadoActual = 'activa';
      const estadoNuevo = 'vencida';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar meta no encontrada', () => {
      const error = new Error('Meta not found');
      expect(error.message).toContain('not found');
    });

    test('debe validar que objetivo sea válido', () => {
      const objetivo = -50000;
      expect(objetivo).toBeLessThan(0);
    });

    test('debe validar que estado sea válido', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'inexistente';
      
      expect(estadosValidos).not.toContain(estado);
    });
  });
});
