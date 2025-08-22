import React, { useEffect, useState } from 'react';
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

  // Función para obtener la imagen principal
  const getImagenPrincipal = (imagenes) => {
    if (!imagenes) return 'https://via.placeholder.com/600x400?text=AdoptMe';
    const primera = Array.isArray(imagenes) ? imagenes[0] : imagenes;
    if (!primera) return 'https://via.placeholder.com/600x400?text=AdoptMe';
    if (typeof primera === 'string' && primera.startsWith('http')) return primera;
    return 'https://via.placeholder.com/600x400?text=AdoptMe';
  };

  if (mascotas.length === 0) return null;

  return (
    <div className="mt-20 mb-16 px-5 ">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-purple-600 mb-10">
        Conoce a más peluditos <span className="inline-block"><img
          src="/paw-title.svg"
          alt="Huellita"
          className="h-7 sm:h-8 w-auto select-none"
          draggable="false"
        /></span>
      </h3>

      <div className="flex flex-wrap justify-center gap-6">
        {mascotas.map((m) => (
          <div
            key={m._id}
            onClick={() => navigate(`/mascotas/${m._id}`)}
            className="cursor-pointer"
          >
            <PetCard
              nombre={m.nombre}
              edad={calcularEdad(m.fechaNacimiento)}
              sexo={m.sexo}
              descripcion={m.descripcion}
              imagen={getImagenPrincipal(m.imagenes)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "N/A";
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) años--;
  if (años <= 0) {
    const meses = Math.max(
      1,
      (hoy.getMonth() + 12 * hoy.getFullYear()) -
      (nacimiento.getMonth() + 12 * nacimiento.getFullYear())
    );
    return `${meses} mes${meses !== 1 ? "es" : ""}`;
  }
  return `${años} año${años !== 1 ? "s" : ""}`;
}

export default PeluditosRelacionados;
