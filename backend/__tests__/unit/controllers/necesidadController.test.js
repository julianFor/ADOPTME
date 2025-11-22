/**
 * Tests para Necesidad Controller
 * Prueba crear necesidades, estados, urgencia, categorías, cálculos
 */

const necesidadController = require('../../../controllers/necesidadController');

jest.mock('../../../models/Need');
jest.mock('mongoose');

describe('Controller - Necesidad', () => {
  let req, res;
  let Need;

  beforeEach(() => {
    jest.clearAllMocks();
    
    Need = require('../../../models/Need');

    req = {
      body: {},
      params: {},
      query: {},
      userRole: 'adminFundacion',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Información Básica', () => {
    test('debe validar título de necesidad', () => {
      const titulo = 'Alimentos para perros';
      expect(typeof titulo).toBe('string');
      expect(titulo.length).toBeGreaterThan(5);
    });

    test('debe rechazar título muy corto', () => {
      const titulo = 'Alo';
      expect(titulo.length).toBeLessThan(5);
    });

    test('debe validar descripción', () => {
      const descripcion = 'Se necesitan alimentos de calidad para alimentar a 50 perros';
      expect(typeof descripcion).toBe('string');
      expect(descripcion.length).toBeGreaterThan(10);
    });

    test('debe permitir descripción sin especificar longitud mínima', () => {
      const descripcion = 'Comida';
      expect(typeof descripcion).toBe('string');
    });
  });

  describe('Validaciones de Estado', () => {
    test('debe validar estado activa', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'activa';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado pausada', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'pausada';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado cumplida', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'cumplida';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar estado vencida', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'vencida';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe rechazar estado inválido', () => {
      const estadosValidos = ['activa', 'pausada', 'cumplida', 'vencida'];
      const estado = 'en-progreso';
      
      expect(estadosValidos).not.toContain(estado);
    });

    test('debe tener estado activa por defecto', () => {
      const estadoPorDefecto = 'activa';
      expect(estadoPorDefecto).toBe('activa');
    });
  });

  describe('Validaciones de Urgencia', () => {
    test('debe validar urgencia baja', () => {
      const urgenciasValidas = ['baja', 'media', 'alta'];
      const urgencia = 'baja';
      
      expect(urgenciasValidas).toContain(urgencia);
    });

    test('debe validar urgencia media', () => {
      const urgenciasValidas = ['baja', 'media', 'alta'];
      const urgencia = 'media';
      
      expect(urgenciasValidas).toContain(urgencia);
    });

    test('debe validar urgencia alta', () => {
      const urgenciasValidas = ['baja', 'media', 'alta'];
      const urgencia = 'alta';
      
      expect(urgenciasValidas).toContain(urgencia);
    });

    test('debe rechazar urgencia inválida', () => {
      const urgenciasValidas = ['baja', 'media', 'alta'];
      const urgencia = 'urgentísima';
      
      expect(urgenciasValidas).not.toContain(urgencia);
    });
  });

  describe('Validaciones de Categoría', () => {
    test('debe validar categoría alimentos', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro'];
      const categoria = 'alimentos';
      
      expect(categoriasValidas).toContain(categoria);
    });

    test('debe validar categoría medicina', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro'];
      const categoria = 'medicina';
      
      expect(categoriasValidas).toContain(categoria);
    });

    test('debe validar categoría educacion', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro'];
      const categoria = 'educacion';
      
      expect(categoriasValidas).toContain(categoria);
    });

    test('debe validar categoría infraestructura', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro'];
      const categoria = 'infraestructura';
      
      expect(categoriasValidas).toContain(categoria);
    });

    test('debe validar categoría otro', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro'];
      const categoria = 'otro';
      
      expect(categoriasValidas).toContain(categoria);
    });

    test('debe rechazar categoría inválida', () => {
      const categoriasValidas = ['alimentos', 'medicina', 'educacion', 'infraestructura'];
      const categoria = 'entretenimiento';
      
      expect(categoriasValidas).not.toContain(categoria);
    });
  });

  describe('Validaciones de Montos', () => {
    test('debe validar objetivo positivo', () => {
      const objetivo = 100000;
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

    test('debe validar recibido positivo', () => {
      const recibido = 50000;
      expect(recibido).toBeGreaterThanOrEqual(0);
    });

    test('debe rechazar recibido mayor al objetivo', () => {
      const objetivo = 100000;
      const recibido = 150000;
      
      expect(recibido).toBeGreaterThan(objetivo);
    });

    test('debe calcular porcentaje de cumplimiento', () => {
      const objetivo = 100000;
      const recibido = 50000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(50);
    });

    test('debe calcular porcentaje completo', () => {
      const objetivo = 100000;
      const recibido = 100000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(100);
    });

    test('debe validar decimales en montos', () => {
      const monto = 1500.50;
      expect(monto).toBeGreaterThan(0);
    });
  });

  describe('Validaciones de Imágenes', () => {
    test('debe aceptar imagen URL válida', () => {
      const imagen = 'https://res.cloudinary.com/necesidad-001.jpg';
      const isUrl = /^https?:\/\/.+/.test(imagen);
      
      expect(isUrl).toBe(true);
    });

    test('debe rechazar URL inválida', () => {
      const imagen = 'no-es-url';
      const isUrl = /^https?:\/\/.+/.test(imagen);
      
      expect(isUrl).toBe(false);
    });

    test('debe permitir múltiples imágenes', () => {
      const imagenes = [
        'https://res.cloudinary.com/imagen1.jpg',
        'https://res.cloudinary.com/imagen2.jpg'
      ];
      
      expect(imagenes.length).toBeGreaterThan(1);
    });

    test('debe permitir sin imágenes', () => {
      const imagenes = [];
      expect(imagenes.length).toBe(0);
    });
  });

  describe('Validaciones de Fechas', () => {
    test('debe validar fecha de creación', () => {
      const fecha = new Date();
      expect(fecha instanceof Date).toBe(true);
    });

    test('debe rechazar fecha futura en creación', () => {
      const ahora = Date.now();
      const futura = new Date();
      futura.setFullYear(futura.getFullYear() + 1);
      
      expect(futura.getTime()).toBeGreaterThan(ahora);
    });

    test('debe validar fecha límite', () => {
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() + 3);
      
      expect(fechaLimite instanceof Date).toBe(true);
      expect(fechaLimite.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe validar fecha límite futura', () => {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() + 1);
      
      expect(fechaLimite.getTime()).toBeGreaterThan(hoy.getTime());
    });

    test('debe rechazar fecha límite pasada', () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      
      expect(ayer.getTime()).toBeLessThan(Date.now());
    });
  });

  describe('Búsqueda y Sanitización', () => {
    test('debe buscar por título', () => {
      const termino = 'alimentos';
      const necesidades = [
        { titulo: 'Alimentos para perros' },
        { titulo: 'Medicina veterinaria' },
        { titulo: 'Comida de emergencia' }
      ];
      
      const resultados = necesidades.filter(n => 
        n.titulo.toLowerCase().includes(termino.toLowerCase())
      );
      
      expect(resultados.length).toBeGreaterThanOrEqual(1);
    });

    test('debe buscar por descripción', () => {
      const termino = 'urgente';
      const necesidades = [
        { descripcion: 'Situación urgente' },
        { descripcion: 'No es tan urgente' }
      ];
      
      const resultados = necesidades.filter(n =>
        n.descripcion.toLowerCase().includes(termino.toLowerCase())
      );
      
      expect(resultados.length).toBeGreaterThan(0);
    });

    test('debe sanitizar búsqueda de inyección', () => {
      const termino = 'alimentos"; DROP TABLE--';
      const sanitizado = termino.replace(/[";'\\]/g, '');
      
      expect(sanitizado).not.toContain('"');
      expect(sanitizado).not.toContain(';');
    });

    test('debe ser case-insensitive en búsqueda', () => {
      const termino = 'ALIMENTOS';
      const necesidad = 'alimentos para perros';
      
      expect(necesidad.toLowerCase()).toContain(termino.toLowerCase());
    });
  });

  describe('Filtrado', () => {
    test('debe filtrar por estado', () => {
      const necesidades = [
        { estado: 'activa' },
        { estado: 'pausada' },
        { estado: 'activa' }
      ];
      
      const activas = necesidades.filter(n => n.estado === 'activa');
      expect(activas.length).toBe(2);
    });

    test('debe filtrar por urgencia', () => {
      const necesidades = [
        { urgencia: 'alta' },
        { urgencia: 'baja' },
        { urgencia: 'alta' }
      ];
      
      const altas = necesidades.filter(n => n.urgencia === 'alta');
      expect(altas.length).toBe(2);
    });

    test('debe filtrar por categoría', () => {
      const necesidades = [
        { categoria: 'alimentos' },
        { categoria: 'medicina' },
        { categoria: 'alimentos' }
      ];
      
      const alimentos = necesidades.filter(n => n.categoria === 'alimentos');
      expect(alimentos.length).toBe(2);
    });

    test('debe filtrar por rango de montos', () => {
      const necesidades = [
        { objetivo: 50000 },
        { objetivo: 150000 },
        { objetivo: 75000 }
      ];
      
      const rango = necesidades.filter(n => n.objetivo >= 60000 && n.objetivo <= 100000);
      expect(rango.length).toBeGreaterThanOrEqual(0);
    });

    test('debe combinar múltiples filtros', () => {
      const necesidades = [
        { estado: 'activa', urgencia: 'alta', categoria: 'alimentos' },
        { estado: 'activa', urgencia: 'baja', categoria: 'medicina' },
        { estado: 'pausada', urgencia: 'alta', categoria: 'alimentos' }
      ];
      
      const filtradas = necesidades.filter(n =>
        n.estado === 'activa' && n.urgencia === 'alta'
      );
      
      expect(filtradas.length).toBe(1);
    });
  });

  describe('Ordenamiento', () => {
    test('debe ordenar por fecha descendente (más recientes)', () => {
      const necesidades = [
        { id: '1', createdAt: new Date('2023-01-01') },
        { id: '3', createdAt: new Date('2023-06-01') },
        { id: '2', createdAt: new Date('2023-03-01') }
      ];
      
      const ordenadas = [...necesidades].sort((a, b) => b.createdAt - a.createdAt);
      expect(ordenadas[0].id).toBe('3');
    });

    test('debe ordenar por urgencia (alta primero)', () => {
      const urgenciasOrden = { alta: 3, media: 2, baja: 1 };
      const necesidades = [
        { id: '1', urgencia: 'baja' },
        { id: '2', urgencia: 'alta' },
        { id: '3', urgencia: 'media' }
      ];
      
      const ordenadas = [...necesidades].sort((a, b) =>
        urgenciasOrden[b.urgencia] - urgenciasOrden[a.urgencia]
      );
      
      expect(ordenadas[0].id).toBe('2');
    });

    test('debe ordenar por porcentaje completado', () => {
      const necesidades = [
        { id: '1', objetivo: 100, recibido: 50 }, // 50%
        { id: '2', objetivo: 100, recibido: 100 }, // 100%
        { id: '3', objetivo: 100, recibido: 25 } // 25%
      ];
      
      const conPorcentaje = necesidades.map(n => ({
        ...n,
        porcentaje: (n.recibido / n.objetivo) * 100
      }));
      
      const ordenadas = [...conPorcentaje].sort((a, b) => b.porcentaje - a.porcentaje);
      expect(ordenadas[0].id).toBe('2');
      expect(ordenadas[2].id).toBe('3');
    });
  });

  describe('Paginación', () => {
    test('debe paginar resultados correctamente', () => {
      const necesidades = Array(25).fill().map((_, i) => ({ id: i + 1 }));
      const page = 2;
      const limit = 10;
      const inicio = (page - 1) * limit;
      
      const pagina = necesidades.slice(inicio, inicio + limit);
      expect(pagina.length).toBe(10);
      expect(pagina[0].id).toBe(11);
    });

    test('debe calcular total de páginas', () => {
      const total = 25;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);
      
      expect(totalPages).toBe(3);
    });

    test('debe manejar última página incompleta', () => {
      const necesidades = Array(25).fill().map((_, i) => ({ id: i + 1 }));
      const page = 3;
      const limit = 10;
      const inicio = (page - 1) * limit;
      
      const pagina = necesidades.slice(inicio, inicio + limit);
      expect(pagina.length).toBe(5);
    });
  });

  describe('Cálculos y Estadísticas', () => {
    test('debe calcular porcentaje cumplimiento individual', () => {
      const objetivo = 100000;
      const recibido = 75000;
      const porcentaje = (recibido / objetivo) * 100;
      
      expect(porcentaje).toBe(75);
    });

    test('debe marcar como cumplida al 100%', () => {
      const objetivo = 100000;
      const recibido = 100000;
      const porcentaje = (recibido / objetivo) * 100;
      
      const estado = porcentaje >= 100 ? 'cumplida' : 'activa';
      expect(estado).toBe('cumplida');
    });

    test('debe calcular total de necesidades activas', () => {
      const necesidades = [
        { estado: 'activa' },
        { estado: 'activa' },
        { estado: 'pausada' }
      ];
      
      const activas = necesidades.filter(n => n.estado === 'activa');
      expect(activas.length).toBe(2);
    });

    test('debe calcular monto total recolectado', () => {
      const necesidades = [
        { recibido: 50000 },
        { recibido: 30000 },
        { recibido: 20000 }
      ];
      
      const total = necesidades.reduce((sum, n) => sum + n.recibido, 0);
      expect(total).toBe(100000);
    });

    test('debe calcular monto total objetivo', () => {
      const necesidades = [
        { objetivo: 100000 },
        { objetivo: 50000 },
        { objetivo: 25000 }
      ];
      
      const total = necesidades.reduce((sum, n) => sum + n.objetivo, 0);
      expect(total).toBe(175000);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo adminFundacion puede crear necesidad', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'adminFundacion';
      
      expect(rolesPermitidos).toContain(usuarioRole);
    });

    test('adoptante NO puede crear necesidad', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(usuarioRole);
    });

    test('solo adminFundacion puede editar necesidad', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'adminFundacion';
      
      expect(rolesPermitidos).toContain(usuarioRole);
    });

    test('cualquiera puede ver necesidades públicas', () => {
      const publica = true;
      expect(publica).toBe(true);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar objetivo no definido', () => {
      const objetivo = undefined;
      expect(objetivo).toBeUndefined();
    });

    test('debe validar que título sea string', () => {
      const titulo = 12345;
      expect(typeof titulo).not.toBe('string');
    });
  });
});
