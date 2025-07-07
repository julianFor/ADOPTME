import React, { useEffect, useState } from "react";
import { getMisSolicitudes } from "../../../services/solicitudAdopcionService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const MisSolicitudesAdopcion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  const fetchMisSolicitudes = async () => {
    try {
      const response = await getMisSolicitudes();
      // ✅ Ajustado para la estructura que trae directamente el array
      setSolicitudes(response || []);
    } catch (error) {
      console.error("Error al obtener tus solicitudes:", error);
    }
  };

  useEffect(() => {
    fetchMisSolicitudes();
  }, []);

  const filtradas = solicitudes.filter((item) =>
    item?.mascota?.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mis Solicitudes de Adopción</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre de mascota"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Especie</th>
              <th className="px-4 py-2">Fecha de Solicitud</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {/* Imagen temporal mientras no haya imagen en el modelo */}
                  <img
                    src={`http://localhost:3000/uploads/${item.mascota?.imagenes}`}
                    alt="mascota"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-2">{item.mascota?.nombre}</td>
                <td className="px-4 py-2 capitalize">{item.mascota?.especie}</td>
                <td className="px-4 py-2">
                  {new Date(item.createdAt).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-2 capitalize">{item.estado}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    className="border border-purple-500 text-purple-500 px-3 py-1 rounded-full hover:bg-purple-100 transition"
                    onClick={() =>
                        navigate(`/dashboard/admin/mis-solicitudes/${item._id}`)
                    }
                    >
                    Ver Detalles
                    </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtradas.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No hay solicitudes encontradas.
          </p>
        )}
      </div>
    </div>
  );
};

export default MisSolicitudesAdopcion;
