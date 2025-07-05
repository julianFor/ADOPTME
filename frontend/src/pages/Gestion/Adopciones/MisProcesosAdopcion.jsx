// src/pages/ProcesosAdopcion/MisProcesosAdopcion.jsx
import React, { useEffect, useState } from "react";
import { getMisProcesos } from "../../../services/procesoService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const MisProcesosAdopcion = () => {
  const [procesos, setProcesos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const res = await getMisProcesos();
        setProcesos(res.procesos || []);
      } catch (error) {
        console.error("Error al obtener procesos:", error);
      }
    };
    fetchProcesos();
  }, []);

  const calcularEstado = (proceso) => {
    if (proceso.finalizado) return "Finalizado";
    if (proceso.etapaRechazada) return "Rechazado";
    return "Pendiente";
  };

  const filtrados = procesos.filter((item) =>
    item?.solicitud?.mascota?.nombre
      ?.toLowerCase()
      .includes(filtro.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mis Procesos de Adopción</h1>
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
              <th className="px-4 py-2">Fecha de Inicio</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => {
              const mascota = item?.solicitud?.mascota;
              return (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img
                      src={`http://localhost:3000/uploads/${mascota?.imagenes?.[0]}`}
                      alt="mascota"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-4 py-2">{mascota?.nombre}</td>
                  <td className="px-4 py-2 capitalize">{mascota?.especie}</td>
                  <td className="px-4 py-2">
                    {new Date(item.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-2">{calcularEstado(item)}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => navigate(`/dashboard/adoptante/mis-procesos/${item._id}`)}
                      className="border border-purple-500 text-purple-500 px-3 py-1 rounded-full hover:bg-purple-100 transition"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtrados.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No hay procesos encontrados.
          </p>
        )}
      </div>
    </div>
  );
};

export default MisProcesosAdopcion;
