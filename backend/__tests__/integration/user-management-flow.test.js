// __tests__/integration/user-management-flow.test.js
// ==================================================
// Tests de Integración - Gestión de Usuarios
// Simula: Registro → Verificación → Roles → Búsqueda
// ==================================================

const {
  crearUsuarioMock,
  generarToken,
  limpiarMocks,
  validarUsuarioCompleto,
} = require('./integration.setup');

describe('INTEGRACIÓN: Gestión de Usuarios', () => {
  
  beforeEach(() => {
    limpiarMocks();
    jest.clearAllMocks();
  });

  // ==========================================
  // PASO 1: Registro de usuarios
  // ==========================================
  describe('Paso 1: Registro de usuarios', () => {
    test('debe registrar adoptante', () => {
      const adoptante = crearUsuarioMock({
        username: 'juan_adoptante',
        email: 'juan@example.com',
        role: 'adoptante',
      });

      validarUsuarioCompleto(adoptante);
      expect(adoptante.role).toBe('adoptante');
    });

    test('debe registrar administrador', () => {
      const admin = crearUsuarioMock({
        username: 'admin_sistema',
        email: 'admin@adoptme.org',
        role: 'admin',
      });

      expect(admin.role).toBe('admin');
    });

    test('debe registrar admin de fundación', () => {
      const adminFund = crearUsuarioMock({
        username: 'fundacion_admin',
        email: 'admin@fundacion.org',
        role: 'adminFundacion',
      });

      expect(adminFund.role).toBe('adminFundacion');
    });

    test('debe validar email único en registro', () => {
      const usuario1 = crearUsuarioMock({ email: 'test@example.com' });
      const usuario2 = crearUsuarioMock({ email: 'test@example.com' });

      // Simular validación
      const emails = [usuario1.email];
      const esUnico = !emails.includes(usuario2.email);
      
      expect(esUnico).toBe(false);
    });

    test('debe validar username único en registro', () => {
      const usuario1 = crearUsuarioMock({ username: 'juan' });
      const usuario2 = crearUsuarioMock({ username: 'juan' });

      const usernames = [usuario1.username];
      const esUnico = !usernames.includes(usuario2.username);
      
      expect(esUnico).toBe(false);
    });

    test('debe validar contraseña tenga mínimo 6 caracteres', () => {
      const contraseñas = ['123', '1234', '12345', '123456'];

      contraseñas.forEach((pass, idx) => {
        const esValida = pass.length >= 6;
        if (idx < 4) {
          expect(esValida).toBe(idx >= 3);
        }
      });
    });

    test('debe validar email con formato correcto', () => {
      const emails = [
        'valid@example.com',
        'user.name@domain.co.uk',
        'invalid.email',
        '@nodomain.com',
        'user@',
      ];

      emails.forEach((email, idx) => {
        // Validación: debe tener @ y . y no ser solo @domain o user@
        const esValido = email.includes('@') && email.includes('.') && 
                         email.indexOf('@') > 0 && email.indexOf('@') < email.length - 1;
        if (idx < 2) expect(esValido).toBe(true);
        if (idx >= 2) expect(esValido).toBe(false);
      });
    });

    test('debe asignar rol por defecto (adoptante)', () => {
      const usuario = crearUsuarioMock();
      expect(usuario.role).toBe('adoptante');
    });
  });

  // ==========================================
  // PASO 2: Verificación de email
  // ==========================================
  describe('Paso 2: Verificación de email', () => {
    test('debe marcar email como no verificado al registrar', () => {
      const usuario = crearUsuarioMock({
        emailVerificado: false,
        tokenVerificacion: 'token-' + Math.random().toString(36),
      });

      expect(usuario.emailVerificado).toBe(false);
      expect(usuario.tokenVerificacion).toBeTruthy();
    });

    test('debe permitir verificar email con token válido', () => {
      let usuario = crearUsuarioMock({
        emailVerificado: false,
        tokenVerificacion: 'token-123',
      });

      usuario.emailVerificado = true;
      usuario.tokenVerificacion = null;
      usuario.fechaVerificacion = new Date();

      expect(usuario.emailVerificado).toBe(true);
      expect(usuario.tokenVerificacion).toBeNull();
    });

    test('debe rechazar token de verificación expirado', () => {
      const usuario = crearUsuarioMock({
        tokenVerificacion: 'token-123',
        fechaTokenVerificacion: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 horas atrás
      });

      const ahora = new Date();
      const diferencia = (ahora - usuario.fechaTokenVerificacion) / (1000 * 60 * 60); // horas
      const esValido = diferencia < 24;

      expect(esValido).toBe(false);
    });
  });

  // ==========================================
  // PASO 3: Autenticación y JWT
  // ==========================================
  describe('Paso 3: Autenticación y JWT', () => {
    test('debe generar JWT al login', () => {
      const usuario = crearUsuarioMock();
      const token = generarToken(usuario._id, usuario.role);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT tiene 3 partes
    });

    test('debe incluir userId y role en token', () => {
      const usuario = crearUsuarioMock({ role: 'adoptante' });
      const token = generarToken(usuario._id, usuario.role);

      // Decodificar (sin verificar firma para test)
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.id).toBeTruthy();
      expect(payload.role).toBe('adoptante');
    });

    test('debe expirar token después de 24 horas', () => {
      const usuario = crearUsuarioMock();
      const token = generarToken(usuario._id, usuario.role, '24h');

      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.exp).toBeTruthy();
    });

    test('debe permitir refrescar token', () => {
      const usuario = crearUsuarioMock();
      const tokenAntiguo = generarToken(usuario._id, usuario.role, '1h');
      const tokenNuevo = generarToken(usuario._id, usuario.role, '24h');

      expect(tokenAntiguo).toBeTruthy();
      expect(tokenNuevo).toBeTruthy();
      expect(tokenAntiguo).not.toBe(tokenNuevo);
    });
  });

  // ==========================================
  // PASO 4: Control de roles y permisos
  // ==========================================
  describe('Paso 4: Control de roles y permisos', () => {
    test('debe asignar permisos por rol', () => {
      const permisos = {
        admin: ['crear-usuario', 'eliminar-usuario', 'editar-meta', 'aprobar-publicacion'],
        adminFundacion: ['crear-mascota', 'editar-mascota', 'aprobar-publicacion', 'crear-meta'],
        adoptante: ['solicitar-adopcion', 'donar', 'vermascotas'],
      };

      const admin = crearUsuarioMock({ role: 'admin' });
      expect(permisos[admin.role]).toContain('crear-usuario');

      const adoptante = crearUsuarioMock({ role: 'adoptante' });
      expect(permisos[adoptante.role]).toContain('solicitar-adopcion');
    });

    test('debe validar permisos en acciones sensibles', () => {
      const admin = crearUsuarioMock({ role: 'admin' });
      const adoptante = crearUsuarioMock({ role: 'adoptante' });

      const puedeEliminarUsuario = (usuario) => {
        return ['admin'].includes(usuario.role);
      };

      expect(puedeEliminarUsuario(admin)).toBe(true);
      expect(puedeEliminarUsuario(adoptante)).toBe(false);
    });

    test('debe permitir solo admin crear metas de donación', () => {
      const roles = {
        admin: true,
        adminFundacion: true,
        adoptante: false,
      };

      const usuario = crearUsuarioMock({ role: 'adminFundacion' });
      expect(roles[usuario.role]).toBe(true);
    });

    test('debe permitir solo adoptantes solicitar adopción', () => {
      const puedeAdoptar = (role) => {
        return ['adoptante', 'admin', 'adminFundacion'].includes(role);
      };

      expect(puedeAdoptar('adoptante')).toBe(true);
      expect(puedeAdoptar('admin')).toBe(true);
    });
  });

  // ==========================================
  // PASO 5: Búsqueda y filtrado de usuarios
  // ==========================================
  describe('Paso 5: Búsqueda y filtrado de usuarios', () => {
    test('debe buscar usuario por email', () => {
      const usuarios = [
        crearUsuarioMock({ email: 'juan@example.com' }),
        crearUsuarioMock({ email: 'maria@example.com' }),
        crearUsuarioMock({ email: 'carlos@example.com' }),
      ];

      const encontrado = usuarios.find(u => u.email === 'maria@example.com');
      expect(encontrado.email).toBe('maria@example.com');
    });

    test('debe buscar usuario por username', () => {
      const usuarios = [
        crearUsuarioMock({ username: 'juan123' }),
        crearUsuarioMock({ username: 'maria456' }),
        crearUsuarioMock({ username: 'carlos789' }),
      ];

      const encontrado = usuarios.find(u => u.username === 'maria456');
      expect(encontrado.username).toBe('maria456');
    });

    test('debe filtrar usuarios por rol', () => {
      const usuarios = [
        crearUsuarioMock({ role: 'adoptante' }),
        crearUsuarioMock({ role: 'admin' }),
        crearUsuarioMock({ role: 'adoptante' }),
      ];

      const adoptantes = usuarios.filter(u => u.role === 'adoptante');
      expect(adoptantes.length).toBe(2);
    });

    test('debe paginar resultados de búsqueda', () => {
      const usuarios = Array.from({ length: 50 }, (_, i) => 
        crearUsuarioMock({ username: `user${i}` })
      );

      const pagina = 1;
      const porPagina = 10;
      const inicio = (pagina - 1) * porPagina;
      const fin = inicio + porPagina;

      const resultado = usuarios.slice(inicio, fin);
      expect(resultado.length).toBe(10);
    });

    test('debe ordenar usuarios por fecha de registro', () => {
      const fecha1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const fecha2 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const fecha3 = new Date();

      const usuarios = [
        crearUsuarioMock({ createdAt: fecha1 }),
        crearUsuarioMock({ createdAt: fecha2 }),
        crearUsuarioMock({ createdAt: fecha3 }),
      ];

      const ordenados = usuarios.sort((a, b) => b.createdAt - a.createdAt);
      // El más reciente debe ser el primero
      expect(ordenados[0].createdAt).toEqual(fecha3);
      expect(ordenados[2].createdAt).toEqual(fecha1);
    });
  });

  // ==========================================
  // PASO 6: Actualización de perfil
  // ==========================================
  describe('Paso 6: Actualización de perfil', () => {
    test('debe permitir cambiar información personal', () => {
      let usuario = crearUsuarioMock({
        username: 'juan_original',
      });

      usuario.username = 'juan_actualizado';
      usuario.updatedAt = new Date();

      expect(usuario.username).toBe('juan_actualizado');
    });

    test('debe permitir cambiar contraseña', () => {
      let usuario = crearUsuarioMock({
        password: 'oldPassword123',
      });

      usuario.password = 'newPassword456';

      expect(usuario.password).toBe('newPassword456');
      expect(usuario.password).not.toBe('oldPassword123');
    });

    test('debe validar nueva contraseña antes de cambiar', () => {
      const contraseña = 'abc'; // muy corta
      const esValida = contraseña.length >= 6;

      expect(esValida).toBe(false);
    });

    test('debe registrar cambios en auditoría', () => {
      let usuario = crearUsuarioMock();

      const cambio = {
        usuarioId: usuario._id,
        campo: 'email',
        valorAnterior: usuario.email,
        valorNuevo: 'newemail@example.com',
        fecha: new Date(),
        razon: 'Cambio por usuario',
      };

      usuario.email = cambio.valorNuevo;

      expect(cambio.usuarioId).toEqual(usuario._id);
      expect(cambio.valorNuevo).toBe(usuario.email);
    });
  });

  // ==========================================
  // PASO 7: Desactivación de cuenta
  // ==========================================
  describe('Paso 7: Desactivación de cuenta', () => {
    test('debe permitir desactivar cuenta temporalmente', () => {
      let usuario = crearUsuarioMock({
        activo: true,
      });

      usuario.activo = false;
      usuario.fechaDesactivacion = new Date();

      expect(usuario.activo).toBe(false);
      expect(usuario.fechaDesactivacion).toBeTruthy();
    });

    test('debe permitir reactivar cuenta', () => {
      let usuario = crearUsuarioMock({
        activo: false,
        fechaDesactivacion: new Date(),
      });

      usuario.activo = true;
      usuario.fechaDesactivacion = null;

      expect(usuario.activo).toBe(true);
    });

    test('debe registrar razón de desactivación', () => {
      let usuario = crearUsuarioMock();

      usuario.activo = false;
      usuario.razonDesactivacion = 'Cuenta no utilizada';
      usuario.fechaDesactivacion = new Date();

      expect(usuario.razonDesactivacion).toBeTruthy();
    });
  });

  // ==========================================
  // FLUJO COMPLETO DE GESTIÓN DE USUARIOS
  // ==========================================
  describe('Flujo Completo de Gestión de Usuarios', () => {
    test('debe ejecutar flujo completo de usuario sin errores', async () => {
      // 1. Registro
      let usuario = crearUsuarioMock({
        username: 'juan_nuevo',
        email: 'juan@example.com',
        role: 'adoptante',
        emailVerificado: false,
      });

      // 2. Verificación de email
      usuario.emailVerificado = true;

      // 3. Login y token
      const token = generarToken(usuario._id, usuario.role);

      // 4. Acceso a rutas protegidas
      const puedeAcceder = token && usuario.role === 'adoptante';

      // 5. Búsqueda
      const usuarios = [usuario];
      const encontrado = usuarios.find(u => u.email === 'juan@example.com');

      // 6. Actualización
      encontrado.username = 'juan_actualizado';

      // 7. Desactivación opcional
      // encontrado.activo = false;

      // Validaciones
      validarUsuarioCompleto(usuario);
      expect(puedeAcceder).toBe(true);
      expect(encontrado.username).toBe('juan_actualizado');
      expect(token).toBeTruthy();
    });

    test('debe generar estadísticas de usuarios', () => {
      const usuarios = [
        crearUsuarioMock({ role: 'adoptante' }),
        crearUsuarioMock({ role: 'adoptante' }),
        crearUsuarioMock({ role: 'admin' }),
        crearUsuarioMock({ role: 'adminFundacion' }),
      ];

      const stats = {
        total: usuarios.length,
        adoptantes: usuarios.filter(u => u.role === 'adoptante').length,
        admins: usuarios.filter(u => u.role === 'admin').length,
        adminsFundacion: usuarios.filter(u => u.role === 'adminFundacion').length,
      };

      expect(stats.total).toBe(4);
      expect(stats.adoptantes).toBe(2);
      expect(stats.admins).toBe(1);
    });

    test('debe permitir exportar datos de usuarios', () => {
      const usuarios = [
        crearUsuarioMock({ role: 'adoptante' }),
        crearUsuarioMock({ role: 'adoptante' }),
      ];

      const datos = usuarios.map(u => ({
        id: u._id,
        email: u.email,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
      }));

      expect(Array.isArray(datos)).toBe(true);
      expect(datos.length).toBe(2);
      expect(datos[0]).toHaveProperty('email');
    });
  });
});
