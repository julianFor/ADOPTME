import { useEffect, useState } from "react";
import { getTodasLasMascotas } from "../services/mascotaService";
import CatIcon from "../assets/images/catIcon.svg";
import DogIcon from "../assets/images/dogIcon.svg";
import OtherIcon from "../assets/images/otherIcon.svg";
import PetCard from "../components/Home/PetCard";
import { Link } from "react-router-dom";


function Adoptar() {
  const [selectedSpecies, setSelectedSpecies] = useState("todos");
  const [mascotas, setMascotas] = useState([]);

  const speciesOptions = [
    { label: "Gato", value: "gato", icon: CatIcon },
    { label: "Perro", value: "perro", icon: DogIcon },
    { label: "Otro", value: "otro", icon: OtherIcon },
  ];

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const response = await getTodasLasMascotas();
        setMascotas(response.data);
      } catch (error) {
        console.error("Error al obtener las mascotas:", error);
      }
    };

    fetchMascotas();
  }, []);

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-center text-4xl font-bold text-purple-700 mb-0">
        Peluditos Disponibles <span className="inline-block">🐾</span>
      </h2>

      {/* Contenedor de filtros + tarjetas */}
      <div className="flex gap-6 items-start">
        {/* Filtros (izquierda) */}
        <div className="w-64 p-4 bg-white rounded-xl shadow self-start scale-90">
          {/* Selector por especie */}
          <div className="flex gap-4 justify-center mb-6">
            {speciesOptions.map((item) => (
              <button
                key={item.value}
                className={`w-12 h-12 rounded-full border-4 transition duration-200 ease-in-out 
                  flex items-center justify-center
                  ${selectedSpecies === item.value
                    ? "border-purple-500 shadow-lg bg-white"
                    : "border-gray-300 bg-[#f3e8ff] hover:bg-[#e9d5ff]"
                  }`}
                onClick={() => setSelectedSpecies(item.value)}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
              </button>
            ))}
          </div>

          {/* Origen */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Origen</h4>
            <div className="space-y-1 text-sm">
              <label><input type="checkbox" /> Todos</label><br />
              <label><input type="checkbox" /> Fundación</label><br />
              <label><input type="checkbox" /> Externa</label>
            </div>
          </div>

          {/* Sexo */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Sexo</h4>
            <div className="space-y-1 text-sm">
              <label><input type="checkbox" /> Todos</label><br />
              <label><input type="checkbox" /> Macho</label><br />
              <label><input type="checkbox" /> Hembra</label>
            </div>
          </div>

          {/* Tamaño */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Tamaño</h4>
            <div className="space-y-1 text-sm">
              <label><input type="checkbox" /> Todos</label><br />
              <label><input type="checkbox" /> Pequeño</label><br />
              <label><input type="checkbox" /> Mediano</label><br />
              <label><input type="checkbox" /> Grande</label>
            </div>
          </div>

          {/* Edad */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Edad</h4>
            <input type="range" min="0" max="20" className="w-full" />
            <div className="flex justify-between text-sm mt-1">
              <span>1 año</span><span>6 años+</span>
            </div>
          </div>

          <button className="w-full bg-purple-500 text-white rounded-full py-1 mt-2 hover:bg-purple-600 text-sm">
            Aplicar
          </button>
        </div>

        {/* Tarjetas (derecha) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto scale-90">
         {mascotas.map((m) => (
          <Link to={`/mascotas/${m._id}`} key={m._id}>
            <PetCard
              nombre={m.nombre}
              edad={calcularEdad(m.fechaNacimiento)}
              sexo={m.sexo.charAt(0).toUpperCase() + m.sexo.slice(1).toLowerCase()}
              descripcion={m.descripcion}
              imagen={`http://localhost:3000/uploads/${m.imagenes}`}
              id={m._id}
              origen={m.origen}
            />
          </Link>
        ))}

        </div>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-10">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-purple-300 shadow">
          <button>{"<"}</button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              className="px-3 py-1 rounded-full hover:bg-purple-100 text-purple-700 font-semibold"
            >
              {n}
            </button>
          ))}
          <button>{">"}</button>
        </div>
      </div>
    </div>
  );
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "Edad desconocida";
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  return `${edad} año${edad > 1 ? "s" : ""}`;
}

export default Adoptar;
