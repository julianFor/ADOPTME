import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "../../../services/userService";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import UserFormModal from "./UserFormModal";
import ConfirmModal from "../../../components/ConfirmModal";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
      setFilteredUsers(response.data); // Inicialmente mostrar todos los usuarios
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Efecto para filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleCrear = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditar = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEliminar = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete._id);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Usuarios</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
          </div>
          <button
            onClick={handleCrear}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Crear Usuario
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Password</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 capitalize">{user.role}</td>
                <td className="px-4 py-2">••••••••••••••••••••••</td>
                <td className="px-4 py-2 flex justify-center gap-4">
                  <PencilIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer"
                    onClick={() => handleEditar(user)}
                  />
                  <TrashIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer"
                    onClick={() => handleEliminar(user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            {searchTerm.trim() === "" 
              ? "No hay usuarios registrados." 
              : "No se encontraron usuarios que coincidan con la búsqueda."}
          </p>
        )}
      </div>

      <UserFormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={() => {
          setShowUserModal(false);
          fetchUsers();
        }}
        initialData={selectedUser}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        message={`¿Estás seguro de eliminar al usuario "${userToDelete?.username}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default UsersList;
