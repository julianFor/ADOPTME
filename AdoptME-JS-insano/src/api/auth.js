import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Asegúrate que coincida con tu puerto del backend

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token); // Guarda el token
      return response.data;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.response?.data?.message || error.message);
    throw error;
  }
};