// src/pages/Gestion/SolicitudesPublicacion/DetalleSolicitudPublicacion.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  obtenerSolicitudPublicacionPorId,
  aprobarSolicitudPublicacion,
  rechazarSolicitudPublicacion,
} from '../../../services/solicitudPublicacionService';

// ✅ importamos el hook de toasts
import { useToast } from '../../../components/ui/ToastProvider';

const traduccionesConfirmaciones = {
  esResponsable: 'Es responsable',
  noSolicitaPago: 'No solicita pago',
  aceptaVerificacion: 'Acepta verificación',
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v);
const isRawExt = (v = '') =>
  /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i.test(v);

const buildFromPublicId = (publicId) => {
  const resourceType = isRawExt(publicId) ? 'raw' : 'image';
  return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${publicId}`;
};

const getAssetUrl = (asset) => {
  if (!asset) return '';
  if (typeof asset === 'string') {
    return isHttpUrl(asset) ? asset : buildFromPublicId(asset);
  }
  if (asset.secure_url) return asset.secure_url;
  if (asset.url) return asset.url;
  if (asset.public_id) return buildFromPublicId(asset.public_id);
  return '';
};

const isImageUrl = (url) => url && !isRawExt(url);

const fmtDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

const DetalleSolicitudPublicacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  const { success, error } = useToast(); // 👈 usamos toasts solo aquí

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await obtenerSolicitudPublicacionPorId(id);
        setSolicitud(response.solicitud);
      } catch (err) {
        console.error('Error al obtener la solicitud:', err);
        error('No se pudo cargar la solicitud.', { title: 'Error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [id, error]);

  const handleAprobar = async () => {
    try {
      await aprobarSolicitudPublicacion(solicitud._id);
      success('Solicitud aprobada y mascota publicada.', { title: 'Aprobada' });
      navigate('/dashboard/admin/solicitudes-publicacion');
    } catch (err) {
      console.error('Error al aprobar la solicitud:', err);
      error('No se pudo aprobar la solicitud.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    try {
      await rechazarSolicitudPublicacion(
        solicitud._id,
        'No cumple con los criterios de publicación'
      );
      success('Solicitud rechazada.', { title: 'Rechazada' });
      navigate('/dashboard/admin/solicitudes-publicacion');
    } catch (err) {
      console.error('Error al rechazar la solicitud:', err);
      error('No se pudo rechazar la solicitud.', { title: 'Error' });
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando solicitud...</p>;
  if (!solicitud) return <p className="text-center mt-10">Solicitud no encontrada</p>;

  const { mascota = {}, contacto = {} } = solicitud;

  const mainAsset = solicitud.imagenes?.[0];
  const mainUrl = getAssetUrl(mainAsset);
  const mainIsImage = isImageUrl(mainUrl);

  const docIdentidadUrl = getAssetUrl(solicitud.documentoIdentidad);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">
        Detalle de Solicitud de Publicación
      </h2>

      {mainUrl && (
        <div className="flex justify-center mb-6">
          {mainIsImage ? (
            <img
              src={mainUrl}
              alt="Mascota"
              className="w-72 h-72 object-cover rounded-xl shadow-md"
            />
          ) : (
            <a
              href={mainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
            >
              Ver archivo principal
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <p><strong>Nombre Mascota:</strong> {mascota.nombre}</p>
        <p><strong>Especie:</strong> {mascota.especie}</p>
        <p><strong>Raza:</strong> {mascota.raza}</p>
        <p><strong>Sexo:</strong> {mascota.sexo}</p>
        <p><strong>Tamaño:</strong> {mascota.tamaño}</p>
        <p><strong>Estado de salud:</strong> {mascota.estadoSalud}</p>
        <p><strong>Fecha de nacimiento:</strong> {fmtDate(mascota.fechaNacimiento)}</p>
        <p className="md:col-span-2"><strong>Personalidad:</strong> {mascota.personalidad}</p>
        <p className="md:col-span-2"><strong>Historia:</strong> {mascota.historia}</p>

        <p><strong>Contacto nombre:</strong> {contacto.nombre}</p>
        <p><strong>Teléfono:</strong> {contacto.telefono}</p>
        <p><strong>Correo:</strong> {contacto.correo}</p>
        <p><strong>Ciudad:</strong> {contacto.ciudad}</p>
        <p><strong>Barrio:</strong> {contacto.barrio}</p>

        <p className="md:col-span-2">
          <strong>Condiciones:</strong><br />
          {solicitud.condiciones ? (
            <ul className="list-disc list-inside mt-1">
              {Object.entries(solicitud.condiciones).map(([key, val]) => (
                <li key={key}>
                  <strong>{key}</strong>: {val ? 'Sí' : 'No'}
                </li>
              ))}
            </ul>
          ) : 'No especificadas'}
        </p>

        <p className="md:col-span-2">
          <strong>Confirmaciones:</strong><br />
          {typeof solicitud.confirmaciones === 'object' && !Array.isArray(solicitud.confirmaciones) ? (
            <ul className="list-disc list-inside mt-1">
              {Object.entries(solicitud.confirmaciones).map(([key, val]) => (
                <li key={key}>
                  <strong>{traduccionesConfirmaciones[key] || key}:</strong> {val ? 'Sí' : 'No'}
                </li>
              ))}
            </ul>
          ) : solicitud.confirmaciones ? (
            solicitud.confirmaciones
          ) : (
            'No especificadas'
          )}
        </p>

        <p><strong>Estado:</strong> <span className="capitalize">{solicitud.estado}</span></p>
      </div>

      <div className="mt-8 flex gap-4 flex-wrap">
        {docIdentidadUrl && (
          <a
            href={docIdentidadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Ver Documento de Identidad
          </a>
        )}
      </div>

      <div className="mt-10 flex gap-4 justify-end">
        <button
          onClick={handleRechazar}
          className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Rechazar
        </button>
        <button
          onClick={handleAprobar}
          className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Aprobar
        </button>
      </div>
    </div>
  );
};

export default DetalleSolicitudPublicacion;
