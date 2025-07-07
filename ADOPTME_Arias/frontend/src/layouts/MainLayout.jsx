// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* Aquí se cargará Home o Adoptar */}
      </main>
      <Footer />
      <AuthModal />
    </>
  );
}

export default MainLayout;
