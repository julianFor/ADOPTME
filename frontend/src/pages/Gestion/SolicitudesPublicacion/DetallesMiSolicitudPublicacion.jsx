// src/pages/Gestion/Publicaciones/DetallesMiSolicitudPublicacion.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerSolicitudPublicacionPorId } from "../../../services/solicitudPublicacionService";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

/* ===== Traducciones para mostrar claves legibles ===== */
const traduccionesConfirmaciones = {
  esResponsable: "Es responsable",
  noSolicitaPago: "No solicita pago",
  aceptaVerificacion: "Acepta verificación",
};

/* ===== Helpers Cloudinary ===== */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const isHttpUrl = (v) => typeof v === "string" && /^https?:\/\//i.test(v);
const isRawExt = (v = "") => /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i.test(v);
const isCloudinary = (u = "") =>
  /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//i.test(u);

const buildFromPublicId = (publicId, { square160 = false } = {}) => {
  const raw = isRawExt(publicId);
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/${raw ? "raw" : "image"}/upload/`;
  if (raw) return `${base}${publicId}`;
  const tf = square160 ? "f_auto,q_auto,c_fill,g_auto,w_160,h_160" : "f_auto,q_auto";
  return `${base}${tf}/${publicId}`;
};

const addTransformsIfCloudinary = (url, { square160 = false } = {}) => {
  if (!isCloudinary(url)) return url;
  const tf = square160 ? "f_auto,q_auto,c_fill,g_auto,w_160,h_160" : "f_auto,q_auto";
  // Inserta transformaciones si no existen ya
  return url.replace(/(\/image\/upload\/)(?!.*(?:f_auto|q_auto))/i, `$1${tf}/`);
};

/** Devuelve URL usable desde string/objeto (url, secure_url, public_id) */
const getAssetUrl = (asset, { square160 = false } = {}) => {
  if (!asset) return "";
  if (typeof asset === "string") {
    if (isHttpUrl(asset)) {
      // para imágenes agrega tf; para RAW deja tal cual
      return isRawExt(asset) ? asset : addTransformsIfCloudinary(asset, { square160 });
    }
    return buildFromPublicId(asset, { square160 });
  }
  if (asset.secure_url)
    return isRawExt(asset.secure_url) ? asset.secure_url : addTransformsIfCloudinary(asset.secure_url, { square160 });
  if (asset.url)
    return isRawExt(asset.url) ? asset.url : addTransformsIfCloudinary(asset.url, { square160 });
  if (asset.public_id) return buildFromPublicId(asset.public_id, { square160 });
  return "";
};

const pickFirstImageUrl = (imagenes, { square160 = false } = {}) => {
  if (!Array.isArray(imagenes)) return "";
  for (const it of imagenes) {
    const u = getAssetUrl(it, { square160 });
    if (u && !isRawExt(u)) return u;
  }
  return "";
};

const PLACEHOLDER =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
      <rect width="100%" height="100%" fill="#eee"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            fill="#9ca3af" font-family="sans-serif" font-size="12">Sin imagen</text>
    </svg>`
  );

const DetallesMiSolicitudPublicacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await obtenerSolicitudPublicacionPorId(id);
        setSolicitud(response.solicitud);
      } catch (error) {
        console.error("Error al obtener la solicitud:", error);
      }
    };
    fetchSolicitud();
  }, [id]);

  if (!solicitud) {
    return <p className="text-center py-6 text-gray-500">Cargando solicitud...</p>;
  }

  const { mascota, contacto, estado, imagenes, documentoIdentidad, condiciones, confirmaciones } = solicitud;

  const renderMensajeEstado = (estado) => {
    switch (estado) {
      case "aprobada":
        return (
          <div className="border-2 border-green-400 bg-white text-green-600 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaCheckCircle className="text-2xl" />
            <p className="font-medium">
              La publicación fue <strong>aprobada</strong> y la mascota ya está visible en el catálogo. ¡Gracias por confiar en AdoptMe!
            </p>
          </div>
        );
      case "pendiente":
        return (
          <div className="border-2 border-gray-400 bg-white text-gray-700 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaClock className="text-2xl" />
            <p className="font-medium">
              La solicitud fue enviada y está <strong>pendiente de revisión</strong> por parte del equipo administrador.
            </p>
          </div>
        );
      case "rechazada":
        return (
          <div className="border-2 border-red-400 bg-white text-red-600 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaTimesCircle className="text-2xl" />
            <p className="font-medium">
              La solicitud fue <strong>rechazada</strong>. Puedes corregir los datos e intentarlo nuevamente con otra mascota.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Imagen principal cuadrada 160x160
  const mainImg =
    pickFirstImageUrl(imagenes, { square160: true }) ||
    pickFirstImageUrl(mascota?.imagenes, { square160: true }) ||
    PLACEHOLDER;

  // Documento identidad (puede ser imagen o PDF/RAW). Link siempre.
  const docUrl = getAssetUrl(documentoIdentidad);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2"
      >
        <FaArrowLeft />
        Volver a mis solicitudes
      </button>

      {/* Alerta según estado */}
      {renderMensajeEstado(estado)}

      {/* Título */}
      <h2 className="text-2xl font-bold text-purple-600 mb-4 text-center">
        Detalle de Solicitud de Publicación
      </h2>

      {/* Imagen mascota (visual sutil) */}
      <div className="flex justify-center mb-4">
        <img
          src={mainImg}
          alt={mascota?.nombre || "Mascota"}
          className="w-40 h-40 object-cover rounded-xl shadow"
          loading="lazy"
        />
      </div>

      {/* Datos distribuidos en 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-6">
        <p><strong>Nombre Mascota:</strong> {mascota?.nombre}</p>
        <p><strong>Especie:</strong> {mascota?.especie}</p>
        <p><strong>Raza:</strong> {mascota?.raza}</p>
        <p><strong>Sexo:</strong> {mascota?.sexo}</p>
        <p><strong>Tamaño:</strong> {mascota?.tamaño}</p>
        <p><strong>Estado de salud:</strong> {mascota?.estadoSalud}</p>
        <p><strong>Fecha de nacimiento:</strong> {mascota?.fechaNacimiento?.split?.("T")?.[0]}</p>
        <p className="md:col-span-2"><strong>Personalidad:</strong> {mascota?.personalidad}</p>
        <p className="md:col-span-2"><strong>Historia:</strong> {mascota?.historia}</p>
        <p><strong>Nombre del contacto:</strong> {contacto?.nombre}</p>
        <p><strong>Teléfono:</strong> {contacto?.telefono}</p>
        <p><strong>Correo:</strong> {contacto?.correo}</p>
        <p><strong>Ciudad:</strong> {contacto?.ciudad}</p>
        <p><strong>Barrio:</strong> {contacto?.barrio}</p>
        <p className="md:col-span-2"><strong>Dirección:</strong> {contacto?.direccion}</p>
        <p><strong>Estado de la solicitud:</strong> <span className="capitalize">{estado}</span></p>
      </div>

      {/* Condiciones y confirmaciones */}
      {condiciones && (
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Condiciones:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {Object.entries(condiciones).map(([key, val]) => (
              <li key={key}><strong>{key}:</strong> {val ? "Sí" : "No"}</li>
            ))}
          </ul>
        </div>
      )}

      {confirmaciones && (
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Confirmaciones:</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {Object.entries(confirmaciones).map(([key, val]) => (
              <li key={key}>
                <strong>{traduccionesConfirmaciones[key] || key}:</strong> {val ? "Sí" : "No"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Documento */}
      {docUrl && (
        <div className="mt-6">
          <a
            href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Ver Documento de Identidad
          </a>
        </div>
      )}
    </div>
  );
};

export default DetallesMiSolicitudPublicacion;
