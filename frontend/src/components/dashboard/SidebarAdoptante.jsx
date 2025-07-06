import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { BiUserCheck } from 'react-icons/bi';
import { UserContext } from '../../context/UserContext';

const SidebarAdoptante = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openMiActividad, setOpenMiActividad] = useState(true); // Abierto por defecto

  if (!user) return null;

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ml-4 mt-6 rounded-xl relative`}
      style={{ minHeight: '650px', maxHeight: 'calc(125vh - 4rem)' }}
    >
      {/* Botón colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-[-12px] w-6 h-6 bg-white border rounded-full shadow flex items-center justify-center"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronDown />}
      </button>

      {/* Avatar + nombre */}
      <div className={`flex ${collapsed ? 'flex-col items-center justify-center gap-4 pt-6' : 'items-center gap-2 p-4'}`}>
        <img src="/GatoAdoptante.jpg" alt="avatar" className="w-10 h-10 rounded-full" />
        {!collapsed && (
          <div>
            <p className="text-xs text-gray-500">BIENVENIDO</p>
            <p className="text-sm font-semibold">{user.username}</p>
          </div>
        )}
      </div>

      {!collapsed && <p className="text-xs text-gray-500 px-4">MAIN</p>}

      {/* Menú Mi Actividad */}
      <nav className="mt-2">
        <div>
          <button
            onClick={() => setOpenMiActividad(!openMiActividad)}
            className="flex items-center justify-between w-full px-4 py-2 hover:bg-purple-50 text-gray-800"
          >
            <div className="flex items-center gap-3">
              <BiUserCheck className="text-xl" />
              {!collapsed && <span>Mi Actividad</span>}
            </div>
            {!collapsed && (
              <FiChevronDown className={`transform transition-transform ${openMiActividad ? 'rotate-180' : ''}`} />
            )}
          </button>

          {openMiActividad && !collapsed && (
            <div className="pl-12 text-sm text-gray-700">
              <Link to="/dashboard/adoptante/mis-solicitudes" className="block py-1 hover:underline">Mis Solicitudes Adopción</Link>
              <Link to="/dashboard/adoptante/mis-procesos" className="block py-1 hover:underline">Mis Procesos Adopción</Link>
              <Link to="/dashboard/adoptante/mis-solicitudes-publicacion" className="block py-1 hover:underline">Mis Solicitudes Publicación</Link>
              <Link to="/dashboard/adoptante/mis-publicaciones" className="block py-1 hover:underline">Mis Publicaciones</Link>
            </div>
          )}

          {openMiActividad && collapsed && (
            <div className="absolute left-20 top-[165px] bg-white shadow-md rounded-md w-56 z-50">
              <Link to="/dashboard/adoptante/mis-solicitudes" className="block px-4 py-2 hover:bg-purple-50">Mis Solicitudes</Link>
              <Link to="/dashboard/adoptante/mis-procesos" className="block px-4 py-2 hover:bg-purple-50">Mis Procesos</Link>
              <Link to="/dashboard/adoptante/mis-solicitudes-publicacion" className="block px-4 py-2 hover:bg-purple-50">Mis Solicitudes Publicación</Link>
              <Link to="/dashboard/adoptante/mis-publicaciones" className="block px-4 py-2 hover:bg-purple-50">Mis Publicaciones</Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default SidebarAdoptante;
