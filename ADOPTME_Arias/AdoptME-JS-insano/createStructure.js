const fs = require('fs');
const path = require('path');

// Estructura del proyecto
const structure = {
  'adoptme-backend': {
    'config': ['database.js', 'cloudinary.js'],
    'controllers': ['authController.js', 'petController.js', 'userController.js'],
    'models': ['Pet.js', 'User.js'],
    'routes': ['authRoutes.js', 'petRoutes.js', 'userRoutes.js'],
    'middleware': ['auth.js', 'upload.js'],
    '.env': '',
    'app.js': '',
    'server.js': ''
  }
};

// Función para crear estructura recursivamente
function createStructure(basePath, obj) {
  for (const key in obj) {
    const fullPath = path.join(basePath, key);
    if (typeof obj[key] === 'object') {
      fs.mkdirSync(fullPath, { recursive: true });
      createStructure(fullPath, obj[key]);
    } else if (Array.isArray(obj[key])) {
      fs.mkdirSync(fullPath, { recursive: true });
      obj[key].forEach(file => {
        fs.writeFileSync(path.join(fullPath, file), '', 'utf8');
      });
    } else {
      fs.writeFileSync(fullPath, '', 'utf8');
    }
  }
}

// Ejecutar la creación
createStructure('.', structure);

console.log('Estructura de carpetas y archivos creada con éxito.');
