// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/Home/HeroSection';
import PetCarousel from '../components/Home/PetCarousel';
import Contacto from '../components/Home/Contacto';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#contacto') {
      const contactoSection = document.getElementById('contacto');
      if (contactoSection) {
        contactoSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div>
      <HeroSection />
      <PetCarousel />
      <Contacto />
    </div>
  );
};

export default Home;
