import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerSolicitudPublicacionPorId } from "../../../services/solicitudPublicacionService";
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

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
      {imagenes?.[0] && (
        <div className="flex justify-center mb-4">
          <img
            src={`http://localhost:3000/uploads/${imagenes[0]}`}
            alt="Mascota"
            className="w-40 h-40 object-cover rounded-xl shadow"
          />
        </div>
      )}

      {/* Datos distribuidos en 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-6">
        <p><strong>Nombre Mascota:</strong> {mascota?.nombre}</p>
        <p><strong>Especie:</strong> {mascota?.especie}</p>
        <p><strong>Raza:</strong> {mascota?.raza}</p>
        <p><strong>Sexo:</strong> {mascota?.sexo}</p>
        <p><strong>Tamaño:</strong> {mascota?.tamaño}</p>
        <p><strong>Estado de salud:</strong> {mascota?.estadoSalud}</p>
        <p><strong>Fecha de nacimiento:</strong> {mascota?.fechaNacimiento?.split("T")[0]}</p>
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
              <li key={key}><strong>{key}:</strong> {val ? "Sí" : "No"}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Documento */}
      {documentoIdentidad && (
        <div className="mt-6">
          <a
            href={`http://localhost:3000/uploads/${documentoIdentidad}`}
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
