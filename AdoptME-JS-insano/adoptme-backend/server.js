require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');
const donationRoutes = require('./routes/donationRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const donationGoalRoutes = require('./routes/donationGoalRoutes');

const app = express();

// Middleware especial para la ruta IPN de PayPal (usa `urlencoded` plano sin JSON)
app.use('/api/paypal/ipn', express.urlencoded({ extended: false }));

// ✅ MIDDLEWARES antes de las rutas

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// ✅ RUTA DE DONACIONES después del middleware
app.use('/api/donations', donationRoutes);
app.use('/api/paypal', paypalRoutes);
app.use('/api/donation-goal', donationGoalRoutes);

// Archivos estáticos
const uploadsDir = path.join(__dirname, 'uploads');
const subdirectories = ['pets', 'documents', 'compromisos'];

const createUploadsFolder = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📂 Carpeta "uploads" creada');
    }

    subdirectories.forEach(dir => {
      const dirPath = path.join(uploadsDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📂 Subcarpeta "uploads/${dir}" creada`);
      }
      fs.chmodSync(dirPath, 0o755);
    });

  } catch (error) {
    console.error('❌ Error configurando directorios:', error.message);
  }
};

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    } else if (['.pdf'].includes(ext)) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Conexión DB
connectDB();

// Otras rutas
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const solicitudAdopcionRoutes = require('./routes/solicitudAdopcionRoutes');
const procesoAdopcionRoutes = require('./routes/procesoAdopcionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const solicitudPublicacionRoutes = require('./routes/solicitudPublicacionRoutes');

app.use('/auth/', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/solicitudesAdopcion', solicitudAdopcionRoutes);
app.use('/api/proceso', procesoAdopcionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/publicaciones', solicitudPublicacionRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    suggestion: 'Verifique la URL y el método HTTP'
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('🔥 Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    if (err.errors) response.errors = err.errors;
  }

  res.status(statusCode).json(response);
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  createUploadsFolder();
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📁 Ruta de archivos: http://localhost:${PORT}/uploads/`);
  console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base de datos: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
});

// Cierre elegante
const shutdown = async (signal) => {
  console.log(`🛑 Recibida señal ${signal}. Cerrando servidor...`);
  try {
    await mongoose.connection.close();
    console.log('🔴 Conexión a MongoDB cerrada');
    server.close(() => {
      console.log('🔴 Servidor HTTP cerrado');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error durante el cierre:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});
