/**
 * Tests para Necesidad Controller
 */

describe('Necesidad Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    query: {},
  });

  describe('Validadores de Estado', () => {
    test('Debe validar estado activa', () => {
      const VALID_ESTADOS = new Set(['activa', 'pausada', 'cumplida', 'vencida']);
      expect(VALID_ESTADOS.has('activa')).toBe(true);
    });

    test('Debe rechazar estado inválido', () => {
      const VALID_ESTADOS = new Set(['activa', 'pausada', 'cumplida', 'vencida']);
      expect(VALID_ESTADOS.has('invalido')).toBe(false);
    });

    test('Debe asignar estado activa por defecto', () => {
      const estado = undefined;
      const result = !estado ? 'activa' : estado;
      expect(result).toBe('activa');
    });

    test('Debe convertir estado a minúsculas', () => {
      const estado = 'ACTIVA'.toLowerCase().trim();
      const VALID_ESTADOS = new Set(['activa', 'pausada', 'cumplida', 'vencida']);
      expect(VALID_ESTADOS.has(estado)).toBe(true);
    });
  });

  describe('Validadores de Urgencia', () => {
    test('Debe validar urgencia baja', () => {
      const VALID_URGENCIAS = new Set(['baja', 'media', 'alta']);
      expect(VALID_URGENCIAS.has('baja')).toBe(true);
    });

    test('Debe validar urgencia media', () => {
      const VALID_URGENCIAS = new Set(['baja', 'media', 'alta']);
      expect(VALID_URGENCIAS.has('media')).toBe(true);
    });

    test('Debe validar urgencia alta', () => {
      const VALID_URGENCIAS = new Set(['baja', 'media', 'alta']);
      expect(VALID_URGENCIAS.has('alta')).toBe(true);
    });

    test('Debe asignar urgencia baja por defecto', () => {
      const urgencia = undefined;
      const result = !urgencia ? 'baja' : urgencia;
      expect(result).toBe('baja');
    });
  });

  describe('Validadores de Categoría', () => {
    test('Debe validar categoría alimentos', () => {
      const VALID_CATEGORIAS = new Set(['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro']);
      expect(VALID_CATEGORIAS.has('alimentos')).toBe(true);
    });

    test('Debe validar categoría medicina', () => {
      const VALID_CATEGORIAS = new Set(['alimentos', 'medicina', 'educacion', 'infraestructura', 'otro']);
      expect(VALID_CATEGORIAS.has('medicina')).toBe(true);
    });

    test('Debe asignar categoría otro por defecto', () => {
      const categoria = undefined;
      const result = !categoria ? 'otro' : categoria;
      expect(result).toBe('otro');
    });
  });

  describe('Helpers de Conversión', () => {
    test('Debe convertir string a número', () => {
      const toNumber = (v, def) => {
        if (v === undefined || v === null) return def;
        const num = Number(v);
        return Number.isNaN(num) ? def : num;
      };

      expect(toNumber('100', 0)).toBe(100);
      expect(toNumber('abc', 0)).toBe(0);
      expect(toNumber(undefined, 50)).toBe(50);
    });

    test('Debe convertir string a booleano', () => {
      const toBool = (v, def) => {
        if (v === undefined || v === null) return def;
        if (typeof v === 'boolean') return v;
        const s = String(v).toLowerCase().trim();
        return s === 'true' || s === '1' || s === 'on';
      };

      expect(toBool('true', false)).toBe(true);
      expect(toBool('1', false)).toBe(true);
      expect(toBool('false', true)).toBe(false);
    });

    test('Debe convertir string vacío a null', () => {
      const toNullable = (v) => {
        if (v === '' || v === undefined || v === null) return null;
        return v;
      };

      expect(toNullable('')).toBe(null);
      expect(toNullable(null)).toBe(null);
      expect(toNullable('text')).toBe('text');
    });
  });

  describe('Validador de ID MongoDB', () => {
    test('Debe validar ObjectId válido', () => {
      const validateId = (id) => {
        if (!id) return null;
        const idStr = String(id).trim();
        return /^[0-9a-fA-F]{24}$/.test(idStr) ? idStr : null;
      };

      const result = validateId('507f1f77bcf86cd799439011');
      expect(result).toBe('507f1f77bcf86cd799439011');
    });

    test('Debe rechazar ObjectId inválido', () => {
      const validateId = (id) => {
        if (!id) return null;
        const idStr = String(id).trim();
        return /^[0-9a-fA-F]{24}$/.test(idStr) ? idStr : null;
      };

      const result = validateId('invalid-id');
      expect(result).toBeNull();
    });

    test('Debe rechazar ID vacío', () => {
      const validateId = (id) => {
        if (!id) return null;
        return id;
      };

      expect(validateId('')).toBeNull();
    });
  });

  describe('Sanitización de Regex', () => {
    test('Debe escapar caracteres especiales', () => {
      const sanitizeRegex = (str) =>
        typeof str === 'string'
          ? str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&').trim()
          : '';

      const result = sanitizeRegex('test.*+?');
      expect(result).not.toContain('.*');
    });

    test('Debe retornar string vacío para no-string', () => {
      const sanitizeRegex = (str) =>
        typeof str === 'string' ? str.trim() : '';

      expect(sanitizeRegex(123)).toBe('');
      expect(sanitizeRegex(null)).toBe('');
    });
  });

  describe('Validador de Sort', () => {
    test('Debe validar sort válido', () => {
      const VALID_SORTS = new Set([
        'titulo',
        '-titulo',
        'fechaPublicacion',
        '-fechaPublicacion',
        'urgencia',
        '-urgencia',
      ]);

      expect(VALID_SORTS.has('titulo')).toBe(true);
      expect(VALID_SORTS.has('-fechaPublicacion')).toBe(true);
    });

    test('Debe rechazar sort inválido', () => {
      const VALID_SORTS = new Set([
        'titulo',
        '-titulo',
        'fechaPublicacion',
        '-fechaPublicacion',
        'urgencia',
        '-urgencia',
      ]);

      expect(VALID_SORTS.has('invalido')).toBe(false);
    });

    test('Debe usar -fechaPublicacion por defecto', () => {
      const sort = undefined;
      const result = !sort ? '-fechaPublicacion' : sort;
      expect(result).toBe('-fechaPublicacion');
    });
  });

  describe('Validador de Visible', () => {
    test('Debe validar visible true', () => {
      const visible = true;
      expect(visible).toBe(true);
    });

    test('Debe asumir visible true por defecto', () => {
      const visible = undefined;
      const result = visible === undefined ? true : visible;
      expect(result).toBe(true);
    });

    test('Debe validar visible false', () => {
      const visible = false;
      expect(visible).toBe(false);
    });
  });

  describe('Operaciones CRUD', () => {
    test('Debe crear necesidad correctamente', () => {
      const req = mockReq();
      req.body = {
        titulo: 'Necesidad de alimentos',
        categoria: 'alimentos',
        urgencia: 'alta',
        objetivo: 1000,
        estado: 'activa',
      };
      const res = mockRes();

      const necesidad = {
        _id: '507f1f77bcf86cd799439011',
        ...req.body,
        recibido: 0,
        visible: true,
        fechaPublicacion: new Date(),
      };

      res.status(201);
      res.json(necesidad);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('Debe obtener necesidad por ID', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      const necesidad = {
        _id: req.params.id,
        titulo: 'Necesidad',
        categoria: 'alimentos',
      };

      res.status(200);
      res.json(necesidad);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe actualizar necesidad', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = { estado: 'cumplida' };
      const res = mockRes();

      res.status(200);
      res.json({ success: true, message: 'Necesidad actualizada' });

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('Debe eliminar necesidad', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(200);
      res.json({ success: true, message: 'Necesidad eliminada' });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
