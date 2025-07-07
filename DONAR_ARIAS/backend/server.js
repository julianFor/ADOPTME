// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mascotaRoutes = require('./routes/mascotaRoutes');
const solicitudAdopcionRoutes = require('./routes/solicitudAdopcionRoutes');
const procesoAdopcionRoutes = require('./routes/procesoAdopcionRoutes'); 
const solicitudPublicacionRoutes = require('./routes/solicitudPublicacionRoutes');
const notificacionRoutes = require('./routes/notificacionRoutes');
const donationRoutes = require('./routes/donationRoutes');
const donationGoalRoutes = require('./routes/donationGoalRoutes');
const paypalRoutes = require('./routes/paypalRoutes');
const path = require("path");

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
connectDB();

// Crear app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta base
app.get('/', (req, res) => {
  res.send('🚀 API de AdoptMe funcionando');
});

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/solicitudesAdopcion', solicitudAdopcionRoutes);
app.use('/api/proceso', procesoAdopcionRoutes); 
app.use('/api/publicaciones', solicitudPublicacionRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/donations', donationRoutes);
app.use('/api/donation-goals', donationGoalRoutes);


// Middleware especial para PayPal IPN (antes de JSON)
app.use('/api/paypal/ipn', express.urlencoded({ extended: false }));

// Después de JSON
app.use('/api/paypal', require('./routes/paypalRoutes'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend escuchando en http://localhost:${PORT}`);
});
