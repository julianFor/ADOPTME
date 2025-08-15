// src/pages/Gestion/Adopciones/ProcesosAdopcionList.jsx
import React, { useEffect, useState } from "react";
import { getAllProcesos } from "../../../services/procesoService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

/** Helper para obtener URL de Cloudinary */
const getCloudinaryUrl = (asset) => {
  if (!asset) return "";
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  if (typeof asset === "string" && /^https?:\/\//i.test(asset)) return asset;

  if (typeof asset === "object" && asset !== null) {
    if (asset.secure_url) return asset.secure_url;
    if (asset.url) return asset.url;

    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const public_id = asset.public_id || asset.filename;
    const fmt = (asset.format || "").toLowerCase();
    if (cloud && public_id) {
      const rt = asset.resource_type || "image";
      const suffix = fmt ? `.${fmt}` : "";
      return `https://res.cloudinary.com/${cloud}/${rt}/upload/${public_id}${suffix}`;
    }
  }

  if (typeof asset === "string") {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloud) return "";
    return `https://res.cloudinary.com/${cloud}/image/upload/${asset}`;
  }

  return "";
};

const ProcesosAdopcionList = () => {
  const [procesos, setProcesos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const res = await getAllProcesos();
        setProcesos(res.procesos || []);
      } catch (error) {
        console.error("Error al obtener procesos de adopción:", error);
      }
    };
    fetchProcesos();
  }, []);

  const filtrar = procesos.filter((p) =>
    p.solicitud?.adoptante?.username?.toLowerCase().includes(filtro.toLowerCase())
  );

  const contarEtapasCompletadas = (proceso) => {
    let total = 1; // formulario siempre aprobado
    if (proceso.entrevista?.aprobada) total++;
    if (proceso.visita?.aprobada) total++;
    if (proceso.compromiso?.aprobada) total++;
    if (proceso.entrega?.aprobada) total++;
    return `${total}/5`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Procesos de Adopción</h1>
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

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Adoptante</th>
              <th className="px-4 py-2">Fecha de Inicio</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Etapas Completadas</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrar.map((proceso) => {
              const imgUrl = getCloudinaryUrl(proceso.solicitud?.mascota?.imagenes?.[0]);
              return (
                <tr key={proceso._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt="mascota"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{proceso.solicitud?.mascota?.nombre}</td>
                  <td className="px-4 py-2">{proceso.solicitud?.adoptante?.username}</td>
                  <td className="px-4 py-2">
                    {new Date(proceso.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-2">
                    {proceso.finalizado ? "Finalizado" : "En proceso"}
                  </td>
                  <td className="px-4 py-2 font-bold text-green-600">
                    {contarEtapasCompletadas(proceso)}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/admin/procesos-adopcion/${proceso._id}`)
                      }
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
        {filtrar.length === 0 && (
          <p className="text-center text-gray-500 py-6">No hay procesos registrados.</p>
        )}
      </div>
    </div>
  );
};

export default ProcesosAdopcionList;
