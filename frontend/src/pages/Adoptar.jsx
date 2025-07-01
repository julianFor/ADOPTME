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
  const [filtros, setFiltros] = useState({
    especie: "todos",
    origen: {
      fundacion: false,
      externo: false,
      todos: true
    },
    sexo: {
      macho: false,
      hembra: false,
      todos: true
    },
    tamano: {  // Cambiado de 'tamaño' a 'tamano'
      pequeño: false,
      mediano: false,
      grande: false,
      todos: true
    },
    edadMaxima: 20
  });

  const speciesOptions = [
    { label: "Todos", value: "todos", icon: null },
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

  const handleFiltroChange = (tipo, valor) => {
    if (tipo === "especie") {
      setFiltros({ ...filtros, especie: valor });
      setSelectedSpecies(valor);
      return;
    }

    if (tipo === "edadMaxima") {
      setFiltros({ ...filtros, edadMaxima: parseInt(valor) });
      return;
    }

    // Para checkboxes (origen, sexo, tamano)
    setFiltros(prev => {
      const newFiltros = { ...prev };
      const grupo = { ...newFiltros[tipo] };
      
      if (valor === "todos") {
        // Si se clickea "Todos", alternar su estado
        grupo.todos = !grupo.todos;
        // Si "Todos" está activado, desactivar los demás
        if (grupo.todos) {
          Object.keys(grupo).forEach(key => {
            if (key !== "todos") grupo[key] = false;
          });
        }
      } else {
        // Para otras opciones, alternar su estado
        grupo[valor] = !grupo[valor];
        // Si se selecciona una opción específica, desmarcar "Todos"
        if (grupo[valor]) {
          grupo.todos = false;
        }
        // Si no hay ninguna opción seleccionada, marcar "Todos"
        const algunoSeleccionado = Object.entries(grupo)
          .filter(([key]) => key !== "todos")
          .some(([, value]) => value);
        
        if (!algunoSeleccionado) {
          grupo.todos = true;
        }
      }
      
      return { ...newFiltros, [tipo]: grupo };
    });
  };

  const mascotasFiltradas = mascotas.filter(mascota => {
    // Filtro por especie
    if (filtros.especie !== "todos" && mascota.especie !== filtros.especie) {
      return false;
    }

    // Filtro por origen
    if (!filtros.origen.todos) {
      if (filtros.origen.fundacion && mascota.origen !== "fundacion") return false;
      if (filtros.origen.externo && mascota.origen !== "externo") return false;
    }

    // Filtro por sexo
    if (!filtros.sexo.todos) {
      if (filtros.sexo.macho && mascota.sexo?.toLowerCase() !== "macho") return false;
      if (filtros.sexo.hembra && mascota.sexo?.toLowerCase() !== "hembra") return false;
    }

    // Filtro por tamano (cambiado de 'tamaño')
    if (!filtros.tamano.todos) {
      if (filtros.tamano.pequeño && mascota.tamano !== "pequeño") return false;
      if (filtros.tamano.mediano && mascota.tamano !== "mediano") return false;
      if (filtros.tamano.grande && mascota.tamano !== "grande") return false;
    }

    // Filtro por edad
    if (mascota.fechaNacimiento) {
      const edad = calcularEdadNumerica(mascota.fechaNacimiento);
      if (edad > filtros.edadMaxima) return false;
    }

    return true;
  });

  function calcularEdadNumerica(fechaNacimiento) {
    if (!fechaNacimiento) return 0;
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-center text-4xl font-bold text-purple-700 mb-0">
        Peluditos Disponibles <span className="inline-block">🐾</span>
      </h2>

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
                    : item.value === "todos" 
                      ? "border-gray-300 bg-gray-100 hover:bg-gray-200"
                      : "border-gray-300 bg-[#f3e8ff] hover:bg-[#e9d5ff]"
                  }`}
                onClick={() => handleFiltroChange("especie", item.value)}
              >
                {item.icon ? (
                  <img src={item.icon} alt={item.label} className="w-6 h-6" />
                ) : (
                  <span className="text-xs font-bold">Todos</span>
                )}
              </button>
            ))}
          </div>

          {/* Origen */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Origen</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.origen.todos}
                  onChange={() => handleFiltroChange("origen", "todos")}
                  className="mr-2"
                />
                Todos
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.origen.fundacion}
                  onChange={() => handleFiltroChange("origen", "fundacion")}
                  className="mr-2"
                  disabled={filtros.origen.todos}
                />
                Fundación
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.origen.externo}
                  onChange={() => handleFiltroChange("origen", "externo")}
                  className="mr-2"
                  disabled={filtros.origen.todos}
                />
                Externo
              </label>
            </div>
          </div>

          {/* Sexo */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Sexo</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.sexo.todos}
                  onChange={() => handleFiltroChange("sexo", "todos")}
                  className="mr-2"
                />
                Todos
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.sexo.macho}
                  onChange={() => handleFiltroChange("sexo", "macho")}
                  className="mr-2"
                  disabled={filtros.sexo.todos}
                />
                Macho
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.sexo.hembra}
                  onChange={() => handleFiltroChange("sexo", "hembra")}
                  className="mr-2"
                  disabled={filtros.sexo.todos}
                />
                Hembra
              </label>
            </div>
          </div>

          {/* Tamano (cambiado de 'Tamaño') */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Tamaño</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.tamano.todos}
                  onChange={() => handleFiltroChange("tamano", "todos")}
                  className="mr-2"
                />
                Todos
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.tamano.pequeño}
                  onChange={() => handleFiltroChange("tamano", "pequeño")}
                  className="mr-2"
                  disabled={filtros.tamano.todos}
                />
                Pequeño
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.tamano.mediano}
                  onChange={() => handleFiltroChange("tamano", "mediano")}
                  className="mr-2"
                  disabled={filtros.tamano.todos}
                />
                Mediano
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={filtros.tamano.grande}
                  onChange={() => handleFiltroChange("tamano", "grande")}
                  className="mr-2"
                  disabled={filtros.tamano.todos}
                />
                Grande
              </label>
            </div>
          </div>

          {/* Edad */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Edad máxima</h4>
            <input 
              type="range" 
              min="0" 
              max="20" 
              value={filtros.edadMaxima}
              onChange={(e) => handleFiltroChange("edadMaxima", e.target.value)}
              className="w-full" 
            />
            <div className="flex justify-between text-sm mt-1">
              <span>0 años</span>
              <span>{filtros.edadMaxima} años</span>
            </div>
          </div>
        </div>

        {/* Tarjetas (derecha) */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto scale-90">
          {mascotasFiltradas.map((m) => (
            <Link to={`/mascotas/${m._id}`} key={m._id}>
              <PetCard
                nombre={m.nombre}
                edad={calcularEdad(m.fechaNacimiento)}
                sexo={m.sexo}
                descripcion={m.descripcion}
                imagen={`http://localhost:3000/uploads/${m.imagenes?.[0]}`}
                especie={m.especie}
                raza={m.raza}
                origen={m.origen}
                tamano={m.tamano}  // Cambiado de 'tamaño' a 'tamano'
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
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return `${edad} año${edad !== 1 ? "s" : ""}`;
}

export default Adoptar;