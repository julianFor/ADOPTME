import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para añadir el token a cada request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default instance;