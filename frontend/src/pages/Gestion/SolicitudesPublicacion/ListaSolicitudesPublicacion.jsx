import React, { useEffect, useState, useMemo } from "react";
import { getSolicitudes } from "../../../services/solicitudPublicacionService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

// === Helpers Cloudinary (mismos del detalle) ===
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isRawExt = (v = "") => /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i.test(v);

const buildFromPublicId = (publicId) => {
  const resourceType = isRawExt(publicId) ? "raw" : "image";
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${publicId}`;
};

/** Devuelve URL desde: string URL | string public_id | obj { secure_url|url|public_id } */
const getAssetUrl = (asset) => {
  if (!asset) return "";
  if (typeof asset === "string") {
    return isHttpUrl(asset) ? asset : buildFromPublicId(asset);
  }
  if (asset.secure_url) return asset.secure_url;
  if (asset.url) return asset.url;
  if (asset.public_id) return buildFromPublicId(asset.public_id);
  return "";
};

const toAvatar = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  // normaliza si vino como /raw/upload/
  url = url.replace("/raw/upload/", "/image/upload/");
  // inserta transformación (evita duplicar si ya existe)
  if (url.includes("/image/upload/") && !/\/upload\/[^/]+,?c_thumb/.test(url)) {
    url = url.replace(
      "/image/upload/",
      "/image/upload/c_thumb,g_face,w_56,h_56,q_auto,f_auto/"
    );
  }
  return url;
};

const ListaSolicitudesPublicacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const response = await getSolicitudes();
        setSolicitudes(response.solicitudes || []);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    };
    fetchSolicitudes();
  }, []);

  const norm = (v) => (v || "").toString().trim().toLowerCase();

  // Toma la PRIMERA imagen de la solicitud (igual que en el detalle) y, si no hay,
  // intenta con la de la mascota como fallback.
  const getThumbFromSolicitud = (s) => {
    const placeholder = "https://via.placeholder.com/56?text=🐾";
    const asset =
      s?.imagenes?.[0] ||
      s?.mascota?.imagenes?.[0] ||
      s?.mascota?.imagenPrincipal ||
      s?.mascota?.imagen ||
      null;

    const raw = getAssetUrl(asset);
    if (!raw) return placeholder;

    // Aplica transformación de avatar si es Cloudinary
    return toAvatar(raw) || raw || placeholder;
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "-";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO");
  };

  const filtradas = useMemo(() => {
    const f = norm(filtro);
    return (solicitudes || []).filter((s) => {
      const contactoNombre = norm(s?.contacto?.nombre);
      const mascotaNombre = norm(s?.mascota?.nombre);
      const publicador = norm(
        s?.contacto?.nombre || s?.adoptante?.username || s?.adoptante?.nombre
      );
      const coincideTexto =
        !f ||
        contactoNombre.includes(f) ||
        mascotaNombre.includes(f) ||
        publicador.includes(f);
      const coincideEstado = estadoFiltro ? s?.estado === estadoFiltro : true;
      return coincideTexto && coincideEstado;
    });
  }, [solicitudes, filtro, estadoFiltro]);

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
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2 text-center">Foto Mascota</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Publicador</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha Solicitud</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtradas.map((solicitud) => {
              const img = getThumbFromSolicitud(solicitud);
              const publicador =
                solicitud?.contacto?.nombre ||
                solicitud?.adoptante?.username ||
                solicitud?.adoptante?.nombre ||
                "-";

              return (
                <tr key={solicitud._id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="px-4 py-2 text-center align-middle">
                    <div className="mx-auto w-14 h-14 rounded-full overflow-hidden ring-1 ring-purple-200 flex items-center justify-center">
                      <img
                        src={img}
                        alt={solicitud?.mascota?.nombre || "Mascota"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </td>

                  <td className="px-4 py-2 align-middle">
                    {solicitud?.mascota?.nombre || "-"}
                  </td>

                  <td className="px-4 py-2 align-middle">{publicador}</td>

                  <td className="px-4 py-2 capitalize align-middle">
                    {solicitud?.estado || "-"}
                  </td>

                  <td className="px-4 py-2 align-middle">
                    {formatearFecha(solicitud?.createdAt)}
                  </td>

                  <td className="px-4 py-2 text-center align-middle">
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

export default ListaSolicitudesPublicacion;
