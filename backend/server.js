// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Configuración de ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Crear app
const app = express();

/* ============================
   Middlewares base
============================ */
const ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================
   Conexión a MongoDB
============================ */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Conectado a MongoDB');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};
await connectDB();

/* ============================
   Carga dinámica de rutas
============================ */
const routes = [
  { path: './routes/authRoutes.js', endpoint: '/api/auth' },
  { path: './routes/userRoutes.js', endpoint: '/api/users' },
  { path: './routes/mascotaRoutes.js', endpoint: '/api/mascotas' },
  { path: './routes/solicitudAdopcionRoutes.js', endpoint: '/api/solicitudesAdopcion' },
  { path: './routes/procesoAdopcionRoutes.js', endpoint: '/api/proceso' },
  { path: './routes/solicitudPublicacionRoutes.js', endpoint: '/api/publicaciones' },
  { path: './routes/notificacionRoutes.js', endpoint: '/api/notificaciones' },
  { path: './routes/donationRoutes.js', endpoint: '/api/donaciones' },
  { path: './routes/donationGoalRoutes.js', endpoint: '/api/metas' },
  { path: './routes/donationsProductRoutes.js', endpoint: '/api/donations-products' },
  { path: './routes/paypalRoutes.js', endpoint: '/api/paypal' },
  { path: './routes/necesidadRoutes.js', endpoint: '/api/necesidades' },
  { path: './routes/dashboardRoutes.js', endpoint: '/api/dashboard' },
  { path: './routes/contactRoutes.js', endpoint: '/api/contact' },
];

for (const route of routes) {
  try {
    const mod = await import(route.path);
    if (mod?.default) {
      app.use(route.endpoint, mod.default);
      console.log(`✓ Ruta ${route.endpoint} cargada correctamente`);
    } else {
      console.warn(`⚠ Ruta ${route.endpoint} no exporta default`);
    }
  } catch (err) {
    console.error(`✗ No se pudo cargar la ruta ${route.path}:`, err.message);
  }
}

/* ============================
   Middlewares y estáticos
============================ */
// PayPal IPN (urlencoded sin extendido)
app.use('/api/paypal/ipn', express.urlencoded({ extended: false }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ============================
   Healthcheck / raíz
============================ */
app.get('/', (_, res) => {
  res.send('API de AdoptMe funcionando');
});

/* ============================
   Manejo de errores
============================ */
app.use((err, req, res, next) => {
  console.error('🛑 Error no controlado:', err);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

/* ============================
   Levantar servidor
============================ */
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`✅ API escuchando en http://${HOST}:${PORT} (CORS_ORIGIN=${ORIGIN})`);
});

/* ============================
   Cierre limpio (opcional)
============================ */
process.on('SIGINT', async () => {
  console.log('🧹 Cerrando por SIGINT…');
  await mongoose.connection.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('🧹 Cerrando por SIGTERM…');
  await mongoose.connection.close();
  process.exit(0);
});
