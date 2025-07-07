import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPublicaciones } from '../../../services/solicitudPublicacionService';
import PetCard from '../../../components/Home/PetCard';
import { FaPaw } from 'react-icons/fa';

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const meses = hoy.getMonth() - nacimiento.getMonth();
  const dias = hoy.getDate() - nacimiento.getDate();

  if (meses < 0 || (meses === 0 && dias < 0)) {
    años--;
  }

  if (años <= 0) {
    const totalMeses = hoy.getMonth() - nacimiento.getMonth() + (12 * (hoy.getFullYear() - nacimiento.getFullYear()));
    return `${Math.max(totalMeses, 1)} mes${totalMeses !== 1 ? 'es' : ''}`;
  }

  return `${años} año${años !== 1 ? 's' : ''}`;
}

const MisPublicaciones = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const data = await getMisPublicaciones();
        setMascotas(data);
      } catch (error) {
        console.error('Error al obtener mis publicaciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6 flex items-center justify-center gap-2">
        <FaPaw className="text-3xl" />
        Mis Publicaciones
      </h2>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : mascotas.length === 0 ? (
        <p className="text-center text-gray-500">No has publicado ninguna mascota todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
          {mascotas.map((mascota) => {
            if (
              !mascota ||
              typeof mascota !== 'object' ||
              !mascota.nombre ||
              typeof mascota.sexo !== 'string' ||
              !mascota.fechaNacimiento
            ) {
              console.warn('Mascota inválida detectada:', mascota);
              return null;
            }

            return (
              <PetCard
                key={mascota._id}
                nombre={mascota.nombre}
                sexo={mascota.sexo}
                edad={calcularEdad(mascota.fechaNacimiento)}
                descripcion={mascota.descripcion || 'Sin descripción.'}
                imagen={`http://localhost:3000/uploads/${mascota.imagenes?.[0]}`}
                redirigir={() => navigate(`/mascotas/${mascota._id}`)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPublicaciones;
