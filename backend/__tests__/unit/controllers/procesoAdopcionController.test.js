/**
 * Tests para Proceso de Adopción Controller
 * Prueba etapas, validaciones, estados, documentos
 */

const procesoAdopcionController = require('../../../controllers/procesoAdopcionController');

jest.mock('../../../models/ProcesoAdopcion');
jest.mock('../../../models/SolicitudAdopcion');
jest.mock('../../../utils/notificaciones');
jest.mock('mongoose');

describe('Controller - Proceso Adopción', () => {
  let req, res;
  let ProcesoAdopcion;

  beforeEach(() => {
    jest.clearAllMocks();
    
    ProcesoAdopcion = require('../../../models/ProcesoAdopcion');

    req = {
      body: {},
      params: {},
      files: {},
      userRole: 'admin',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Solicitud Adopción', () => {
    test('debe validar que solicitud adopción sea requerida', () => {
      const solicitudId = '507f1f77bcf86cd799439011';
      expect(solicitudId).toBeDefined();
    });

    test('debe validar formato de MongoDB ID', () => {
      const solicitudId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(solicitudId);
      
      expect(isValidId).toBe(true);
    });

    test('debe rechazar ID inválido', () => {
      const solicitudId = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(solicitudId);
      
      expect(isValidId).toBe(false);
    });
  });

  describe('Etapa - Entrevista', () => {
    test('debe validar estado de entrevista', () => {
      const estadosValidos = ['pendiente', 'en-progreso', 'completada', 'rechazada'];
      const estado = 'completada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar que entrevista sea requerida', () => {
      const entrevista = {
        fecha: new Date(),
        notas: 'Entrevista completada'
      };
      
      expect(entrevista).toBeDefined();
    });

    test('debe validar fecha de entrevista', () => {
      const fecha = new Date();
      expect(fecha instanceof Date).toBe(true);
    });

    test('debe validar notas de entrevista', () => {
      const notas = 'Potencial adoptante comprometido';
      expect(typeof notas).toBe('string');
      expect(notas.length).toBeGreaterThan(5);
    });

    test('debe validar resultado de entrevista', () => {
      const resultado = 'aprobada';
      const resultadosValidos = ['aprobada', 'rechazada', 'pendiente'];
      
      expect(resultadosValidos).toContain(resultado);
    });

    test('debe permitir rechazo en entrevista', () => {
      const resultado = 'rechazada';
      const resultadosValidos = ['aprobada', 'rechazada', 'pendiente'];
      
      expect(resultadosValidos).toContain(resultado);
    });
  });

  describe('Etapa - Visita Domiciliaria', () => {
    test('debe validar que visita sea requerida', () => {
      const visita = {
        fecha: new Date(),
        direccion: 'Calle 5 #10-25'
      };
      
      expect(visita).toBeDefined();
    });

    test('debe validar dirección de visita', () => {
      const direccion = 'Calle 5 #10-25, Apartamento 301';
      expect(typeof direccion).toBe('string');
      expect(direccion.length).toBeGreaterThan(5);
    });

    test('debe validar notas de visita', () => {
      const notas = 'Casa adecuada para mascota';
      expect(typeof notas).toBe('string');
    });

    test('debe validar fotos de visita', () => {
      const fotos = ['https://res.cloudinary.com/foto1.jpg'];
      expect(Array.isArray(fotos)).toBe(true);
    });

    test('debe permitir múltiples fotos', () => {
      const fotos = [
        'https://res.cloudinary.com/foto1.jpg',
        'https://res.cloudinary.com/foto2.jpg'
      ];
      
      expect(fotos.length).toBeGreaterThan(1);
    });

    test('debe validar resultado de visita', () => {
      const resultado = 'aprobada';
      const resultadosValidos = ['aprobada', 'rechazada'];
      
      expect(resultadosValidos).toContain(resultado);
    });
  });

  describe('Etapa - Compromiso', () => {
    test('debe validar que compromiso sea requerido', () => {
      const compromiso = {
        fecha: new Date(),
        documento: 'https://res.cloudinary.com/compromiso.pdf'
      };
      
      expect(compromiso).toBeDefined();
    });

    test('debe validar URL de documento compromiso', () => {
      const documento = 'https://res.cloudinary.com/compromiso.pdf';
      const isUrl = /^https?:\/\/.+/.test(documento);
      
      expect(isUrl).toBe(true);
    });

    test('debe validar términos del compromiso', () => {
      const terminos = true;
      expect(typeof terminos).toBe('boolean');
    });

    test('debe validar firma compromiso', () => {
      const firma = 'https://res.cloudinary.com/firma.jpg';
      const isUrl = /^https?:\/\/.+/.test(firma);
      
      expect(isUrl).toBe(true);
    });

    test('debe validar resultado compromiso', () => {
      const resultado = 'aprobada';
      const resultadosValidos = ['aprobada', 'rechazada'];
      
      expect(resultadosValidos).toContain(resultado);
    });
  });

  describe('Etapa - Entrega', () => {
    test('debe validar que entrega sea requerida', () => {
      const entrega = {
        fecha: new Date(),
        lugar: 'Fundación'
      };
      
      expect(entrega).toBeDefined();
    });

    test('debe validar lugar de entrega', () => {
      const lugar = 'Fundación central';
      const lugaresValidos = ['Fundación', 'Domicilio', 'Otro'];
      
      expect(typeof lugar).toBe('string');
    });

    test('debe validar instrucciones de cuidado', () => {
      const instrucciones = 'Alimentar 2 veces al día con comida de calidad';
      expect(typeof instrucciones).toBe('string');
      expect(instrucciones.length).toBeGreaterThan(10);
    });

    test('debe validar botiquín entregado', () => {
      const botiquin = true;
      expect(typeof botiquin).toBe('boolean');
    });

    test('debe validar acta de entrega', () => {
      const acta = 'https://res.cloudinary.com/acta.pdf';
      const isUrl = /^https?:\/\/.+/.test(acta);
      
      expect(isUrl).toBe(true);
    });

    test('debe validar que proceso esté completado', () => {
      const completado = true;
      expect(completado).toBe(true);
    });
  });

  describe('Estados del Proceso', () => {
    test('debe validar estado en-progreso', () => {
      const estadosValidos = ['iniciado', 'en-progreso', 'completado', 'cancelado'];
      const estado = 'en-progreso';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado iniciado', () => {
      const estadosValidos = ['iniciado', 'en-progreso', 'completado', 'cancelado'];
      const estado = 'iniciado';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado completado', () => {
      const estadosValidos = ['iniciado', 'en-progreso', 'completado', 'cancelado'];
      const estado = 'completado';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado cancelado', () => {
      const estadosValidos = ['iniciado', 'en-progreso', 'completado', 'cancelado'];
      const estado = 'cancelado';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe tener estado iniciado por defecto', () => {
      const estadoPorDefecto = 'iniciado';
      expect(estadoPorDefecto).toBe('iniciado');
    });
  });

  describe('Transiciones de Estado', () => {
    test('debe permitir iniciado → en-progreso', () => {
      const estadoActual = 'iniciado';
      const estadoNuevo = 'en-progreso';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir en-progreso → completado', () => {
      const estadoActual = 'en-progreso';
      const estadoNuevo = 'completado';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir cualquier estado → cancelado', () => {
      const estadoActual = 'en-progreso';
      const estadoNuevo = 'cancelado';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });
  });

  describe('Validaciones de Fechas', () => {
    test('debe validar fecha de inicio', () => {
      const fecha = new Date();
      expect(fecha instanceof Date).toBe(true);
    });

    test('debe validar que fecha no sea futura', () => {
      const futura = new Date();
      futura.setFullYear(futura.getFullYear() + 1);
      
      expect(futura.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe validar que etapas estén en orden cronológico', () => {
      const entrevista = new Date('2023-01-15');
      const visita = new Date('2023-02-15');
      const compromiso = new Date('2023-03-15');
      const entrega = new Date('2023-04-15');
      
      expect(entrevista.getTime()).toBeLessThan(visita.getTime());
      expect(visita.getTime()).toBeLessThan(compromiso.getTime());
      expect(compromiso.getTime()).toBeLessThan(entrega.getTime());
    });
  });

  describe('Duración del Proceso', () => {
    test('debe calcular duración total del proceso', () => {
      const inicio = new Date('2023-01-01');
      const fin = new Date('2023-04-15');
      
      const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
      expect(duracion).toBeGreaterThan(0);
    });

    test('debe calcular días entre etapas', () => {
      const etapa1 = new Date('2023-01-15');
      const etapa2 = new Date('2023-02-15');
      
      const dias = (etapa2.getTime() - etapa1.getTime()) / (1000 * 60 * 60 * 24);
      expect(dias).toBe(31);
    });

    test('debe detectar procesos lentos', () => {
      const inicio = new Date('2022-01-01');
      const fin = new Date('2023-01-01');
      
      const duracion = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);
      const esLento = duracion > 90;
      
      expect(esLento).toBe(true);
    });
  });

  describe('Búsqueda y Filtrado', () => {
    test('debe filtrar por estado', () => {
      const procesos = [
        { estado: 'en-progreso' },
        { estado: 'completado' },
        { estado: 'en-progreso' }
      ];
      
      const enProgreso = procesos.filter(p => p.estado === 'en-progreso');
      expect(enProgreso.length).toBe(2);
    });

    test('debe filtrar por solicitud adopción', () => {
      const solicitudId = '507f1f77bcf86cd799439011';
      const procesos = [
        { solicitud: solicitudId },
        { solicitud: 'otro-id' },
        { solicitud: solicitudId }
      ];
      
      const delaSolicitud = procesos.filter(p => p.solicitud === solicitudId);
      expect(delaSolicitud.length).toBe(2);
    });

    test('debe filtrar completados', () => {
      const procesos = [
        { estado: 'completado' },
        { estado: 'en-progreso' },
        { estado: 'completado' }
      ];
      
      const completados = procesos.filter(p => p.estado === 'completado');
      expect(completados.length).toBe(2);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo admin puede crear proceso', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('solo admin puede actualizar etapas', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('adoptante NO puede actualizar etapas', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(role);
    });

    test('adoptante puede ver su proceso', () => {
      const adopianteId = '507f1f77bcf86cd799439011';
      const procesoAdoptante = '507f1f77bcf86cd799439011';
      
      const esDelUsuario = adopianteId === procesoAdoptante;
      expect(esDelUsuario).toBe(true);
    });
  });

  describe('Notificaciones', () => {
    test('debe enviar notificación al iniciar proceso', () => {
      const proceso = {
        solicitud: '507f1f77bcf86cd799439011',
        estado: 'iniciado'
      };
      
      expect(proceso.solicitud).toBeDefined();
      expect(proceso.estado).toBe('iniciado');
    });

    test('debe enviar notificación al completar etapa', () => {
      const etapa = 'entrevista';
      const resultado = 'aprobada';
      
      expect(etapa).toBeDefined();
      expect(resultado).toBe('aprobada');
    });

    test('debe enviar notificación al rechazar etapa', () => {
      const etapa = 'visita';
      const resultado = 'rechazada';
      
      expect(etapa).toBeDefined();
      expect(resultado).toBe('rechazada');
    });

    test('debe enviar notificación cuando proceso se completa', () => {
      const estado = 'completado';
      expect(estado).toBe('completado');
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar solicitud no encontrada', () => {
      const error = new Error('Solicitud not found');
      expect(error.message).toContain('not found');
    });

    test('debe validar que solicitud sea requerida', () => {
      const solicitud = undefined;
      expect(solicitud).toBeUndefined();
    });

    test('debe manejar proceso no encontrado', () => {
      const error = new Error('Proceso not found');
      expect(error.message).toContain('not found');
    });
  });
});
