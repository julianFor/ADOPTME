import React from 'react'

function ContactSection() {
  return (
    <section className="contact">
      <h2>Contáctanos</h2>
      <form>
        <label htmlFor="nombre">Nombre</label>
        <input type="text" id="nombre" placeholder="Nombre" />
        <label htmlFor="celular">Número Celular</label>
        <input type="text" id="celular" placeholder="Número Celular" />
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" placeholder="Escribe tu mensaje aquí..." />
        <button className="btn" type="submit">Enviar</button>
      </form>
      <img src="../img/group ilustration.png" alt="Gato contactando"></img>
    </section>
  )
}

export default ContactSection
