import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosClient from '../services/axiosClient';

import defaultAdoptante from '../assets/avatar-adoptante.png';
import defaultFundacion from '../assets/avatar-fundacion.png';
import defaultAdmin from '../assets/avatar-admin.png';

import { FaUser, FaEnvelope } from 'react-icons/fa';

const UserDropdown = () => {
  const { user, logoutUser, loginUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    password: ''
  });

  // Evitamos el ternario anidado usando if-else
  let avatar;
  if (user.role === 'admin') {
    avatar = defaultAdmin;
  } else if (user.role === 'adminFundacion') {
    avatar = defaultFundacion;
  } else {
    avatar = defaultAdoptante;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/'); // Redirigir al home
  };

  const handleUpdate = async () => {
    try {
      const res = await axiosClient.put(`/api/users/me`, formData, {
        headers: { 'x-access-token': localStorage.getItem('token') }
      });

      if (res.data.success) {
        loginUser(res.data.user, localStorage.getItem('token'));
        setShowEdit(false);
        alert('Perfil actualizado');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar');
    }
  };

  // Refactorizamos la condición negada en JSX (no había if-else con negación)
  return (
    <div className="absolute right-2 top-16 z-50 bg-white shadow-xl rounded-2xl p-6 w-[340px] max-w-full transition-all duration-300">
      {showEdit ? (
        <div className="flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-center">Editar Perfil</h2>
          <input
            type="text"
            name="username"
            value={formData.username}
            placeholder="Escribe tu usuario"
            onChange={handleChange}
            className="w-full mb-3 border border-gray-300 p-2 rounded-md"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Escribe tu contraseña"
            onChange={handleChange}
            className="w-full mb-4 border border-gray-300 p-2 rounded-md"
          />
          <button
            onClick={handleUpdate}
            className="bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 w-full"
          >
            Guardar cambios
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <img
            src={avatar}
            alt="avatar"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
          />
          <h2 className="text-xl font-bold mt-4">{user.username}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <FaUser className="text-base" />
            <span>Rol: {user.role}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 break-all">
            <FaEnvelope className="text-base" />
            <span>{user.email}</span>
          </div>

          <button
            onClick={() => setShowEdit(true)}
            className="bg-purple-600 text-white px-5 py-2 mt-4 rounded-md hover:bg-purple-700 w-full"
          >
            Editar Perfil
          </button>
          <button
            onClick={handleLogout}
            className="mt-3 border border-gray-400 rounded-md px-5 py-2 text-gray-800 hover:bg-gray-100 w-full"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
