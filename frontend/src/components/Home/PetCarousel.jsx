import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PetCard from './PetCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getMascotasFundacion } from '../../services/mascotaService';

function PetCarousel() {
  const [mascotas, setMascotas] = useState([]);
  const [start, setStart] = useState(0);
  const visible = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const response = await getMascotasFundacion();
        setMascotas(response.data || []);
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
      }
    };
    fetchMascotas();
  }, []);

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

  const CLOUDINARY_PLACEHOLDER = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

  const obtenerImagen = (imagenes) => {
    if (Array.isArray(imagenes) && imagenes.length > 0 && typeof imagenes[0] === 'string' && imagenes[0].startsWith('http')) {
      return imagenes[0];
    }

    if (typeof imagenes === 'string' && imagenes.startsWith('http')) {
      return imagenes;
    }

    return CLOUDINARY_PLACEHOLDER;
  };

  return (
    <section className="text-center mt-16">
      <h2 className="text-3xl font-extrabold text-purple-500 mb-6">
        Peluditos Disponibles{' '}
        <span className="inline-block ml-2">
          <img
            src="/paw-title.svg"
            alt=""
            className="h-7 sm:h-8 w-auto select-none"
            draggable="false"
          />
        </span>
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
        <div className="overflow-x-hidden w-[910px] pb-4">
          <div
            className="flex gap-4 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${start * 304}px)` }}
          >
            {mascotas.map((mascota) => (
              <PetCard
                key={mascota._id} // ✅ Clave única y estable
                nombre={mascota.nombre}
                edad={calcularEdad(mascota.fechaNacimiento)}
                sexo={mascota.sexo}
                descripcion={mascota.descripcion}
                imagen={obtenerImagen(mascota.imagenes)}
                redirigir={true}
                onAdoptar={() => navigate('/adoptar')}
              />
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
            key={`page-${i}`} // ✅ Clave única
            className={`w-4 h-4 rounded-full transition ${
              i === Math.floor(start / visible) ? 'bg-purple-400' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Función para calcular edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  if (fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    const años = hoy.getFullYear() - nacimiento.getFullYear();
    const meses = hoy.getMonth() - nacimiento.getMonth();
    if (años > 0) {
      return `${años} año${años !== 1 ? 's' : ''}`;
    }
    return `${Math.max(meses, 1)} mes${meses !== 1 ? 'es' : ''}`;
  } else {
    return 'N/A';
  }
}

export default PetCarousel;
