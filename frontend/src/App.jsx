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
import Donar from './pages/Donar'; // ✅ NUEVO
import AdminMetas from './pages/AdminMetas'; // ✅ NUEVO

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
import { NotificationProvider } from './context/NotificationContext';

function AppContent() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  const esRutaDashboard = location.pathname.startsWith('/dashboard');

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
          <Route path="/donar" element={<Donar />} /> {/* ✅ Nueva ruta pública */}
          <Route path="/admin/metas" element={<AdminMetas />} /> {/* ✅ Ruta directa por si se desea acceder sin dashboard */}

          {/* Rutas protegidas */}
          <Route path="/dashboard/admin/*" element={<DashboardAdmin />} />
          <Route path="/dashboard/adminFundacion/*" element={<DashboardFundacion />} />
          <Route path="/dashboard/adoptante/*" element={<DashboardAdoptante />} />
        </Routes>
      </main>

      {!esRutaDashboard && <Footer />}
      <AuthModal />
    </>
  );
}

function App() {
  const { user } = useContext(UserContext);

  return (
    <BrowserRouter>
      {user ? (
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      ) : (
        <AppContent />
      )}
    </BrowserRouter>
  );
}

export default App;
