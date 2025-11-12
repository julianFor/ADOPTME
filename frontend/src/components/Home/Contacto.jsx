// src/components/Home/Contacto.jsx
import { useState } from "react";

// Base de la API desde .env (VITE_API_URL=http://<IP>:3000/api)
const API = import.meta.env.VITE_API_URL;

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    mensaje: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const msg = formData.mensaje.trim();

    if (msg.length < 10) {
      setStatus("❌ El mensaje debe tener al menos 10 caracteres.");
      return;
    }
    if (msg.length > 1000) {
      setStatus("❌ El mensaje no puede superar los 1000 caracteres.");
      return;
    }

    try {
      const response = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("✅ Mensaje enviado con éxito");
        setFormData({ nombre: "", celular: "", email: "", mensaje: "" });
      } else {
        setStatus("❌ Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ Error de conexión con el servidor");
    }
  };

  return (
    <section id="contacto" className="w-full py-16 bg-white flex justify-center items-center">
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16">
        {/* Columna izquierda: formulario */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-4xl font-extrabold text-purple-500 mb-10">
            Contáctanos{" "}
            <span className="inline-block text-5xl ml-2">
              <img
                src="/paw-title.svg"
                alt="Huellita"
                className="h-7 sm:h-8 w-auto select-none"
                draggable="false"
              />
            </span>
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="sr-only">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                autoComplete="name"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="celular" className="sr-only">Teléfono</label>
              <input
                id="celular"
                type="tel"
                placeholder="Número Celular"
                value={formData.celular}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                autoComplete="tel"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                autoComplete="email"
              />
            </div>

            {/* Mensaje */}
            <div>
              <label htmlFor="mensaje" className="sr-only">Mensaje</label>
              <textarea
                id="mensaje"
                placeholder="Escribe tu mensaje..."
                value={formData.mensaje}
                onChange={handleChange}
                minLength={10}
                maxLength={1000}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 h-36 resize-y"
              />
              <div className="mt-1 text-xs text-gray-500 text-right">
                {formData.mensaje.length}/1000
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="bg-purple-500 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-600 transition"
              >
                Enviar
              </button>
              <button
                type="reset"
                onClick={() => {
                  setFormData({ nombre: "", celular: "", email: "", mensaje: "" });
                  setStatus(null);
                }}
                className="border border-gray-400 px-8 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Borrar
              </button>
            </div>
          </form>

          {/* Mensaje de estado */}
          {status && <p className="mt-4 text-sm font-semibold">{status}</p>}
        </div>

        {/* Columna derecha: imagen */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="src/assets/images/ContactoGato.svg"
            alt="Ilustración de gato"
            className="max-w-md w-full"
          />
        </div>
      </div>
    </section>
  );
}

export default Contacto;
