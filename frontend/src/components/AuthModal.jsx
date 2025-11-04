import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';
import authService from '../services/authService';

const AuthModal = () => {
  const {
    isModalOpen,
    authView,
    closeModal,
    switchToRegister,
    switchToLogin,
    setUser,
  } = useContext(AuthContext);

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(emailOrUsername, password);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);

      console.log('LOGIN ÉXITO', response);

      closeModal();
      globalThis.location.reload(); // 🔁 recarga para actualizar Navbar
    } catch (error) {
      console.error('LOGIN ERROR', error);
      setErrorMsg(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(username, email, password);
      console.log('REGISTRO ÉXITO', response);
      switchToLogin();
    } catch (error) {
      console.error('REGISTRO ERROR', error);
      setErrorMsg(error.response?.data?.message || 'Error al registrarse');
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-2">
      <div className="bg-white rounded-3xl shadow-lg p-6 w-full max-w-sm relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-purple-600 text-lg"
        >
          <IoClose />
        </button>

        <div className="flex justify-between items-start mb-4">
          <p className="text-gray-700 text-sm">
            Bienvenido a{' '}
            <span className="text-purple-600 font-bold">AdoptME</span>
          </p>
          <div className="text-right text-xs text-gray-500 leading-tight">
            {authView === 'login' ? (
              <>
                <span className="block">¿No tienes cuenta?</span>
                <button
                  onClick={switchToRegister}
                  className="block text-purple-600 font-medium hover:underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                <span className="block">¿Ya tienes una cuenta?</span>
                <button
                  onClick={switchToLogin}
                  className="block text-purple-600 font-medium hover:underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
        )}

        {authView === 'login' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Inicia sesión</h2>
            <form className="space-y-3" onSubmit={handleLogin}>
              <div>
                <label htmlFor="emailOrUsername" className="block text-xs mb-1 font-medium">
                  Escribe tu correo o usuario
                </label>
                <input
                  id="emailOrUsername"
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Correo o Usuario"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="passwordLogin" className="block text-xs mb-1 font-medium">
                  Escribe tu contraseña
                </label>
                <input
                  id="passwordLogin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="text-right text-xs text-purple-600 hover:underline cursor-pointer">
                ¿Olvidaste tu contraseña?
              </div>
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-lg w-full text-sm transition duration-300"
              >
                Iniciar sesión
              </button>
            </form>
          </>
        )}

        {authView === 'register' && (
          <>
            <h2 className="text-2xl font-bold mb-4">Registrarse</h2>
            <form className="space-y-3" onSubmit={handleRegister}>
              <div>
                <label htmlFor="emailRegister" className="block text-xs mb-1 font-medium">
                  Correo electrónico
                </label>
                <input
                  id="emailRegister"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Escribe tu correo"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="usernameRegister" className="block text-xs mb-1 font-medium">
                  Nombre de usuario
                </label>
                <input
                  id="usernameRegister"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Escribe tu usuario"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="passwordRegister" className="block text-xs mb-1 font-medium">
                  Contraseña
                </label>
                <input
                  id="passwordRegister"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Escribe tu contraseña"
                  className="w-full border border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 rounded-lg w-full text-sm transition duration-300"
              >
                Registrarse
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
