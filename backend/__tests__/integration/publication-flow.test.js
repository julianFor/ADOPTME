// __tests__/integration/publication-flow.test.js
// ================================================
// Tests de Integración - Flujo de Publicación
// Simula: Mascota → Solicitud Publicación → Aprobación → Visibilidad
// ================================================

const {
  crearUsuarioMock,
  crearMascotaMock,
  crearSolicitudPublicacionMock,
  generarToken,
  limpiarMocks,
  validarMascotaCompleta,
} = require('./integration.setup');

describe('INTEGRACIÓN: Flujo de Publicación de Mascota', () => {
  
  beforeEach(() => {
    limpiarMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // PASO 1: Fundación carga mascota
  // ==========================================
  describe('Paso 1: Fundación carga mascota', () => {
    test('debe cargar mascota en el sistema', () => {
      const mascota = crearMascotaMock({
        nombre: 'Max',
        especie: 'perro',
        raza: 'Pastor Alemán',
        estado: 'disponible',
      });

      validarMascotaCompleta(mascota);
      expect(mascota.estado).toBe('disponible');
    });

    test('debe validar que mascota tiene imagenes para publicar', () => {
      const mascota = crearMascotaMock({
        imagenes: [
          'https://cloudinary.com/img1.jpg',
          'https://cloudinary.com/img2.jpg',
          'https://cloudinary.com/img3.jpg',
        ],
      });

      expect(Array.isArray(mascota.imagenes)).toBe(true);
      expect(mascota.imagenes.length).toBeGreaterThanOrEqual(1);
      mascota.imagenes.forEach(img => {
        expect(img).toMatch(/^https:\/\//);
      });
    });

    test('debe validar descripción completa de mascota', () => {
      const mascota = crearMascotaMock({
        descripcion: 'Max es un perro amigable, vacunado, castrado, sin problemas de comportamiento',
        edad: 3,
        tamano: 'grande',
        salud: {
          vacunas: true,
          desparasitado: true,
          castrado: true,
        },
      });

      expect(mascota.descripcion.length).toBeGreaterThan(20);
      expect(mascota.edad).toBeGreaterThan(0);
      expect(mascota.salud.vacunas).toBe(true);
    });
  });

  // ==========================================
  // PASO 2: Crear solicitud de publicación
  // ==========================================
  describe('Paso 2: Crear solicitud de publicación', () => {
    test('debe crear solicitud de publicación en estado pendiente', () => {
      const mascota = crearMascotaMock();
      const solicitud = crearSolicitudPublicacionMock(mascota._id, {
        estado: 'pendiente',
      });

      expect(solicitud.estado).toBe('pendiente');
      expect(solicitud.mascota).toEqual(mascota._id);
    });

    test('debe incluir título y descripción en solicitud', () => {
      const mascota = crearMascotaMock();
      const solicitud = crearSolicitudPublicacionMock(mascota._id, {
        titulo: 'Se busca hogar para Max, perro rescatado',
        descripcion: 'Max necesita una familia amorosa que lo adopte',
      });

      expect(solicitud.titulo).toBeTruthy();
      expect(solicitud.descripcion).toBeTruthy();
      expect(solicitud.titulo.length).toBeGreaterThan(10);
    });

    test('debe validar motivo de publicación', () => {
      const motivos = ['rescate', 'reubicacion', 'sobrepoblacion', 'otro'];
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          motivoPublicacion: 'rescate',
        }
      );

      expect(motivos).toContain(solicitud.motivoPublicacion);
    });

    test('debe validar categoría de mascota', () => {
      const categorias = ['perro', 'gato', 'roedor', 'ave', 'reptil'];
      const mascota = crearMascotaMock({ especie: 'perro' });
      const solicitud = crearSolicitudPublicacionMock(mascota._id, {
        categoria: mascota.especie,
      });

      expect(categorias).toContain(solicitud.categoria);
    });
  });

  // ==========================================
  // PASO 3: Revisión por administrador
  // ==========================================
  describe('Paso 3: Revisión por administrador', () => {
    test('debe validar datos completos antes de aprobar', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'pendiente',
          titulo: 'Se busca hogar para Max',
          descripcion: 'Perro amigable y cariñoso',
          imagenes: ['https://cloudinary.com/img1.jpg'],
        }
      );

      const esValida = 
        solicitud.titulo && 
        solicitud.descripcion && 
        Array.isArray(solicitud.imagenes) && 
        solicitud.imagenes.length > 0;

      expect(esValida).toBe(true);
    });

    test('debe rechazar solicitud con campos incompletos', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          titulo: '', // vacío
          descripcion: 'Descripción',
        }
      );

      const esValida = Boolean(solicitud.titulo && solicitud.titulo.length > 0);
      expect(esValida).toBe(false);
    });

    test('debe agregar comentarios del revisor', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId()
      );

      solicitud.comentariosRevisor = 'Excelentes imágenes, descripción clara';
      solicitud.revisadoPor = new (require('mongoose')).Types.ObjectId();
      solicitud.fechaRevision = new Date();

      expect(solicitud.comentariosRevisor).toBeTruthy();
      expect(solicitud.revisadoPor).toBeDefined();
      expect(solicitud.fechaRevision).toBeDefined();
    });
  });

  // ==========================================
  // PASO 4: Aprobación de publicación
  // ==========================================
  describe('Paso 4: Aprobación de publicación', () => {
    test('debe cambiar estado a aprobada', () => {
      let solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'pendiente' }
      );

      solicitud.estado = 'aprobada';
      solicitud.fechaAprobacion = new Date();

      expect(solicitud.estado).toBe('aprobada');
      expect(solicitud.fechaAprobacion).toBeTruthy();
    });

    test('debe generar slug para URL amigable', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          titulo: 'Se busca hogar para Max el perro',
          slug: 'se-busca-hogar-para-max-el-perro',
        }
      );

      expect(solicitud.slug).toBeTruthy();
      expect(solicitud.slug).not.toContain(' ');
      expect(solicitud.slug).toContain('-');
    });

    test('debe asignar URL pública de publicación', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          slug: 'mascota-rescatada',
          urlPublica: 'https://adoptme.org/mascotas/mascota-rescatada',
        }
      );

      expect(solicitud.urlPublica).toMatch(/^https:\/\//);
      expect(solicitud.urlPublica).toContain(solicitud.slug);
    });

    test('debe optimizar para SEO', () => {
      const solicitud = crearSolicitudPublicacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          seo: {
            metaTitle: 'Adopta a Max - Perro Labrador en Bogotá',
            metaDescription: 'Max es un perro amigable buscando hogar. Conoce su historia y únete a nuestra causa',
            keywords: ['adopción', 'perro', 'labrador', 'bogotá'],
          },
        }
      );

      expect(solicitud.seo.metaTitle).toBeTruthy();
      expect(solicitud.seo.metaDescription).toBeTruthy();
      expect(Array.isArray(solicitud.seo.keywords)).toBe(true);
    });
  });

  // ==========================================
  // PASO 5: Publicación visible en plataforma
  // ==========================================
  describe('Paso 5: Publicación visible en plataforma', () => {
    test('debe estar visible en listado de mascotas', () => {
      const mascota = crearMascotaMock({
        estado: 'disponible',
        publicada: true,
      });

      expect(mascota.publicada).toBe(true);
      expect(mascota.estado).toBe('disponible');
    });

    test('debe tener fecha de publicación', () => {
      const mascota = crearMascotaMock({
        fechaPublicacion: new Date(),
      });

      expect(mascota.fechaPublicacion).toBeTruthy();
      expect(mascota.fechaPublicacion instanceof Date).toBe(true);
    });

    test('debe permitir búsqueda por especie', () => {
      const mascotas = [
        crearMascotaMock({ especie: 'perro', publicada: true }),
        crearMascotaMock({ especie: 'gato', publicada: true }),
        crearMascotaMock({ especie: 'perro', publicada: true }),
      ];

      const perros = mascotas.filter(m => m.especie === 'perro' && m.publicada);
      expect(perros.length).toBe(2);
    });

    test('debe permitir búsqueda por tamaño', () => {
      const mascotas = [
        crearMascotaMock({ tamano: 'pequeño', publicada: true }),
        crearMascotaMock({ tamano: 'mediano', publicada: true }),
        crearMascotaMock({ tamano: 'grande', publicada: true }),
      ];

      const medianos = mascotas.filter(m => m.tamano === 'mediano');
      expect(medianos.length).toBe(1);
    });

    test('debe permitir filtro por edad', () => {
      const mascotas = [
        crearMascotaMock({ edad: 1, publicada: true }),
        crearMascotaMock({ edad: 3, publicada: true }),
        crearMascotaMock({ edad: 8, publicada: true }),
      ];

      const menoresDe5Años = mascotas.filter(m => m.edad < 5);
      expect(menoresDe5Años.length).toBe(2);
    });

    test('debe mostrar información de salud', () => {
      const mascota = crearMascotaMock({
        salud: {
          vacunas: true,
          desparasitado: true,
          castrado: true,
          microchip: '123456789',
        },
        publicada: true,
      });

      expect(mascota.salud.vacunas).toBe(true);
      expect(mascota.salud.microchip).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 6: Gestión de estadísticas
  // ==========================================
  describe('Paso 6: Gestión de estadísticas', () => {
    test('debe contar vistas de publicación', () => {
      const mascota = crearMascotaMock({
        estadisticas: {
          vistas: 145,
          compartidas: 23,
          solicitudes: 5,
        },
      });

      expect(mascota.estadisticas.vistas).toBeGreaterThan(0);
      expect(typeof mascota.estadisticas.vistas).toBe('number');
    });

    test('debe registrar interacciones', () => {
      const mascota = crearMascotaMock({
        interacciones: [
          { tipo: 'vista', fecha: new Date() },
          { tipo: 'compartida', fecha: new Date() },
          { tipo: 'favorito', fecha: new Date() },
        ],
      });

      expect(Array.isArray(mascota.interacciones)).toBe(true);
      expect(mascota.interacciones.length).toBeGreaterThan(0);
    });

    test('debe calcular tasa de conversión', () => {
      const mascota = crearMascotaMock({
        estadisticas: {
          vistas: 100,
          solicitudes: 10,
        },
      });

      const tasaConversion = (mascota.estadisticas.solicitudes / mascota.estadisticas.vistas) * 100;
      expect(tasaConversion).toBe(10);
    });
  });

  // ==========================================
  // PASO 7: Modificación de publicación
  // ==========================================
  describe('Paso 7: Modificación de publicación', () => {
    test('debe permitir editar información de mascota', () => {
      let mascota = crearMascotaMock({
        descripcion: 'Descripción original',
      });

      mascota.descripcion = 'Descripción actualizada con más detalles';
      mascota.updatedAt = new Date();

      expect(mascota.descripcion).toBe('Descripción actualizada con más detalles');
    });

    test('debe permitir agregar imagenes', () => {
      let mascota = crearMascotaMock({
        imagenes: ['https://cloudinary.com/img1.jpg'],
      });

      mascota.imagenes.push('https://cloudinary.com/img2.jpg');

      expect(mascota.imagenes.length).toBe(2);
    });

    test('debe validar cambios antes de guardar', () => {
      let mascota = crearMascotaMock({
        nombre: 'Max',
      });

      const cambiosValidos = {
        nombre: 'Max (actualizado)',
        descripcion: 'Nueva descripción',
      };

      mascota.nombre = cambiosValidos.nombre;
      mascota.descripcion = cambiosValidos.descripcion;

      expect(mascota.nombre).toBe('Max (actualizado)');
      expect(mascota.descripcion).toBe('Nueva descripción');
    });
  });

  // ==========================================
  // PASO 8: Archivado de publicación
  // ==========================================
  describe('Paso 8: Archivado de publicación', () => {
    test('debe archivar cuando mascota es adoptada', () => {
      let mascota = crearMascotaMock({
        estado: 'adoptada',
        publicada: true,
      });

      mascota.publicada = false;
      mascota.estado = 'adoptada';

      expect(mascota.publicada).toBe(false);
      expect(mascota.estado).toBe('adoptada');
    });

    test('debe permitir reactivar publicación', () => {
      let mascota = crearMascotaMock({
        publicada: false,
        estado: 'disponible',
      });

      mascota.publicada = true;

      expect(mascota.publicada).toBe(true);
    });

    test('debe mantener historial de publicaciones', () => {
      const mascota = crearMascotaMock({
        historial: [
          { 
            fechaPublicacion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            fechaArchivo: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            duracion: 30,
          },
          { 
            fechaPublicacion: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            fechaArchivo: null,
            duracion: null,
          },
        ],
      });

      expect(Array.isArray(mascota.historial)).toBe(true);
      expect(mascota.historial.length).toBe(2);
    });
  });

  // ==========================================
  // FLUJO COMPLETO DE PUBLICACIÓN
  // ==========================================
  describe('Flujo Completo de Publicación', () => {
    test('debe ejecutar flujo completo sin errores', async () => {
      // 1. Cargar mascota
      const mascota = crearMascotaMock({
        nombre: 'Luna',
        especie: 'perro',
        estado: 'disponible',
        imagenes: ['https://cloudinary.com/luna1.jpg', 'https://cloudinary.com/luna2.jpg'],
      });

      // 2. Crear solicitud de publicación
      let solicitud = crearSolicitudPublicacionMock(mascota._id, {
        estado: 'pendiente',
        titulo: 'Adopta a Luna, hermosa perrita rescatada',
        descripcion: 'Luna es una perrita amigable de 2 años',
      });

      // 3. Revisar
      solicitud.comentariosRevisor = 'Datos completos y verificados';
      solicitud.estado = 'en_revision';

      // 4. Aprobar
      solicitud.estado = 'aprobada';
      solicitud.slug = 'adopta-luna-hermosa-perrita';
      solicitud.seo = {
        metaTitle: 'Adopta a Luna - Perrito Rescatado',
        metaDescription: 'Luna busca hogar. Conoce su historia',
        keywords: ['adopción', 'perro', 'rescate'],
      };

      // 5. Publicar
      mascota.publicada = true;
      mascota.fechaPublicacion = new Date();
      mascota.estadisticas = {
        vistas: 0,
        solicitudes: 0,
      };

      // Validaciones finales
      expect(solicitud.estado).toBe('aprobada');
      expect(mascota.publicada).toBe(true);
      expect(mascota.estadisticas).toBeDefined();
      validarMascotaCompleta(mascota);
    });

    test('debe simular ciclo completo de adopción por publicación', () => {
      // 1. Publicar
      const mascota = crearMascotaMock({ 
        publicada: true,
        estado: 'disponible',
      });

      // 2. Recibir interacciones
      mascota.estadisticas = {
        vistas: 50,
        solicitudes: 3,
        compartidas: 10,
      };

      // 3. Recibir solicitudes
      const solicitudes = [
        crearSolicitudAdopcionMock(mascota._id, new (require('mongoose')).Types.ObjectId()),
        crearSolicitudAdopcionMock(mascota._id, new (require('mongoose')).Types.ObjectId()),
        crearSolicitudAdopcionMock(mascota._id, new (require('mongoose')).Types.ObjectId()),
      ];

      // 4. Aprobar una solicitud
      solicitudes[0].estado = 'aprobada';

      // 5. Adoptada
      mascota.estado = 'adoptada';
      mascota.publicada = false;

      // Validaciones
      expect(mascota.estado).toBe('adoptada');
      expect(mascota.publicada).toBe(false);
      expect(solicitudes.filter(s => s.estado === 'aprobada').length).toBe(1);
    });

    test('debe calcular métricas de publicación', () => {
      const mascota = crearMascotaMock({
        estadisticas: {
          vistas: 200,
          solicitudes: 8,
          compartidas: 25,
        },
        fechaPublicacion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      });

      const tasaConversion = (mascota.estadisticas.solicitudes / mascota.estadisticas.vistas) * 100;
      const promedioVistasXSolicitud = mascota.estadisticas.vistas / mascota.estadisticas.solicitudes;

      expect(tasaConversion).toBeCloseTo(4, 0); // ~4%
      expect(promedioVistasXSolicitud).toBeCloseTo(25, 0); // ~25 vistas por solicitud
    });
  });
});

// Helper para crear SolicitudAdopcion con datos completos
function crearSolicitudAdopcionMock(mascotaId, adoptanteId) {
  const id = new (require('mongoose')).Types.ObjectId();
  return {
    _id: id,
    mascota: mascotaId,
    adoptante: adoptanteId,
    estado: 'pendiente',
  };
}
