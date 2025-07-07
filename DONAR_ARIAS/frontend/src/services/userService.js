// src/services/userService.js
import axiosClient from "./axiosClient";

// Obtener todos los usuarios
export const getAllUsers = async () => {
  const response = await axiosClient.get("/users");
  return response.data;
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const response = await axiosClient.post("/users", userData);
  return response.data;
};

// Actualizar un usuario existente
export const updateUser = async (id, userData) => {
  const response = await axiosClient.put(`/users/${id}`, userData);
  return response.data;
};
