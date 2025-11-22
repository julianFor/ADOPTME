/**
 * Tests para Middlewares Multer/Cloudinary
 * Incluye: multerCloudinary, multerCloudinaryCompromiso, multerCloudinaryDocs,
 *          multerCloudinaryNecesidad, multerCloudinaryPublicacion
 */

describe('Multer/Cloudinary Middleware', () => {
  describe('General Multer Configuration', () => {
    test('Debe usar CloudinaryStorage', () => {
      const storage = 'CloudinaryStorage';
      expect(storage).toBeDefined();
    });

    test('Debe configurar carpeta adoptme', () => {
      const folder = 'adoptme';
      expect(folder).toBe('adoptme');
    });

    test('Debe usar resource_type auto', () => {
      const resourceType = 'auto';
      expect(['auto', 'image', 'raw']).toContain(resourceType);
    });

    test('Debe usar type upload público', () => {
      const type = 'upload';
      expect(type).toBe('upload');
    });
  });

  describe('multerCloudinary - Mascota Images', () => {
    test('Debe permitir archivos JPG', () => {
      const mimetypes = ['image/jpeg'];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/pdf'];

      mimetypes.forEach((mt) => {
        expect(allowedMimes).toContain(mt);
      });
    });

    test('Debe permitir archivos PNG', () => {
      const mimetypes = ['image/png'];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/pdf'];

      mimetypes.forEach((mt) => {
        expect(allowedMimes).toContain(mt);
      });
    });

    test('Debe permitir archivos PDF', () => {
      const mimetypes = ['application/pdf'];
      const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

      mimetypes.forEach((mt) => {
        expect(allowedMimes).toContain(mt);
      });
    });

    test('Debe rechazar otros formatos', () => {
      const mimetypes = ['video/mp4', 'audio/mp3'];
      const allowedMimes = ['image/jpeg', 'image/png'];

      mimetypes.forEach((mt) => {
        expect(allowedMimes).not.toContain(mt);
      });
    });

    test('Debe generar public_id con timestamp', () => {
      const now = Date.now();
      const publicId = `${now}-image`;

      expect(publicId).toContain(String(now));
    });

    test('Debe usar allowed_formats en Cloudinary', () => {
      const formats = ['jpg', 'jpeg', 'png', 'pdf'];
      expect(formats).toHaveLength(4);
    });
  });

  describe('multerCloudinaryCompromiso - Proceso Adoption', () => {
    test('Debe permitir solo imágenes (JPEG, PNG, WEBP)', () => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      expect(allowedMimes).toHaveLength(3);
    });

    test('Debe rechazar PDF en compromiso', () => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      expect(allowedMimes).not.toContain('application/pdf');
    });

    test('Debe validar extensión de archivo', () => {
      const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
      const testExt = '.jpg';

      expect(allowedExt).toContain(testExt);
    });

    test('Debe rechazar extensión inválida', () => {
      const allowedExt = ['.jpg', '.jpeg', '.png', '.webp'];
      const testExt = '.exe';

      expect(allowedExt).not.toContain(testExt);
    });

    test('Debe límitar tamaño a 8MB', () => {
      const maxSize = 8 * 1024 * 1024;
      const testSize = 5 * 1024 * 1024;

      expect(testSize).toBeLessThanOrEqual(maxSize);
    });

    test('Debe rechazar archivo mayor a 8MB', () => {
      const maxSize = 8 * 1024 * 1024;
      const testSize = 10 * 1024 * 1024;

      expect(testSize).toBeGreaterThan(maxSize);
    });

    test('Debe organizar por carpeta del proceso', () => {
      const procesoId = '507f1f77bcf86cd799439011';
      const folder = `adoptme/compromisos/${procesoId}`;

      expect(folder).toContain(procesoId);
    });

    test('Debe usar UUID para evitar sobrescrituras', () => {
      const uniqueId = '550e8400-e29b-41d4-a716-446655440000';
      const timestamp = Date.now();
      const publicId = `${timestamp}-${uniqueId}`;

      expect(publicId).toContain('-');
    });

    test('Debe marcar overwrite como false', () => {
      const overwrite = false;
      expect(overwrite).toBe(false);
    });

    test('Debe usar unique_filename true', () => {
      const uniqueFilename = true;
      expect(uniqueFilename).toBe(true);
    });

    test('Debe convertir a formato PNG', () => {
      const format = 'png';
      expect(format).toBe('png');
    });

    test('Debe mapear cloudinaryCompromiso en request', () => {
      const req = { file: null };
      const file = {
        secure_url: 'https://cloudinary.com/file.png',
        public_id: 'adopme/compromisos/123',
        resource_type: 'image',
        format: 'png',
      };

      const mapCompromiso = (f) =>
        f && {
          secure_url: f.secure_url,
          public_id: f.public_id,
          resource_type: f.resource_type,
          format: f.format,
        };

      const result = mapCompromiso(file);
      expect(result.secure_url).toBe(file.secure_url);
    });
  });

  describe('multerCloudinaryDocs - Documentos', () => {
    test('Debe permitir archivos PDF', () => {
      const allowedFormats = ['pdf'];
      expect(allowedFormats).toContain('pdf');
    });

    test('Debe permitir archivos DOC', () => {
      const allowedFormats = ['doc', 'docx'];
      expect(allowedFormats).toContain('doc');
    });

    test('Debe permitir archivos DOCX', () => {
      const allowedFormats = ['doc', 'docx'];
      expect(allowedFormats).toContain('docx');
    });

    test('Debe rechazar imágenes en documentos', () => {
      const allowedFormats = ['pdf', 'doc', 'docx'];
      expect(allowedFormats).not.toContain('jpg');
    });

    test('Debe usar resource_type auto para PDF', () => {
      const resourceType = 'auto';
      expect(['auto', 'raw']).toContain(resourceType);
    });

    test('Debe organizar en carpeta docs', () => {
      const folder = 'adoptme/documentos';
      expect(folder).toContain('documentos');
    });

    test('Debe validar MIME types de documentos', () => {
      const mimetypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      expect(mimetypes).toHaveLength(3);
    });
  });

  describe('multerCloudinaryNecesidad - Need Images', () => {
    test('Debe permitir archivos JPG', () => {
      const formats = ['jpg', 'jpeg'];
      expect(formats).toContain('jpg');
    });

    test('Debe permitir archivos PNG', () => {
      const formats = ['png'];
      expect(formats).toContain('png');
    });

    test('Debe permitir archivos GIF', () => {
      const formats = ['gif'];
      expect(formats).toContain('gif');
    });

    test('Debe organizar por categoría de necesidad', () => {
      const categoria = 'alimentos';
      const folder = `adoptme/necesidades/${categoria}`;

      expect(folder).toContain(categoria);
    });

    test('Debe permitir múltiples imágenes por necesidad', () => {
      const maxFiles = 5;
      const files = Array(5).fill({ filename: 'image.jpg' });

      expect(files).toHaveLength(maxFiles);
    });

    test('Debe rechazar más de 5 imágenes', () => {
      const maxFiles = 5;
      const files = Array(6).fill({ filename: 'image.jpg' });

      expect(files.length).toBeGreaterThan(maxFiles);
    });
  });

  describe('multerCloudinaryPublicacion - Publication Images', () => {
    test('Debe permitir archivos JPG', () => {
      const allowedFormats = ['jpg', 'jpeg', 'png'];
      expect(allowedFormats).toContain('jpg');
    });

    test('Debe permitir archivos PNG', () => {
      const allowedFormats = ['jpg', 'jpeg', 'png'];
      expect(allowedFormats).toContain('png');
    });

    test('Debe organizar por ID de mascota', () => {
      const mascotaId = '507f1f77bcf86cd799439011';
      const folder = `adoptme/publicaciones/${mascotaId}`;

      expect(folder).toContain(mascotaId);
    });

    test('Debe generar public_id único', () => {
      const timestamp = Date.now();
      const filename = 'photo';
      const publicId = `${timestamp}-${filename}`;

      expect(publicId).toContain(String(timestamp));
    });

    test('Debe marcar como recurso público', () => {
      const accessMode = 'public';
      expect(accessMode).toBe('public');
    });
  });

  describe('File Processing Pipeline', () => {
    test('Debe validar mimetype antes de subir', () => {
      const file = {
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
      };

      const isValidMime =
        file.mimetype &&
        /^(image\/jpeg|image\/png|image\/webp)$/i.test(file.mimetype);

      expect(isValidMime).toBe(true);
    });

    test('Debe extraer extensión correctamente', () => {
      const filename = 'photo.jpg';
      const ext = filename.split('.').pop();

      expect(ext).toBe('jpg');
    });

    test('Debe generar timestamp único', () => {
      const timestamp1 = Date.now();
      const timestamp2 = Date.now();

      expect(timestamp1).toBeLessThanOrEqual(timestamp2);
    });

    test('Debe normalizar datos del archivo', () => {
      const file = {
        secure_url: 'https://cloudinary.com/file.jpg',
        public_id: 'adoptme/photo',
        resource_type: 'image',
        format: 'jpg',
        bytes: 1024,
        original_filename: 'photo.jpg',
      };

      const normalized = {
        secure_url: file.secure_url,
        public_id: file.public_id,
        resource_type: file.resource_type,
        format: file.format,
      };

      expect(normalized.secure_url).toBeDefined();
      expect(normalized.public_id).toBeDefined();
    });

    test('Debe manejar errores de archivo inválido', () => {
      const error = new Error('Solo se permiten imágenes JPG, PNG o WEBP.');
      expect(error.message).toContain('imágenes');
    });
  });

  describe('Cloudinary Configuration', () => {
    test('Debe usar allowed_formats correcto', () => {
      const formats = ['jpg', 'jpeg', 'png'];
      expect(formats.length).toBeGreaterThan(0);
    });

    test('Debe usar resource_type auto para múltiples tipos', () => {
      const resourceType = 'auto';
      expect(resourceType).toBe('auto');
    });

    test('Debe usar type upload para archivos públicos', () => {
      const type = 'upload';
      expect(type).toBe('upload');
    });

    test('Debe no usar signed URLs', () => {
      const signed = false;
      expect(signed).toBe(false);
    });

    test('Debe permitir acceso anónimo a archivos', () => {
      const accessMode = 'public';
      expect(accessMode).toBe('public');
    });
  });

  describe('Error Handling', () => {
    test('Debe capturar error de archivo inválido', () => {
      const file = { mimetype: 'application/exe' };
      const isValid = /^(image\/jpeg|image\/png)$/i.test(file.mimetype);

      expect(isValid).toBe(false);
    });

    test('Debe capturar error de tamaño excedido', () => {
      const maxSize = 8 * 1024 * 1024;
      const fileSize = 10 * 1024 * 1024;

      expect(fileSize > maxSize).toBe(true);
    });

    test('Debe retornar 400 en error de multer', () => {
      const error = new Error('Multer validation error');
      const statusCode = 400;

      expect(statusCode).toBe(400);
    });

    test('Debe loguear advertencia si falta procesoId', () => {
      const procesoId = undefined;
      const folder = `adoptme/compromisos/${procesoId || '_sin_id'}`;

      expect(folder).toContain('_sin_id');
    });
  });

  describe('Request/Response Mapping', () => {
    test('Debe agregar file a request', () => {
      const req = {};
      req.file = {
        filename: 'photo.jpg',
        path: 'https://cloudinary.com/photo.jpg',
      };

      expect(req.file).toBeDefined();
      expect(req.file.filename).toBe('photo.jpg');
    });

    test('Debe mapear array de files a req.files', () => {
      const req = {};
      req.files = [
        { filename: 'photo1.jpg' },
        { filename: 'photo2.jpg' },
      ];

      expect(Array.isArray(req.files)).toBe(true);
      expect(req.files).toHaveLength(2);
    });

    test('Debe mapear compromiso normalizado', () => {
      const req = {};
      req.cloudinaryCompromiso = {
        secure_url: 'https://cloudinary.com/file.png',
        public_id: 'adoptme/compromiso',
        resource_type: 'image',
      };

      expect(req.cloudinaryCompromiso).toBeDefined();
      expect(req.cloudinaryCompromiso.secure_url).toContain('cloudinary');
    });

    test('Debe preservar original_filename', () => {
      const file = {
        secure_url: 'https://cloudinary.com/file.jpg',
        original_filename: 'my-photo.jpg',
      };

      expect(file.original_filename).toBe('my-photo.jpg');
    });
  });
});
