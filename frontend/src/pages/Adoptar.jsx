// frontend/src/pages/Adoptar.jsx
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getTodasLasMascotas } from "../services/mascotaService";
import CatIcon from "../assets/images/catIcon.svg";
import DogIcon from "../assets/images/dogIcon.svg";
import OtherIcon from "../assets/images/otherIcon.svg";
import PetCard from "../components/Home/PetCard";
import { Link } from "react-router-dom";

/* ───────────────── Componentes auxiliares ───────────────── */

function SpeciesButtons({ className = "", speciesOptions, selectedSpecies, toggleSpecies }) {
  return (
    <div className={`flex gap-4 justify-center ${className}`}>
      {speciesOptions.map((item) => {
        const active = selectedSpecies === item.value;
        return (
          <button
            key={item.value}
            type="button"
            className={`w-12 h-12 rounded-full border-4 transition duration-200 ease-in-out 
              flex items-center justify-center
              ${
                active
                  ? "border-purple-500 shadow-lg bg-white"
                  : "border-gray-300 bg-[#f3e8ff] hover:bg-[#e9d5ff]"
              }`}
            onClick={() => toggleSpecies(item.value)}
            aria-pressed={active}
            title={active ? `Quitar filtro: ${item.label}` : `Filtrar: ${item.label}`}
          >
            <img src={item.icon} alt={item.label} className="w-6 h-6" />
          </button>
        );
      })}
    </div>
  );
}

SpeciesButtons.propTypes = {
  className: PropTypes.string,
  speciesOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedSpecies: PropTypes.string.isRequired,
  toggleSpecies: PropTypes.func.isRequired,
};

/* ───────────────── Helpers puros ───────────────── */

function origenLabel(v) {
  if (v === "todos") return "Todos";
  if (v === "fundacion") return "Fundación";
  return "Externa";
}

// Render amigable de edad
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

/* ───────────────── Página principal ───────────────── */

function Adoptar() {
  const [selectedSpecies, setSelectedSpecies] = useState("todos");
  const [origen, setOrigen] = useState("todos");
  const [sexo, setSexo] = useState("todos");
  const [tamano, setTamano] = useState("todos");
  const [edadMax, setEdadMax] = useState(20);
  const [mascotas, setMascotas] = useState([]);

  // PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // RESPONSIVE: panel móvil
  const [openFilters, setOpenFilters] = useState(false);

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
        // eslint-disable-next-line no-console
        console.error("Error al obtener las mascotas:", error);
      }
    };
    fetchMascotas();
  }, []);

  const getImagenPrincipal = (imagenes) => {
    if (!imagenes || (Array.isArray(imagenes) && imagenes.length === 0)) {
      return "https://via.placeholder.com/600x400?text=AdoptMe";
    }
    const first = Array.isArray(imagenes) ? imagenes[0] : imagenes;
    if (typeof first === "string" && first.startsWith("http")) return first;
    if (typeof first === "object") {
      return first.secure_url || first.url || "https://via.placeholder.com/600x400?text=AdoptMe";
    }
    return "https://via.placeholder.com/600x400?text=AdoptMe";
  };

  // Helpers
  const yearsOld = (fechaNacimiento) => {
    if (!fechaNacimiento) return 0;
    const n = new Date(fechaNacimiento);
    const h = new Date();
    let y = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) y--;
    return Math.max(0, y);
  };
  const normalizar = (v) => (v || "").toString().trim().toLowerCase();

  // Toggle species
  const toggleSpecies = (val) => {
    setSelectedSpecies((prev) => (prev === val ? "todos" : val));
  };

  // Filtro principal
  const filteredMascotas = useMemo(() => {
    return mascotas.filter((m) => {
      const especie = normalizar(m.especie || m.tipo);
      const org = normalizar(m.origen);
      const sx = normalizar(m.sexo);
      const sz = normalizar(m.tamano || m.tamaño);
      const edadY = yearsOld(m.fechaNacimiento);

      const okEspecie = selectedSpecies === "todos" ? true : especie === selectedSpecies;
      const okOrigen = origen === "todos" ? true : org === origen;
      const okSexo = sexo === "todos" ? true : sx === sexo;
      const okTam = tamano === "todos" ? true : sz === tamano;
      const okEdad = edadY <= Number(edadMax);

      return okEspecie && okOrigen && okSexo && okTam && okEdad;
    });
  }, [mascotas, selectedSpecies, origen, sexo, tamano, edadMax]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecies, origen, sexo, tamano, edadMax]);

  // Datos paginados
  const totalPages = Math.max(1, Math.ceil(filteredMascotas.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredMascotas.slice(start, start + pageSize);

  const getPageNumbers = () => {
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }, (_, i) => ({ type: "page", value: i + 1 }));
    }
    const pages = new Set([
      1,
      2,
      totalPages - 1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);
    const arr = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push({ type: "page", value: arr[i] });
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) {
        // id estable basado en el rango omitido (evita usar índice)
        out.push({ type: "dots", id: `${arr[i]}-${arr[i + 1]}` });
      }
    }
    return out;
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <h2 className="text-center text-3xl font-extrabold text-purple-500 mb-4">
        Peluditos Disponibles{" "}
        <span className="inline-block">
          <img
            src="/paw-title.svg"
            alt="Huellita"
            className="h-7 sm:h-8 w-auto select-none"
            draggable="false"
          />
        </span>
        {" "}
      </h2>

      {/* ====== Barra móvil: botón Filtros + chips de especie ====== */}
      <div className="md:hidden mb-4 flex items-center justify-between">
        <SpeciesButtons
          className="flex-1"
          speciesOptions={speciesOptions}
          selectedSpecies={selectedSpecies}
          toggleSpecies={toggleSpecies}
        />
        <button
          onClick={() => setOpenFilters(true)}
          className="ml-3 px-4 py-2 rounded-full bg-purple-600 text-white font-semibold shadow active:scale-[0.98]"
          aria-label="Abrir filtros"
        >
          Filtros
        </button>
      </div>

      <div className="flex gap-6 items-start">
        {/* ====== Sidebar de filtros (DESKTOP: intacto) ====== */}
        <div className="hidden md:block w-64 p-4 bg-white rounded-xl shadow self-start">
          <SpeciesButtons
            className="mb-6"
            speciesOptions={speciesOptions}
            selectedSpecies={selectedSpecies}
            toggleSpecies={toggleSpecies}
          />

          {/* Origen */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Origen</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="origen"
                  value="todos"
                  checked={origen === "todos"}
                  onChange={(e) => setOrigen(e.target.value)}
                />{" "}
                Todos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="origen"
                  value="fundacion"
                  checked={origen === "fundacion"}
                  onChange={(e) => setOrigen(e.target.value)}
                />{" "}
                Fundación
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="origen"
                  value="externo"
                  checked={origen === "externo"}
                  onChange={(e) => setOrigen(e.target.value)}
                />{" "}
                Externa
              </label>
            </div>
          </div>

          {/* Sexo */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Sexo</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sexo"
                  value="todos"
                  checked={sexo === "todos"}
                  onChange={(e) => setSexo(e.target.value)}
                />{" "}
                Todos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sexo"
                  value="macho"
                  checked={sexo === "macho"}
                  onChange={(e) => setSexo(e.target.value)}
                />{" "}
                Macho
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sexo"
                  value="hembra"
                  checked={sexo === "hembra"}
                  onChange={(e) => setSexo(e.target.value)}
                />{" "}
                Hembra
              </label>
            </div>
          </div>

          {/* Tamaño */}
          <div className="mb-4">
            <h4 className="font-bold mb-2">Tamaño</h4>
            <div className="space-y-1 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tamano"
                  value="todos"
                  checked={tamano === "todos"}
                  onChange={(e) => setTamano(e.target.value)}
                />{" "}
                Todos
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tamano"
                  value="pequeño"
                  checked={tamano === "pequeño"}
                  onChange={(e) => setTamano(e.target.value)}
                />{" "}
                Pequeño
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tamano"
                  value="mediano"
                  checked={tamano === "mediano"}
                  onChange={(e) => setTamano(e.target.value)}
                />{" "}
                Mediano
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tamano"
                  value="grande"
                  checked={tamano === "grande"}
                  onChange={(e) => setTamano(e.target.value)}
                />{" "}
                Grande
              </label>
            </div>
          </div>

          {/* Edad */}
          <div className="mb-2">
            <h4 className="font-bold mb-2">Edad (máxima)</h4>
            <input
              type="range"
              min="0"
              max="20"
              value={edadMax}
              onChange={(e) => setEdadMax(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm mt-1">
              <span>0 años</span>
              <span>{edadMax} años</span>
            </div>
          </div>
        </div>

        {/* ====== Grid tarjetas ====== */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1200px] mx-auto">
          {pageItems.map((m) => (
            <Link to={`/mascotas/${m._id}`} key={m._id}>
              <PetCard
                nombre={m.nombre}
                edad={calcularEdad(m.fechaNacimiento)}
                sexo={
                  m.sexo ? m.sexo.charAt(0).toUpperCase() + m.sexo.slice(1).toLowerCase() : "N/A"
                }
                descripcion={m.descripcion}
                imagen={getImagenPrincipal(m.imagenes)}
                id={m._id}
                origen={m.origen}
              />
            </Link>
          ))}
          {pageItems.length === 0 && (
            <p className="col-span-full text-center text-slate-500">
              No hay peluditos que coincidan con los filtros.
            </p>
          )}
        </div>
      </div>

      {/* ====== Paginación ====== */}
      <div className="flex justify-center mt-10">
        {filteredMascotas.length > 0 && (
          <nav
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-purple-300 shadow"
            aria-label="Paginación"
          >
            <button
              className="px-3 py-1 rounded-full hover:bg-purple-100 text-purple-700 font-semibold disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              {"<"}
            </button>

            {getPageNumbers().map((item) =>
              item.type === "dots" ? (
                <span key={`dots-${item.id}`} className="px-2 select-none">
                  …
                </span>
              ) : (
                <button
                  key={`page-${item.value}`}
                  className={`px-3 py-1 rounded-full font-semibold ${
                    currentPage === item.value
                      ? "bg-purple-600 text-white"
                      : "hover:bg-purple-100 text-purple-700"
                  }`}
                  onClick={() => setCurrentPage(item.value)}
                >
                  {item.value}
                </button>
              )
            )}

            <button
              className="px-3 py-1 rounded-full hover:bg-purple-100 text-purple-700 font-semibold disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
          </nav>
        )}
      </div>

      {/* ====== PANEL FILTROS MÓVIL (overlay) ====== */}
      {openFilters && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* backdrop */}
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpenFilters(false)}
            aria-label="Cerrar filtros"
          />
          {/* sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">Filtros</h3>
              <button
                onClick={() => setOpenFilters(false)}
                className="px-3 py-1 rounded-full border"
                aria-label="Cerrar"
              >
                Cerrar
              </button>
            </div>

            <SpeciesButtons
              className="mb-5"
              speciesOptions={speciesOptions}
              selectedSpecies={selectedSpecies}
              toggleSpecies={toggleSpecies}
            />

            {/* Origen */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Origen</h4>
              <div className="flex gap-4 text-sm">
                {["todos", "fundacion", "externo"].map((v) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="origen_m"
                      value={v}
                      checked={origen === v}
                      onChange={(e) => setOrigen(e.target.value)}
                    />
                    {origenLabel(v)}
                  </label>
                ))}
              </div>
            </div>

            {/* Sexo */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Sexo</h4>
              <div className="flex gap-4 text-sm">
                {["todos", "macho", "hembra"].map((v) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sexo_m"
                      value={v}
                      checked={sexo === v}
                      onChange={(e) => setSexo(e.target.value)}
                    />
                    {v === "todos" ? "Todos" : v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Tamaño */}
            <div className="mb-4">
              <h4 className="font-bold mb-2">Tamaño</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                {["todos", "pequeño", "mediano", "grande"].map((v) => (
                  <label key={v} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tamano_m"
                      value={v}
                      checked={tamano === v}
                      onChange={(e) => setTamano(e.target.value)}
                    />
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Edad */}
            <div className="mb-2">
              <h4 className="font-bold mb-2">Edad (máxima)</h4>
              <input
                type="range"
                min="0"
                max="20"
                value={edadMax}
                onChange={(e) => setEdadMax(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm mt-1">
                <span>0 años</span>
                <span>{edadMax} años</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 py-2 rounded-full border"
                onClick={() => {
                  setSelectedSpecies("todos");
                  setOrigen("todos");
                  setSexo("todos");
                  setTamano("todos");
                  setEdadMax(20);
                }}
              >
                Limpiar
              </button>
              <button
                className="flex-1 py-2 rounded-full bg-purple-600 text-white font-semibold"
                onClick={() => setOpenFilters(false)}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adoptar;
