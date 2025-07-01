// src/components/Home/PetCarousel.jsx
import { useState } from 'react';
import PetCard from './PetCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const mascotas = [
  {
    nombre: 'Dasha',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/Dasha.jpeg', // Reemplaza por ruta real desde /public
  },
  {
    nombre: 'Dasha',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/Dasha.jpeg', // Reemplaza por ruta real desde /public
  },
  {
    nombre: 'Dasha',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/Dasha.jpeg', // Reemplaza por ruta real desde /public
  },
  {
    nombre: 'Dasha',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/Dasha.jpeg', // Reemplaza por ruta real desde /public
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  {
    nombre: 'PerroCalvo',
    edad: '1 año',
    sexo: 'Hembra',
    descripcion: 'tengo 1 año y soy muy caliente 🔥',
    imagen: 'src/assets/images/perroCalvo.jpg',
  },
  // Puedes duplicar esto para más tarjetas
];

function PetCarousel() {
  const [start, setStart] = useState(0);
  const visible = 3;

  const avanzar = () => {
    if (start + visible < mascotas.length) {
      setStart(start + visible);
    }
  };

  const retroceder = () => {
    if (start - visible >= 0) {
      setStart(start - visible);
    }
  };

  return (
    <section className="text-center mt-16">
      <h2 className="text-3xl font-extrabold text-purple-500 mb-6">
        Peluditos Disponibles <span className="inline-block ml-2">🐾</span>
      </h2>

      <div className="flex items-center justify-center gap-4 px-4">
        {/* Botón izquierdo */}
        <button
          onClick={retroceder}
          className="text-2xl bg-gray-300 p-3 rounded-full transition duration-300 hover:bg-purple-400 hover:text-white"
        >
          <FaChevronLeft />
        </button>

        {/* Carrusel */}
        <div className="overflow-x-hidden w-[910px] pb-4"> {/* ya no corta la sombra inferior */}
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${start * 304}px)` }} // 304 = ancho exacto aprox. por tarjeta (incluye gap)
          >
            {mascotas.map((mascota, idx) => (
              <PetCard key={idx} {...mascota} />
            ))}
          </div>
        </div>

        {/* Botón derecho */}
        <button
          onClick={avanzar}
          className="text-2xl bg-gray-300 p-3 rounded-full transition duration-300 hover:bg-purple-400 hover:text-white"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Paginación inferior */}
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: Math.ceil(mascotas.length / visible) }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full transition ${
              i === Math.floor(start / visible) ? 'bg-purple-400' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default PetCarousel;