import React from 'react'

function HeroSection({ openModal }) {
  return (
    <section className="hero">
      <div className="text">
        <h1>Adopta con seguridad <br /> y encuentra a tu <span>mejor amigo</span></h1>
        <p>Aquí te ayudamos a encontrar a tu mascota ideal. AdoptMe conecta a rescatistas y adoptantes para garantizar adopciones seguras y responsables. ¡Dale un hogar a un amigo peludo!</p>
        <button className="btn" onClick={() => openModal('login')}>Adoptar</button>
      </div>
      <img src="/img/ilustracion.png" alt="Adopta un amigo" />
    </section>
  )
}

export default HeroSection
