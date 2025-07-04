import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import './index.css';
import Home from './pages/Home';
import Adoptar from './pages/Adoptar';
import ComoAdoptar from './pages/ComoAdoptar';
import MascotaDetalle from './pages/Mascotas/MascotaDetalle';
import FormularioAdopcion from './pages/Gestion/SolicitudesAdopcion/FormularioAdopcion';
import FormularioPublicacion from './pages/Gestion/SolicitudesPublicacion/FormularioPublicacion';

import AuthModal from './components/AuthModal';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardFundacion from './pages/DashboardFundacion';
import DashboardAdoptante from './pages/DashboardAdoptante';

import NavbarAdmin from './components/NavbarAdmin';
import NavbarFundacion from './components/NavbarFundacion';
import NavbarAdoptante from './components/NavbarAdoptante';
import NavbarDefault from './components/Navbar';
import Footer from './components/Footer';

import { UserContext } from './context/UserContext';

function AppContent() {
  const { user } = useContext(UserContext);
  const location = useLocation();

  //  Detecta si es una ruta de dashboard
  const esRutaDashboard = location.pathname.startsWith('/dashboard');

  //  Renderiza el Navbar correspondiente
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
          <Route path="/" element={<Home />} />
          <Route path="/adoptar" element={<Adoptar />} />
          <Route path="/ComoAdoptar" element={<ComoAdoptar />} />
          <Route path="/mascotas/:id" element={<MascotaDetalle />} />
          <Route path="/adopcion/:idMascota" element={<FormularioAdopcion />} />
          <Route path="/publicaciones" element={<FormularioPublicacion />} />

          <Route path="/dashboard/admin/*" element={<DashboardAdmin />} />
          <Route path="/dashboard/fundacion" element={<DashboardFundacion />} />
          <Route path="/dashboard/adoptante" element={<DashboardAdoptante />} />
        </Routes>
      </main>

      {/*  Footer solo si NO es dashboard */}
      {!esRutaDashboard && <Footer />}

      <AuthModal />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
