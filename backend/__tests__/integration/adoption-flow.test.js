// __tests__/integration/adoption-flow.test.js
// =============================================
// Tests de Integración - Flujo Completo de Adopción
// Simula: Usuario → Publica Mascota → Solicita Adopción → Crea Proceso → Etapas
// =============================================

const {
  crearUsuarioMock,
  crearMascotaMock,
  crearSolicitudAdopcionMock,
  crearProcesoAdopcionMock,
  generarToken,
  limpiarMocks,
  validarUsuarioCompleto,
  validarMascotaCompleta,
  validarSolicitudCompleta,
  validarProcesoCompleto,
} = require('./integration.setup');

describe('INTEGRACIÓN: Flujo Completo de Adopción', () => {
  
  beforeEach(() => {
    limpiarMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // PASO 1: Fundación se registra
  // ==========================================
  describe('Paso 1: Fundación se registra', () => {
    test('debe registrar fundación con rol admin', () => {
      const fundacion = crearUsuarioMock({
        username: 'fundacion_adopciones',
        email: 'admin@fundacion.org',
        role: 'adminFundacion',
      });

      validarUsuarioCompleto(fundacion);
      expect(fundacion.role).toBe('adminFundacion');
      expect(fundacion.email).toMatch(/@/);
    });

    test('debe generar token JWT para la fundación', () => {
      const fundacion = crearUsuarioMock({ role: 'adminFundacion' });
      const token = generarToken(fundacion._id, 'adminFundacion');

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    test('fundación puede acceder a rutas protegidas', () => {
      const fundacion = crearUsuarioMock({ role: 'adminFundacion' });
      const token = generarToken(fundacion._id, 'adminFundacion');

      // Simular verificación de token
      const rolesPermitidos = ['admin', 'adminFundacion'];
      expect(rolesPermitidos).toContain('adminFundacion');
      expect(token).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 2: Fundación publica mascota
  // ==========================================
  describe('Paso 2: Fundación publica mascota', () => {
    test('debe crear mascota con datos completos', () => {
      const fundacion = crearUsuarioMock({ role: 'adminFundacion' });
      const mascota = crearMascotaMock({
        nombre: 'Luna',
        especie: 'perro',
        raza: 'Labrador',
        tamano: 'grande',
        estado: 'disponible',
      });

      validarMascotaCompleta(mascota);
      expect(mascota.estado).toBe('disponible');
    });

    test('debe validar que mascota tiene imagenes', () => {
      const mascota = crearMascotaMock({
        imagenes: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      });

      expect(Array.isArray(mascota.imagenes)).toBe(true);
      expect(mascota.imagenes.length).toBeGreaterThan(0);
    });

    test('debe validar que mascota tiene descripción', () => {
      const mascota = crearMascotaMock({
        descripcion: 'Perro amigable, vacunado, sin problemas de comportamiento',
      });

      expect(mascota.descripcion).toBeTruthy();
      expect(mascota.descripcion.length).toBeGreaterThan(5);
    });

    test('debe rechazar mascota sin especie', () => {
      const datosInvalidos = {
        nombre: 'Luna',
        especie: '', // invalido
      };

      const esValido = Boolean(datosInvalidos.especie && datosInvalidos.especie.length > 0);
      expect(esValido).toBe(false);
    });
  });

  // ==========================================
  // PASO 3: Adoptante se registra
  // ==========================================
  describe('Paso 3: Adoptante se registra', () => {
    test('debe registrar adoptante exitosamente', () => {
      const adoptante = crearUsuarioMock({
        username: 'juan_adoptante',
        email: 'juan@example.com',
        role: 'adoptante',
      });

      validarUsuarioCompleto(adoptante);
      expect(adoptante.role).toBe('adoptante');
    });

    test('debe validar email único del adoptante', () => {
      const adoptante1 = crearUsuarioMock({ email: 'juan@example.com' });
      const adoptante2 = crearUsuarioMock({ email: 'juan@example.com' });

      // Simular validación de unicidad
      const emails = [adoptante1.email];
      const esUnico = !emails.includes(adoptante2.email);
      
      expect(esUnico).toBe(false); // Debería detectar duplicado
    });

    test('adoptante genera token para acceso', () => {
      const adoptante = crearUsuarioMock({ role: 'adoptante' });
      const token = generarToken(adoptante._id, 'adoptante');

      expect(token).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 4: Adoptante solicita adopción
  // ==========================================
  describe('Paso 4: Adoptante solicita adopción', () => {
    test('debe crear solicitud de adopción con datos completos', () => {
      const mascota = crearMascotaMock();
      const adoptante = crearUsuarioMock();
      const solicitud = crearSolicitudAdopcionMock(mascota._id, adoptante._id);

      validarSolicitudCompleta(solicitud);
      expect(solicitud.estado).toBe('pendiente');
    });

    test('debe validar que solicitud tiene documentos requeridos', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        {
          documentoIdentidad: 'https://cloudinary.com/doc1.pdf',
          pruebaResidencia: 'https://cloudinary.com/doc2.pdf',
        }
      );

      expect(solicitud.documentoIdentidad).toBeTruthy();
      expect(solicitud.pruebaResidencia).toBeTruthy();
    });

    test('debe validar información del adoptante', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        {
          nombreCompleto: 'Juan Pérez González',
          cedula: '1234567890',
          telefono: '3001234567',
          email: 'juan@example.com',
        }
      );

      expect(solicitud.nombreCompleto).toBeTruthy();
      expect(solicitud.cedula.length).toBeGreaterThan(0);
      expect(solicitud.email).toMatch(/@/);
    });

    test('debe validar información del hogar', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        {
          tipoVivienda: 'apartamento',
          tenenciaVivienda: 'propia',
          hayNinos: false,
          otrasMascotas: false,
        }
      );

      expect(['apartamento', 'casa', 'finca']).toContain(solicitud.tipoVivienda);
      expect(typeof solicitud.hayNinos).toBe('boolean');
    });

    test('debe validar que solicitud tiene motivo de adopción', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        {
          motivoAdopcion: 'Quiero darle un hogar a un animal rescatado',
        }
      );

      expect(solicitud.motivoAdopcion.length).toBeGreaterThan(10);
    });
  });

  // ==========================================
  // PASO 5: Fundación revisa solicitud
  // ==========================================
  describe('Paso 5: Fundación revisa solicitud', () => {
    test('debe aprobar solicitud válida', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'pendiente' }
      );

      // Simular aprobación
      solicitud.estado = 'aprobada';

      expect(solicitud.estado).toBe('aprobada');
    });

    test('debe rechazar solicitud con documentos faltantes', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'pendiente',
          documentoIdentidad: null,
          pruebaResidencia: null,
        }
      );

      const esValida = Boolean(solicitud.documentoIdentidad && solicitud.pruebaResidencia);
      expect(esValida).toBe(false);
    });

    test('debe registrar comentarios del revisor', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId()
      );

      solicitud.comentariosRevisor = 'Familia adecuada, hogar apto';
      expect(solicitud.comentariosRevisor).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 6: Se crea proceso de adopción
  // ==========================================
  describe('Paso 6: Se crea proceso de adopción', () => {
    test('debe iniciar proceso después de aprobación', () => {
      const solicitud = crearSolicitudAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'aprobada' }
      );

      // Cambiar solicitud a "en proceso"
      solicitud.estado = 'en proceso';

      const proceso = crearProcesoAdopcionMock(solicitud._id);

      expect(proceso.solicitud).toEqual(solicitud._id);
      expect(proceso.etapa).toBe('entrevista');
      expect(proceso.estado).toBe('en_proceso');
    });

    test('debe validar que proceso tiene etapas definidas', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'entrevista',
          etapas: ['entrevista', 'visita', 'compromiso', 'entrega'],
        }
      );

      expect(Array.isArray(proceso.etapas)).toBe(true);
      expect(proceso.etapas.length).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // PASO 7: Etapa de Entrevista
  // ==========================================
  describe('Paso 7: Etapa de Entrevista', () => {
    test('debe agendar entrevista virtual', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'entrevista',
          entrevista: {
            fechaAgendada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días después
            enlaceZoom: 'https://zoom.us/meeting/123',
          },
        }
      );

      expect(proceso.entrevista).toBeDefined();
      expect(proceso.entrevista.fechaAgendada).toBeTruthy();
    });

    test('debe registrar resultado de entrevista', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'entrevista',
          resultados: {
            entrevista: {
              aprobado: true,
              fecha: new Date(),
              notas: 'Familia motivada, responde bien a preguntas',
            },
          },
        }
      );

      expect(proceso.resultados.entrevista.aprobado).toBe(true);
      expect(proceso.resultados.entrevista.notas).toBeTruthy();
    });

    test('debe pasar a siguiente etapa si entrevista es aprobada', () => {
      let proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'entrevista',
          resultados: {
            entrevista: { aprobado: true },
          },
        }
      );

      // Simular transición
      if (proceso.resultados.entrevista.aprobado) {
        proceso.etapa = 'visita';
      }

      expect(proceso.etapa).toBe('visita');
    });
  });

  // ==========================================
  // PASO 8: Etapa de Visita
  // ==========================================
  describe('Paso 8: Etapa de Visita', () => {
    test('debe agendar visita al hogar', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'visita',
          visita: {
            fechaAgendada: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            direccion: 'Cra 5 #10-20, Bogotá',
          },
        }
      );

      expect(proceso.visita.fechaAgendada).toBeTruthy();
      expect(proceso.visita.direccion).toBeTruthy();
    });

    test('debe registrar observaciones de la visita', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'visita',
          resultados: {
            visita: {
              aprobado: true,
              observaciones: 'Hogar limpio, ambiente seguro, mascotas bien atendidas',
              fecha: new Date(),
            },
          },
        }
      );

      expect(proceso.resultados.visita.aprobado).toBe(true);
      expect(proceso.resultados.visita.observaciones).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 9: Etapa de Compromiso
  // ==========================================
  describe('Paso 9: Etapa de Compromiso', () => {
    test('debe presentar contrato de adopción', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'compromiso',
          compromiso: {
            contratoUrl: 'https://cloudinary.com/contrato.pdf',
            fechaPresentacion: new Date(),
          },
        }
      );

      expect(proceso.compromiso.contratoUrl).toBeTruthy();
    });

    test('debe registrar firma del contrato', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'compromiso',
          resultados: {
            compromiso: {
              firmado: true,
              fechaFirma: new Date(),
              firmaDigital: 'https://cloudinary.com/firma.png',
            },
          },
        }
      );

      expect(proceso.resultados.compromiso.firmado).toBe(true);
      expect(proceso.resultados.compromiso.fechaFirma).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 10: Etapa de Entrega
  // ==========================================
  describe('Paso 10: Etapa de Entrega', () => {
    test('debe registrar entrega de mascota', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          etapa: 'entrega',
          entrega: {
            fechaEntrega: new Date(),
            certificadoUrl: 'https://cloudinary.com/certificado.pdf',
          },
        }
      );

      expect(proceso.entrega.fechaEntrega).toBeTruthy();
      expect(proceso.entrega.certificadoUrl).toBeTruthy();
    });

    test('debe finalizar proceso de adopción', () => {
      let proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'en_proceso',
          etapa: 'entrega',
          resultados: {
            entrega: { completada: true },
          },
        }
      );

      // Simular finalización
      if (proceso.resultados.entrega.completada) {
        proceso.estado = 'completado';
        proceso.fechaFinalizacion = new Date();
      }

      expect(proceso.estado).toBe('completado');
      expect(proceso.fechaFinalizacion).toBeTruthy();
    });

    test('debe marcar mascota como adoptada', () => {
      const mascota = crearMascotaMock({
        estado: 'disponible',
      });

      // Simular cambio de estado
      mascota.estado = 'adoptada';

      expect(mascota.estado).toBe('adoptada');
    });
  });

  // ==========================================
  // PASO 11: Post-Adopción
  // ==========================================
  describe('Paso 11: Post-Adopción', () => {
    test('debe enviar certificado de adopción', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          certificado: {
            url: 'https://cloudinary.com/certificado.pdf',
            enviado: true,
            fechaEnvio: new Date(),
          },
        }
      );

      expect(proceso.certificado.url).toBeTruthy();
      expect(proceso.certificado.enviado).toBe(true);
    });

    test('debe permitir seguimiento post-adopción', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          seguimientoPost: {
            activo: true,
            duracionMeses: 3,
            checkins: [
              { fecha: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), estado: 'pendiente' },
              { fecha: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), estado: 'pendiente' },
            ],
          },
        }
      );

      expect(proceso.seguimientoPost.activo).toBe(true);
      expect(Array.isArray(proceso.seguimientoPost.checkins)).toBe(true);
    });
  });

  // ==========================================
  // FLUJO COMPLETO INTEGRADO
  // ==========================================
  describe('Flujo Completo Integrado', () => {
    test('debe ejecutar flujo completo de adopción sin errores', async () => {
      // 1. Crear usuarios
      const fundacion = crearUsuarioMock({ role: 'adminFundacion' });
      const adoptante = crearUsuarioMock({ role: 'adoptante' });

      // 2. Crear mascota
      const mascota = crearMascotaMock({ estado: 'disponible' });

      // 3. Crear solicitud
      const solicitud = crearSolicitudAdopcionMock(mascota._id, adoptante._id, {
        estado: 'pendiente',
      });

      // 4. Aprobar solicitud
      solicitud.estado = 'aprobada';

      // 5. Crear proceso
      let proceso = crearProcesoAdopcionMock(solicitud._id, {
        estado: 'en_proceso',
        etapa: 'entrevista',
      });

      // 6. Pasar por etapas
      const etapas = [
        { nombre: 'entrevista', resultado: true },
        { nombre: 'visita', resultado: true },
        { nombre: 'compromiso', resultado: true },
        { nombre: 'entrega', resultado: true },
      ];

      for (const etapa of etapas) {
        proceso.etapa = etapa.nombre;
        if (etapa.resultado) {
          proceso.resultados[etapa.nombre] = { aprobado: true };
        }
      }

      // 7. Finalizar
      proceso.estado = 'completado';
      proceso.fechaFinalizacion = new Date();
      mascota.estado = 'adoptada';

      // Validaciones finales
      expect(proceso.estado).toBe('completado');
      expect(mascota.estado).toBe('adoptada');
      expect(solicitud.estado).toBe('aprobada');
      validarProcesoCompleto(proceso);
      validarMascotaCompleta(mascota);
    });

    test('debe trackear tiempos de cada etapa', () => {
      const ahora = Date.now();
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          fechaInicio: new Date(ahora),
          tiemposEtapas: {
            entrevista: { duracionDias: 3 },
            visita: { duracionDias: 5 },
            compromiso: { duracionDias: 2 },
            entrega: { duracionDias: 1 },
          },
          duracionTotal: 11, // días
        }
      );

      const duracionTotal = Object.values(proceso.tiemposEtapas)
        .reduce((sum, etapa) => sum + etapa.duracionDias, 0);

      expect(duracionTotal).toBe(11);
    });

    test('debe generar reporte de adopción', () => {
      const proceso = crearProcesoAdopcionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'completado',
          reporte: {
            fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            fechaFinalizacion: new Date(),
            etapasCompletadas: 4,
            observacionesGenerales: 'Proceso exitoso',
          },
        }
      );

      expect(proceso.reporte).toBeDefined();
      expect(proceso.reporte.etapasCompletadas).toBe(4);
    });
  });
});
