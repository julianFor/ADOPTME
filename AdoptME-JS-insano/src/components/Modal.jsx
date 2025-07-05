import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function Modal({ modal, closeModal, openModal, setUser, setIsAuthenticated, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    contactNumber: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    username: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  // Limpiar formularios al cambiar de modal
  useEffect(() => {
    if (modal) {
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        contactNumber: '',
        confirmPassword: ''
      });
      setErrors({
        name: '',
        email: '',
        username: '',
        contactNumber: '',
        password: '',
        confirmPassword: '',
        general: ''
      });
      setSuccessMessage('');
      setLoginSuccess(false);
    }
  }, [modal]);

  // Redirección después de registro exitoso
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        closeModal();
        openModal('login');
        setRegistrationSuccess(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, closeModal, openModal]);

  // Redirección después de login exitoso
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        window.location.reload(); // Recarga la página para actualizar el estado
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: '',
      general: ''
    }));
  };

  const validateLoginForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateRegisterForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
      valid = false;
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
      valid = false;
    }

    if (!formData.username) {
      newErrors.username = 'El nombre de usuario es requerido';
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
      valid = false;
    }

    if (formData.contactNumber && !/^\d+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Solo se permiten números';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      valid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
      valid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { token, user } = response.data;
      
      // Notificar al componente padre (App.jsx) del login exitoso
      if (onLoginSuccess) {
        onLoginSuccess(user, token);
      }
      
      // Mostrar mensaje de éxito
      setSuccessMessage('¡Inicio de sesión exitoso!');
      setLoginSuccess(true);

    } catch (error) {
      console.error('Error en login:', error.response?.data || error.message);
      setErrors({
        ...errors,
        general: error.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        contactNumber: formData.contactNumber.trim() || undefined,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Error en el registro');
      }

      // Mostrar mensaje de éxito
      setSuccessMessage('¡Registro exitoso! Redirigiendo al login...');
      setRegistrationSuccess(true);

    } catch (error) {
      console.error('Error en registro:', error.response?.data || error.message);
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = { ...errors };
        
        for (const err of backendErrors) {
          if (err.path in newErrors) {
            newErrors[err.path] = err.msg;
          }
        }
        
        setErrors(newErrors);
      } else {
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'Error en el registro. Intenta nuevamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrors({ ...errors, email: 'El email es requerido' });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, {
        email: formData.email.trim().toLowerCase()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSuccessMessage('Hemos enviado un email con instrucciones para restablecer tu contraseña.');
    } catch (error) {
      console.error('Error en recuperación:', error.response?.data || error.message);
      setErrors({
        ...errors,
        general: error.response?.data?.message || 'Error al procesar la solicitud.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (!modal) return null;

    switch (modal) {
      case 'login':
        return (
          <form onSubmit={handleLogin}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Iniciar Sesión</h2>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <p>¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); openModal('register') }}>Regístrate</a></p>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <p className="forgot-password">
              <a href="#" onClick={(e) => { e.preventDefault(); openModal('forgotPassword') }}>
                ¿Olvidaste tu contraseña?
              </a>
            </p>
            
            <button type="submit" disabled={isLoading || loginSuccess}>
              {isLoading ? 'Cargando...' : loginSuccess ? 'Redirigiendo...' : 'Iniciar Sesión'}
            </button>
          </form>
        );

      case 'register':
        return (
          <form onSubmit={handleRegister}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Registrarse</h2>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <p>¿Ya tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); openModal('login') }}>Inicia Sesión</a></p>
            
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                required
              />
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="text"
                name="contactNumber"
                placeholder="Número de contacto (opcional)"
                value={formData.contactNumber}
                onChange={handleChange}
                className={errors.contactNumber ? 'error' : ''}
              />
              {errors.contactNumber && <div className="error-message">{errors.contactNumber}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                required
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>
        );

      case 'forgotPassword':
        return (
          <form onSubmit={handleForgotPassword}>
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Recuperar Contraseña</h2>
            
            {errors.general && <div className="error-message">{errors.general}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <p>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal" style={{ display: modal ? 'block' : 'none' }}>
      <div className="modal-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Modal;