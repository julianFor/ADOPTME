import React, { useEffect, useState } from "react";
import { getSolicitudes } from "../../../services/solicitudPublicacionService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ListaSolicitudesPublicacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const navigate = useNavigate();

  const fetchSolicitudes = async () => {
    try {
      const response = await getSolicitudes();
      setSolicitudes(response.solicitudes);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const filtradas = solicitudes.filter((s) => {
    const coincideNombre = s.contacto?.nombre?.toLowerCase().includes(filtro.toLowerCase());
    const coincideEstado = estadoFiltro ? s.estado === estadoFiltro : true;
    return coincideNombre && coincideEstado;
  });

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Solicitudes Publicación</h1>
        <div className="flex gap-4">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="border border-purple-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
          >
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha Solicitud</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((solicitud) => (
              <tr key={solicitud._id} className="border-b hover:bg-gray-50 text-sm">
                <td className="px-4 py-2">{solicitud.contacto?.nombre}</td>
                <td className="px-4 py-2">{solicitud.contacto?.telefono}</td>
                <td className="px-4 py-2">{solicitud.mascota?.nombre}</td>
                <td className="px-4 py-2 capitalize">{solicitud.estado}</td>
                <td className="px-4 py-2">{formatearFecha(solicitud.createdAt)}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/admin/solicitudes-publicacion/${solicitud._id}`)
                    }
                    className="border border-purple-500 text-purple-500 px-4 py-1 rounded-full hover:bg-purple-100 transition text-sm"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtradas.length === 0 && (
          <p className="text-center text-gray-500 py-6">No hay solicitudes encontradas.</p>
        )}
      </div>
    </div>
  );
};

export default ListaSolicitudesPublicacion;
