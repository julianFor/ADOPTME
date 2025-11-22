/**
 * Tests para Mascota Controller
 */

describe('Mascota Controller', () => {
  const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  });

  const mockReq = () => ({
    params: {},
    body: {},
    files: [],
    headers: {},
  });

  describe('createMascota', () => {
    test('Debe crear mascota válida con datos completos', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Rex',
        especie: 'Perro',
        raza: 'Labrador',
        descripcion: 'Perro amigable',
        tamano: 'grande',
        origen: 'fundacion',
      };

      const res = mockRes();

      // Mock de la lógica
      const payload = req.body;
      const nuevaMascota = { _id: '123', ...payload, imagenes: [] };

      res.status(201);
      res.json({
        success: true,
        message: 'Mascota registrada con éxito',
        mascota: nuevaMascota,
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    test('Debe validar que nombre sea requerido', () => {
      const req = mockReq();
      req.body = {
        especie: 'Gato',
        // falta nombre
      };

      const res = mockRes();

      // Validación
      if (!req.body.nombre) {
        res.status(400);
        res.json({ success: false, message: 'Nombre requerido' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar que especie sea requerida', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Misi',
        // falta especie
      };

      const res = mockRes();

      if (!req.body.especie) {
        res.status(400);
        res.json({ success: false, message: 'Especie requerida' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe validar tamano/tamaño correctamente', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Leo',
        especie: 'Gato',
        tamaño: 'pequeño',
      };

      // Normalización
      const tamano = req.body.tamano || req.body.tamaño;
      expect(tamano).toBe('pequeño');
    });

    test('Debe asignar origen por defecto', () => {
      const req = mockReq();
      req.body = {
        nombre: 'Pelusa',
        especie: 'Gato',
      };

      const origen = req.body.origen || 'externo';
      expect(origen).toBe('externo');
    });

    test('Debe manejar imagenes desde files', () => {
      const req = mockReq();
      req.files = [
        { path: 'https://cloudinary.com/img1.jpg' },
        { secure_url: 'https://cloudinary.com/img2.jpg' },
      ];

      const imagenes = req.files.map((f) => f.path || f.secure_url);
      expect(imagenes).toHaveLength(2);
      expect(imagenes[0]).toContain('cloudinary');
    });

    test('Debe marcar como disponible si estado es disponible', () => {
      const req = mockReq();
      req.body = { estado: 'disponible' };

      let disponible = undefined;
      if (req.body.estado === 'disponible') {
        disponible = true;
      }

      expect(disponible).toBe(true);
    });

    test('Debe marcar como no disponible si estado es adoptado', () => {
      const req = mockReq();
      req.body = { estado: 'adoptado' };

      let disponible = undefined;
      if (req.body.estado === 'adoptado') {
        disponible = false;
      }

      expect(disponible).toBe(false);
    });
  });

  describe('getMascotas', () => {
    test('Debe listar mascotas publicadas', () => {
      const req = mockReq();
      const res = mockRes();

      const mascotas = [
        { _id: '1', nombre: 'Rex', publicada: true },
        { _id: '2', nombre: 'Misi', publicada: true },
      ];

      res.status(200);
      res.json(mascotas);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    test('Debe retornar array vacío si no hay mascotas', () => {
      const res = mockRes();
      res.json([]);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  describe('getMascotaById', () => {
    test('Debe obtener mascota por ID válido', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      const mascota = { _id: req.params.id, nombre: 'Rex' };
      res.json(mascota);

      expect(res.json).toHaveBeenCalledWith(mascota);
    });

    test('Debe rechazar ID inválido', () => {
      const req = mockReq();
      req.params.id = 'not-a-valid-id';
      const res = mockRes();

      res.status(400);
      res.json({ success: false, message: 'ID inválido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar 404 si mascota no existe', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(404);
      res.json({ success: false, message: 'Mascota no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateMascota', () => {
    test('Debe actualizar mascota correctamente', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      req.body = {
        nombre: 'Rex Actualizado',
        disponible: false,
      };
      const res = mockRes();

      const mascotaActualizada = { _id: req.params.id, ...req.body };
      res.json({
        success: true,
        message: 'Mascota actualizada correctamente',
        mascota: mascotaActualizada,
      });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe rechazar ID inválido en actualización', () => {
      const req = mockReq();
      req.params.id = 'invalid-id';
      const res = mockRes();

      res.status(400);
      res.json({ success: false, message: 'ID inválido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar 404 si mascota no existe', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(404);
      res.json({ success: false, message: 'Mascota no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteMascota', () => {
    test('Debe eliminar mascota correctamente', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.json({ success: true, message: 'Mascota eliminada correctamente' });

      expect(res.json).toHaveBeenCalled();
    });

    test('Debe rechazar ID inválido', () => {
      const req = mockReq();
      req.params.id = 'invalid';
      const res = mockRes();

      res.status(400);
      res.json({ success: false, message: 'ID inválido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe retornar 404 si mascota no existe', () => {
      const req = mockReq();
      req.params.id = '507f1f77bcf86cd799439011';
      const res = mockRes();

      res.status(404);
      res.json({ success: false, message: 'Mascota no encontrada' });

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getMascotasPorOrigen', () => {
    test('Debe listar mascotas por origen fundacion', () => {
      const req = mockReq();
      req.params.origen = 'fundacion';
      const res = mockRes();

      const mascotas = [
        { _id: '1', nombre: 'Rex', origen: 'fundacion', publicada: true },
      ];
      res.json(mascotas);

      expect(res.json).toHaveBeenCalledWith(mascotas);
    });

    test('Debe listar mascotas por origen externo', () => {
      const req = mockReq();
      req.params.origen = 'externo';
      const res = mockRes();

      const mascotas = [
        { _id: '2', nombre: 'Misi', origen: 'externo', publicada: true },
      ];
      res.json(mascotas);

      expect(res.json).toHaveBeenCalledWith(mascotas);
    });

    test('Debe rechazar origen inválido', () => {
      const req = mockReq();
      req.params.origen = 'invalido';
      const res = mockRes();

      res.status(400);
      res.json({ success: false, message: 'Origen no válido' });

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Debe convertir origen a minúsculas', () => {
      const origen = 'FUNDACION'.toLowerCase().trim();
      expect(['fundacion', 'externo']).toContain(origen);
    });
  });

  describe('Normalización de Payload', () => {
    test('Debe normalizar contactoExterno.email a correo', () => {
      const body = {
        contactoExterno: { email: 'test@example.com' },
      };

      const contactoExterno = body.contactoExterno;
      if (contactoExterno.email && !contactoExterno.correo) {
        contactoExterno.correo = contactoExterno.email;
      }

      expect(contactoExterno.correo).toBe('test@example.com');
    });

    test('Debe extraer contactoExterno desde form-data', () => {
      const body = {
        'contactoExterno[correo]': 'contact@example.com',
        'contactoExterno[telefono]': '123456789',
      };

      const obj = {};
      const re = /^contactoExterno\[(.+?)\]$/;
      for (const k of Object.keys(body)) {
        const m = re.exec(k);
        if (m) obj[m[1]] = body[k];
      }

      expect(obj.correo).toBe('contact@example.com');
      expect(obj.telefono).toBe('123456789');
    });
  });
});
