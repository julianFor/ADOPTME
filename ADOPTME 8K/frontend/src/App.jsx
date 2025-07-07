// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import './index.css';

// Páginas públicas
import Home from './pages/Home';
import Adoptar from './pages/Adoptar';
import ComoAdoptar from './pages/ComoAdoptar';
import MascotaDetalle from './pages/Mascotas/MascotaDetalle';
import FormularioAdopcion from './pages/Gestion/SolicitudesAdopcion/FormularioAdopcion';
import FormularioPublicacion from './pages/Gestion/SolicitudesPublicacion/FormularioPublicacion';
import Donar from './pages/Donar'; 
import AdminMetas from './pages/AdminMetas'; 

// Dashboards por rol
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardFundacion from './pages/DashboardFundacion';
import DashboardAdoptante from './pages/DashboardAdoptante';

// Navbar por rol
import NavbarAdmin from './components/NavbarAdmin';
import NavbarFundacion from './components/NavbarFundacion';
import NavbarAdoptante from './components/NavbarAdoptante';
import NavbarDefault from './components/Navbar';

// Otros componentes globales
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

// Contexto
import { UserContext } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext'; // 👈 Importamos el contexto de notificaciones

// ------------------- CONTENIDO DE LA APP -----------------------
function AppContent() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  // ¿Estamos en una ruta de dashboard?
  const esRutaDashboard = location.pathname.startsWith('/dashboard');

  // Navbar dinámico según el rol
  const renderNavbar = () => {
    if (!user) return <NavbarDefault />;
    if (user.role === 'admin') return <NavbarAdmin />;
    if (user.role === 'adminFundacion') return <NavbarFundacion />;
    if (user.role === 'adoptante') return <NavbarAdoptante />;
    return <NavbarDefault />;
  };

  return (
    <>
      {renderNavbar()}

      <main className="min-h-screen">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/adoptar" element={<Adoptar />} />
          <Route path="/ComoAdoptar" element={<ComoAdoptar />} />
          <Route path="/mascotas/:id" element={<MascotaDetalle />} />
          <Route path="/adopcion/:idMascota" element={<FormularioAdopcion />} />
          <Route path="/publicaciones" element={<FormularioPublicacion />} />
          <Route path="/donar" element={<Donar />} />
        <Route path="/admin/metas" element={<AdminMetas />} />

          {/* Rutas protegidas (según rol) */}
          <Route path="/dashboard/admin/*" element={<DashboardAdmin />} />
          <Route path="/dashboard/fundacion" element={<DashboardFundacion />} />
          <Route path="/dashboard/adoptante" element={<DashboardAdoptante />} />
        </Routes>
      </main>

      {/* Footer solo en rutas públicas */}
      {!esRutaDashboard && <Footer />}

      <AuthModal />
    </>
  );
}

// ---------------------- APP PRINCIPAL -------------------------
function App() {
  const { user } = useContext(UserContext); // Necesitamos saber si hay usuario autenticado

  return (
    <BrowserRouter>
      {
        user ? (
          // 👇 Envolvemos AppContent con el NotificationProvider SOLO si el usuario está autenticado
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        ) : (
          <AppContent />
        )
      }
    </BrowserRouter>
  );
}

export default App;
