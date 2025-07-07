
// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};
await connectDB();

// Importar rutas dinámicamente con manejo de errores
const importRoute = async (routePath) => {
  try {
    const module = await import(routePath);
    return module.default;
  } catch (err) {
    console.error(`❌ Error cargando ruta ${routePath}:`, err);
    return null;
  }
};

// Cargar rutas dinámicamente
const routes = [
  { path: './routes/authRoutes.js', endpoint: '/api/auth' },
  { path: './routes/userRoutes.js', endpoint: '/api/users' },
  { path: './routes/mascotaRoutes.js', endpoint: '/api/mascotas' },
  { path: './routes/solicitudAdopcionRoutes.js', endpoint: '/api/solicitudesAdopcion' },
  { path: './routes/procesoAdopcionRoutes.js', endpoint: '/api/proceso' },
  { path: './routes/solicitudPublicacionRoutes.js', endpoint: '/api/publicaciones' },
  { path: './routes/notificacionRoutes.js', endpoint: '/api/notificaciones' },
  { path: './routes/donationRoutes.js', endpoint: '/api/donations' },
  { path: './routes/donationGoalRoutes.js', endpoint: '/api/donation-goals', endpoint: '/api/metas' },
  { path: './routes/donationsProductRoutes.js', endpoint: '/api/donations-products' },
  { path: './routes/paypalRoutes.js', endpoint: '/api/paypal' }
];

for (const route of routes) {
  try {
    const routeModule = await import(route.path);
    if (routeModule && routeModule.default) {
      app.use(route.endpoint, routeModule.default);
      console.log(`✓ Ruta ${route.endpoint} cargada correctamente`);
    }
  } catch (err) {
    console.error(`✗ No se pudo cargar la ruta ${route.path}:`, err.message);
  }
}

// Middleware para PayPal IPN
app.use('/api/paypal/ipn', express.urlencoded({ extended: false }));

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta base
app.get('/', (_, res) => {
  res.send('🚀 API de AdoptMe funcionando');
});

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal en el servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});