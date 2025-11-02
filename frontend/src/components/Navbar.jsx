import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/LogoAdoptmeLavandaV1.svg';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { FaBell, FaUser, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { openLogin } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [open, setOpen] = useState(false); // RESPONSIVE: estado del menú

  // Ruta de gestión según rol
  const gestionPath =
    user?.role === 'admin'
      ? '/dashboard-admin'
      : user?.role === 'adminFundacion'
      ? '/dashboard-fundacion'
      : user?.role === 'adoptante'
      ? '/dashboard-adoptante'
      : '#';

  // helper para estilos activos (mismo diseño)
  const active = (path) =>
    `pb-1 ${
      location.pathname === path
        ? 'text-purple-600 border-b-2 border-purple-500'
        : 'text-gray-700 hover:text-purple-600'
    }`;

  return (
    <header
      className="flex justify-between items-center px-8 py-4 bg-white rounded-full shadow-md max-w-[1200px] mx-auto
      relative" // RESPONSIVE: contenedor relativo para posicionar el panel móvil
    >
      <div className="flex items-center gap-3">
        <Link to="/" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="AdoptMe logo"
            className="h-10 md:h-12 w-auto" // RESPONSIVE: altura fluida
          />
        </Link>
      </div>

      {/* NAV DESKTOP (inalterado visualmente) */}
      <nav className="hidden md:flex gap-6 text-lg font-medium">
        <Link to="/" className={active('/')}>Inicio</Link>
        <Link to="/adoptar" className={active('/adoptar')}>Adoptar</Link>
        <Link to="/ComoAdoptar" className={active('/ComoAdoptar')}>¿Cómo Adoptar?</Link>
        <Link to="/donar" className={active('/donar')}>Donar</Link>
        <Link to={{ pathname: '/', hash: '#contacto' }} className="text-gray-700 hover:text-purple-600">
          Contacto
        </Link>
        {user && (
          <Link
            to={gestionPath}
            className={`text-gray-700 hover:text-purple-600 ${
              location.pathname === gestionPath ? 'text-purple-600 font-semibold' : ''
            }`}
          >
            Gestión
          </Link>
        )}
      </nav>

      {/* Acciones derecha DESKTOP (igual que antes) */}
      {user ? (
        <div className="hidden md:flex items-center gap-3">
          <Link to="/notificaciones" className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600">
            <FaBell />
          </Link>
          <Link to="/perfil" className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600">
            <FaUser />
          </Link>
        </div>
      ) : (
        <button
          onClick={openLogin}
          className="hidden md:inline-flex bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition duration-300"
        >
          Iniciar Sesión
        </button>
      )}

      {/* BOTÓN HAMBURGUESA (solo móvil) */}
      <button
        className="md:hidden inline-flex items-center justify-center p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600"
        onClick={() => setOpen((s) => !s)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

{/* PANEL MÓVIL (mismo contenido que el nav, sin cambiar diseño base) */}
<div
  id="mobile-menu"
  className={`md:hidden absolute left-0 right-0 top-full mx-4 mt-2 rounded-2xl bg-white shadow-xl overflow-hidden transition-all
  z-[10000] ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
>
  <div className="flex flex-col gap-3 p-4 text-base font-medium">
    <Link to="/" className={active('/')} onClick={() => setOpen(false)}>Inicio</Link>
    <Link to="/adoptar" className={active('/adoptar')} onClick={() => setOpen(false)}>Adoptar</Link>
    <Link to="/ComoAdoptar" className={active('/ComoAdoptar')} onClick={() => setOpen(false)}>¿Cómo Adoptar?</Link>
    <Link to="/donar" className={active('/donar')} onClick={() => setOpen(false)}>Donar</Link>
    <Link
      to={{ pathname: '/', hash: '#contacto' }}
      className="text-gray-700 hover:text-purple-600"
      onClick={() => setOpen(false)}
    >
      Contacto
    </Link>

    {user && (
      <Link
        to={gestionPath}
        className={`text-gray-700 hover:text-purple-600 ${
          location.pathname === gestionPath ? 'text-purple-600 font-semibold' : ''
        }`}
        onClick={() => setOpen(false)}
      >
        Gestión
      </Link>
    )}

    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
      {user ? (
        <div className="flex gap-3">
          <Link
            to="/notificaciones"
            className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600"
            onClick={() => setOpen(false)}
          >
            <FaBell />
          </Link>
          <Link
            to="/perfil"
            className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600"
            onClick={() => setOpen(false)}
          >
            <FaUser />
          </Link>
        </div>
      ) : (
        <button
          onClick={() => {
            setOpen(false);
            openLogin();
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition duration-300 w-full"
        >
          Iniciar Sesión
        </button>
      )}
    </div>
  </div>
</div>

    </header>
  );
};

export default Navbar;
