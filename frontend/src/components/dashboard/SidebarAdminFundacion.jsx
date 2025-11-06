import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { BiBone, BiHeart, BiClipboard, BiDollarCircle, BiUserCheck } from 'react-icons/bi';
import { UserContext } from '../../context/UserContext';

const SidebarAdminFundacion = () => {
  const { user } = useContext(UserContext);

  const [collapsed, setCollapsed] = useState(false);
  const [openMascotas, setOpenMascotas] = useState(false);
  const [openAdopciones, setOpenAdopciones] = useState(false);
  const [openDonaciones, setOpenDonaciones] = useState(false);
  const [openMiActividad, setOpenMiActividad] = useState(false);

  if (!user) return null;

  return (
    <aside
      className={`bg-white shadow-md transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ml-4 mt-6 rounded-xl relative`}
      style={{ minHeight: '650px', maxHeight: 'calc(125vh - 4rem)' }}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-[-12px] w-6 h-6 bg-white border rounded-full shadow flex items-center justify-center"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronDown />}
      </button>

      <div className={`flex ${collapsed ? 'flex-col items-center justify-center gap-4 pt-6' : 'items-center gap-2 p-4'}`}>
        <img src="/GatoFundacion.jpeg" alt="avatar" className="w-10 h-10 rounded-full" />
        {!collapsed && (
          <div>
            <p className="text-xs text-gray-500">BIENVENIDO</p>
            <p className="text-sm font-semibold">{user.username}</p>
          </div>
        )}
      </div>

      {!collapsed && <p className="text-xs text-gray-500 px-4">MAIN</p>}

      <nav className="mt-2">
        <Link to="/dashboard/adminfundacion" className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 text-gray-800">
          <FiHome className="text-lg" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Mascotas */}
        <div>
          <button
            onClick={() => setOpenMascotas(!openMascotas)}
            className="flex items-center justify-between w-full px-4 py-2 hover:bg-purple-50 text-gray-800"
          >
            <div className="flex items-center gap-3">
              <BiBone className="text-xl" />
              {!collapsed && <span>Mascotas</span>}
            </div>
            {!collapsed && (
              <FiChevronDown className={`transform transition-transform ${openMascotas ? 'rotate-180' : ''}`} />
            )}
          </button>
          {openMascotas && !collapsed && (
            <div className="pl-12 text-sm text-gray-700">
              <Link to="/dashboard/adminfundacion/mascotas/fundacion" className="block py-1 hover:underline">Fundación</Link>
              <Link to="/dashboard/adminfundacion/mascotas/externas" className="block py-1 hover:underline">Externas</Link>
            </div>
          )}
          {openMascotas && collapsed && (
            <div className="absolute left-20 top-[165px] bg-white shadow-md rounded-md w-40 z-50">
              <Link to="/dashboard/adminfundacion/mascotas/fundacion" className="block px-4 py-2 hover:bg-purple-50">Fundación</Link>
              <Link to="/dashboard/adminfundacion/mascotas/externas" className="block px-4 py-2 hover:bg-purple-50">Externas</Link>
            </div>
          )}
        </div>

        {/* Adopciones */}
        <div>
          <button
            onClick={() => setOpenAdopciones(!openAdopciones)}
            className="flex items-center justify-between w-full px-4 py-2 hover:bg-purple-50 text-gray-800"
          >
            <div className="flex items-center gap-3">
              <BiHeart className="text-xl" />
              {!collapsed && <span>Adopciones</span>}
            </div>
            {!collapsed && (
              <FiChevronDown className={`transform transition-transform ${openAdopciones ? 'rotate-180' : ''}`} />
            )}
          </button>
          {openAdopciones && !collapsed && (
            <div className="pl-12 text-sm text-gray-700">
              <Link to="/dashboard/adminfundacion/solicitudes-adopcion" className="block py-1 hover:underline">Solicitudes Adopción</Link>
              <Link to="/dashboard/adminfundacion/procesos-adopcion" className="block py-1 hover:underline">Procesos Adopción</Link>
            </div>
          )}
          {openAdopciones && collapsed && (
            <div className="absolute left-20 top-[250px] bg-white shadow-md rounded-md w-48 z-50">
              <Link to="/dashboard/adminfundacion/solicitudes-adopcion" className="block px-4 py-2 hover:bg-purple-50">Solicitudes Adopción</Link>
              <Link to="/dashboard/adminfundacion/procesos-adopcion" className="block px-4 py-2 hover:bg-purple-50">Procesos Adopción</Link>
            </div>
          )}
        </div>

        {/* Solicitudes Publicación */}
        <Link to="/dashboard/adminfundacion/solicitudes-publicacion" className="flex items-center gap-3 px-4 py-2 hover:bg-purple-50 text-gray-800">
          <BiClipboard className="text-xl" />
          {!collapsed && <span>Solicitudes Publicación</span>}
        </Link>

        {/* Donaciones */}
        <div>
          <button
            onClick={() => setOpenDonaciones(!openDonaciones)}
            className="flex items-center justify-between w-full px-4 py-2 hover:bg-purple-50 text-gray-800"
          >
            <div className="flex items-center gap-3">
              <BiDollarCircle className="text-xl" />
              {!collapsed && <span>Donaciones</span>}
            </div>
            {!collapsed && (
              <FiChevronDown className={`transform transition-transform ${openDonaciones ? 'rotate-180' : ''}`} />
            )}
          </button>
          {openDonaciones && !collapsed && (
            <div className="pl-12 text-sm text-gray-700">
              <Link to="/dashboard/adminfundacion/necesidades" className="block py-1 hover:underline">Necesidades Fundación</Link>
              <Link to="/dashboard/adminfundacion/donaciones/meta" className="block py-1 hover:underline">Meta Monetaria</Link>
            </div>
          )}
          {openDonaciones && collapsed && (
            <div className="absolute left-20 top-[330px] bg-white shadow-md rounded-md w-56 z-50">
              <Link to="/dashboard/adminfundacion/necesidades" className="block px-4 py-2 hover:bg-purple-50">Necesidades Fundación</Link>
              <Link to="/dashboard/adminfundacion/donaciones/meta" className="block px-4 py-2 hover:bg-purple-50">Meta Monetaria</Link>
            </div>
          )}
        </div>

        {/* Mi Actividad */}
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
              <Link to="/dashboard/adminfundacion/mis-solicitudes" className="block py-1 hover:underline">Mis Solicitudes Adopción</Link>
              <Link to="/dashboard/adminfundacion/mis-procesos" className="block py-1 hover:underline">Mis Procesos Adopción</Link>
              <Link to="/dashboard/adminfundacion/mis-solicitudes-publicacion" className="block py-1 hover:underline">Mis Solicitudes Publicacion</Link>
              <Link to="/dashboard/adminfundacion/mis-publicaciones" className="block py-1 hover:underline">Mis Publicaciones</Link>
            </div>
          )}
          {openMiActividad && collapsed && (
            <div className="absolute left-20 top-[410px] bg-white shadow-md rounded-md w-56 z-50">
              <Link to="/dashboard/adminfundacion/mis-solicitudes" className="block px-4 py-2 hover:bg-purple-50">Mis Solicitudes</Link>
              <Link to="/dashboard/adminfundacion/mis-procesos" className="block px-4 py-2 hover:bg-purple-50">Mis Procesos</Link>
              <Link to="/dashboard/adminfundacion/mis-solicitudes-publicacion" className="block px-4 py-2 hover:bg-purple-50">Mis Solicitudes Publicacion</Link>
              <Link to="/dashboard/adminfundacion/mis-publicaciones" className="block px-4 py-2 hover:bg-purple-50">Mis Publicaciones</Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default SidebarAdminFundacion;
