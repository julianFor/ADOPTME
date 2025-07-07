// src/services/authService.js
import axiosClient from './axiosClient';

const authService = {
  login: async (email, password) => {
    const res = await axiosClient.post('/auth/signin', {
      email,
      password,
    });
    return res.data;
  },

  // Registro público (no requiere token)
  register: async (username, email, password) => {
    const res = await axiosClient.post('/users/register', {
      username,
      email,
      password,
    });
    return res.data;
  },
};

export default authService;
