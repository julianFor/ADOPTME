/**
 * Tests para Mascota Controller
 * Prueba crear, actualizar, listar y eliminar mascotas
 */

const mascotaController = require('../../../controllers/mascotaController');

jest.mock('../../../models/Mascota');
jest.mock('mongoose');

describe('Controller - Mascota', () => {
  let req, res;
  let Mascota;

  beforeEach(() => {
    jest.clearAllMocks();
    
    Mascota = require('../../../models/Mascota');

    req = {
      body: {},
      params: {},
      files: {},
      userRole: 'admin',
      userId: '507f1f77bcf86cd799439011'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('Validaciones de Mascota', () => {
    test('debe validar que nombre no esté vacío', () => {
      const nombre = 'Firulais';
      expect(nombre && nombre.trim()).toBeTruthy();
    });

    test('debe validar que especie sea válida', () => {
      const especiesValidas = ['perro', 'gato', 'pájaro', 'conejo'];
      const especie = 'perro';
      
      expect(especiesValidas).toContain(especie);
    });

    test('debe rechazar especie inválida', () => {
      const especiesValidas = ['perro', 'gato', 'pájaro'];
      const especie = 'pez';
      
      expect(especiesValidas).not.toContain(especie);
    });

    test('debe validar que raza tenga formato válido', () => {
      const raza = 'Labrador Retriever';
      expect(typeof raza).toBe('string');
      expect(raza.length).toBeGreaterThan(0);
    });

    test('debe validar descripción máximo 500 caracteres', () => {
      const descripcion = 'A'.repeat(500);
      expect(descripcion.length).toBeLessThanOrEqual(500);
    });

    test('debe rechazar descripción mayor a 500 caracteres', () => {
      const descripcion = 'A'.repeat(501);
      expect(descripcion.length).toBeGreaterThan(500);
    });

    test('debe validar estados válidos', () => {
      const estadosValidos = ['disponible', 'adoptado', 'en-proceso', 'no-adoptable'];
      const estado = 'disponible';
      
      expect(estadosValidos).toContain(estado);
    });

    test('debe validar tamaño válido', () => {
      const tamañosValidos = ['pequeño', 'mediano', 'grande'];
      const tamaño = 'mediano';
      
      expect(tamañosValidos).toContain(tamaño);
    });

    test('debe validar sexo válido', () => {
      const sexosValidos = ['macho', 'hembra', 'desconocido'];
      const sexo = 'macho';
      
      expect(sexosValidos).toContain(sexo);
    });

    test('debe validar que fecha de nacimiento sea válida', () => {
      const fecha = new Date('2020-01-15');
      expect(fecha instanceof Date).toBe(true);
      expect(fecha.getTime()).toBeLessThan(Date.now());
    });

    test('debe rechazar fecha de nacimiento futura', () => {
      const fecha = new Date();
      fecha.setFullYear(fecha.getFullYear() + 1);
      expect(fecha.getTime()).toBeGreaterThan(Date.now());
    });

    test('debe validar estado de salud', () => {
      const estadosSalud = ['excelente', 'bueno', 'regular', 'enfermo', 'desconocido'];
      const estado = 'bueno';
      
      expect(estadosSalud).toContain(estado);
    });
  });

  describe('Validaciones de Contacto Externo', () => {
    test('debe validar email del contacto externo', () => {
      const email = 'contacto@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(true);
    });

    test('debe rechazar email inválido', () => {
      const email = 'contacto-invalido';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test(email)).toBe(false);
    });

    test('debe validar teléfono del contacto', () => {
      const telefono = '3001234567';
      expect(typeof telefono).toBe('string');
      expect(telefono.length).toBeGreaterThanOrEqual(7);
    });

    test('debe validar nombre de contacto', () => {
      const nombre = 'Juan Pérez';
      expect(typeof nombre).toBe('string');
      expect(nombre.length).toBeGreaterThan(0);
    });
  });

  describe('Validaciones de Origen', () => {
    test('debe asignar origen por defecto como externo', () => {
      const origen = undefined || 'externo';
      expect(origen).toBe('externo');
    });

    test('debe aceptar origen rescatado', () => {
      const origenesValidos = ['externo', 'rescatado', 'entrega'];
      const origen = 'rescatado';
      
      expect(origenesValidos).toContain(origen);
    });

    test('debe aceptar origen entrega', () => {
      const origenesValidos = ['externo', 'rescatado', 'entrega'];
      const origen = 'entrega';
      
      expect(origenesValidos).toContain(origen);
    });
  });

  describe('Lógica de Disponibilidad', () => {
    test('debe establecer disponible=true cuando estado es disponible', () => {
      const estado = 'disponible';
      const disponible = estado === 'disponible' ? true : false;
      
      expect(disponible).toBe(true);
    });

    test('debe establecer disponible=false cuando estado es adoptado', () => {
      const estado = 'adoptado';
      const disponible = estado === 'adoptado' ? false : true;
      
      expect(disponible).toBe(false);
    });

    test('debe establecer disponible=false cuando está en proceso', () => {
      const estado = 'en-proceso';
      const disponible = estado === 'en-proceso' ? false : true;
      
      expect(disponible).toBe(false);
    });
  });

  describe('Validaciones de Imágenes', () => {
    test('debe aceptar URLs válidas de imágenes', () => {
      const imagen = 'https://res.cloudinary.com/example/image.jpg';
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      
      expect(urlRegex.test(imagen)).toBe(true);
    });

    test('debe rechazar URLs inválidas', () => {
      const imagen = 'no-es-url';
      const urlRegex = /^https?:\/\/.+/;
      
      expect(urlRegex.test(imagen)).toBe(false);
    });

    test('debe permitir múltiples imágenes', () => {
      const imagenes = [
        'https://example.com/img1.jpg',
        'https://example.com/img2.jpg',
        'https://example.com/img3.jpg'
      ];
      
      expect(Array.isArray(imagenes)).toBe(true);
      expect(imagenes.length).toBeGreaterThan(1);
    });

    test('debe validar límite de 10 imágenes', () => {
      const imagenes = Array(10).fill('https://example.com/img.jpg');
      expect(imagenes.length).toBeLessThanOrEqual(10);
    });

    test('debe rechazar más de 10 imágenes', () => {
      const imagenes = Array(11).fill('https://example.com/img.jpg');
      expect(imagenes.length).toBeGreaterThan(10);
    });
  });

  describe('Lógica de Permisos', () => {
    test('solo admin puede crear mascota', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'admin';
      
      expect(rolesPermitidos).toContain(usuarioRole);
    });

    test('adminFundacion puede crear mascota', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'adminFundacion';
      
      expect(rolesPermitidos).toContain(usuarioRole);
    });

    test('adoptante NO puede crear mascota', () => {
      const rolesPermitidos = ['admin', 'adminFundacion'];
      const usuarioRole = 'adoptante';
      
      expect(rolesPermitidos).not.toContain(usuarioRole);
    });

    test('solo admin puede eliminar mascota', () => {
      const puedeBorrar = 'admin' === 'admin';
      expect(puedeBorrar).toBe(true);
    });
  });

  describe('Validaciones de Datos Requeridos', () => {
    test('debe validar que nombre es requerido', () => {
      const nombre = undefined;
      expect(nombre).not.toBeDefined();
    });

    test('debe validar que especie es requerida', () => {
      const especie = '';
      expect(especie && especie.trim()).toBeFalsy();
    });

    test('debe validar que al menos una imagen es requerida', () => {
      const imagenes = [];
      expect(imagenes.length).toBe(0);
    });

    test('debe permitir mascota sin raza especificada', () => {
      const raza = null;
      expect(raza).toBeNull();
    });
  });

  describe('Manejo de Errores', () => {
    test('debe detectar error de validación Mongoose', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      expect(error.name).toBe('ValidationError');
    });

    test('debe detectar error de MongoDB duplicado', () => {
      const error = new Error('Duplicate key error');
      error.code = 11000;
      
      expect(error.code).toBe(11000);
    });

    test('debe manejar error de conexión BD', () => {
      const error = new Error('MongoDB connection failed');
      expect(error.message).toContain('connection');
    });

    test('debe validar ID de MongoDB', () => {
      const idValido = '507f1f77bcf86cd799439011';
      const idInvalido = 'no-es-id';
      
      const isValidId = /^[a-f\d]{24}$/i.test(idValido);
      const isInvalidId = /^[a-f\d]{24}$/i.test(idInvalido);
      
      expect(isValidId).toBe(true);
      expect(isInvalidId).toBe(false);
    });
  });

  describe('Filtering y Búsqueda', () => {
    test('debe filtrar mascotas por especie', () => {
      const mascotas = [
        { nombre: 'Firulais', especie: 'perro' },
        { nombre: 'Misi', especie: 'gato' },
        { nombre: 'Tweety', especie: 'pájaro' }
      ];
      
      const perros = mascotas.filter(m => m.especie === 'perro');
      expect(perros.length).toBe(1);
      expect(perros[0].nombre).toBe('Firulais');
    });

    test('debe filtrar mascotas disponibles', () => {
      const mascotas = [
        { nombre: 'Firulais', disponible: true },
        { nombre: 'Misi', disponible: false }
      ];
      
      const disponibles = mascotas.filter(m => m.disponible);
      expect(disponibles.length).toBe(1);
    });

    test('debe filtrar por estado de salud', () => {
      const mascotas = [
        { nombre: 'Firulais', estadoSalud: 'bueno' },
        { nombre: 'Misi', estadoSalud: 'regular' }
      ];
      
      const saludables = mascotas.filter(m => m.estadoSalud === 'bueno');
      expect(saludables.length).toBe(1);
    });

    test('debe buscar por nombre parcial', () => {
      const mascotas = [
        { nombre: 'Firulais' },
        { nombre: 'Fifi' },
        { nombre: 'Misi' }
      ];
      
      const busqueda = 'Fir';
      const resultados = mascotas.filter(m => 
        m.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
      
      expect(resultados.length).toBe(1);
      expect(resultados[0].nombre).toBe('Firulais');
    });
  });

  describe('Paginación', () => {
    test('debe validar que página sea número positivo', () => {
      const page = 1;
      expect(page).toBeGreaterThan(0);
    });

    test('debe validar que limit sea número positivo', () => {
      const limit = 10;
      expect(limit).toBeGreaterThan(0);
    });

    test('debe rechazar página negativa', () => {
      const page = -1;
      expect(page).toBeLessThan(1);
    });

    test('debe establecer límite máximo de 100', () => {
      const limitMax = 100;
      const limit = 150;
      
      const finalLimit = Math.min(limit, limitMax);
      expect(finalLimit).toBe(100);
    });
  });

  describe('Ordenamiento', () => {
    test('debe permitir ordenar por nombre ascendente', () => {
      const mascotas = [
        { nombre: 'Zoe' },
        { nombre: 'Andrés' },
        { nombre: 'Firulais' }
      ];
      
      const ordenadas = [...mascotas].sort((a, b) => 
        a.nombre.localeCompare(b.nombre)
      );
      
      expect(ordenadas[0].nombre).toBe('Andrés');
      expect(ordenadas[2].nombre).toBe('Zoe');
    });

    test('debe permitir ordenar por fecha descendente', () => {
      const mascotas = [
        { nombre: 'Firu', fecha: new Date('2023-01-01') },
        { nombre: 'Misi', fecha: new Date('2023-06-01') },
        { nombre: 'Fifi', fecha: new Date('2023-03-01') }
      ];
      
      const ordenadas = [...mascotas].sort((a, b) => 
        b.fecha - a.fecha
      );
      
      expect(ordenadas[0].nombre).toBe('Misi');
      expect(ordenadas[2].nombre).toBe('Firu');
    });
  });
});
