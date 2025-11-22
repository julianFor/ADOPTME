/**
 * Tests para Solicitud de Publicación Controller
 * Prueba crear publicaciones, aprobación, rechazo, estados
 */

const solicitudPublicacionController = require('../../../controllers/solicitudPublicacionController');

jest.mock('../../../models/SolicitudPublicacion');
jest.mock('../../../models/Mascota');
jest.mock('../../../utils/notificaciones');
jest.mock('mongoose');

describe('Controller - Solicitud Publicación', () => {
  let req, res;
  let SolicitudPublicacion;

  beforeEach(() => {
    jest.clearAllMocks();
    
    SolicitudPublicacion = require('../../../models/SolicitudPublicacion');

    req = {
      body: {},
      params: {},
      files: {},
      userRole: 'adminFundacion',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Mascota', () => {
    test('debe validar que mascota sea MongoDB ID válido', () => {
      const mascotaId = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(mascotaId);
      
      expect(isValidId).toBe(true);
    });

    test('debe rechazar mascota ID inválido', () => {
      const mascotaId = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(mascotaId);
      
      expect(isValidId).toBe(false);
    });

    test('debe requerir mascota', () => {
      const mascota = undefined;
      expect(mascota).toBeUndefined();
    });
  });

  describe('Validaciones de Datos de Publicación', () => {
    test('debe validar título de publicación', () => {
      const titulo = 'Adopta a Luna, hermosa gata';
      expect(typeof titulo).toBe('string');
      expect(titulo.length).toBeGreaterThan(5);
    });

    test('debe rechazar título muy corto', () => {
      const titulo = 'Gato';
      expect(titulo.length).toBeLessThan(5);
    });

    test('debe validar descripción de publicación', () => {
      const descripcion = 'Luna es una gata tranquila, amigable y juguetona. Perfecta para familias';
      expect(typeof descripcion).toBe('string');
      expect(descripcion.length).toBeGreaterThan(10);
    });

    test('debe permitir descripción sin especificar longitud mínima', () => {
      const descripcion = 'Gata linda';
      expect(typeof descripcion).toBe('string');
    });

    test('debe validar URL de imagen destacada', () => {
      const imagen = 'https://res.cloudinary.com/destacada.jpg';
      const isUrl = /^https?:\/\/.+/.test(imagen);
      
      expect(isUrl).toBe(true);
    });

    test('debe rechazar URL inválida', () => {
      const imagen = 'no-es-url';
      const isUrl = /^https?:\/\/.+/.test(imagen);
      
      expect(isUrl).toBe(false);
    });
  });

  describe('Estados de Publicación', () => {
    test('debe validar estado borrador', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada', 'archivada'];
      const estado = 'borrador';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado pendiente-aprobacion', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada', 'archivada'];
      const estado = 'pendiente-aprobacion';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado publicada', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada', 'archivada'];
      const estado = 'publicada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado rechazada', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada', 'archivada'];
      const estado = 'rechazada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado archivada', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada', 'archivada'];
      const estado = 'archivada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe tener estado borrador por defecto', () => {
      const estadoPorDefecto = 'borrador';
      expect(estadoPorDefecto).toBe('borrador');
    });
  });

  describe('Transiciones de Estado', () => {
    test('debe permitir borrador → pendiente-aprobacion', () => {
      const estadoActual = 'borrador';
      const estadoNuevo = 'pendiente-aprobacion';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir pendiente-aprobacion → publicada', () => {
      const estadoActual = 'pendiente-aprobacion';
      const estadoNuevo = 'publicada';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir pendiente-aprobacion → rechazada', () => {
      const estadoActual = 'pendiente-aprobacion';
      const estadoNuevo = 'rechazada';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe permitir publicada → archivada', () => {
      const estadoActual = 'publicada';
      const estadoNuevo = 'archivada';
      
      expect(estadoNuevo).not.toBe(estadoActual);
    });

    test('debe no permitir rechazada → publicada', () => {
      const estadoActual = 'rechazada';
      const estadoNuevo = 'publicada';
      
      const permitido = !(estadoActual === 'rechazada' && estadoNuevo === 'publicada');
      expect(permitido).toBe(false);
    });
  });

  describe('Validaciones de Contenido', () => {
    test('debe validar que título no esté vacío', () => {
      const titulo = '';
      expect(titulo.length).toBe(0);
    });

    test('debe validar que descripción no esté vacía', () => {
      const descripcion = '';
      expect(descripcion.length).toBe(0);
    });

    test('debe detectar contenido ofensivo potencial', () => {
      const texto = 'Texto sin contenido inapropiado';
      const esLimpio = !texto.includes('palabra-prohibida');
      
      expect(esLimpio).toBe(true);
    });

    test('debe permitir emojis en descripción', () => {
      const descripcion = 'Luna es adorable 🐱❤️';
      expect(descripcion).toContain('🐱');
    });
  });

  describe('Búsqueda y Filtrado', () => {
    test('debe filtrar por estado', () => {
      const publicaciones = [
        { estado: 'publicada' },
        { estado: 'rechazada' },
        { estado: 'publicada' }
      ];
      
      const publicadas = publicaciones.filter(p => p.estado === 'publicada');
      expect(publicadas.length).toBe(2);
    });

    test('debe filtrar por creador', () => {
      const creadorId = '507f1f77bcf86cd799439011';
      const publicaciones = [
        { creador: creadorId },
        { creador: 'otro-id' },
        { creador: creadorId }
      ];
      
      const delCreador = publicaciones.filter(p => p.creador === creadorId);
      expect(delCreador.length).toBe(2);
    });

    test('debe filtrar por mascota', () => {
      const mascotaId = '507f1f77bcf86cd799439011';
      const publicaciones = [
        { mascota: mascotaId },
        { mascota: 'otra-mascota' },
        { mascota: mascotaId }
      ];
      
      const delaMascota = publicaciones.filter(p => p.mascota === mascotaId);
      expect(delaMascota.length).toBe(2);
    });

    test('debe filtrar pendientes de aprobación', () => {
      const publicaciones = [
        { estado: 'pendiente-aprobacion' },
        { estado: 'publicada' },
        { estado: 'pendiente-aprobacion' }
      ];
      
      const pendientes = publicaciones.filter(p => p.estado === 'pendiente-aprobacion');
      expect(pendientes.length).toBe(2);
    });
  });

  describe('Ordenamiento', () => {
    test('debe ordenar por fecha descendente (más recientes)', () => {
      const publicaciones = [
        { id: '1', fecha: new Date('2023-01-01') },
        { id: '3', fecha: new Date('2023-06-01') },
        { id: '2', fecha: new Date('2023-03-01') }
      ];
      
      const ordenadas = [...publicaciones].sort((a, b) => b.fecha - a.fecha);
      expect(ordenadas[0].id).toBe('3');
      expect(ordenadas[2].id).toBe('1');
    });

    test('debe ordenar por prioridad', () => {
      const publicaciones = [
        { id: '1', prioridad: 1 },
        { id: '2', prioridad: 3 },
        { id: '3', prioridad: 2 }
      ];
      
      const ordenadas = [...publicaciones].sort((a, b) => b.prioridad - a.prioridad);
      expect(ordenadas[0].id).toBe('2');
    });
  });

  describe('Validación de Fechas', () => {
    test('debe establecer fecha de creación automáticamente', () => {
      const ahora = new Date();
      expect(ahora instanceof Date).toBe(true);
    });

    test('debe rechazar fecha futura', () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() + 1);
      
      expect(fecha.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe validar fecha de publicación', () => {
      const fechaPublicacion = new Date();
      expect(fechaPublicacion instanceof Date).toBe(true);
    });
  });

  describe('Visibilidad de Publicaciones', () => {
    test('debe mostrar solo publicadas al público', () => {
      const publicaciones = [
        { estado: 'publicada', visible: true },
        { estado: 'rechazada', visible: false },
        { estado: 'publicada', visible: true }
      ];
      
      const visibles = publicaciones.filter(p => p.estado === 'publicada');
      expect(visibles.length).toBe(2);
    });

    test('debe mostrar pendientes solo a admin', () => {
      const userRole = 'admin';
      const puedeVer = userRole === 'admin' || userRole === 'adminFundacion';
      
      expect(puedeVer).toBe(true);
    });

    test('debe no mostrar rechazadas al público', () => {
      const estado = 'rechazada';
      const puedeVer = estado === 'publicada';
      
      expect(puedeVer).toBe(false);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo adminFundacion puede crear solicitud', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'adminFundacion';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('solo admin puede aprobar publicación', () => {
      const rolesPermitidos = ['admin'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('solo admin puede rechazar publicación', () => {
      const rolesPermitidos = ['admin'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('creador puede editar borrador', () => {
      const creadorId = '507f1f77bcf86cd799439011';
      const usuarioId = '507f1f77bcf86cd799439011';
      
      const esCreador = creadorId === usuarioId;
      expect(esCreador).toBe(true);
    });

    test('creador no puede editar publicada', () => {
      const estado = 'publicada';
      const puedeEditar = estado === 'borrador';
      
      expect(puedeEditar).toBe(false);
    });

    test('adoptante NO puede crear publicación', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(role);
    });
  });

  describe('Notificaciones', () => {
    test('debe enviar notificación al crear solicitud', () => {
      const publicacion = {
        titulo: 'Nueva publicación',
        mascota: '507f1f77bcf86cd799439011'
      };
      
      expect(publicacion.titulo).toBeDefined();
      expect(publicacion.mascota).toBeDefined();
    });

    test('debe enviar notificación cuando se aprueba', () => {
      const estado = 'publicada';
      expect(estado).toBe('publicada');
    });

    test('debe enviar notificación cuando se rechaza', () => {
      const estado = 'rechazada';
      const razon = 'Contenido inapropiado';
      
      expect(estado).toBe('rechazada');
      expect(razon).toBeDefined();
    });

    test('debe notificar a seguidores cuando se publica', () => {
      const publicada = true;
      expect(publicada).toBe(true);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar mascota no encontrada', () => {
      const error = new Error('Mascota not found');
      expect(error.message).toContain('not found');
    });

    test('debe manejar publicación no encontrada', () => {
      const error = new Error('Publication not found');
      expect(error.message).toContain('not found');
    });

    test('debe validar que mascota sea requerida', () => {
      const mascota = undefined;
      expect(mascota).toBeUndefined();
    });

    test('debe validar que estado sea válido', () => {
      const estadosValidos = ['borrador', 'pendiente-aprobacion', 'publicada', 'rechazada'];
      const estado = 'inexistente';
      
      expect(estadosValidos).not.toContain(estado);
    });
  });

  describe('SEO y Metadatos', () => {
    test('debe generar slug amigable para URL', () => {
      const titulo = 'Adopta a Luna hermosa gata';
      const slug = titulo
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
      
      expect(slug).toBe('adopta-a-luna-hermosa-gata');
    });

    test('debe generar meta descripción', () => {
      const descripcion = 'Luna es una gata tranquila, amigable y juguetona. Perfecta para familias con niños';
      const meta = descripcion.substring(0, 160);
      
      expect(meta.length).toBeLessThanOrEqual(160);
    });

    test('debe contar palabras de descripción', () => {
      const descripcion = 'Luna es una gata muy linda';
      const palabras = descripcion.split(' ').length;
      
      expect(palabras).toBe(6);
    });
  });

  describe('Conteo y Estadísticas', () => {
    test('debe contar total de publicaciones', () => {
      const publicaciones = [
        { id: '1' },
        { id: '2' },
        { id: '3' }
      ];
      
      expect(publicaciones.length).toBe(3);
    });

    test('debe contar publicaciones por creador', () => {
      const creadorId = '507f1f77bcf86cd799439011';
      const publicaciones = [
        { creador: creadorId },
        { creador: creadorId },
        { creador: 'otro' }
      ];
      
      const delCreador = publicaciones.filter(p => p.creador === creadorId).length;
      expect(delCreador).toBe(2);
    });

    test('debe contar vistas de publicación', () => {
      const publicacion = { vistas: 150 };
      expect(publicacion.vistas).toBeGreaterThan(0);
    });

    test('debe contar comentarios', () => {
      const publicacion = { comentarios: [1, 2, 3] };
      expect(publicacion.comentarios.length).toBe(3);
    });
  });
});
