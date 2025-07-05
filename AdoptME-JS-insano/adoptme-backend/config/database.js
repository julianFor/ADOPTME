const mongoose = require('mongoose');
const { createIndexes } = require('../models/Notificacion');
const { createIndexes: createSolicitudIndexes } = require('../models/SolicitudAdopcion');
const { createIndexes: createProcesoIndexes } = require('../models/ProcesoAdopcion');
const { createIndexes: createPublicacionIndexes } = require('../models/SolicitudPublicacion');

const connectDB = async () => {
  try {
    // Configuración optimizada de conexión (sin opciones obsoletas)
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adoptme', {
      serverSelectionTimeoutMS: 5000,    // 5 segundos para seleccionar servidor
      socketTimeoutMS: 45000,           // 45 segundos para timeout de operaciones
      maxPoolSize: 10,                  // Máximo de conexiones en el pool
      retryWrites: true,                // Reintentar escrituras fallidas
      retryReads: true,                 // Reintentar lecturas fallidas
      w: 'majority'                     // Confirmación de escritura en mayoría
    });
    
    console.log('✅ MongoDB Connected');

    // Eventos de conexión mejorados
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
      initializeCollections();
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.error('Verifica que MongoDB esté corriendo y accesible');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from DB');
    });

  } catch (err) {
    console.error(`❌ Error de conexión: ${err.message}`);
    console.error('Revisa tu conexión a internet y la configuración de MongoDB');
    process.exit(1);
  }
};

// Función optimizada para inicializar colecciones e índices
const initializeCollections = async () => {
  const db = mongoose.connection.db;
  
  try {
    console.log('🔍 Verificando índices de colecciones...');
    
    // Índices para Notificaciones
    await mongoose.model('Notificacion').createIndexes();
    
    // Índices para SolicitudAdopcion (con nombres más descriptivos)
    await mongoose.model('SolicitudAdopcion').createIndexes();
    await db.collection('solicitudadopcions').createIndex(
      { mascota: 1 },
      { name: 'idx_solicitud_mascota' }
    );
    await db.collection('solicitudadopcions').createIndex(
      { adoptante: 1 },
      { name: 'idx_solicitud_adoptante' }
    );
    await db.collection('solicitudadopcions').createIndex(
      { estado: 1 },
      { name: 'idx_solicitud_estado' }
    );
    
    // Índices para ProcesoAdopcion
    await mongoose.model('ProcesoAdopcion').createIndexes();
    await db.collection('procesoadopcions').createIndex(
      { solicitud: 1 },
      { name: 'idx_proceso_solicitud' }
    );
    await db.collection('procesoadopcions').createIndex(
      { finalizado: 1 },
      { name: 'idx_proceso_finalizado' }
    );
    
    // Índices para SolicitudPublicacion
    await mongoose.model('SolicitudPublicacion').createIndexes();
    await db.collection('solicitudpublicacions').createIndex(
      { adoptante: 1 },
      { name: 'idx_publicacion_adoptante' }
    );
    await db.collection('solicitudpublicacions').createIndex(
      { estado: 1 },
      { name: 'idx_publicacion_estado' }
    );
    
    console.log('✅ Índices verificados y optimizados');

  } catch (err) {
    console.error('❌ Error inicializando colecciones:', err.message);
    if (err.code === 26) {
      console.error('Posible error de permisos en la base de datos');
    }
  }
};

// Manejo mejorado de cierre de conexión
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} recibido. Cerrando conexiones...`);
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión:', err.message);
    process.exit(1);
  }
};

// Manejadores para diferentes señales de terminación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

module.exports = connectDB;