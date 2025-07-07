import { FaVenus, FaMars, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function PetCard({ nombre, edad, sexo, descripcion, imagen, redirigir = false }) {
  const navigate = useNavigate();

  const handleAdoptar = () => {
    if (redirigir) {
      navigate('/adoptar');
    }
  };

  // Validaciones seguras
  const genero = typeof sexo === 'string' ? sexo.toLowerCase() : 'desconocido';
  const nombreSeguro = nombre || 'Sin nombre';
  const edadSegura = edad || 'N/A';
  const descripcionCorta = descripcion ? descripcion.substring(0, 50) + '...' : 'Sin descripción.';

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden w-72 flex-shrink-0 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Imagen */}
      <div className="h-56 w-full overflow-hidden">
        <img
          src={imagen}
          alt={nombreSeguro}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Información */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2 mx-2">
          <h3 className="text-xl font-semibold text-gray-700">{nombreSeguro}</h3>
          <div className="flex items-center gap-2">
            {genero === 'hembra' ? (
              <FaVenus className="text-pink-500" title="Hembra" />
            ) : genero === 'macho' ? (
              <FaMars className="text-blue-500" title="Macho" />
            ) : (
              <span className="text-gray-400 text-sm">?</span>
            )}

            <div className="flex items-center bg-gray-200 text-xs px-2 h-6 rounded-full min-w-[50px] justify-center">
              <FaClock className="mr-1" />
              <span className="whitespace-nowrap">{edadSegura}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm">{descripcionCorta}</p>

        <button
          onClick={handleAdoptar}
          className="bg-purple-400 text-white font-bold w-full py-2 rounded-full mt-3 hover:bg-purple-500"
        >
          Adoptar
        </button>
      </div>
    </div>
  );
}

export default PetCard;
