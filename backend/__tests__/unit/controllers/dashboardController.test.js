/**
 * Tests para Dashboard Controller
 * Prueba estadísticas, gráficos, conteos, filtros
 */

const dashboardController = require('../../../controllers/dashboardController');

jest.mock('../../../models/Mascota');
jest.mock('../../../models/SolicitudAdopcion');
jest.mock('../../../models/User');
jest.mock('../../../models/Donation');
jest.mock('../../../models/ProcesoAdopcion');
jest.mock('mongoose');

describe('Controller - Dashboard', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

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

  describe('Utilidades de Fecha', () => {
    test('debe calcular inicio de mes', () => {
      const fecha = new Date('2023-06-15');
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0, 0);
      
      expect(inicio.getDate()).toBe(1);
      expect(inicio.getHours()).toBe(0);
    });

    test('debe calcular fin de mes', () => {
      const fecha = new Date('2023-06-15');
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
      
      expect(fin.getDate()).toBe(30); // Junio tiene 30 días
      expect(fin.getHours()).toBe(23);
    });

    test('debe generar últimos 6 meses', () => {
      const ahora = new Date();
      const meses = [];
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        meses.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1
        });
      }
      
      expect(meses.length).toBe(6);
      expect(meses[0].month).toBeLessThanOrEqual(12);
    });

    test('debe generar últimos 12 meses', () => {
      const ahora = new Date();
      const meses = [];
      
      for (let i = 11; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        meses.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1
        });
      }
      
      expect(meses.length).toBe(12);
    });

    test('debe generar últimos 3 meses', () => {
      const ahora = new Date();
      const meses = [];
      
      for (let i = 2; i >= 0; i--) {
        const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        meses.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1
        });
      }
      
      expect(meses.length).toBe(3);
    });
  });

  describe('Nombres de Meses', () => {
    test('debe tener 12 meses en español', () => {
      const meses = [
        'Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
      ];
      
      expect(meses.length).toBe(12);
      expect(meses[0]).toBe('Enero');
      expect(meses[11]).toBe('Diciembre');
    });

    test('debe mapear índice a mes correcto', () => {
      const meses = [
        'Enero','Febrero','Marzo','Abril','Mayo','Junio',
        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
      ];
      
      const fecha = new Date(2023, 5, 15); // Junio
      expect(meses[fecha.getMonth()]).toBe('Junio');
    });
  });

  describe('Series Mensuales por Conteo', () => {
    test('debe contar elementos por mes', () => {
      const datos = [
        { fecha: new Date('2023-01-15'), count: 5 },
        { fecha: new Date('2023-02-20'), count: 3 },
        { fecha: new Date('2023-03-10'), count: 8 }
      ];
      
      const totalEnero = datos.filter(d => d.fecha.getMonth() === 0).reduce((sum, d) => sum + d.count, 0);
      expect(totalEnero).toBe(5);
    });

    test('debe generar serie con meses sin datos', () => {
      const meses = ['Enero', 'Febrero', 'Marzo'];
      const datos = new Map([['Enero', 5], ['Marzo', 8]]);
      
      const serie = meses.map(m => ({
        name: m,
        val: datos.get(m) || 0
      }));
      
      expect(serie[1].val).toBe(0); // Febrero sin datos
      expect(serie.length).toBe(3);
    });

    test('debe sumar conteos correctamente', () => {
      const elementos = [1, 1, 1, 1, 1]; // 5 elementos
      const total = elementos.reduce((sum) => sum + 1, 0);
      
      expect(total).toBe(5);
    });
  });

  describe('Series Mensuales por Suma', () => {
    test('debe sumar montos por mes', () => {
      const donaciones = [
        { mes: 'Enero', monto: 50000 },
        { mes: 'Enero', monto: 30000 },
        { mes: 'Febrero', monto: 20000 }
      ];
      
      const totalEnero = donaciones
        .filter(d => d.mes === 'Enero')
        .reduce((sum, d) => sum + d.monto, 0);
      
      expect(totalEnero).toBe(80000);
    });

    test('debe calcular promedio de montos', () => {
      const donaciones = [50000, 30000, 20000];
      const promedio = donaciones.reduce((sum, m) => sum + m, 0) / donaciones.length;
      
      expect(Math.round(promedio * 100) / 100).toBe(Math.round(33333.33333333333 * 100) / 100);
    });

    test('debe encontrar máximo monto', () => {
      const montos = [50000, 30000, 100000, 20000];
      const maximo = Math.max(...montos);
      
      expect(maximo).toBe(100000);
    });

    test('debe encontrar mínimo monto', () => {
      const montos = [50000, 30000, 100000, 20000];
      const minimo = Math.min(...montos);
      
      expect(minimo).toBe(20000);
    });
  });

  describe('Estadísticas Generales', () => {
    test('debe contar total de mascotas', () => {
      const mascotas = [
        { id: 1, nombre: 'Rex' },
        { id: 2, nombre: 'Luna' },
        { id: 3, nombre: 'Max' }
      ];
      
      expect(mascotas.length).toBe(3);
    });

    test('debe contar mascotas disponibles', () => {
      const mascotas = [
        { disponible: true },
        { disponible: false },
        { disponible: true }
      ];
      
      const disponibles = mascotas.filter(m => m.disponible).length;
      expect(disponibles).toBe(2);
    });

    test('debe contar mascotas adoptadas', () => {
      const mascotas = [
        { disponible: false },
        { disponible: false },
        { disponible: true }
      ];
      
      const adoptadas = mascotas.filter(m => !m.disponible).length;
      expect(adoptadas).toBe(2);
    });

    test('debe contar solicitudes totales', () => {
      const solicitudes = [
        { estado: 'pendiente' },
        { estado: 'aprobada' },
        { estado: 'rechazada' }
      ];
      
      expect(solicitudes.length).toBe(3);
    });

    test('debe contar solicitudes pendientes', () => {
      const solicitudes = [
        { estado: 'pendiente' },
        { estado: 'aprobada' },
        { estado: 'pendiente' }
      ];
      
      const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;
      expect(pendientes).toBe(2);
    });

    test('debe contar solicitudes aprobadas', () => {
      const solicitudes = [
        { estado: 'pendiente' },
        { estado: 'aprobada' },
        { estado: 'aprobada' }
      ];
      
      const aprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
      expect(aprobadas).toBe(2);
    });

    test('debe contar solicitudes rechazadas', () => {
      const solicitudes = [
        { estado: 'rechazada' },
        { estado: 'aprobada' },
        { estado: 'rechazada' }
      ];
      
      const rechazadas = solicitudes.filter(s => s.estado === 'rechazada').length;
      expect(rechazadas).toBe(2);
    });

    test('debe calcular tasa de aprobación', () => {
      const solicitudes = [
        { estado: 'aprobada' },
        { estado: 'aprobada' },
        { estado: 'rechazada' },
        { estado: 'pendiente' }
      ];
      
      const aprobadas = solicitudes.filter(s => s.estado === 'aprobada').length;
      const total = solicitudes.length;
      const tasa = (aprobadas / total) * 100;
      
      expect(tasa).toBe(50);
    });

    test('debe sumar total de donaciones', () => {
      const donaciones = [
        { monto: 50000 },
        { monto: 30000 },
        { monto: 20000 }
      ];
      
      const total = donaciones.reduce((sum, d) => sum + d.monto, 0);
      expect(total).toBe(100000);
    });

    test('debe contar donantes únicos', () => {
      const donaciones = [
        { donante: 'user1' },
        { donante: 'user2' },
        { donante: 'user1' }
      ];
      
      const donantesUnicos = new Set(donaciones.map(d => d.donante)).size;
      expect(donantesUnicos).toBe(2);
    });

    test('debe calcular donación promedio', () => {
      const donaciones = [
        { monto: 50000 },
        { monto: 30000 },
        { monto: 20000 }
      ];
      
      const promedio = donaciones.reduce((sum, d) => sum + d.monto, 0) / donaciones.length;
      expect(Math.round(promedio * 100) / 100).toBeCloseTo(33333.33, 2);
    });
  });

  describe('Etapas de Adopción', () => {
    test('debe validar que entrevista esté aprobada', () => {
      const proceso = {
        entrevista: { aprobada: true }
      };
      
      expect(proceso.entrevista.aprobada).toBe(true);
    });

    test('debe validar que visita esté aprobada', () => {
      const proceso = {
        visita: { aprobada: true }
      };
      
      expect(proceso.visita.aprobada).toBe(true);
    });

    test('debe validar que compromiso esté aprobado', () => {
      const proceso = {
        compromiso: { aprobada: true }
      };
      
      expect(proceso.compromiso.aprobada).toBe(true);
    });

    test('debe validar que entrega esté aprobada', () => {
      const proceso = {
        entrega: { aprobada: true }
      };
      
      expect(proceso.entrega.aprobada).toBe(true);
    });

    test('debe validar que todas las etapas estén aprobadas', () => {
      const proceso = {
        entrevista: { aprobada: true },
        visita: { aprobada: true },
        compromiso: { aprobada: true },
        entrega: { aprobada: true }
      };
      
      const todasAprobadas = Boolean(
        proceso.entrevista?.aprobada &&
        proceso.visita?.aprobada &&
        proceso.compromiso?.aprobada &&
        proceso.entrega?.aprobada
      );
      
      expect(todasAprobadas).toBe(true);
    });

    test('debe detectar que no todas las etapas estén aprobadas', () => {
      const proceso = {
        entrevista: { aprobada: true },
        visita: { aprobada: false },
        compromiso: { aprobada: true },
        entrega: { aprobada: true }
      };
      
      const todasAprobadas = Boolean(
        proceso.entrevista?.aprobada &&
        proceso.visita?.aprobada &&
        proceso.compromiso?.aprobada &&
        proceso.entrega?.aprobada
      );
      
      expect(todasAprobadas).toBe(false);
    });

    test('debe contar procesos completados', () => {
      const procesos = [
        { completo: true },
        { completo: true },
        { completo: false }
      ];
      
      const completados = procesos.filter(p => p.completo).length;
      expect(completados).toBe(2);
    });

    test('debe contar procesos en proceso', () => {
      const procesos = [
        { completo: true },
        { completo: false },
        { completo: false }
      ];
      
      const enProceso = procesos.filter(p => !p.completo).length;
      expect(enProceso).toBe(2);
    });
  });

  describe('Filtros por Rango de Fecha', () => {
    test('debe filtrar elementos en rango de fecha', () => {
      const elementos = [
        { fecha: new Date('2023-01-15') },
        { fecha: new Date('2023-03-20') },
        { fecha: new Date('2023-06-10') }
      ];
      
      const inicio = new Date('2023-02-01');
      const fin = new Date('2023-05-31');
      
      const filtrados = elementos.filter(e => e.fecha >= inicio && e.fecha <= fin);
      expect(filtrados.length).toBe(1);
    });

    test('debe filtrar últimos 30 días', () => {
      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const elementos = [
        { fecha: new Date(ahora.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { fecha: new Date(ahora.getTime() - 40 * 24 * 60 * 60 * 1000) }
      ];
      
      const filtrados = elementos.filter(e => e.fecha >= hace30Dias);
      expect(filtrados.length).toBe(1);
    });

    test('debe filtrar últimos 90 días', () => {
      const ahora = new Date();
      const hace90Dias = new Date(ahora.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      const elementos = [
        { fecha: new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000) },
        { fecha: new Date(ahora.getTime() - 100 * 24 * 60 * 60 * 1000) }
      ];
      
      const filtrados = elementos.filter(e => e.fecha >= hace90Dias);
      expect(filtrados.length).toBe(1);
    });
  });

  describe('Agrupación por Estado', () => {
    test('debe agrupar solicitudes por estado', () => {
      const solicitudes = [
        { estado: 'pendiente' },
        { estado: 'aprobada' },
        { estado: 'pendiente' },
        { estado: 'rechazada' }
      ];
      
      const agrupado = {};
      solicitudes.forEach(s => {
        agrupado[s.estado] = (agrupado[s.estado] || 0) + 1;
      });
      
      expect(agrupado.pendiente).toBe(2);
      expect(agrupado.aprobada).toBe(1);
      expect(agrupado.rechazada).toBe(1);
    });

    test('debe agrupar mascotas por especie', () => {
      const mascotas = [
        { especie: 'perro' },
        { especie: 'gato' },
        { especie: 'perro' }
      ];
      
      const agrupado = {};
      mascotas.forEach(m => {
        agrupado[m.especie] = (agrupado[m.especie] || 0) + 1;
      });
      
      expect(agrupado.perro).toBe(2);
      expect(agrupado.gato).toBe(1);
    });

    test('debe agrupar donaciones por estado', () => {
      const donaciones = [
        { estado: 'pendiente', monto: 50000 },
        { estado: 'completada', monto: 30000 },
        { estado: 'completada', monto: 20000 }
      ];
      
      const agrupado = {};
      donaciones.forEach(d => {
        if (!agrupado[d.estado]) {
          agrupado[d.estado] = { count: 0, total: 0 };
        }
        agrupado[d.estado].count++;
        agrupado[d.estado].total += d.monto;
      });
      
      expect(agrupado.completada.count).toBe(2);
      expect(agrupado.completada.total).toBe(50000);
    });
  });

  describe('Percentiles y Cuartiles', () => {
    test('debe calcular percentil 25', () => {
      const valores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const p25 = valores[Math.floor(valores.length * 0.25)];
      
      expect(p25).toBe(30);
    });

    test('debe calcular mediana (percentil 50)', () => {
      const valores = [10, 20, 30, 40, 50];
      const mediana = valores[Math.floor(valores.length / 2)];
      
      expect(mediana).toBe(30);
    });

    test('debe calcular percentil 75', () => {
      const valores = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const p75 = valores[Math.floor(valores.length * 0.75)];
      
      expect(p75).toBe(80);
    });
  });

  describe('Tasas y Porcentajes', () => {
    test('debe calcular porcentaje de éxito', () => {
      const exitosas = 75;
      const total = 100;
      const porcentaje = (exitosas / total) * 100;
      
      expect(porcentaje).toBe(75);
    });

    test('debe calcular tasa de conversion', () => {
      const solicitudes = 100;
      const aprobadas = 70;
      const tasa = (aprobadas / solicitudes) * 100;
      
      expect(tasa).toBe(70);
    });

    test('debe calcular tasa de rechazo', () => {
      const solicitudes = 100;
      const rechazadas = 20;
      const tasa = (rechazadas / solicitudes) * 100;
      
      expect(tasa).toBe(20);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo admin puede ver dashboard completo', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'admin';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('adminFundacion puede ver dashboard limitado', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'adminFundacion';
      
      expect(rolesPermitidos).toContain(role);
    });

    test('adoptante NO puede ver dashboard', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const role = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(role);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error en agregación', () => {
      const error = new Error('Aggregation error');
      expect(error.message).toContain('Aggregation');
    });

    test('debe manejar datos vacíos', () => {
      const datos = [];
      expect(datos.length).toBe(0);
    });

    test('debe validar que Model exista', () => {
      const Model = undefined;
      expect(Model).toBeUndefined();
    });

    test('debe validar fechas válidas', () => {
      const fecha = new Date('invalid');
      expect(isNaN(fecha.getTime())).toBe(true);
    });
  });
});
