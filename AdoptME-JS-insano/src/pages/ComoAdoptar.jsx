// src/pages/ComoAdoptar.jsx
import React from "react";
import '../styles/ComoAdoptar.css';

const ComoAdoptar = () => {
  return (
    <>
      <main>
        <h1>Cómo Adoptar en AdoptMe</h1>
        <p>¿Cómo funciona la adopción en nuestra plataforma?</p>
        <p>En AdoptMe ofrecemos dos formas de adopción seguras y responsables:</p>

        <div className="adoption-options">
          <div className="option">
            <img src="/img/gaticueva.png" alt="Fundación Gaticueva" />
            <h2>🐾 Opción 1: <p>Adopción con la Fundación Gaticueva</p></h2>
            <p>Proceso estructurado y seguro para garantizar el bienestar del felino.</p>
            <a href="/formulario" className="btn">Adoptar</a>
          </div>
          <div className="option">
            <img src="/img/removed.png" alt="Adopción desde Persona Externa" />
            <h2>📞 Opción 2: <p>Adopción desde una Persona Externa</p></h2>
            <p>Adopta a partir de personas responsables que buscan un hogar para su mascota.</p>
            <a href="/formulario2" className="btn">Adoptar</a>
          </div>
        </div>
      </main>

      <section className="adoption-steps">
        <h2>🐾 <span style={{ color: "#9b59b6" }}>Opción 1:</span> Adopción con la Fundación Gaticueva</h2>

        <div className="step">
          <img src="/img/formulario.png" alt="Formulario de Adopción" />
          <div className="step-content">
            <span className="step-number">1</span>
            <h3>Formulario de Adopción</h3>
            <p>Llena un formulario de adopción con tus datos y experiencia.</p>
          </div>
        </div>

        <div className="step">
          <img src="/img/entrevista.png" alt="Evaluación y Entrevista" />
          <div className="step-content">
            <span className="step-number">2</span>
            <h3>Evaluación y Entrevista</h3>
            <p>La fundación evaluará tu solicitud y agendará una entrevista.</p>
          </div>
        </div>

        <div className="step">
          <img src="/img/visita.png" alt="Visita a la Fundación" />
          <div className="step-content">
            <span className="step-number">3</span>
            <h3>Visita a la Fundación</h3>
            <p>Si eres apto, visitarás la fundación para conocer a la mascota.</p>
          </div>
        </div>

        <div className="step">
          <img src="/img/contrato.png" alt="Firma del Compromiso" />
          <div className="step-content">
            <span className="step-number">4</span>
            <h3>Firma del Compromiso</h3>
            <p>Si todo está en orden, firmas el compromiso de adopción.</p>
          </div>
        </div>

        <p className="note">
          📌 En el catálogo, estas mascotas tendrán la etiqueta{" "}
          <span style={{ color: "#9b59b6" }}>"Fundación Gaticueva"</span> y el
          botón "Adoptar" te llevará al formulario de la fundación.
        </p>
      </section>

      <section className="external-adoption">
        <h2>📞 <span>Opción 2:</span> Adopción desde una Persona Externa</h2>
        <p>AdoptMe permite que personas responsables postulen mascotas en adopción.</p>

        <h3>¿Cómo funciona?</h3>
        <ul>
          <li>Cada persona que quiera publicar una mascota deberá llenar un formulario detallado.</li>
          <li>Un administrador de AdoptMe revisará la información antes de aprobar la publicación.</li>
          <li>Si alguien desea una de estas mascotas, verá el contacto del dueño y recomendaciones para una adopción segura.</li>
        </ul>

        <h3>Recomendaciones al adoptante de una persona externa:</h3>
        <ul>
          <li>Pregunta sobre la historia y salud de la mascota.</li>
          <li>Pide fotos y videos recientes.</li>
          <li>Visita al dueño en un lugar seguro.</li>
          <li>Evita hacer pagos innecesarios o anticipados.</li>
        </ul>

        <p>
          📌 En el catálogo, estas mascotas tendrán la etiqueta{" "}
          <span className="highlight">"Adopción Directa"</span> y mostrarán la información de contacto del dueño en la sección de detalles.
        </p>

        <h3>🐾 ¿Tienes una mascota para dar en adopción?</h3>
        <p>
          Si deseas postular una mascota en AdoptMe, haz clic en el botón{" "}
          <a href="/formulario2" className="btn">Postular Mascota</a> y sigue los pasos para enviar tu solicitud.
        </p>

        <p>❗ Nuestro equipo revisará la información antes de aprobar la publicación.</p>
      </section>
    </>
  );
};

export default ComoAdoptar;
