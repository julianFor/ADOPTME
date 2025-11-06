// src/components/etapas/EtapaFormulario.jsx
import PropTypes from 'prop-types';
import { FaCheckCircle } from 'react-icons/fa';

/* ========= Helpers Cloudinary robustos ========= */

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/** ¿Es http(s) URL? */
const isHttpUrl = (s) => typeof s === 'string' && /^https?:\/\//i.test(s);

/** Busca cualquier URL http(s) en propiedades comunes (incluye anidados simples) */
const pickHttpUrlFromAny = (asset) => {
  if (!asset || typeof asset !== 'object') return '';
  // directas
  for (const key of ['secure_url', 'url', 'path', 'href', 'link']) {
    const val = asset?.[key];
    if (isHttpUrl(val)) return val;
  }
  // anidados de 1 nivel (algunos serializers guardan { url: { secure_url } })
  for (const key of Object.keys(asset)) {
    const v = asset[key];
    if (v && typeof v === 'object') {
      const found = pickHttpUrlFromAny(v);
      if (found) return found;
    }
  }
  return '';
};

const normalizeRt = (asset) => {
  // Si es PDF u otros no-imagen, usar 'raw'
  const fmt = (asset?.format || '').toLowerCase();
  if (fmt === 'pdf' || fmt === 'zip' || fmt === 'txt') return 'raw';
  return asset?.resource_type || 'image';
};

const buildFromObject = (asset, cloud = CLOUD) => {
  // 1) si ya hay http en cualquier propiedad conocida, úsala
  const direct = pickHttpUrlFromAny(asset);
  if (direct) return direct;

  // 2) construir desde public_id/filename
  const public_id = asset?.public_id || asset?.filename;
  if (!cloud || !public_id) return '';

  const rt = normalizeRt(asset);
  const fmt = (asset?.format || '').toLowerCase();
  const suffix = fmt ? `.${fmt}` : '';
  return `https://res.cloudinary.com/${cloud}/${rt}/upload/${public_id}${suffix}`;
};

const buildFromPublicId = (publicId, cloud = CLOUD) => {
  if (isHttpUrl(publicId)) return publicId; // ya viene completo
  if (!cloud || !publicId) return '';
  return `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`;
};

/** Resuelve URL Cloudinary desde objeto/string/array */
const getCloudinaryUrl = (asset) => {
  if (!asset) return '';
  if (Array.isArray(asset)) return getCloudinaryUrl(asset[0]);
  if (isHttpUrl(asset)) return asset;
  if (typeof asset === 'object') return buildFromObject(asset);
  if (typeof asset === 'string') return buildFromPublicId(asset);
  return '';
};

/* =================== Componente =================== */

const EtapaFormulario = ({ proceso }) => {
  const solicitud = proceso?.solicitud;

  if (!solicitud) {
    return <p className="text-gray-500">No se encontró información de la solicitud.</p>;
  }

  const urlDocId = getCloudinaryUrl(solicitud.documentoIdentidad);
  const urlResidencia = getCloudinaryUrl(solicitud.pruebaResidencia);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Alerta de formulario aprobado */}
      <div className="border-2 border-purple-500 bg-white text-purple-600 rounded-lg p-4 flex items-center gap-3 mb-6">
        <FaCheckCircle className="text-2xl" />
        <p className="font-medium">
          El formulario del adoptante ha sido aprobado. Puedes continuar con el proceso.
        </p>
      </div>

      {/* Título */}
      <h2 className="text-xl font-bold text-purple-600 mb-4">Detalle de Solicitud de Adopción</h2>

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-sm mb-6">
        {/* Columna izquierda */}
        <div className="space-y-2">
          <p><strong>Nombre completo:</strong> {solicitud.nombreCompleto}</p>
          <p><strong>Fecha de nacimiento:</strong> {solicitud.fechaNacimiento?.split('T')[0]}</p>
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

        {/* Columna derecha */}
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

EtapaFormulario.propTypes = {
  proceso: PropTypes.shape({
    solicitud: PropTypes.shape({
      nombreCompleto: PropTypes.string,
      fechaNacimiento: PropTypes.string,
      barrio: PropTypes.string,
      telefono: PropTypes.string,
      tipoVivienda: PropTypes.string,
      acuerdoFamiliar: PropTypes.string,
      otrasMascotas: PropTypes.string,
      motivoAdopcion: PropTypes.string,
      lugarMascota: PropTypes.string,
      tiempoSola: PropTypes.string,
      queHariasMudanza: PropTypes.string,
      compromisoCuidados: PropTypes.string,
      mascota: PropTypes.shape({ nombre: PropTypes.string }),
      cedula: PropTypes.string,
      direccion: PropTypes.string,
      ciudad: PropTypes.string,
      correo: PropTypes.string,
      tenenciaVivienda: PropTypes.string,
      hayNinos: PropTypes.string,
      alergias: PropTypes.string,
      reaccionProblemas: PropTypes.string,
      responsable: PropTypes.string,
      aceptaVisitaVirtual: PropTypes.string,
      aceptaContrato: PropTypes.string,
      documentoIdentidad: PropTypes.any,
      pruebaResidencia: PropTypes.any,
    }),
  }).isRequired,
};

export default EtapaFormulario;
