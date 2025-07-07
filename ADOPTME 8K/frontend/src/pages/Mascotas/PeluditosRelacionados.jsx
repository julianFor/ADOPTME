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

  if (mascotas.length === 0) return null;

  return (
    <div className="mt-20 mb-16 px-5">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-purple-600 mb-10">
        Conoce a más peluditos 🐾
      </h3>

      <div className="flex flex-wrap justify-center gap-6">
        {mascotas.map((m) => (
          <div key={m._id} onClick={() => navigate(`/mascotas/${m._id}`)} className="cursor-pointer">
            <PetCard
              nombre={m.nombre}
              edad={calcularEdad(m.fechaNacimiento)}
              sexo={m.sexo}
              descripcion={m.descripcion}
              imagen={`http://localhost:3000/uploads/${m.imagenes?.[0]}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'Edad desconocida';
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mesDiferencia = hoy.getMonth() - nacimiento.getMonth();
  if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} año${edad !== 1 ? 's' : ''}`;
}

export default PeluditosRelacionados;
