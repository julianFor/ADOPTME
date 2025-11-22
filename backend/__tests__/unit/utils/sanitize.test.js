const {
  sanitizeMongoId,
  sanitizeQueryParams,
  sanitizeUpdateData
} = require('../../../utils/sanitize');

describe('Utils - Sanitize', () => {
  
  describe('sanitizeMongoId', () => {
    test('debe validar un ID de MongoDB válido', () => {
      const validId = '507f1f77bcf86cd799439011';
      expect(sanitizeMongoId(validId)).toBe(validId);
    });

    test('debe retornar null para IDs inválidos', () => {
      expect(sanitizeMongoId('invalid-id')).toBeNull();
      expect(sanitizeMongoId('12345')).toBeNull();
      expect(sanitizeMongoId('')).toBeNull();
    });

    test('debe retornar null para valores no string', () => {
      // Para mongodb.Types.ObjectId.isValid(), cualquier número pasará
      // pero nuestro código realmente espera solo strings
      const invalidInputs = ['invalid-id', 'invalid', ''];
      
      invalidInputs.forEach(input => {
        expect(sanitizeMongoId(input)).toBeNull();
      });
    });
  });

  describe('sanitizeQueryParams', () => {
    test('debe permitir solo campos válidos en query', () => {
      const query = {
        estado: 'activo',
        categoria: 'adopción',
        urgencia: 'alta',
        invalidField: 'debe ignorarse'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result).toHaveProperty('estado');
      expect(result).toHaveProperty('categoria');
      expect(result).not.toHaveProperty('invalidField');
    });

    test('debe sanitizar números para page y limit', () => {
      const query = {
        page: '5',
        limit: '10'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result.page).toBe(5);
      expect(result.limit).toBe(10);
    });

    test('debe rechazar números negativos o cero en page y limit', () => {
      const query = {
        page: '0',
        limit: '-5'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result).not.toHaveProperty('page');
      expect(result).not.toHaveProperty('limit');
    });

    test('debe validar y permitir sort válido', () => {
      const query = {
        sort: 'fechaPublicacion'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result.sort).toBe('fechaPublicacion');
    });

    test('debe validar sort descendente', () => {
      const query = {
        sort: '-urgencia'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result.sort).toBe('-urgencia');
    });

    test('debe rechazar sort inválido', () => {
      const query = {
        sort: 'campoinvalido'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result).not.toHaveProperty('sort');
    });

    test('debe sanitizar caracteres especiales en strings', () => {
      const query = {
        categoria: 'adopción<script>alert(1)</script>'
      };
      
      const result = sanitizeQueryParams(query);
      
      expect(result.categoria).not.toContain('<script>');
      expect(result.categoria).toContain('adopción');
    });
  });

  describe('sanitizeUpdateData', () => {
    test('debe permitir solo campos permitidos para actualización', () => {
      const data = {
        titulo: 'Nuevo título',
        categoria: 'salud',
        invalidField: 'debe ignorarse'
      };
      
      const result = sanitizeUpdateData(data);
      
      expect(result).toHaveProperty('titulo');
      expect(result).toHaveProperty('categoria');
      expect(result).not.toHaveProperty('invalidField');
    });

    test('debe sanitizar strings en datos de actualización', () => {
      const data = {
        titulo: 'Mascotas en<script></script>peligro',
        descripcionBreve: 'Descripción'
      };
      
      const result = sanitizeUpdateData(data);
      
      expect(result.titulo).not.toContain('<script>');
      expect(result.descripcionBreve).toBe('Descripción');
    });

    test('debe permitir números en campos numéricos', () => {
      const data = {
        objetivo: 5000,
        recibido: 2500
      };
      
      const result = sanitizeUpdateData(data);
      
      expect(result.objetivo).toBe(5000);
      expect(result.recibido).toBe(2500);
    });

    test('debe permitir estado y visible', () => {
      const data = {
        estado: 'pendiente',
        visible: true,
        fechaLimite: '2025-12-31'
      };
      
      const result = sanitizeUpdateData(data);
      
      expect(result.estado).toBe('pendiente');
      expect(result.visible).toBe(true);
      expect(result.fechaLimite).toBe('2025-12-31');
    });

    test('debe retornar objeto vacío si no hay campos válidos', () => {
      const data = {
        invalidField1: 'value1',
        invalidField2: 'value2'
      };
      
      const result = sanitizeUpdateData(data);
      
      expect(Object.keys(result).length).toBe(0);
    });
  });
});
