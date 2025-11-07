import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getAllMascotas } from '../../services/mascotaService';
import PetCard from '../../components/Home/PetCard';

const PeluditosRelacionados = ({ origen, mascotaId }) => {
  const [mascotas, setMascotas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelacionadas = async () => {
      try {
        const data = await getAllMascotas();
        const relacionadas = data
          .filter((m) => m.origen === origen && m._id !== mascotaId)
          .slice(0, 3);
        setMascotas(relacionadas);
      } catch (err) {
        console.error('Error al cargar peluditos relacionados', err);
      }
    };

    fetchRelacionadas();
  }, [origen, mascotaId]);

  const getImagenPrincipal = (imagenes) => {
    if (imagenes && Array.isArray(imagenes) && imagenes[0]) {
      const primera = imagenes[0];
      if (typeof primera === 'string' && primera.startsWith('http')) {
        return primera;
      }
    }
    return 'https://via.placeholder.com/600x400?text=AdoptMe';
  };

  if (mascotas.length === 0) return null;

  return (
    <div className="mt-20 mb-16 px-5">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-purple-600 mb-10">
        Conoce a más peluditos{' '}
        <span className="inline-block">
          <img
            src="/paw-title.svg"
            alt="Huellita"
            className="h-7 sm:h-8 w-auto select-none"
            draggable="false"
          />
        </span>
      </h3>

      <div className="flex flex-wrap justify-center gap-6">
        {mascotas.map((m) => (
          <button
            key={m._id}
            type="button"
            onClick={() => navigate(`/mascotas/${m._id}`)}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-xl bg-transparent border-0 p-0 text-left"
          >
            <PetCard
              nombre={m.nombre}
              edad={calcularEdad(m.fechaNacimiento)}
              sexo={m.sexo}
              descripcion={m.descripcion}
              imagen={getImagenPrincipal(m.imagenes)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// ✅ Condición reescrita para evitar negación
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) {
    return 'N/A';
  }

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    años--;
  }

  if (años > 0) {
    return `${años} año${años === 1 ? '' : 's'}`;
  } else {
    const meses =
      (hoy.getMonth() + 12 * hoy.getFullYear()) -
      (nacimiento.getMonth() + 12 * nacimiento.getFullYear());
    const totalMeses = Math.max(1, meses);
    return `${totalMeses} mes${totalMeses === 1 ? '' : 'es'}`;
  }
}

PeluditosRelacionados.propTypes = {
  origen: PropTypes.string.isRequired,
  mascotaId: PropTypes.string.isRequired,
};

export default PeluditosRelacionados;