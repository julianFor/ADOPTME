import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/LogoAdoptmeLavandaV1.svg';
import { FiBell, FiUser, FiMail, FiMenu, FiX } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import NotificationModal from './NotificationModal';
import { useNotificaciones } from '../context/NotificationContext';

const NavbarAdmin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, updateUser } = useContext(UserContext);
  const { noLeidas } = useNotificaciones();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showNotificaciones, setShowNotificaciones] = useState(false);
  const [open, setOpen] = useState(false); // menú móvil

  const toggleModal = () => setShowModal(!showModal);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleUpdate = async () => {
    try {
      const payload = {};
      if (formData.username && formData.username !== user.username) payload.username = formData.username;
      if (formData.password) payload.password = formData.password;
      if (Object.keys(payload).length === 0) {
        alert('No realizaste ningún cambio');
        return;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem('token') },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        updateUser(data.user);
        alert('Perfil actualizado');
        setEditing(false);
        setShowModal(false);
      } else {
        alert(data.message || 'Error desconocido');
      }
    } catch (error) {
      alert('Error actualizando perfil');
      console.error(error);
    }
  };

  const renderProfileModal = () => {
    if (!showModal) return null;
    const imagenPorRol = {
      admin: '/GatoAdmin.jpg',
      adminFundacion: '/GatoFundacion.png',
      adoptante: '/GatoAdoptante.png',
    };
    return (
      <div className="absolute top-20 right-8 bg-white shadow-xl rounded-xl p-6 w-96 z-50">
        {!editing ? (
          <>
            <div className="flex items-center gap-4">
              <img src={imagenPorRol[user.role]} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
              <div className="flex-1">
                <h2 className="text-xl font-bold truncate">{user.username}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  <FiUser className="inline mr-1" />
                  Rol: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
                <p className="text-gray-600 text-sm mt-1 break-all">
                  <FiMail className="inline mr-1" />
                  {user.email}
                </p>
                <button
                  className="w-full bg-purple-600 text-white py-2 rounded-md mt-3 hover:bg-purple-700 transition text-sm"
                  onClick={() => { setFormData({ username: user.username, password: '' }); setEditing(true); }}
                >
                  Editar Perfil
                </button>
              </div>
            </div>
            <hr className="my-4 border-gray-200" />
            <div className="flex justify-center">
              <button
                className="px-6 py-2 border border-gray-400 rounded-full text-gray-800 hover:bg-gray-100 transition text-sm"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-center">Editar Perfil</h2>
            <input type="text" name="username" placeholder="Escribe tu usuario" value={formData.username} onChange={handleChange} className="border px-4 py-2 rounded" />
            <input type="password" name="password" placeholder="Escribe tu contraseña" value={formData.password} onChange={handleChange} className="border px-4 py-2 rounded" />
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition" onClick={handleUpdate}>Guardar cambios</button>
            <button className="text-sm text-gray-500 hover:underline text-center" onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        )}
      </div>
    );
  };

  const active = (path) =>
    `pb-1 ${location.pathname === path ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`;

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white rounded-full shadow-md max-w-[1200px] mx-auto relative">
      <Link to="/" onClick={() => setOpen(false)}>
        <img src={logo} alt="AdoptMe logo" className="h-10 md:h-12 w-auto" />
      </Link>

      {/* NAV DESKTOP */}
      <nav className="hidden md:flex gap-6 text-lg font-medium">
        <Link to="/" className={active('/')}>Inicio</Link>
        <Link to="/adoptar" className={active('/adoptar')}>Adoptar</Link>
        <Link to="/ComoAdoptar" className={active('/ComoAdoptar')}>¿Cómo Adoptar?</Link>
        <Link to="/donar" className={active('/donar')}>Donar</Link>
        <Link to="/dashboard/admin" className={active('/dashboard/admin')}>Gestión</Link>
      </nav>

      {/* Acciones derecha DESKTOP */}
      <div className="hidden md:flex gap-3 relative">
        <div className="relative">
          <button
            onClick={() => setShowNotificaciones(!showNotificaciones)}
            className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition relative"
          >
            <FiBell className="text-xl" />
            {noLeidas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {noLeidas}
              </span>
            )}
          </button>
          <NotificationModal visible={showNotificaciones} onClose={() => setShowNotificaciones(false)} />
        </div>

        <button onClick={toggleModal} className="w-12 h-12 flex items-center justify-center bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition">
          <FiUser className="text-xl" />
        </button>
        {renderProfileModal()}
      </div>

      {/* BOTÓN HAMBURGUESA (solo móvil) */}
      <button
        className="md:hidden inline-flex items-center justify-center p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600"
        onClick={() => setOpen((s) => !s)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-menu-admin"
      >
        {open ? <FiX /> : <FiMenu />}
      </button>

      {/* PANEL MÓVIL: ahora siempre por delante */}
      <div
        id="mobile-menu-admin"
        className={`md:hidden absolute left-0 right-0 top-full mx-4 mt-2 rounded-2xl bg-white shadow-xl overflow-hidden transition-all
        z-[10000] ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        <div className="flex flex-col gap-3 p-4 text-base font-medium">
          <Link to="/" className={active('/')} onClick={() => setOpen(false)}>Inicio</Link>
          <Link to="/adoptar" className={active('/adoptar')} onClick={() => setOpen(false)}>Adoptar</Link>
          <Link to="/ComoAdoptar" className={active('/ComoAdoptar')} onClick={() => setOpen(false)}>¿Cómo Adoptar?</Link>
          <Link to="/donar" className={active('/donar')} onClick={() => setOpen(false)}>Donar</Link>
          <Link to="/dashboard/admin" className={active('/dashboard/admin')} onClick={() => setOpen(false)}>Gestión</Link>

          <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={() => { setShowNotificaciones(true); }}
                className="w-11 h-11 flex items-center justify-center bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition relative"
              >
                <FiBell className="text-lg" />
                {noLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {noLeidas}
                  </span>
                )}
              </button>

              <button
                onClick={() => { setOpen(false); toggleModal(); }}
                className="w-11 h-11 flex items-center justify-center bg-purple-500 text-white rounded-full shadow-md hover:bg-purple-600 transition"
              >
                <FiUser className="text-lg" />
              </button>
            </div>

            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="px-4 py-2 border border-gray-300 rounded-full text-gray-800 hover:bg-gray-100 transition text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarAdmin;
