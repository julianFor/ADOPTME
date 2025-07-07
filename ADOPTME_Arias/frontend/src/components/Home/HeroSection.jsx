// src/components/HeroSection.jsx
import React from 'react';
import heroImg from '../../assets/images/ilustrationHeroSection.png'; 

const HeroSection = () => {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between max-w-[1200px] mx-auto mt-10 px-6">
      <div className="max-w-xl text-center md:text-left">
        <h2 className="text-4xl md:text-4x1 font-bold text-gray-600 mb-4 leading-tight">
          Adopta con seguridad <br />
          y encuentra a tu <br />
          <span className="text-purple-500">mejor amigo</span>
        </h2>
        <p className="text-gray-600 mb-6">
          Aquí te ayudamos a encontrar a tu mascota ideal. AdoptMe conecta a rescatistas y adoptantes para garantizar adopciones seguras y responsables.
        </p>
        <button className="bg-purple-500 text-white px-6 py-3 rounded-full text-lg hover:bg-purple-600 transition">
          Adoptar
        </button>
      </div>
      <div className="max-w-[500px] w-full">
        <img src={heroImg} alt="Ilustración AdoptMe" className="w-82 object-contain" />
      </div>
    </section>
  );
};

export default HeroSection;
