// src/components/Contacto.jsx
function Contacto() {
  return (
    <section id="contacto" className="w-full py-16 bg-white flex justify-center items-center">
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16">
        
        {/* Columna izquierda: formulario */}
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <h2 className="text-4xl font-extrabold text-purple-500 mb-10">
            Contactanos <span className="inline-block text-5xl ml-2">🐾</span>
          </h2>

          <form className="flex flex-col gap-6">
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="sr-only">Nombre</label>
              <input
                id="nombre"
                type="text"
                placeholder="Nombre"
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Campo Teléfono */}
            <div>
              <label htmlFor="telefono" className="sr-only">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                placeholder="Numero Celular"
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
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
                className="border border-gray-400 px-8 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Borrar
              </button>
            </div>
          </form>
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
