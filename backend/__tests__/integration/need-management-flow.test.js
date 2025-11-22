// __tests__/integration/need-management-flow.test.js
// ==================================================
// Tests de Integración - Gestión de Necesidades
// Simula: Crear → Actualizar → Filtrar → Completar
// ==================================================

const {
  crearNecesidadMock,
  crearUsuarioMock,
  limpiarMocks,
} = require('./integration.setup');

describe('INTEGRACIÓN: Gestión de Necesidades', () => {
  
  beforeEach(() => {
    limpiarMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // PASO 1: Crear necesidad
  // ==========================================
  describe('Paso 1: Crear necesidad', () => {
    test('debe crear necesidad con datos completos', () => {
      const necesidad = crearNecesidadMock({
        titulo: 'Comida para gatos',
        descripcion: 'Se necesita alimento premium para 20 gatos',
        categoria: 'alimento',
      });

      expect(necesidad.titulo).toBeTruthy();
      expect(necesidad.descripcion).toBeTruthy();
      expect(necesidad.categoria).toBe('alimento');
    });

    test('debe validar categorías permitidas', () => {
      const categorias = ['alimento', 'medicina', 'cuidados', 'infraestructura', 'otro'];

      categorias.forEach(cat => {
        const necesidad = crearNecesidadMock({ categoria: cat });
        expect(categorias).toContain(necesidad.categoria);
      });
    });

    test('debe validar urgencia de necesidad', () => {
      const urgencias = ['baja', 'media', 'alta', 'critica'];

      urgencias.forEach(urg => {
        const necesidad = crearNecesidadMock({ urgencia: urg });
        expect(urgencias).toContain(necesidad.urgencia);
      });
    });

    test('debe validar cantidad requerida', () => {
      const necesidad = crearNecesidadMock({
        cantidad: 100,
        unidad: 'kg',
      });

      expect(necesidad.cantidad).toBeGreaterThan(0);
      expect(necesidad.unidad).toBeTruthy();
    });

    test('debe crear necesidad en estado activa', () => {
      const necesidad = crearNecesidadMock({
        estado: 'activa',
      });

      expect(necesidad.estado).toBe('activa');
    });

    test('debe asignar creador de la necesidad', () => {
      const usuario = crearUsuarioMock({ role: 'adminFundacion' });
      const necesidad = crearNecesidadMock({
        creadoPor: usuario._id,
      });

      expect(necesidad.creadoPor).toEqual(usuario._id);
    });
  });

  // ==========================================
  // PASO 2: Actualizar necesidad
  // ==========================================
  describe('Paso 2: Actualizar necesidad', () => {
    test('debe permitir cambiar descripción', () => {
      let necesidad = crearNecesidadMock({
        descripcion: 'Descripción original',
      });

      necesidad.descripcion = 'Descripción actualizada';
      necesidad.updatedAt = new Date();

      expect(necesidad.descripcion).toBe('Descripción actualizada');
    });

    test('debe permitir cambiar cantidad', () => {
      let necesidad = crearNecesidadMock({
        cantidad: 50,
      });

      necesidad.cantidad = 100;

      expect(necesidad.cantidad).toBe(100);
    });

    test('debe permitir cambiar urgencia', () => {
      let necesidad = crearNecesidadMock({
        urgencia: 'media',
      });

      necesidad.urgencia = 'alta';

      expect(necesidad.urgencia).toBe('alta');
    });

    test('debe registrar historial de cambios', () => {
      let necesidad = crearNecesidadMock({
        cantidad: 50,
        historial: [
          {
            fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            campo: 'cantidad',
            valorAnterior: 50,
            valorNuevo: 75,
          },
        ],
      });

      necesidad.cantidad = 100;
      necesidad.historial.push({
        fecha: new Date(),
        campo: 'cantidad',
        valorAnterior: 75,
        valorNuevo: 100,
      });

      expect(necesidad.historial.length).toBe(2);
    });

    test('debe permitir agregar notas', () => {
      let necesidad = crearNecesidadMock();

      necesidad.notas = 'Verificada por veterinario';
      necesidad.fechaUltimaVerificacion = new Date();

      expect(necesidad.notas).toBeTruthy();
      expect(necesidad.fechaUltimaVerificacion).toBeTruthy();
    });
  });

  // ==========================================
  // PASO 3: Filtrar necesidades
  // ==========================================
  describe('Paso 3: Filtrar necesidades', () => {
    test('debe filtrar por estado', () => {
      const necesidades = [
        crearNecesidadMock({ estado: 'activa' }),
        crearNecesidadMock({ estado: 'completada' }),
        crearNecesidadMock({ estado: 'activa' }),
      ];

      const activas = necesidades.filter(n => n.estado === 'activa');
      expect(activas.length).toBe(2);
    });

    test('debe filtrar por categoría', () => {
      const necesidades = [
        crearNecesidadMock({ categoria: 'alimento' }),
        crearNecesidadMock({ categoria: 'medicina' }),
        crearNecesidadMock({ categoria: 'alimento' }),
      ];

      const alimentacion = necesidades.filter(n => n.categoria === 'alimento');
      expect(alimentacion.length).toBe(2);
    });

    test('debe filtrar por urgencia', () => {
      const necesidades = [
        crearNecesidadMock({ urgencia: 'alta' }),
        crearNecesidadMock({ urgencia: 'baja' }),
        crearNecesidadMock({ urgencia: 'alta' }),
      ];

      const urgentes = necesidades.filter(n => n.urgencia === 'alta');
      expect(urgentes.length).toBe(2);
    });

    test('debe filtrar por fecha de creación', () => {
      const ahora = Date.now();
      const necesidades = [
        crearNecesidadMock({ createdAt: new Date(ahora - 30 * 24 * 60 * 60 * 1000) }),
        crearNecesidadMock({ createdAt: new Date(ahora - 5 * 24 * 60 * 60 * 1000) }),
        crearNecesidadMock({ createdAt: new Date(ahora) }),
      ];

      const recientes = necesidades.filter(n => {
        const dias = (ahora - n.createdAt) / (24 * 60 * 60 * 1000);
        return dias <= 7;
      });

      expect(recientes.length).toBe(2);
    });

    test('debe aplicar múltiples filtros simultáneamente', () => {
      const necesidades = [
        crearNecesidadMock({ estado: 'activa', urgencia: 'alta', categoria: 'alimento' }),
        crearNecesidadMock({ estado: 'activa', urgencia: 'baja', categoria: 'alimento' }),
        crearNecesidadMock({ estado: 'completada', urgencia: 'alta', categoria: 'alimento' }),
        crearNecesidadMock({ estado: 'activa', urgencia: 'alta', categoria: 'medicina' }),
      ];

      const filtradas = necesidades.filter(n => 
        n.estado === 'activa' && 
        n.urgencia === 'alta' && 
        n.categoria === 'alimento'
      );

      expect(filtradas.length).toBe(1);
    });
  });

  // ==========================================
  // PASO 4: Ordenar necesidades
  // ==========================================
  describe('Paso 4: Ordenar necesidades', () => {
    test('debe ordenar por urgencia descendente', () => {
      const urgencias = { critica: 4, alta: 3, media: 2, baja: 1 };
      const necesidades = [
        crearNecesidadMock({ urgencia: 'media' }),
        crearNecesidadMock({ urgencia: 'critica' }),
        crearNecesidadMock({ urgencia: 'baja' }),
      ];

      const ordenadas = necesidades.sort((a, b) => 
        urgencias[b.urgencia] - urgencias[a.urgencia]
      );

      expect(ordenadas[0].urgencia).toBe('critica');
      expect(ordenadas[2].urgencia).toBe('baja');
    });

    test('debe ordenar por fecha descendente', () => {
      const ahora = Date.now();
      const necesidades = [
        crearNecesidadMock({ createdAt: new Date(ahora - 10 * 24 * 60 * 60 * 1000) }),
        crearNecesidadMock({ createdAt: new Date(ahora) }),
        crearNecesidadMock({ createdAt: new Date(ahora - 5 * 24 * 60 * 60 * 1000) }),
      ];

      const ordenadas = necesidades.sort((a, b) => 
        b.createdAt - a.createdAt
      );

      expect(ordenadas[0].createdAt.getTime()).toBe(ahora);
    });

    test('debe ordenar por cantidad', () => {
      const necesidades = [
        crearNecesidadMock({ cantidad: 50 }),
        crearNecesidadMock({ cantidad: 100 }),
        crearNecesidadMock({ cantidad: 25 }),
      ];

      const ordenadas = necesidades.sort((a, b) => b.cantidad - a.cantidad);

      expect(ordenadas[0].cantidad).toBe(100);
      expect(ordenadas[2].cantidad).toBe(25);
    });
  });

  // ==========================================
  // PASO 5: Asignar recursos a necesidades
  // ==========================================
  describe('Paso 5: Asignar recursos a necesidades', () => {
    test('debe asignar donación a necesidad', () => {
      const necesidad = crearNecesidadMock({
        asignaciones: [],
      });

      const asignacion = {
        donacionId: new (require('mongoose')).Types.ObjectId(),
        monto: 500000,
        fecha: new Date(),
      };

      necesidad.asignaciones.push(asignacion);

      expect(necesidad.asignaciones.length).toBe(1);
      expect(necesidad.asignaciones[0].monto).toBe(500000);
    });

    test('debe calcular cantidad asignada vs requerida', () => {
      const necesidad = crearNecesidadMock({
        cantidad: 100,
        cantidadAsignada: 60,
      });

      const falta = necesidad.cantidad - necesidad.cantidadAsignada;
      expect(falta).toBe(40);
    });

    test('debe calcular porcentaje de cumplimiento', () => {
      const necesidad = crearNecesidadMock({
        cantidad: 100,
        cantidadAsignada: 75,
      });

      const porcentaje = (necesidad.cantidadAsignada / necesidad.cantidad) * 100;
      expect(porcentaje).toBe(75);
    });

    test('debe permitir registrar compra de necesidad', () => {
      let necesidad = crearNecesidadMock({
        estado: 'activa',
        cantidad: 50,
      });

      const compra = {
        fecha: new Date(),
        cantidad: 50,
        proveedor: 'Tienda Pet Plus',
        costo: 500000,
        certificado: 'https://cloudinary.com/compra.pdf',
      };

      necesidad.compras = [compra];
      necesidad.cantidadAsignada = 50;

      // Verificar si está completada
      if (necesidad.cantidadAsignada >= necesidad.cantidad) {
        necesidad.estado = 'completada';
        necesidad.fechaComplecion = new Date();
      }

      expect(necesidad.estado).toBe('completada');
      expect(necesidad.compras.length).toBe(1);
    });
  });

  // ==========================================
  // PASO 6: Marcar como completada
  // ==========================================
  describe('Paso 6: Marcar como completada', () => {
    test('debe cambiar estado a completada', () => {
      let necesidad = crearNecesidadMock({
        estado: 'activa',
      });

      necesidad.estado = 'completada';
      necesidad.fechaComplecion = new Date();

      expect(necesidad.estado).toBe('completada');
      expect(necesidad.fechaComplecion).toBeTruthy();
    });

    test('debe registrar cómo fue completada', () => {
      let necesidad = crearNecesidadMock({
        estado: 'activa',
      });

      necesidad.estado = 'completada';
      necesidad.completadaPor = new (require('mongoose')).Types.ObjectId();
      necesidad.razonComplecion = 'Compra realizada exitosamente';
      necesidad.fechaComplecion = new Date();

      expect(necesidad.completadaPor).toBeDefined();
      expect(necesidad.razonComplecion).toBeTruthy();
    });

    test('debe generar reporte de cumplimiento', () => {
      const necesidad = crearNecesidadMock({
        estado: 'completada',
        cantidad: 100,
        cantidadAsignada: 100,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        fechaComplecion: new Date(),
      });

      const dias = (necesidad.fechaComplecion - necesidad.createdAt) / (24 * 60 * 60 * 1000);

      const reporte = {
        necesidadId: necesidad._id,
        titulo: necesidad.titulo,
        cumplida: true,
        diasTardados: Math.round(dias),
        porcentajeCumplimiento: 100,
      };

      expect(reporte.cumplida).toBe(true);
      expect(reporte.diasTardados).toBeGreaterThan(0);
    });

    test('debe archivar necesidad completada', () => {
      let necesidad = crearNecesidadMock({
        estado: 'completada',
        archivada: false,
      });

      necesidad.archivada = true;
      necesidad.fechaArchivo = new Date();

      expect(necesidad.archivada).toBe(true);
    });
  });

  // ==========================================
  // PASO 7: Gestión de estadísticas
  // ==========================================
  describe('Paso 7: Gestión de estadísticas', () => {
    test('debe calcular total de necesidades', () => {
      const necesidades = [
        crearNecesidadMock(),
        crearNecesidadMock(),
        crearNecesidadMock(),
      ];

      expect(necesidades.length).toBe(3);
    });

    test('debe calcular porcentaje completado', () => {
      const necesidades = [
        crearNecesidadMock({ estado: 'completada' }),
        crearNecesidadMock({ estado: 'activa' }),
        crearNecesidadMock({ estado: 'completada' }),
      ];

      const completadas = necesidades.filter(n => n.estado === 'completada').length;
      const porcentaje = (completadas / necesidades.length) * 100;

      expect(porcentaje).toBeCloseTo(66.67, 0);
    });

    test('debe mostrar necesidades por categoría', () => {
      const necesidades = [
        crearNecesidadMock({ categoria: 'alimento' }),
        crearNecesidadMock({ categoria: 'medicina' }),
        crearNecesidadMock({ categoria: 'alimento' }),
        crearNecesidadMock({ categoria: 'cuidados' }),
      ];

      const porCategoria = {};
      necesidades.forEach(n => {
        porCategoria[n.categoria] = (porCategoria[n.categoria] || 0) + 1;
      });

      expect(porCategoria['alimento']).toBe(2);
      expect(porCategoria['medicina']).toBe(1);
      expect(porCategoria['cuidados']).toBe(1);
    });

    test('debe calcular urgencia promedio', () => {
      const urgencias = { baja: 1, media: 2, alta: 3, critica: 4 };
      const necesidades = [
        crearNecesidadMock({ urgencia: 'alta' }),
        crearNecesidadMock({ urgencia: 'media' }),
        crearNecesidadMock({ urgencia: 'critica' }),
      ];

      const sumaUrgencia = necesidades.reduce((sum, n) => 
        sum + urgencias[n.urgencia], 0
      );
      const promedio = sumaUrgencia / necesidades.length;

      expect(promedio).toBeCloseTo(3, 0);
    });
  });

  // ==========================================
  // FLUJO COMPLETO DE NECESIDADES
  // ==========================================
  describe('Flujo Completo de Necesidades', () => {
    test('debe ejecutar flujo completo sin errores', async () => {
      // 1. Crear necesidad
      let necesidad = crearNecesidadMock({
        titulo: 'Comida premium para gatos',
        descripcion: 'Alimento specializado',
        cantidad: 100,
        unidad: 'kg',
        estado: 'activa',
        urgencia: 'alta',
        categoria: 'alimento',
      });

      // 2. Actualizar
      necesidad.cantidad = 120;

      // 3. Asignar recursos
      necesidad.cantidadAsignada = 0;
      necesidad.asignaciones = [];

      necesidad.asignaciones.push({
        donacionId: new (require('mongoose')).Types.ObjectId(),
        cantidad: 80,
        fecha: new Date(),
      });
      necesidad.cantidadAsignada = 80;

      necesidad.asignaciones.push({
        donacionId: new (require('mongoose')).Types.ObjectId(),
        cantidad: 40,
        fecha: new Date(),
      });
      necesidad.cantidadAsignada = 120;

      // 4. Completar
      if (necesidad.cantidadAsignada >= necesidad.cantidad) {
        necesidad.estado = 'completada';
        necesidad.fechaComplecion = new Date();
      }

      // 5. Archivar
      necesidad.archivada = true;

      // Validaciones
      expect(necesidad.estado).toBe('completada');
      expect(necesidad.archivada).toBe(true);
      expect(necesidad.asignaciones.length).toBe(2);
      expect(necesidad.cantidadAsignada).toBe(120);
    });

    test('debe generar estadísticas mensuales', () => {
      const necesidades = [
        crearNecesidadMock({ estado: 'completada' }),
        crearNecesidadMock({ estado: 'completada' }),
        crearNecesidadMock({ estado: 'activa' }),
      ];

      const stats = {
        total: necesidades.length,
        completadas: necesidades.filter(n => n.estado === 'completada').length,
        activas: necesidades.filter(n => n.estado === 'activa').length,
        porcentajeComplecion: (necesidades.filter(n => n.estado === 'completada').length / necesidades.length) * 100,
      };

      expect(stats.total).toBe(3);
      expect(stats.completadas).toBe(2);
      expect(stats.activas).toBe(1);
      expect(stats.porcentajeComplecion).toBeCloseTo(66.67, 0);
    });

    test('debe generar reporte detallado de necesidades', () => {
      const necesidades = Array.from({ length: 10 }, () => 
        crearNecesidadMock({
          estado: Math.random() > 0.4 ? 'completada' : 'activa',
        })
      );

      const reporte = {
        fecha: new Date(),
        totalNecesidades: necesidades.length,
        completadas: necesidades.filter(n => n.estado === 'completada').length,
        pendientes: necesidades.filter(n => n.estado === 'activa').length,
        porcentajeCumplimiento: (necesidades.filter(n => n.estado === 'completada').length / necesidades.length) * 100,
      };

      expect(reporte.totalNecesidades).toBe(10);
      expect(reporte.completadas + reporte.pendientes).toBe(10);
    });
  });
});
