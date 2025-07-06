import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/LogoAdoptmeLavandaV1.svg';
import { FiBell, FiUser, FiMail } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';

const NavbarAdoptante = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, updateUser } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const toggleModal = () => setShowModal(!showModal);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleUpdate = async () => {
    try {
      const payload = {};
      if (formData.username && formData.username !== user.username) {
        payload.username = formData.username;
      }
      if (formData.password) {
        payload.password = formData.password;
      }
      if (Object.keys(payload).length === 0) {
        alert('No realizaste ningún cambio');
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem('token'),
        },
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
      admin: '/GatoAdmin.png',
      adminFundacion: '/GatoFundacion.png',
      adoptante: '/GatoAdoptante.jpg',
    };

    return (
      <div className="absolute top-20 right-8 bg-white shadow-xl rounded-xl p-6 w-96 z-50">
        {!editing ? (
          <>
            <div className="flex items-center gap-4">
              <img
                src={imagenPorRol[user.role]}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
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
                  onClick={() => {
                    setFormData({ username: user.username, password: '' });
                    setEditing(true);
                  }}
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
            <input
              type="text"
              name="username"
              placeholder="Escribe tu usuario"
              value={formData.username}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
            />
            <input
              type="password"
              name="password"
              placeholder="Escribe tu contraseña"
              value={formData.password}
              onChange={handleChange}
              className="border px-4 py-2 rounded"
            />
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              onClick={handleUpdate}
            >
              Guardar cambios
            </button>
            <button
              className="text-sm text-gray-500 hover:underline text-center"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white rounded-full shadow-md max-w-[1200px] mx-auto relative">
      <Link to="/">
        <img src={logo} alt="AdoptMe logo" className="w-100 h-12" />
      </Link>

      <nav className="flex gap-6 text-lg font-medium">
        <Link to="/" className={`pb-1 ${location.pathname === '/' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}>Inicio</Link>
        <Link to="/adoptar" className={`pb-1 ${location.pathname === '/adoptar' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}>Adoptar</Link>
        <Link to="/ComoAdoptar" className={`pb-1 ${location.pathname === '/ComoAdoptar' ? 'text-purple-600 border-b-2 border-purple-500' : 'text-gray-700 hover:text-purple-600'}`}>¿Cómo Adoptar?</Link>
        <Link to="#" className="text-gray-700 hover:text-purple-600">Donar</Link>
        <Link to="/dashboard/adoptante" className="text-gray-700 hover:text-purple-600">Gestión</Link>
      </nav>

      <div className="flex gap-3 relative">
        <button className="bg-purple-500 text-white p-3 rounded-full shadow-md hover:bg-purple-600 transition">
          <FiBell />
        </button>
        <button
          onClick={toggleModal}
          className="bg-purple-500 text-white p-3 rounded-full shadow-md hover:bg-purple-600 transition"
        >
          <FiUser />
        </button>
        {renderProfileModal()}
      </div>
    </header>
  );
};

export default NavbarAdoptante;
