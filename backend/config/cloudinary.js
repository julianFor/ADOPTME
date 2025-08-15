const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log temporal para validar
console.log('[Cloudinary] cloud_name:', cloudinary.config().cloud_name);

module.exports = cloudinary;
