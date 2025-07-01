import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null); // 👈 Nuevo

  const openLogin = () => {
    setAuthView('login');
    setIsModalOpen(true);
  };

  const openRegister = () => {
    setAuthView('register');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const switchToRegister = () => setAuthView('register');
  const switchToLogin = () => setAuthView('login');

  // Cargar usuario desde localStorage si existe
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isModalOpen,
        authView,
        openLogin,
        openRegister,
        closeModal,
        switchToRegister,
        switchToLogin,
        user,
        setUser, // 👈 lo exportamos
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
