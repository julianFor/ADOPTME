// src/pages/Home.jsx
import React from 'react';
import HeroSection from '../components/Home/HeroSection'; // si ya lo tienes creado
import PetCarousel from '../components/Home/PetCarousel';
import Contacto from '../components/Home/Contacto';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <PetCarousel />
      <Contacto />
    </div>
  );
};

export default Home;
