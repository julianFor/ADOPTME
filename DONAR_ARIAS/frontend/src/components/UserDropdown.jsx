// src/components/UserDropdown.jsx
import { useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import axiosClient from '../services/axiosClient';
import defaultAdoptante from '../assets/avatar-adoptante.png'; // Cambia según rol
import defaultFundacion from '../assets/avatar-fundacion.png';
import defaultAdmin from '../assets/avatar-admin.png';

const UserDropdown = () => {
  const { user, logoutUser, loginUser } = useContext(UserContext);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    password: ''
  });

  const avatar = user.role === 'admin'
    ? defaultAdmin
    : user.role === 'adminFundacion'
    ? defaultFundacion
    : defaultAdoptante;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logoutUser();
  };

  const handleUpdate = async () => {
    try {
      const res = await axiosClient.put(`/api/users/me`, formData, {
        headers: { 'x-access-token': localStorage.getItem('token') }
      });

      if (res.data.success) {
        loginUser(res.data.user, localStorage.getItem('token')); // actualizar nombre en UI
        setShowEdit(false);
        alert('Perfil actualizado');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar');
    }
  };

  return (
    <div className="absolute right-2 top-16 z-50 bg-white shadow-xl rounded-xl p-4 w-80">
      {!showEdit ? (
        <div className="flex flex-col items-center text-center">
          <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
          <h2 className="text-lg font-bold mt-2">{user.username}</h2>
          <p className="text-sm text-gray-600">Rol: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-purple-600 text-white px-4 py-1 mt-3 rounded hover:bg-purple-700"
          >
            Editar Perfil
          </button>
          <button
            onClick={handleLogout}
            className="mt-3 border rounded-full px-5 py-1 text-gray-700 hover:bg-gray-100"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold mb-3">Editar Perfil</h2>
          <input
            type="text"
            name="username"
            value={formData.username}
            placeholder="Escribe tu usuario"
            onChange={handleChange}
            className="w-full mb-2 border p-2 rounded"
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Escribe tu contraseña"
            onChange={handleChange}
            className="w-full mb-4 border p-2 rounded"
          />
          <button
            onClick={handleUpdate}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
