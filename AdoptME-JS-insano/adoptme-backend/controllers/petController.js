const path = require('path');
const fs = require('fs');
const Pet = require('../models/Pet');
const cloudinary = require('../config/cloudinary');

// Configuración de rutas de archivos
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'pets');

// Crear directorio de uploads si no existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * @desc    Obtener todas las mascotas
 * @route   GET /api/pets
 * @access  Público
 */
exports.getAllPets = async (req, res) => {
  try {
    console.log('🔵 [getAllPets] Obteniendo mascotas. Filtros:', req.query);

    const { species, gender, size, age, name, status, limit } = req.query;
    const filter = {};

    if (species) filter.species = species;
    if (gender) filter.gender = gender.toLowerCase();
    if (size) filter.size = size.toLowerCase();
    if (age) filter.age = { $lte: parseInt(age) };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (status) filter.status = status;

    let query = Pet.find(filter)
      .populate('postedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const pets = await query;

    console.log(`🟢 [getAllPets] ${pets.length} mascotas encontradas`);

    res.status(200).json({
      success: true,
      count: pets.length,
      pets
    });

  } catch (err) {
    console.error('🔴 [getAllPets] Error:', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

/**
 * @desc    Crear una nueva mascota
 * @route   POST /api/pets
 * @access  Privado
 */
exports.createPet = async (req, res) => {
  try {
    console.log('🔵 [createPet] Datos recibidos:', req.body);
    console.log('📸 Archivos recibidos:', req.files);

    // Validación de campos requeridos
    const requiredFields = {
      name: 'Nombre',
      species: 'Especie',
      breed: 'Raza',
      age: 'Edad',
      gender: 'Género',
      size: 'Tamaño',
      description: 'Descripción',
      location: 'Ubicación'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !req.body[key])
      .map(([_, value]) => value);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obligatorios faltantes: ${missingFields.join(', ')}`
      });
    }

    // Procesar fotos
    const photos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Verificar si el archivo existe
          if (!fs.existsSync(file.path)) {
            throw new Error(`El archivo ${file.path} no existe`);
          }

          // Intentar subir a Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'pet_adoption/pets',
            use_filename: true,
            unique_filename: false
          });

          photos.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          // Eliminar archivo temporal
          fs.unlinkSync(file.path);
          console.log(`✅ Imagen ${file.originalname} subida a Cloudinary`);
        } catch (uploadError) {
          console.error('🔴 Error subiendo imagen a Cloudinary:', uploadError.message);

          // Mover el archivo al directorio de uploads local
          const newPath = path.join(UPLOADS_DIR, file.filename);
          fs.renameSync(file.path, newPath);

          photos.push({
            url: `/uploads/pets/${file.filename}`,
            publicId: null
          });
          console.log(`📁 Imagen guardada localmente en: ${newPath}`);
        }
      }
    }

    // Crear la mascota
    const petData = {
      ...req.body,
      gender: req.body.gender.toLowerCase(),
      size: req.body.size.toLowerCase(),
      postedBy: req.user.id,
      photos: photos.length > 0 ? photos : undefined
    };

    const pet = await Pet.create(petData);

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      pet
    });

  } catch (err) {
    console.error('🔴 [createPet] Error:', {
      message: err.message,
      stack: err.stack
    });

    // Limpiar archivos temporales en caso de error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      });
    }

    // Manejo de errores de validación
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear mascota',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

/**
 * @desc    Obtener una mascota por ID
 * @route   GET /api/pets/:id
 * @access  Público
 */
exports.getPet = async (req, res) => {
  try {
    console.log(`🔵 [getPet] Buscando mascota ID: ${req.params.id}`);

    const pet = await Pet.findById(req.params.id)
      .populate('postedBy', 'name email avatar');

    if (!pet) {
      console.log('🔴 [getPet] Mascota no encontrada');
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    // Procesar URLs de imágenes para asegurar accesibilidad
    if (pet.photos && pet.photos.length > 0) {
      pet.photos = pet.photos.map(photo => {
        if (photo.url && !photo.url.startsWith('http') && !photo.url.startsWith('/uploads')) {
          return {
            ...photo,
            url: `/uploads/pets/${photo.url}`
          };
        }
        return photo;
      });
    }

    console.log(`🟢 [getPet] Mascota encontrada: ${pet.name}`);
    res.status(200).json({
      success: true,
      pet
    });

  } catch (err) {
    console.error('🔴 [getPet] Error:', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error al obtener mascota',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

/**
 * @desc    Actualizar mascota
 * @route   PUT /api/pets/:id
 * @access  Privado (Dueño o Admin)
 */
exports.updatePet = async (req, res) => {
  try {
    console.log(`🔵 [updatePet] Actualizando mascota ID: ${req.params.id}`);

    let pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    // Verificar permisos
    if (pet.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para actualizar esta mascota'
      });
    }

    // Procesar nuevas fotos
    let newPhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          // Subir a Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'pet_adoption/pets',
            use_filename: true,
            unique_filename: false
          });

          newPhotos.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          // Eliminar archivo temporal
          fs.unlinkSync(file.path);
        } catch (uploadError) {
          console.error('Error subiendo imagen:', uploadError);

          // Guardar localmente
          const newPath = path.join(UPLOADS_DIR, file.filename);
          fs.renameSync(file.path, newPath);

          newPhotos.push({
            url: `/uploads/pets/${file.filename}`,
            publicId: null
          });
        }
      }
    }

    // Preparar datos de actualización
    const updateData = {
      ...req.body,
      gender: req.body.gender ? req.body.gender.toLowerCase() : pet.gender,
      size: req.body.size ? req.body.size.toLowerCase() : pet.size
    };

    // Manejar fotos
    if (req.body.photos === 'reset' || req.body.photos === '[]') {
      // Eliminar todas las fotos existentes
      await deletePhotosFromStorage(pet.photos);
      updateData.photos = [];
    } else if (newPhotos.length > 0) {
      // Combinar fotos existentes con nuevas (a menos que se especifique reemplazo)
      if (!req.body.photos) {
        updateData.photos = [...pet.photos, ...newPhotos];
      } else {
        // Si se envían fotos en el body, reemplazar todo el array
        updateData.photos = JSON.parse(req.body.photos).concat(newPhotos);
      }
    }

    // Actualizar mascota
    pet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Mascota actualizada',
      pet
    });

  } catch (err) {
    console.error('🔴 [updatePet] Error:', {
      message: err.message,
      stack: err.stack
    });

    // Limpiar archivos temporales en caso de error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (unlinkError) {
          console.error('Error eliminando archivo temporal:', unlinkError);
        }
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error al actualizar mascota',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

/**
 * @desc    Eliminar mascota
 * @route   DELETE /api/pets/:id
 * @access  Privado (Dueño o Admin)
 */
exports.deletePet = async (req, res) => {
  try {
    console.log(`🔵 [deletePet] Eliminando mascota ID: ${req.params.id}`);

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    // Verificar permisos
    if (pet.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar esta mascota'
      });
    }

    // Eliminar fotos del almacenamiento
    await deletePhotosFromStorage(pet.photos);

    await pet.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Mascota eliminada'
    });

  } catch (err) {
    console.error('🔴 [deletePet] Error:', {
      message: err.message,
      stack: err.stack
    });

    res.status(500).json({
      success: false,
      message: 'Error al eliminar mascota',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
};

// Función auxiliar para eliminar fotos del almacenamiento
async function deletePhotosFromStorage(photos) {
  if (!photos || photos.length === 0) return;

  for (const photo of photos) {
    try {
      // Eliminar de Cloudinary si tiene publicId
      if (photo.publicId) {
        await cloudinary.uploader.destroy(photo.publicId);
        console.log(`🗑️ Imagen eliminada de Cloudinary: ${photo.publicId}`);
      }
      
      // Eliminar archivo local si existe
      if (photo.url && photo.url.startsWith('/uploads/pets/')) {
        const filename = photo.url.split('/').pop();
        const filePath = path.join(UPLOADS_DIR, filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Archivo local eliminado: ${filePath}`);
        }
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  }
}