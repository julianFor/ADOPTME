// middleware/folderSetup.js
const fs = require('fs');
const path = require('path');

const createUploadsFolder = () => {
  const baseDir = path.join(__dirname, '../uploads');
  const subDirs = ['pets', 'documents', 'compromisos'];
  
  try {
    // Crear directorio base si no existe
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // Crear subdirectorios
    subDirs.forEach(dir => {
      const dirPath = path.join(baseDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  } catch (error) {
    console.error('Error creando directorios de uploads:', error);
    throw error;
  }
};

module.exports = {
  createUploadsFolder
};