import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [user, setUser] = useState(null);

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
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Agregado para que NotificationContext funcione correctamente
export const useAuth = () => useContext(AuthContext);
