// src/pages/ProcesosAdopcion/MisProcesosAdopcion.jsx
import React, { useEffect, useState, useContext } from "react";
import { getMisProcesos } from "../../../services/procesoService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

const buildCloudinaryUrl = (cloud, publicId, resourceType = 'image', format = '') => {
  if (!cloud || !publicId) return '';
  const suffix = format ? `.${format}` : '';
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${publicId}${suffix}`;
};

const getUrlFromAssetObject = (asset) => {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (asset.secure_url) return asset.secure_url;
  if (asset.url) return asset.url;
  
  const publicId = asset.public_id || asset.filename;
  const format = (asset.format || '').toLowerCase();
  const resourceType = asset.resource_type || 'image';
  
  return buildCloudinaryUrl(cloud, publicId, resourceType, format);
};

const getUrlFromString = (asset) => {
  if (/^https?:\/\//i.test(asset)) return asset;
  
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  return buildCloudinaryUrl(cloud, asset);
};

/** Helper: resuelve URL Cloudinary desde objeto/string/array */
const getCloudinaryUrl = (asset) => {
  if (!asset) return '';
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  
  if (typeof asset === 'object' && asset !== null) {
    return getUrlFromAssetObject(asset);
  }
  
  if (typeof asset === 'string') {
    return getUrlFromString(asset);
  }
  
  return '';
};

const MisProcesosAdopcion = () => {
  const [procesos, setProcesos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

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

  const getRutaDetalle = (id) => {
    if (user?.role === "admin") {
      return `/dashboard/admin/procesos-adopcion/${id}`;
    } else if (user?.role === "adminFundacion") {
      return `/dashboard/adminFundacion/procesos-adopcion/${id}`;
    } else {
      return `/dashboard/adoptante/mis-procesos/${id}`;
    }
  };

  const filtrados = procesos.filter((item) =>
    item?.solicitud?.mascota?.nombre?.toLowerCase().includes(filtro.toLowerCase())
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
              const imgUrl = getCloudinaryUrl(mascota?.imagenes?.[0]);
              return (
                <tr key={item._id} className="border-b hover:bg-gray-50">
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
                  <td className="px-4 py-2">{mascota?.nombre}</td>
                  <td className="px-4 py-2 capitalize">{mascota?.especie}</td>
                  <td className="px-4 py-2">
                    {new Date(item.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-2">{calcularEstado(item)}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => navigate(getRutaDetalle(item._id))}
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
