import { FaVenus, FaMars, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function PetCard({ nombre, edad, sexo, descripcion, imagen, redirigir = false }) {
  const navigate = useNavigate();

  const handleAdoptar = () => {
    if (redirigir) {
      navigate('/adoptar');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl overflow-hidden w-72 flex-shrink-0 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
      {/* Imagen */}
      <div className="h-56 w-full overflow-hidden">
        <img
          src={imagen}
          alt={nombre}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Información */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2 mx-2">
          <h3 className="text-xl font-semibold text-gray-700">{nombre}</h3>
          <div className="flex items-center gap-2">
            {sexo.toLowerCase() === 'hembra' ? (
              <FaVenus className="text-pink-500" title="Hembra" />
            ) : (
              <FaMars className="text-blue-500" title="Macho" />
            )}

            <div className="flex items-center bg-gray-200 text-xs px-2 h-6 rounded-full min-w-[50px] justify-center">
              <FaClock className="mr-1" />
              <span className="whitespace-nowrap">{edad}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          {descripcion?.substring(0, 50)}...
        </p>

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
