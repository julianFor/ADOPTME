// src/pages/Gestion/Users/UserFormModal.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { createUser, updateUser } from "../../../services/userService";

// Solo los roles válidos del sistema AdoptMe
const roles = ["admin", "adminFundacion", "adoptante"];

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "adoptante",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "", // Nunca mostramos la real
        role: initialData.role || "adoptante",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "adoptante",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (initialData) {
        await updateUser(initialData._id, formData);
      } else {
        await createUser(formData);
      }

      onSubmit(); // Recargar lista
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  if (!isOpen) return null;

  // ✅ Separa el ternario anidado en una función simple
  const getRoleLabel = (role) => {
    if (role === "admin") return "Administrador";
    if (role === "adminFundacion") return "Administrador Fundación";
    return "Adoptante";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Editar Usuario" : "Crear Usuario"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />

          <input
            type="password"
            name="password"
            placeholder={initialData ? "Nueva contraseña (opcional)" : "Contraseña"}
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required={!initialData}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded"
            required
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {getRoleLabel(r)}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {initialData ? "Guardar Cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ✅ Validación de props corregida para SonarQube
UserFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.oneOf(["admin", "adminFundacion", "adoptante"]),
  }),
};

export default UserFormModal;
