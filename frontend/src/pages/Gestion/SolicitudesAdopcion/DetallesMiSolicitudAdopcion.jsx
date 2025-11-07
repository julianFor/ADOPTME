import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSolicitudById } from "../../../services/solicitudAdopcionService";
import { FaCheckCircle, FaTimesCircle, FaClock, FaStar, FaArrowLeft } from "react-icons/fa";

/** Helper: construye URL desde public_id */
const buildCloudinaryUrl = (cloud, public_id, resourceType = 'image', format = '') => {
  if (!cloud || !public_id) return '';
  const suffix = format ? `.${format}` : '';
  return `https://res.cloudinary.com/${cloud}/${resourceType}/upload/${public_id}${suffix}`;
};

/** Helper: maneja objeto Cloudinary */
const handleCloudinaryObject = (asset) => {
  if (asset.secure_url) return asset.secure_url;
  if (asset.url) return asset.url;

  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const public_id = asset.public_id || asset.filename;
  const fmt = (asset.format || '').toLowerCase();
  const rt = asset.resource_type || 'image';
  
  return buildCloudinaryUrl(cloud, public_id, rt, fmt);
};

/** Helper: resuelve URL de Cloudinary desde objeto/string/array */
const getCloudinaryUrl = (asset) => {
  if (!asset) return '';
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  if (typeof asset === 'string' && /^https?:\/\//i.test(asset)) return asset;
  if (typeof asset === 'object') return handleCloudinaryObject(asset);
  if (typeof asset === 'string') {
    return buildCloudinaryUrl(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, asset);
  }
  return '';
};

const DetallesMiSolicitudAdopcion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const data = await getSolicitudById(id);
        setSolicitud(data);
      } catch (error) {
        console.error("Error al cargar la solicitud:", error);
      }
    };
    fetchSolicitud();
  }, [id]);

  const renderMensajeEstado = (estado) => {
    switch (estado) {
      case "en proceso":
        return (
          <div className="border-2 border-green-400 bg-white text-green-600 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaCheckCircle className="text-2xl" />
            <p className="font-medium">
              El Formulario fue <strong>Aprobado</strong>, por favor, estar pendiente al proceso de adopción
            </p>
          </div>
        );
      case "pendiente":
        return (
          <div className="border-2 border-gray-400 bg-white text-gray-700 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaClock className="text-2xl" />
            <p className="font-medium">
              El formulario fue enviado, por favor, esperar a que sea revisado por los administradores
            </p>
          </div>
        );
      case "rechazada":
        return (
          <div className="border-2 border-red-400 bg-white text-red-600 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaTimesCircle className="text-2xl" />
            <p className="font-medium">
              El formulario fue <strong>rechazado</strong>, podrás seguir enviando nuevas solicitudes de otra mascota
            </p>
          </div>
        );
      case "finalizada":
        return (
          <div className="border-2 border-purple-400 bg-white text-purple-600 rounded-lg p-4 flex items-center gap-3 mb-6">
            <FaStar className="text-2xl" />
            <p className="font-medium">
              Todo el proceso fue un <strong>éxito</strong>, ¡felicidades por tu nuevo peludito!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!solicitud) {
    return <p className="text-center py-6 text-gray-500">Cargando solicitud...</p>;
  }

  // URLs Cloudinary (imágenes)
  const urlDocId = getCloudinaryUrl(solicitud.documentoIdentidad);
  const urlResidencia = getCloudinaryUrl(solicitud.pruebaResidencia);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Botón volver */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-2"
      >
        <FaArrowLeft />
        Volver a mis solicitudes
      </button>

      {/* Alerta según estado */}
      {renderMensajeEstado(solicitud.estado)}

      {/* Título */}
      <h2 className="text-xl font-bold text-purple-600 mb-4">Detalle de Solicitud de Adopción</h2>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm mb-6">
        <div className="space-y-2">
          <p><strong>Nombre completo:</strong> {solicitud.nombreCompleto}</p>
          <p><strong>Fecha de nacimiento:</strong> {solicitud.fechaNacimiento?.split("T")[0]}</p>
          <p><strong>Barrio:</strong> {solicitud.barrio}</p>
          <p><strong>Teléfono:</strong> {solicitud.telefono}</p>
          <p><strong>Tipo de vivienda:</strong> {solicitud.tipoVivienda}</p>
          <p><strong>Acuerdo familiar:</strong> {solicitud.acuerdoFamiliar}</p>
          <p><strong>¿Otras mascotas?:</strong> {solicitud.otrasMascotas}</p>
          <p><strong>Motivo de adopción:</strong> {solicitud.motivoAdopcion}</p>
          <p><strong>Lugar donde vivirá:</strong> {solicitud.lugarMascota}</p>
          <p><strong>Tiempo que pasará sola:</strong> {solicitud.tiempoSola}</p>
          <p><strong>¿Qué harías si te mudas?:</strong> {solicitud.queHariasMudanza}</p>
          <p><strong>Compromiso de cuidados:</strong> {solicitud.compromisoCuidados}</p>
          <p><strong>Mascota:</strong> {solicitud.mascota?.nombre}</p>
        </div>
        <div className="space-y-2">
          <p><strong>Cédula:</strong> {solicitud.cedula}</p>
          <p><strong>Dirección:</strong> {solicitud.direccion}</p>
          <p><strong>Ciudad:</strong> {solicitud.ciudad}</p>
          <p><strong>Correo:</strong> {solicitud.correo}</p>
          <p><strong>Tenencia:</strong> {solicitud.tenenciaVivienda}</p>
          <p><strong>¿Hay niños?:</strong> {solicitud.hayNinos}</p>
          <p><strong>¿Alergias?:</strong> {solicitud.alergias}</p>
          <p><strong>Reacción ante problemas:</strong> {solicitud.reaccionProblemas}</p>
          <p><strong>Responsable:</strong> {solicitud.responsable}</p>
          <p><strong>Acepta visita virtual:</strong> {solicitud.aceptaVisitaVirtual}</p>
          <p><strong>Acepta contrato:</strong> {solicitud.aceptaContrato}</p>
        </div>
      </div>

      {/* Botones archivos (Cloudinary) */}
      <div className="flex flex-wrap gap-4 mt-6">
        {urlDocId && (
          <a
            href={urlDocId}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-purple-500 transition"
          >
            Ver Documento de Identidad
          </a>
        )}
        {urlResidencia && (
          <a
            href={urlResidencia}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-purple-500 transition"
          >
            Ver Prueba de Residencia
          </a>
        )}
      </div>
    </div>
  );
};

export default DetallesMiSolicitudAdopcion;
