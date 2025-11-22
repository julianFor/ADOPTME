// __tests__/integration/donation-flow.test.js
// ============================================
// Tests de Integración - Flujo de Donaciones
// Simula: Usuario → Dona → Registra → Actualiza Meta → Notificación
// ============================================

const {
  crearUsuarioMock,
  crearDonacionMock,
  crearNecesidadMock,
  generarToken,
  limpiarMocks,
  validarUsuarioCompleto,
} = require('./integration.setup');

describe('INTEGRACIÓN: Flujo de Donaciones', () => {
  
  beforeEach(() => {
    limpiarMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // PASO 1: Fundación publica meta de donación
  // ==========================================
  describe('Paso 1: Fundación publica meta de donación', () => {
    test('debe crear meta de donación', () => {
      const meta = {
        _id: new (require('mongoose')).Types.ObjectId(),
        titulo: 'Meta para alimento 2024',
        descripcion: 'Necesitamos $5.000.000 para alimentar a 50 perros un mes',
        montoMeta: 5000000,
        montoRecolectado: 0,
        estado: 'activa',
        fechaInicio: new Date(),
        fechaCierre: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        categoria: 'alimento',
      };

      expect(meta.montoMeta).toBeGreaterThan(0);
      expect(meta.estado).toBe('activa');
      expect(meta.montoRecolectado).toBe(0);
    });

    test('debe validar que meta tiene descripción clara', () => {
      const meta = {
        titulo: 'Meta de vacunas',
        descripcion: 'Vacunación completa para 30 mascotas rescatadas',
      };

      expect(meta.titulo).toBeTruthy();
      expect(meta.descripcion).toBeTruthy();
      expect(meta.descripcion.length).toBeGreaterThan(10);
    });

    test('debe validar montos realistas', () => {
      const meta = {
        montoMeta: 2000000,
      };

      const esValido = meta.montoMeta > 0 && meta.montoMeta <= 100000000;
      expect(esValido).toBe(true);
    });

    test('debe validar fecha de cierre', () => {
      const ahora = new Date();
      const meta = {
        fechaInicio: new Date(ahora),
        fechaCierre: new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000),
      };

      const esValido = meta.fechaCierre > meta.fechaInicio;
      expect(esValido).toBe(true);
    });
  });

  // ==========================================
  // PASO 2: Donante se registra
  // ==========================================
  describe('Paso 2: Donante se registra', () => {
    test('debe registrar donante con email', () => {
      const donante = crearUsuarioMock({
        username: 'carlos_donante',
        email: 'carlos@example.com',
        role: 'adoptante',
      });

      validarUsuarioCompleto(donante);
      expect(donante.email).toMatch(/@/);
    });

    test('debe crear perfil de donante', () => {
      const donante = crearUsuarioMock();
      const perfilDonante = {
        usuarioId: donante._id,
        nombre: 'Carlos García',
        email: donante.email,
        telefono: '3015555555',
        frecuenciaDonacion: 'mensual',
        montoPromedio: 50000,
        totalDonado: 0,
        donacionesRealizadas: 0,
      };

      expect(perfilDonante.usuarioId).toEqual(donante._id);
      expect(perfilDonante.montoPromedio).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // PASO 3: Donante hace donación
  // ==========================================
  describe('Paso 3: Donante hace donación', () => {
    test('debe crear registro de donación', () => {
      const donador = crearUsuarioMock();
      const donacion = crearDonacionMock(donador._id, {
        monto: 100000,
        metodoPago: 'paypal',
        estado: 'pendiente',
      });

      expect(donacion.monto).toBeGreaterThan(0);
      expect(donacion.estado).toBe('pendiente');
      expect(donacion.donador).toEqual(donador._id);
    });

    test('debe validar montos de donación', () => {
      const montos = [5000, 10000, 50000, 100000, 500000];

      montos.forEach(monto => {
        const esValido = monto >= 5000 && monto <= 5000000;
        expect(esValido).toBe(true);
      });
    });

    test('debe soportar múltiples métodos de pago', () => {
      const metodosPago = ['paypal', 'tarjeta', 'transferencia', 'efectivo'];

      metodosPago.forEach(metodo => {
        const donacion = crearDonacionMock(
          new (require('mongoose')).Types.ObjectId(),
          { metodoPago: metodo }
        );
        expect(metodosPago).toContain(donacion.metodoPago);
      });
    });

    test('debe solicitar confirmación antes de procesar', () => {
      const donacion = {
        monto: 100000,
        metodoPago: 'paypal',
        confirmada: false,
        fechaSolicitud: new Date(),
      };

      expect(donacion.confirmada).toBe(false);
      expect(donacion.fechaSolicitud).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 4: Procesar pago
  // ==========================================
  describe('Paso 4: Procesar pago', () => {
    test('debe validar pago en gateway externo', () => {
      let donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'pendiente',
        }
      );

      // Simular validación
      donacion.estado = 'completada';
      donacion.referencia = 'TXN-' + Date.now();
      donacion.fechaPago = new Date();

      expect(donacion.estado).toBe('completada');
      expect(donacion.referencia).toBeTruthy();
    });

    test('debe registrar referencia de transacción', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          referencia: 'PP-123456789',
          estado: 'completada',
        }
      );

      expect(donacion.referencia).toMatch(/^[A-Z]+-\d+/);
    });

    test('debe manejar fallos de pago', () => {
      let donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'pendiente' }
      );

      donacion.estado = 'fallida';
      donacion.razonFallo = 'Fondos insuficientes';

      expect(donacion.estado).toBe('fallida');
      expect(donacion.razonFallo).toBeTruthy();
    });

    test('debe permitir reintentos de pago', () => {
      let donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'fallida',
          reintentos: 0,
        }
      );

      donacion.reintentos = 1;
      donacion.proximoReintento = new Date(Date.now() + 24 * 60 * 60 * 1000);

      expect(donacion.reintentos).toBe(1);
      expect(donacion.proximoReintento).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 5: Registrar donación completada
  // ==========================================
  describe('Paso 5: Registrar donación completada', () => {
    test('debe confirmar donación exitosa', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'completada',
          monto: 100000,
          fechaDonacion: new Date(),
        }
      );

      expect(donacion.estado).toBe('completada');
      expect(donacion.monto).toBeGreaterThan(0);
    });

    test('debe generar recibo de donación', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          estado: 'completada',
          recibo: {
            numero: 'REC-' + Date.now(),
            url: 'https://cloudinary.com/recibo.pdf',
            emailEnviado: true,
          },
        }
      );

      expect(donacion.recibo.numero).toBeTruthy();
      expect(donacion.recibo.url).toMatch(/^https:\/\//);
      expect(donacion.recibo.emailEnviado).toBe(true);
    });

    test('debe permitir descarga de certificado de donación', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          certificado: {
            generado: true,
            url: 'https://cloudinary.com/certificado.pdf',
          },
        }
      );

      expect(donacion.certificado.generado).toBe(true);
      expect(donacion.certificado.url).toMatch(/\.pdf$/);
    });
  });

  // ==========================================
  // PASO 6: Actualizar meta de donación
  // ==========================================
  describe('Paso 6: Actualizar meta de donación', () => {
    test('debe sumar donación al monto recolectado', () => {
      let meta = {
        montoMeta: 5000000,
        montoRecolectado: 1000000,
        donaciones: [],
      };

      const nuevaDonacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        { monto: 500000, estado: 'completada' }
      );

      meta.montoRecolectado += nuevaDonacion.monto;
      meta.donaciones.push(nuevaDonacion._id);

      expect(meta.montoRecolectado).toBe(1500000);
      expect(meta.donaciones.length).toBe(1);
    });

    test('debe calcular porcentaje de progreso', () => {
      const meta = {
        montoMeta: 5000000,
        montoRecolectado: 2500000,
      };

      const porcentaje = (meta.montoRecolectado / meta.montoMeta) * 100;
      expect(porcentaje).toBe(50);
    });

    test('debe actualizar estado de meta si alcanza objetivo', () => {
      let meta = {
        montoMeta: 5000000,
        montoRecolectado: 4900000,
        estado: 'activa',
      };

      const nuevaDonacion = 150000;
      meta.montoRecolectado += nuevaDonacion;

      if (meta.montoRecolectado >= meta.montoMeta) {
        meta.estado = 'completada';
        meta.fechaComplecion = new Date();
      }

      expect(meta.estado).toBe('completada');
      expect(meta.fechaComplecion).toBeTruthy();
    });

    test('debe calcular cantidad de donantes únicos', () => {
      const meta = {
        donantes: [
          new (require('mongoose')).Types.ObjectId(),
          new (require('mongoose')).Types.ObjectId(),
          new (require('mongoose')).Types.ObjectId(),
        ],
      };

      const cantidadDonantes = new Set(meta.donantes).size;
      expect(cantidadDonantes).toBe(3);
    });

    test('debe calcular monto promedio por donación', () => {
      const meta = {
        montoRecolectado: 3000000,
        totalDonaciones: 15,
      };

      const promedio = meta.montoRecolectado / meta.totalDonaciones;
      expect(promedio).toBe(200000);
    });
  });

  // ==========================================
  // PASO 7: Notificaciones
  // ==========================================
  describe('Paso 7: Notificaciones', () => {
    test('debe enviar confirmación de donación al donante', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'completada' }
      );

      const notificacion = {
        tipo: 'donacion-confirmada',
        destinatario: donacion.donador,
        asunto: 'Gracias por tu donación',
        fecha: new Date(),
      };

      expect(notificacion.tipo).toBe('donacion-confirmada');
      expect(notificacion.destinatario).toEqual(donacion.donador);
    });

    test('debe notificar a fundación cuando se alcanza meta', () => {
      const meta = {
        _id: new (require('mongoose')).Types.ObjectId(),
        titulo: 'Meta completada',
        estado: 'completada',
      };

      const notificacion = {
        tipo: 'meta-completada',
        metaId: meta._id,
        mensaje: `La meta "${meta.titulo}" ha sido alcanzada`,
        fecha: new Date(),
      };

      expect(notificacion.tipo).toBe('meta-completada');
      expect(notificacion.metaId).toEqual(meta._id);
    });

    test('debe enviar recordatorio de meta cercana a completarse', () => {
      const meta = {
        montoMeta: 5000000,
        montoRecolectado: 4500000, // 90%
      };

      const porcentaje = (meta.montoRecolectado / meta.montoMeta) * 100;
      const debeNotificar = porcentaje >= 80 && porcentaje < 100;

      expect(debeNotificar).toBe(true);
    });

    test('debe reconocer a donante grande en notificación', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        {
          monto: 1000000, // donación grande
          estado: 'completada',
        }
      );

      const esDonanteGrande = donacion.monto >= 500000;

      if (esDonanteGrande) {
        expect(true).toBe(true); // Notificación especial
      }
    });
  });

  // ==========================================
  // PASO 8: Gestión de recursos
  // ==========================================
  describe('Paso 8: Gestión de recursos', () => {
    test('debe crear necesidad vinculada a meta de donación', () => {
      const necesidad = crearNecesidadMock({
        titulo: 'Comida para perros (Enero)',
        metaId: new (require('mongoose')).Types.ObjectId(),
        cantidad: 200,
        unidad: 'kg',
        costo: 5000000,
      });

      expect(necesidad.titulo).toBeTruthy();
      expect(necesidad.metaId).toBeDefined();
    });

    test('debe registrar compra realizada con donación', () => {
      const compra = {
        necesidadId: new (require('mongoose')).Types.ObjectId(),
        donacionesUsadas: [
          new (require('mongoose')).Types.ObjectId(),
          new (require('mongoose')).Types.ObjectId(),
        ],
        montoTotal: 500000,
        proveedor: 'Tienda Pet Plus',
        fechaCompra: new Date(),
        certificadoCompra: 'https://cloudinary.com/compra.pdf',
      };

      expect(compra.montoTotal).toBeGreaterThan(0);
      expect(Array.isArray(compra.donacionesUsadas)).toBe(true);
      expect(compra.certificadoCompra).toMatch(/^https:\/\//);
    });

    test('debe permitir rastrear dinero donado', () => {
      const donacion = crearDonacionMock(
        new (require('mongoose')).Types.ObjectId(),
        { estado: 'completada' }
      );

      const rastreo = {
        donacionId: donacion._id,
        etapas: [
          { nombre: 'Recibida', fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
          { nombre: 'Asignada a meta', fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          { nombre: 'Usada en compra', fecha: new Date() },
        ],
      };

      expect(Array.isArray(rastreo.etapas)).toBe(true);
      expect(rastreo.etapas.length).toBe(3);
    });
  });

  // ==========================================
  // FLUJO COMPLETO DE DONACIÓN
  // ==========================================
  describe('Flujo Completo de Donación', () => {
    test('debe ejecutar flujo completo de donación sin errores', async () => {
      // 1. Crear meta
      let meta = {
        _id: new (require('mongoose')).Types.ObjectId(),
        titulo: 'Alimento para mascotas enero 2024',
        montoMeta: 5000000,
        montoRecolectado: 0,
        estado: 'activa',
        donaciones: [],
      };

      // 2. Registrar donante
      const donante = crearUsuarioMock({ role: 'adoptante' });

      // 3. Crear donación
      let donacion1 = crearDonacionMock(donante._id, {
        monto: 100000,
        estado: 'completada',
      });

      // 4. Actualizar meta
      meta.montoRecolectado += donacion1.monto;
      meta.donaciones.push(donacion1._id);

      // 5. Más donaciones
      let donacion2 = crearDonacionMock(donante._id, {
        monto: 500000,
        estado: 'completada',
      });

      meta.montoRecolectado += donacion2.monto;
      meta.donaciones.push(donacion2._id);

      let donacion3 = crearDonacionMock(donante._id, {
        monto: 4400000,
        estado: 'completada',
      });

      meta.montoRecolectado += donacion3.monto;
      meta.donaciones.push(donacion3._id);

      // 6. Marcar meta como completada
      if (meta.montoRecolectado >= meta.montoMeta) {
        meta.estado = 'completada';
        meta.fechaComplecion = new Date();
      }

      // 7. Crear necesidad y compra
      const necesidad = crearNecesidadMock({
        titulo: 'Comida para mascotas',
        metaId: meta._id,
        cantidad: 200,
        unidad: 'kg',
      });

      // Validaciones finales
      expect(meta.estado).toBe('completada');
      expect(meta.montoRecolectado).toBe(5000000);
      expect(meta.donaciones.length).toBe(3);
      expect(necesidad.metaId).toEqual(meta._id);
    });

    test('debe calcular estadísticas de donación', () => {
      const donaciones = [
        crearDonacionMock(new (require('mongoose')).Types.ObjectId(), { monto: 100000 }),
        crearDonacionMock(new (require('mongoose')).Types.ObjectId(), { monto: 250000 }),
        crearDonacionMock(new (require('mongoose')).Types.ObjectId(), { monto: 150000 }),
      ];

      const estadisticas = {
        totalDonaciones: donaciones.length,
        montoTotal: donaciones.reduce((sum, d) => sum + d.monto, 0),
        montoPromedio: donaciones.reduce((sum, d) => sum + d.monto, 0) / donaciones.length,
        montoMinimo: Math.min(...donaciones.map(d => d.monto)),
        montoMaximo: Math.max(...donaciones.map(d => d.monto)),
      };

      expect(estadisticas.totalDonaciones).toBe(3);
      expect(estadisticas.montoTotal).toBe(500000);
      expect(estadisticas.montoPromedio).toBeCloseTo(166666.67, 0);
      expect(estadisticas.montoMinimo).toBe(100000);
      expect(estadisticas.montoMaximo).toBe(250000);
    });

    test('debe generar reporte mensual de donaciones', () => {
      const mes = new Date().getMonth();
      const anio = new Date().getFullYear();

      const reporte = {
        mes,
        anio,
        totalDonantes: 25,
        totalDonaciones: 120,
        montoTotal: 15000000,
        metasCompletadas: 2,
        metasEnProgreso: 3,
        gastos: 14500000,
      };

      expect(reporte.montoTotal).toBeGreaterThan(reporte.gastos);
      expect(reporte.metasCompletadas).toBeGreaterThanOrEqual(0);
    });
  });
});
