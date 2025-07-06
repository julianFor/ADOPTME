// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/LogoAdoptmeLavandaV1.svg';
import { AuthContext } from '../context/AuthContext';
import { UserContext } from '../context/UserContext';
import { FaBell, FaUser } from 'react-icons/fa';

const Navbar = () => {
  const { openLogin } = useContext(AuthContext);
  const { user } = useContext(UserContext);
  const location = useLocation();

  // Ruta de gestión según rol
  const gestionPath = user?.role === 'admin'
    ? '/dashboard-admin'
    : user?.role === 'adminFundacion'
    ? '/dashboard-fundacion'
    : user?.role === 'adoptante'
    ? '/dashboard-adoptante'
    : '#';

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white rounded-full shadow-md max-w-[1200px] mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/">
          <img src={logo} alt="AdoptMe logo" className="w-100 h-12" />
        </Link>
      </div>

      <nav className="flex gap-6 text-lg font-medium">
        <Link
          to="/"
          className={`pb-1 ${location.pathname === '/' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}
        >
          Inicio
        </Link>
        <Link
          to="/adoptar"
          className={`pb-1 ${location.pathname === '/adoptar' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}
        >
          Adoptar
        </Link>
        <Link to="/ComoAdoptar" className={`pb-1 ${location.pathname === '/ComoAdoptar' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}>¿Cómo Adoptar?</Link>
        
        <Link to="#" className="text-gray-700 hover:text-purple-600">Donar</Link>
        <Link
          to={{ pathname: '/', hash: '#contacto' }}
          className="text-gray-700 hover:text-purple-600"
        >
          Contacto
        </Link>

        {user && (
          <Link
            to={gestionPath}
            className={`text-gray-700 hover:text-purple-600 ${location.pathname === gestionPath ? 'text-purple-600 font-semibold' : ''}`}
          >
            Gestión
          </Link>
        )}
      </nav>

      {user ? (
        <div className="flex items-center gap-3">
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
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg transition duration-300"
        >
          Iniciar Sesión
        </button>
      )}
    </header>
  );
};

export default Navbar;
