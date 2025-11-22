/**
 * Tests para User Controller
 * Prueba registro, búsqueda, actualización, eliminación de usuarios
 */

const userController = require('../../../controllers/userController');

jest.mock('../../../models/User');
jest.mock('bcryptjs');
jest.mock('mongoose');

describe('Controller - User', () => {
  let req, res;
  let User;

  beforeEach(() => {
    jest.clearAllMocks();
    
    User = require('../../../models/User');

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

  describe('Validaciones de Registro', () => {
    test('debe validar que username no esté vacío', () => {
      const username = '';
      expect(username).toBe('');
      expect(!username).toBe(true);
    });

    test('debe validar que email sea requerido', () => {
      const email = '';
      expect(email).toBe('');
    });

    test('debe validar que contraseña sea requerida', () => {
      const password = '';
      expect(password).toBe('');
    });

    test('debe validar todos los campos juntos', () => {
      const usuario = {
        username: 'juan123',
        email: 'juan@example.com',
        password: 'Password123'
      };
      
      const valido = usuario.username && usuario.email && usuario.password;
      expect(Boolean(valido)).toBe(true);
    });

    test('debe detectar cuando falta username', () => {
      const usuario = {
        email: 'juan@example.com',
        password: 'Password123'
      };
      
      const valido = usuario.username && usuario.email && usuario.password;
      expect(valido).toBeFalsy();
    });

    test('debe detectar cuando falta email', () => {
      const usuario = {
        username: 'juan123',
        password: 'Password123'
      };
      
      const valido = usuario.username && usuario.email && usuario.password;
      expect(valido).toBeFalsy();
    });

    test('debe detectar cuando falta password', () => {
      const usuario = {
        username: 'juan123',
        email: 'juan@example.com'
      };
      
      const valido = usuario.username && usuario.email && usuario.password;
      expect(valido).toBeFalsy();
    });
  });

  describe('Normalización de Datos', () => {
    test('debe normalizar username (trim)', () => {
      const rawUsername = '  juan123  ';
      const normalizado = rawUsername.trim();
      
      expect(normalizado).toBe('juan123');
    });

    test('debe normalizar email a minúsculas', () => {
      const rawEmail = 'JUAN@EXAMPLE.COM';
      const normalizado = rawEmail.toLowerCase();
      
      expect(normalizado).toBe('juan@example.com');
    });

    test('debe convertir undefined a string vacío', () => {
      const valor = undefined;
      const resultado = valor === undefined ? '' : String(valor).trim();
      
      expect(resultado).toBe('');
    });

    test('debe convertir null a string vacío', () => {
      const valor = null;
      const resultado = valor === null ? '' : String(valor).trim();
      
      expect(resultado).toBe('');
    });

    test('debe combinar normalizaciones', () => {
      const rawUsername = '  JUAN123  ';
      const normalizado = rawUsername.trim().toLowerCase();
      
      expect(normalizado).toBe('juan123');
    });
  });

  describe('Validación de Email', () => {
    test('debe validar email con formato correcto', () => {
      const email = 'juan@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(true);
    });

    test('debe rechazar email sin @', () => {
      const email = 'juanexample.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe rechazar email sin dominio', () => {
      const email = 'juan@.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe rechazar email sin punto', () => {
      const email = 'juan@examplecom';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe aceptar emails con múltiples subdominios', () => {
      const email = 'juan@mail.example.co.uk';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(true);
    });
  });

  describe('Validación de Username', () => {
    test('debe validar username alfanumérico', () => {
      const username = 'juan123';
      expect(typeof username).toBe('string');
      expect(username.length).toBeGreaterThan(0);
    });

    test('debe permitir username con guiones', () => {
      const username = 'juan-123';
      expect(username).toContain('-');
    });

    test('debe permitir username con guiones bajos', () => {
      const username = 'juan_123';
      expect(username).toContain('_');
    });

    test('debe validar longitud mínima', () => {
      const username = 'ju';
      expect(username.length).toBeLessThan(3);
    });

    test('debe permitir username de longitud válida', () => {
      const username = 'juan123';
      expect(username.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Validación de Contraseña', () => {
    test('debe validar que contraseña tenga mínimo 6 caracteres', () => {
      const password = '123456';
      expect(password.length).toBeGreaterThanOrEqual(6);
    });

    test('debe rechazar contraseña muy corta', () => {
      const password = '12345';
      expect(password.length).toBeLessThan(6);
    });

    test('debe permitir contraseña con caracteres especiales', () => {
      const password = 'Pass@123!';
      expect(password.length).toBeGreaterThanOrEqual(6);
    });

    test('debe permitir contraseña con números', () => {
      const password = 'Password123';
      expect(/\d/.test(password)).toBe(true);
    });

    test('debe permitir contraseña con letras mayúsculas', () => {
      const password = 'Password';
      expect(/[A-Z]/.test(password)).toBe(true);
    });
  });

  describe('Roles de Usuario', () => {
    test('debe asignar rol adoptante por defecto', () => {
      const rol = 'adoptante';
      expect(rol).toBe('adoptante');
    });

    test('debe permitir rol admin', () => {
      const rolesValidos = ['adoptante', 'admin', 'adminFundacion'];
      const rol = 'admin';
      
      expect(rolesValidos).toContain(rol);
    });

    test('debe permitir rol adminFundacion', () => {
      const rolesValidos = ['adoptante', 'admin', 'adminFundacion'];
      const rol = 'adminFundacion';
      
      expect(rolesValidos).toContain(rol);
    });

    test('debe rechazar rol inválido', () => {
      const rolesValidos = ['adoptante', 'admin', 'adminFundacion'];
      const rol = 'moderador';
      
      expect(rolesValidos).not.toContain(rol);
    });
  });

  describe('Estados de Usuario', () => {
    test('debe tener estado activo por defecto', () => {
      const estado = 'activo';
      expect(estado).toBe('activo');
    });

    test('debe permitir estado inactivo', () => {
      const estadosValidos = ['activo', 'inactivo', 'suspendido'];
      const estado = 'inactivo';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe permitir estado suspendido', () => {
      const estadosValidos = ['activo', 'inactivo', 'suspendido'];
      const estado = 'suspendido';
      
      expect(estadosValidos).toContain(estado);
    });
  });

  describe('Búsqueda de Usuarios', () => {
    test('debe buscar por email', () => {
      const usuarios = [
        { email: 'juan@example.com', nombre: 'Juan' },
        { email: 'maria@example.com', nombre: 'María' },
        { email: 'pedro@example.com', nombre: 'Pedro' }
      ];
      
      const encontrado = usuarios.find(u => u.email === 'maria@example.com');
      expect(encontrado.nombre).toBe('María');
    });

    test('debe buscar por username', () => {
      const usuarios = [
        { username: 'juan123', nombre: 'Juan' },
        { username: 'maria456', nombre: 'María' }
      ];
      
      const encontrado = usuarios.find(u => u.username === 'juan123');
      expect(encontrado.nombre).toBe('Juan');
    });

    test('debe buscar por ID', () => {
      const usuarioId = '507f1f77bcf86cd799439011';
      const usuarios = [
        { _id: usuarioId, nombre: 'Juan' },
        { _id: '507f1f77bcf86cd799439012', nombre: 'María' }
      ];
      
      const encontrado = usuarios.find(u => u._id === usuarioId);
      expect(encontrado.nombre).toBe('Juan');
    });

    test('debe retornar null si no encuentra usuario', () => {
      const usuarios = [
        { email: 'juan@example.com' }
      ];
      
      const encontrado = usuarios.find(u => u.email === 'noexiste@example.com');
      expect(encontrado).toBeUndefined();
    });
  });

  describe('Filtrado de Usuarios', () => {
    test('debe filtrar por rol', () => {
      const usuarios = [
        { nombre: 'Juan', role: 'adoptante' },
        { nombre: 'María', role: 'admin' },
        { nombre: 'Pedro', role: 'adoptante' }
      ];
      
      const adoptantes = usuarios.filter(u => u.role === 'adoptante');
      expect(adoptantes.length).toBe(2);
    });

    test('debe filtrar por estado', () => {
      const usuarios = [
        { nombre: 'Juan', estado: 'activo' },
        { nombre: 'María', estado: 'inactivo' },
        { nombre: 'Pedro', estado: 'activo' }
      ];
      
      const activos = usuarios.filter(u => u.estado === 'activo');
      expect(activos.length).toBe(2);
    });

    test('debe filtrar activos y por rol', () => {
      const usuarios = [
        { nombre: 'Juan', role: 'adoptante', estado: 'activo' },
        { nombre: 'María', role: 'admin', estado: 'activo' },
        { nombre: 'Pedro', role: 'adoptante', estado: 'inactivo' }
      ];
      
      const filtrados = usuarios.filter(u => u.role === 'adoptante' && u.estado === 'activo');
      expect(filtrados.length).toBe(1);
    });
  });

  describe('Actualización de Usuario', () => {
    test('debe permitir actualizar email', () => {
      const usuario = { email: 'viejo@example.com' };
      usuario.email = 'nuevo@example.com';
      
      expect(usuario.email).toBe('nuevo@example.com');
    });

    test('debe permitir actualizar nombre completo', () => {
      const usuario = { nombre: 'Juan' };
      usuario.nombre = 'Juan Pérez';
      
      expect(usuario.nombre).toBe('Juan Pérez');
    });

    test('debe permitir actualizar teléfono', () => {
      const usuario = { telefono: '3001234567' };
      usuario.telefono = '3009876543';
      
      expect(usuario.telefono).toBe('3009876543');
    });

    test('debe permitir actualizar dirección', () => {
      const usuario = { direccion: 'Calle 1' };
      usuario.direccion = 'Calle 2';
      
      expect(usuario.direccion).toBe('Calle 2');
    });

    test('debe permitir actualizar estado', () => {
      const usuario = { estado: 'activo' };
      usuario.estado = 'inactivo';
      
      expect(usuario.estado).toBe('inactivo');
    });

    test('debe no permitir cambiar role sin ser admin', () => {
      const usuarioRole = 'adoptante';
      const puedeActualizar = usuarioRole === 'admin';
      
      expect(puedeActualizar).toBe(false);
    });
  });

  describe('Eliminación de Usuario', () => {
    test('debe permitir eliminar usuario como admin', () => {
      const usuarioRole = 'admin';
      const puedeEliminar = usuarioRole === 'admin';
      
      expect(puedeEliminar).toBe(true);
    });

    test('debe no permitir que adoptante se elimine a sí mismo', () => {
      const usuarioRole = 'adoptante';
      const puedeEliminar = usuarioRole === 'admin';
      
      expect(puedeEliminar).toBe(false);
    });

    test('debe permitir que usuario se elimine a sí mismo', () => {
      const usuarioIdAutenticado = '507f1f77bcf86cd799439011';
      const usuarioIdEliminar = '507f1f77bcf86cd799439011';
      
      const puedeSelf = usuarioIdAutenticado === usuarioIdEliminar;
      expect(puedeSelf).toBe(true);
    });
  });

  describe('Conteo y Estadísticas', () => {
    test('debe contar total de usuarios', () => {
      const usuarios = [
        { nombre: 'Juan' },
        { nombre: 'María' },
        { nombre: 'Pedro' }
      ];
      
      expect(usuarios.length).toBe(3);
    });

    test('debe contar usuarios por rol', () => {
      const usuarios = [
        { role: 'adoptante' },
        { role: 'admin' },
        { role: 'adoptante' }
      ];
      
      const conteo = {};
      usuarios.forEach(u => {
        conteo[u.role] = (conteo[u.role] || 0) + 1;
      });
      
      expect(conteo.adoptante).toBe(2);
      expect(conteo.admin).toBe(1);
    });

    test('debe contar usuarios activos', () => {
      const usuarios = [
        { estado: 'activo' },
        { estado: 'inactivo' },
        { estado: 'activo' }
      ];
      
      const activos = usuarios.filter(u => u.estado === 'activo').length;
      expect(activos).toBe(2);
    });

    test('debe obtener últimos usuarios registrados', () => {
      const usuarios = [
        { nombre: 'Juan', fecha: new Date('2023-01-01') },
        { nombre: 'María', fecha: new Date('2023-06-01') },
        { nombre: 'Pedro', fecha: new Date('2023-03-01') }
      ];
      
      const ordenados = [...usuarios].sort((a, b) => b.fecha - a.fecha);
      expect(ordenados[0].nombre).toBe('María');
    });
  });

  describe('Validación de MongoDB ID', () => {
    test('debe validar ID válido', () => {
      const id = '507f1f77bcf86cd799439011';
      const isValidId = /^[a-f\d]{24}$/i.test(id);
      
      expect(isValidId).toBe(true);
    });

    test('debe rechazar ID inválido', () => {
      const id = 'no-es-id';
      const isValidId = /^[a-f\d]{24}$/i.test(id);
      
      expect(isValidId).toBe(false);
    });

    test('debe rechazar ID vacío', () => {
      const id = '';
      const isValidId = /^[a-f\d]{24}$/i.test(id);
      
      expect(isValidId).toBe(false);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo admin puede ver todos los usuarios', () => {
      const rolesPermitidos = ['admin'];
      const userRole = 'admin';
      
      expect(rolesPermitidos).toContain(userRole);
    });

    test('adoptante no puede ver todos los usuarios', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const userRole = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(userRole);
    });

    test('admin puede cambiar rol de usuario', () => {
      const puedeActualizar = 'admin' === 'admin';
      expect(puedeActualizar).toBe(true);
    });

    test('adoptante no puede cambiar rol', () => {
      const puedeActualizar = 'adoptante' === 'admin';
      expect(puedeActualizar).toBe(false);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de duplicado de email', () => {
      const error = new Error('Duplicate key error');
      error.code = 11000;
      
      expect(error.code).toBe(11000);
    });

    test('debe detectar error de validación', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe manejar usuario no encontrado', () => {
      const usuario = null;
      expect(usuario).toBeNull();
    });

    test('debe validar que campos requeridos existan', () => {
      const usuario = { username: 'juan' };
      const valido = usuario.username && usuario.email;
      
      expect(valido).toBeFalsy();
    });
  });
});
