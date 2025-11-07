import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);

  const openLogin = () => setAuthView('login') || setIsModalOpen(true);
  const openRegister = () => setAuthView('register') || setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const switchToRegister = () => setAuthView('register');
  const switchToLogin = () => setAuthView('login');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ useMemo para valor estable del contexto
  const value = useMemo(() => ({
    isModalOpen,
    authView,
    openLogin,
    openRegister,
    closeModal,
    switchToRegister,
    switchToLogin,
    user,
    setUser,
  }), [isModalOpen, authView, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Validación de props
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook para usar el contexto
export const useAuth = () => useContext(AuthContext);
