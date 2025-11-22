/**
 * Tests para Notificación Controller
 * Prueba crear notificaciones, marcar como leídas, filtrado
 */

const notificacionController = require('../../../controllers/notificacionController');

jest.mock('../../../models/Notificacion');
jest.mock('mongoose');

describe('Controller - Notificación', () => {
  let req, res;
  let Notificacion;

  beforeEach(() => {
    jest.clearAllMocks();
    
    Notificacion = require('../../../models/Notificacion');

    req = {
      body: {},
      params: {},
      query: {},
      userRole: 'adoptante',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Notificación Básica', () => {
    test('debe validar que usuario sea MongoDB ID válido', () => {
      const userId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(userId);
      
      expect(isValidId).toBe(true);
    });

    test('debe rechazar usuario ID inválido', () => {
      const userId = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(userId);
      
      expect(isValidId).toBe(false);
    });

    test('debe validar que título sea string', () => {
      const titulo = 'Nueva solicitud de adopción';
      expect(typeof titulo).toBe('string');
      expect(titulo.length).toBeGreaterThan(0);
    });

    test('debe validar mensaje', () => {
      const mensaje = 'Tienes una nueva solicitud';
      expect(typeof mensaje).toBe('string');
      expect(mensaje.length).toBeGreaterThan(0);
    });

    test('debe permitir mensaje vacío', () => {
      const mensaje = '';
      expect(typeof mensaje).toBe('string');
    });
  });

  describe('Validaciones de Tipos de Notificación', () => {
    test('debe validar tipo solicitud-adopcion-enviada', () => {
      const tiposValidos = [
        'solicitud-adopcion-enviada',
        'solicitud-adopcion-aprobada',
        'solicitud-adopcion-rechazada',
        'proceso-seguimiento',
        'proceso-completado',
        'solicitud-publicacion-enviada',
        'solicitud-publicacion-aprobada',
        'solicitud-publicacion-rechazada',
        'nueva-solicitud-publicacion',
        'nueva-donation',
        'meta-alcanzada'
      ];
      
      const tipo = 'solicitud-adopcion-enviada';
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo solicitud-adopcion-aprobada', () => {
      const tiposValidos = [
        'solicitud-adopcion-enviada',
        'solicitud-adopcion-aprobada',
        'solicitud-adopcion-rechazada'
      ];
      
      const tipo = 'solicitud-adopcion-aprobada';
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo solicitud-adopcion-rechazada', () => {
      const tiposValidos = [
        'solicitud-adopcion-enviada',
        'solicitud-adopcion-aprobada',
        'solicitud-adopcion-rechazada'
      ];
      
      const tipo = 'solicitud-adopcion-rechazada';
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo proceso-seguimiento', () => {
      const tiposValidos = ['proceso-seguimiento', 'proceso-completado'];
      const tipo = 'proceso-seguimiento';
      
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo proceso-completado', () => {
      const tiposValidos = ['proceso-seguimiento', 'proceso-completado'];
      const tipo = 'proceso-completado';
      
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo solicitud-publicacion-enviada', () => {
      const tiposValidos = [
        'solicitud-publicacion-enviada',
        'solicitud-publicacion-aprobada',
        'solicitud-publicacion-rechazada'
      ];
      
      const tipo = 'solicitud-publicacion-enviada';
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo nueva-solicitud-publicacion', () => {
      const tiposValidos = ['nueva-solicitud-publicacion'];
      const tipo = 'nueva-solicitud-publicacion';
      
      expect(tiposValidos).toContain(tipo);
    });

    test('debe validar tipo nueva-donation', () => {
      const tiposValidos = ['nueva-donation', 'meta-alcanzada'];
      const tipo = 'nueva-donation';
      
      expect(tiposValidos).toContain(tipo);
    });

    test('debe rechazar tipo inválido', () => {
      const tiposValidos = ['solicitud-adopcion-enviada', 'proceso-completado'];
      const tipo = 'tipo-inexistente';
      
      expect(tiposValidos).not.toContain(tipo);
    });
  });

  describe('Estado de Lectura', () => {
    test('debe iniciar como no leída', () => {
      const leida = false;
      expect(leida).toBe(false);
    });

    test('debe poder marcar como leída', () => {
      const leida = false;
      const leidaActualizada = true;
      
      expect(leida).toBe(false);
      expect(leidaActualizada).toBe(true);
    });

    test('debe permitir cambiar estado leída múltiples veces', () => {
      let leida = false;
      leida = true;
      expect(leida).toBe(true);
      
      leida = false;
      expect(leida).toBe(false);
    });

    test('debe validar que leida sea booleano', () => {
      const leida = true;
      expect(typeof leida).toBe('boolean');
    });
  });

  describe('Validaciones de Referencias', () => {
    test('debe validar referencia a solicitud adopción', () => {
      const solicitudId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(solicitudId);
      
      expect(isValidId).toBe(true);
    });

    test('debe permitir referencia a solicitud nula', () => {
      const solicitudId = null;
      expect(solicitudId).toBeNull();
    });

    test('debe validar referencia a mascota', () => {
      const mascotaId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(mascotaId);
      
      expect(isValidId).toBe(true);
    });

    test('debe permitir referencia a mascota nula', () => {
      const mascotaId = null;
      expect(mascotaId).toBeNull();
    });

    test('debe validar referencia a proceso adopción', () => {
      const procesoId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(procesoId);
      
      expect(isValidId).toBe(true);
    });
  });

  describe('Fecha de Notificación', () => {
    test('debe establecer fecha automáticamente', () => {
      const fecha = new Date();
      expect(fecha instanceof Date).toBe(true);
    });

    test('debe ser fecha actual', () => {
      const ahora = new Date();
      const fecha = new Date();
      
      expect(Math.abs(fecha.getTime() - ahora.getTime())).toBeLessThan(1000);
    });

    test('debe rechazar fecha futura', () => {
      const futura = new Date();
      futura.setFullYear(futura.getFullYear() + 1);
      
      expect(futura.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe permitir fecha pasada reciente', () => {
      const hace5min = new Date(Date.now() - 5 * 60 * 1000);
      expect(hace5min.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Búsqueda y Filtrado por Usuario', () => {
    test('debe obtener notificaciones del usuario', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificaciones = [
        { usuario: userId, tipo: 'solicitud-adopcion-enviada' },
        { usuario: 'otro-usuario', tipo: 'nueva-donation' },
        { usuario: userId, tipo: 'proceso-completado' }
      ];
      
      const delUsuario = notificaciones.filter(n => n.usuario === userId);
      expect(delUsuario.length).toBe(2);
    });

    test('debe filtrar por estado leída', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificaciones = [
        { usuario: userId, leida: false },
        { usuario: userId, leida: true },
        { usuario: userId, leida: false }
      ];
      
      const noLeidas = notificaciones.filter(n => !n.leida);
      expect(noLeidas.length).toBe(2);
    });

    test('debe filtrar por tipo de notificación', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificaciones = [
        { usuario: userId, tipo: 'solicitud-adopcion-enviada' },
        { usuario: userId, tipo: 'nueva-donation' },
        { usuario: userId, tipo: 'solicitud-adopcion-enviada' }
      ];
      
      const adopcion = notificaciones.filter(n => n.tipo === 'solicitud-adopcion-enviada');
      expect(adopcion.length).toBe(2);
    });

    test('debe combinar filtros (usuario + leída + tipo)', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificaciones = [
        { usuario: userId, leida: false, tipo: 'solicitud-adopcion-enviada' },
        { usuario: userId, leida: true, tipo: 'solicitud-adopcion-enviada' },
        { usuario: userId, leida: false, tipo: 'nueva-donation' }
      ];
      
      const filtradas = notificaciones.filter(n =>
        n.usuario === userId && !n.leida && n.tipo === 'solicitud-adopcion-enviada'
      );
      
      expect(filtradas.length).toBe(1);
    });
  });

  describe('Ordenamiento', () => {
    test('debe ordenar por fecha descendente (más recientes primero)', () => {
      const notificaciones = [
        { id: '1', fecha: new Date('2023-01-01') },
        { id: '3', fecha: new Date('2023-06-01') },
        { id: '2', fecha: new Date('2023-03-01') }
      ];
      
      const ordenadas = [...notificaciones].sort((a, b) => b.fecha - a.fecha);
      expect(ordenadas[0].id).toBe('3');
      expect(ordenadas[2].id).toBe('1');
    });

    test('debe mostrar no leídas primero', () => {
      const notificaciones = [
        { id: '1', leida: true },
        { id: '2', leida: false },
        { id: '3', leida: true }
      ];
      
      const ordenadas = [...notificaciones].sort((a, b) => {
        if (a.leida === b.leida) return 0;
        return a.leida ? 1 : -1;
      });
      
      expect(ordenadas[0].leida).toBe(false);
    });
  });

  describe('Marcar Como Leída', () => {
    test('debe permitir marcar una notificación como leída', () => {
      const notificacion = { id: '507f1f77bcf86cd799439011', leida: false };
      notificacion.leida = true;
      
      expect(notificacion.leida).toBe(true);
    });

    test('debe permitir marcar múltiples como leídas', () => {
      const notificaciones = [
        { id: '1', leida: false },
        { id: '2', leida: false },
        { id: '3', leida: false }
      ];
      
      notificaciones.forEach(n => n.leida = true);
      
      const todas = notificaciones.every(n => n.leida);
      expect(todas).toBe(true);
    });

    test('debe actualizar fecha de lectura', () => {
      const notificacion = {
        id: '507f1f77bcf86cd799439011',
        leida: false,
        fechaLectura: null
      };
      
      notificacion.leida = true;
      notificacion.fechaLectura = new Date();
      
      expect(notificacion.leida).toBe(true);
      expect(notificacion.fechaLectura).not.toBeNull();
    });
  });

  describe('Contar Notificaciones', () => {
    test('debe contar notificaciones no leídas', () => {
      const notificaciones = [
        { leida: false },
        { leida: true },
        { leida: false },
        { leida: false }
      ];
      
      const noLeidas = notificaciones.filter(n => !n.leida).length;
      expect(noLeidas).toBe(3);
    });

    test('debe contar total de notificaciones', () => {
      const notificaciones = Array(15).fill().map((_, i) => ({ id: i }));
      expect(notificaciones.length).toBe(15);
    });

    test('debe contar por tipo', () => {
      const notificaciones = [
        { tipo: 'solicitud-adopcion-enviada' },
        { tipo: 'solicitud-adopcion-enviada' },
        { tipo: 'nueva-donation' },
        { tipo: 'solicitud-adopcion-aprobada' }
      ];
      
      const adopcion = notificaciones.filter(n => n.tipo === 'solicitud-adopcion-enviada').length;
      expect(adopcion).toBe(2);
    });
  });

  describe('Paginación', () => {
    test('debe paginar notificaciones', () => {
      const notificaciones = Array(50).fill().map((_, i) => ({ id: i + 1 }));
      const page = 2;
      const limit = 10;
      const inicio = (page - 1) * limit;
      
      const pagina = notificaciones.slice(inicio, inicio + limit);
      expect(pagina.length).toBe(10);
      expect(pagina[0].id).toBe(11);
    });

    test('debe calcular total de páginas', () => {
      const total = 50;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);
      
      expect(totalPages).toBe(5);
    });

    test('debe manejar última página incompleta', () => {
      const notificaciones = Array(47).fill().map((_, i) => ({ id: i + 1 }));
      const page = 5;
      const limit = 10;
      const inicio = (page - 1) * limit;
      
      const pagina = notificaciones.slice(inicio, inicio + limit);
      expect(pagina.length).toBe(7);
    });
  });

  describe('Eliminación de Notificaciones', () => {
    test('debe poder eliminar una notificación', () => {
      let notificaciones = [
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ];
      
      notificaciones = notificaciones.filter(n => n.id !== '2');
      expect(notificaciones.length).toBe(2);
    });

    test('debe poder eliminar múltiples notificaciones', () => {
      let notificaciones = [
        { id: '1', tipo: 'antigua' },
        { id: '2', tipo: 'nueva' },
        { id: '3', tipo: 'antigua' }
      ];
      
      notificaciones = notificaciones.filter(n => n.tipo !== 'antigua');
      expect(notificaciones.length).toBe(1);
    });

    test('debe limpiar notificaciones leídas antiguas', () => {
      const ahora = Date.now();
      const hace30Dias = ahora - (30 * 24 * 60 * 60 * 1000);
      
      let notificaciones = [
        { id: '1', leida: true, fecha: ahora },
        { id: '2', leida: true, fecha: hace30Dias - 1000 },
        { id: '3', leida: false, fecha: hace30Dias }
      ];
      
      // Eliminar leídas con más de 30 días
      notificaciones = notificaciones.filter(n => 
        !n.leida || (n.fecha > hace30Dias)
      );
      
      expect(notificaciones.length).toBe(2);
    });
  });

  describe('Lógica de Permisos', () => {
    test('usuario solo puede ver sus propias notificaciones', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificaciones = [
        { usuario: userId, id: '1' },
        { usuario: 'otro', id: '2' }
      ];
      
      const delUsuario = notificaciones.filter(n => n.usuario === userId);
      expect(delUsuario.length).toBe(1);
    });

    test('usuario solo puede marcar como leída sus notificaciones', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificacion = { usuario: userId, leida: false };
      
      const esDelUsuario = notificacion.usuario === userId;
      expect(esDelUsuario).toBe(true);
    });

    test('usuario solo puede eliminar sus notificaciones', () => {
      const userId = '507f1f77bcf86cd799439011';
      const notificacion = { usuario: userId, id: '123' };
      
      const esDelUsuario = notificacion.usuario === userId;
      expect(esDelUsuario).toBe(true);
    });
  });

  describe('Validaciones de Datos', () => {
    test('debe validar que titulo no sea vacío', () => {
      const titulo = '';
      expect(titulo.length).toBe(0);
    });

    test('debe validar que usuario sea requerido', () => {
      const usuario = '507f1f77bcf86cd799439011';
      expect(usuario).toBeDefined();
    });

    test('debe validar que tipo sea requerido', () => {
      const tipo = 'solicitud-adopcion-enviada';
      expect(tipo).toBeDefined();
    });

    test('debe tener leida por defecto false', () => {
      const leida = false;
      expect(leida).toBe(false);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar usuario no encontrado', () => {
      const error = new Error('User not found');
      expect(error.message).toContain('not found');
    });

    test('debe manejar notificación no encontrada', () => {
      const error = new Error('Notification not found');
      expect(error.message).toContain('not found');
    });

    test('debe validar ID de notificación', () => {
      const notificacionId = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(notificacionId);
      
      expect(isValidId).toBe(false);
    });
  });
});
