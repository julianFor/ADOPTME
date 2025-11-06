// src/pages/Gestion/Publicaciones/MisSolicitudesPublicacion.jsx
import React, { useEffect, useState } from "react";
import { getMisSolicitudes } from "../../../services/solicitudPublicacionService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/* ===== Helpers Cloudinary ===== */
const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isRawExt = (v = "") =>
  /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i.test(v);
const isCloudinary = (u = "") =>
  /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//i.test(u);

const buildFromPublicId = (publicId) => {
  const isRaw = isRawExt(publicId);
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/${isRaw ? "raw" : "image"}/upload/`;
  if (isRaw) return `${base}${publicId}`;
  // Avatar cuadrado y optimizado
  return `${base}f_auto,q_auto,c_fill,g_auto,w_120,h_120/${publicId}`;
};

const addImgTransformsIfCloudinary = (url) => {
  if (!isCloudinary(url)) return url;
  // Inserta transformaciones si no existen (antes de versión v123…)
  return url.replace(
    /(\/image\/upload\/)(?!.*(?:f_auto|q_auto|c_fill|w_))/i,
    "$1f_auto,q_auto,c_fill,g_auto,w_120,h_120/"
  );
};

const getAssetUrl = (asset) => {
  if (!asset) return "";
  if (typeof asset === "string") {
    if (isHttpUrl(asset)) return isRawExt(asset) ? "" : addImgTransformsIfCloudinary(asset);
    return buildFromPublicId(asset);
  }
  if (asset.secure_url) return isRawExt(asset.secure_url) ? "" : addImgTransformsIfCloudinary(asset.secure_url);
  if (asset.url) return isRawExt(asset.url) ? "" : addImgTransformsIfCloudinary(asset.url);
  if (asset.public_id) return buildFromPublicId(asset.public_id);
  return "";
};

const pickFirstImageUrl = (imagenes) => {
  if (!Array.isArray(imagenes)) return "";
  for (const it of imagenes) {
    const u = getAssetUrl(it);
    if (u && !isRawExt(u)) return u;
  }
  return "";
};

const PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="100%" height="100%" fill="#eee"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="#9ca3af" font-family="sans-serif" font-size="12">
        Sin imagen
      </text>
    </svg>`
  );

const MisSolicitudesPublicacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMisSolicitudes = async () => {
      try {
        const data = await getMisSolicitudes();
        setSolicitudes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener tus solicitudes:", error);
        setSolicitudes([]);
      }
    };
    fetchMisSolicitudes();
  }, []);

  const filtradas = solicitudes.filter((item) =>
    item?.mascota?.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  const getRutaBase = () => {
    if (user?.role === "admin") return "/dashboard/admin";
    if (user?.role === "adminFundacion") return "/dashboard/adminFundacion";
    return "/dashboard/adoptante";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mis Solicitudes de Publicación</h1>
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
            {filtradas.map((item) => {
              const avatar =
                pickFirstImageUrl(item?.imagenes) ||
                pickFirstImageUrl(item?.mascota?.imagenes) ||
                PLACEHOLDER;

              const rutaBase = getRutaBase();

              return (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img
                      src={avatar}
                      alt={item?.mascota?.nombre || "mascota"}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  </td>
                  <td className="px-4 py-2">{item?.mascota?.nombre}</td>
                  <td className="px-4 py-2 capitalize">{item?.mascota?.especie}</td>
                  <td className="px-4 py-2">
                    {item?.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("es-CO")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 capitalize">{item?.estado}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`${rutaBase}/mis-solicitudes-publicacion/${item._id}`)
                      }
                      className="border border-purple-500 text-purple-500 px-3 py-1 rounded-full hover:bg-purple-100 transition"
                    >
                      Ver detalles
                    </button>
                  </td>
                </tr>
              );
            })}
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

export default MisSolicitudesPublicacion;
