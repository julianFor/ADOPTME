import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Modal from './components/Modal';
import HeroSection from './components/HeroSection';
import PetsSection from './components/PetsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import Adoptar from './pages/Adoptar';
import Mascota from './pages/Mascota';
import Formulario from './pages/Formulario';
import ComoAdoptar from './pages/ComoAdoptar';
import Formulario2 from './pages/Formulario2';
import MisSolicitudes from './pages/MisSolicitudes';
import Donar from './pages/Donar'; 
import AdminMetas from './pages/AdminMetas'; 


function App() {
  const [modal, setModal] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    axios.defaults.baseURL = 'http://localhost:3000/api';
    checkAuth();
  }, []);

  // Redirección después de login exitoso
  useEffect(() => {
    if (loginSuccess) {
      const timer = setTimeout(() => {
        window.location.reload(); // Recarga la página para actualizar el estado
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginSuccess]);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
    setLoginSuccess(true);
    setModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setLoginSuccess(false);
    window.location.href = '/';
  };

  const openModal = (modalType) => setModal(modalType);
  const closeModal = () => setModal(null);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <Router>
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        openModal={openModal}
      />

      {/* Modal de Login/Registro */}
      <Modal
        modal={modal}
        closeModal={closeModal}
        openModal={openModal}
        setUser={setUser}
        onLoginSuccess={handleLoginSuccess}
        loginSuccess={loginSuccess}
      />

      <Routes>
        <Route path="/" element={
          <>
            <HeroSection isAuthenticated={isAuthenticated} user={user} openModal={openModal} />
            <PetsSection isAuthenticated={isAuthenticated} user={user} openModal={openModal} />
            <ContactSection />
          </>
        } />
        <Route path="/adoptar" element={<Adoptar isAuthenticated={isAuthenticated} user={user} />} />
        <Route path="/mascota/:id" element={<Mascota isAuthenticated={isAuthenticated} user={user} />} />
        <Route path="/formulario" element={<Formulario isAuthenticated={isAuthenticated} user={user} />} />
        <Route path="/formulario2" element={<Formulario2 isAuthenticated={isAuthenticated} user={user} />} />
        <Route path="/comoadoptar" element={<ComoAdoptar />} />
        <Route path="/donar" element={<Donar />} />
        <Route path="/admin/metas" element={<AdminMetas />} />

        <Route path="/formulario/:mascotaId" element={
          isAuthenticated ? <Formulario user={user} /> : <Navigate to="/login" />
        } />
        <Route 
          path="/mis-solicitudes" 
          element={
            isAuthenticated ? <MisSolicitudes user={user} /> : <Navigate to="/login" />
          } 
        />
      </Routes>

      <Footer openModal={openModal} />
    </Router>
  );
}

export default App;