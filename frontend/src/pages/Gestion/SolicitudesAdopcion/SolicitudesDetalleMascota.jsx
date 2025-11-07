import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerSolicitudesPorMascota } from "../../../services/solicitudAdopcionService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const getCloudinaryUrlFromString = (imgString) => {
  if (/^https?:\/\//i.test(imgString)) return imgString;
  
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (cloud) {
    return `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_112,h_112,c_fill/${imgString}`;
  }
  return `/uploads/${imgString}`;
};

const getCloudinaryUrlFromObject = (imgObject) => {
  if (imgObject.secure_url) return imgObject.secure_url;
  if (imgObject.url) return imgObject.url;
  if (imgObject.public_id && import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
    return getCloudinaryUrlFromString(imgObject.public_id);
  }
  return "";
};

const getCloudinaryUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string") return getCloudinaryUrlFromString(img);
  if (typeof img === "object" && img !== null) return getCloudinaryUrlFromObject(img);
  return "";
};

const SolicitudesDetalleMascota = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [solicitudesOriginales, setSolicitudesOriginales] = useState([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
  const [mascotaInfo, setMascotaInfo] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await obtenerSolicitudesPorMascota(id);
        setSolicitudesOriginales(res.data.solicitudes || []);
        setSolicitudesFiltradas(res.data.solicitudes || []);
        setMascotaInfo(res.data.mascota || null);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let filtradas = solicitudesOriginales;

    if (estadoFiltro !== "todos") {
      filtradas = filtradas.filter((s) => s.estado === estadoFiltro);
    }

    if (busqueda.trim() !== "") {
      filtradas = filtradas.filter((s) =>
        s.adoptante?.username?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setSolicitudesFiltradas(filtradas);
  }, [estadoFiltro, busqueda, solicitudesOriginales]);

  const getAvatarSrc = () => {
    if (!mascotaInfo?.imagenes?.length) return null;
    return getCloudinaryUrl(mascotaInfo.imagenes[0]);
  };

  const avatarSrc = getAvatarSrc();

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        {avatarSrc && (
          <img
            src={avatarSrc}
            alt="Mascota"
            className="w-14 h-14 rounded-full object-cover"
            loading="lazy"
          />
        )}
        <h1 className="text-2xl font-bold">
          Solicitudes de Adopción Para{" "}
          <span className="text-purple-600 uppercase">
            {mascotaInfo?.nombre}
          </span>
        </h1>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <label htmlFor="estado" className="text-sm font-medium text-gray-700">
            Estado
          </label>
          <select
            id="estado"
            className="border border-gray-300 rounded px-2 py-1"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en proceso">En Proceso</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar adoptante"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Adoptante</th>
              <th className="px-4 py-2">Fecha Solicitud</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesFiltradas.map((s) => (
              <tr key={s._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{s.adoptante?.username}</td>
                <td className="px-4 py-2">
                  {new Date(s.createdAt).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-2 capitalize">{s.estado}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/admin/solicitudes-adopcion/detalle/${s._id}`
                      )
                    }
                    className="border border-purple-500 text-purple-500 px-3 py-1 rounded-full hover:bg-purple-100 transition"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {solicitudesFiltradas.length === 0 && (
          <p className="text-center text-gray-500 py-6">No hay solicitudes.</p>
        )}
      </div>
    </div>
  );
};

export default SolicitudesDetalleMascota;
