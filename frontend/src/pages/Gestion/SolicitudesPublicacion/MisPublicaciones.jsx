// src/pages/Gestion/Publicaciones/MisPublicaciones.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisPublicaciones } from '../../../services/solicitudPublicacionService';
import PetCard from '../../../components/Home/PetCard';
import { FaPaw } from 'react-icons/fa';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

/* ===== Helpers de fechas ===== */
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'N/A';
  const n = new Date(fechaNacimiento);
  const h = new Date();
  let años = h.getFullYear() - n.getFullYear();
  const meses = h.getMonth() - n.getMonth();
  const dias = h.getDate() - n.getDate();
  if (meses < 0 || (meses === 0 && dias < 0)) años--;
  if (años <= 0) {
    const totalMeses = h.getMonth() - n.getMonth() + 12 * (h.getFullYear() - n.getFullYear());
    const m = Math.max(totalMeses, 1);
    return `${m} mes${m === 1 ? '' : 'es'}`;
  }
  return `${años} año${años === 1 ? '' : 's'}`;
}

/* ===== Helpers Cloudinary ===== */
const isHttpUrl = (v) => typeof v === 'string' && /^https?:\/\//i.test(v);
const isRawExt = (v = '') => /\.(pdf|docx?|xlsx?|pptx?|txt|csv|zip|rar)$/i.test(v);
const isCloudinary = (u = '') => /res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\//i.test(u);

const buildFromPublicId = (publicId) => {
  const isRaw = isRawExt(publicId);
  const base = `https://res.cloudinary.com/${CLOUD_NAME}/${isRaw ? 'raw' : 'image'}/upload/`;
  if (isRaw) return `${base}${publicId}`;
  // imágenes con transformaciones
  return `${base}f_auto,q_auto,c_fill,g_auto,w_600/${publicId}`;
};

const addImgTransformsIfCloudinary = (url) => {
  if (!isCloudinary(url)) return url;
  // Inserta transformaciones si no existen ya
  // .../image/upload/  -> .../image/upload/f_auto,q_auto,c_fill,g_auto,w_600/
  return url.replace(/(\/image\/upload\/)(?!v\d)/i, '$1f_auto,q_auto,c_fill,g_auto,w_600/');
};

const getAssetUrl = (asset) => {
  if (!asset) return '';
  if (typeof asset === 'string') {
    if (isHttpUrl(asset)) {
      return isRawExt(asset) ? '' : addImgTransformsIfCloudinary(asset);
    }
    return buildFromPublicId(asset);
  }
  if (asset.secure_url) return isRawExt(asset.secure_url) ? '' : addImgTransformsIfCloudinary(asset.secure_url);
  if (asset.url) return isRawExt(asset.url) ? '' : addImgTransformsIfCloudinary(asset.url);
  if (asset.public_id) return buildFromPublicId(asset.public_id);
  return '';
};

const pickFirstImageUrl = (imagenes) => {
  if (!imagenes || !Array.isArray(imagenes)) return '';
  for (const it of imagenes) {
    const url = getAssetUrl(it);
    if (url && !isRawExt(url)) return url;
  }
  return '';
};

const PLACEHOLDER =
  'data:image/svg+xml;base64,' +
  btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
      <rect width="100%" height="100%" fill="#eee"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="20">
        Sin imagen
      </text>
    </svg>`
  );

const MisPublicaciones = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const data = await getMisPublicaciones(); 
        setMascotas(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al obtener mis publicaciones:', error);
        setMascotas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMascotas();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6 flex items-center justify-center gap-2">
        <FaPaw className="text-3xl" />
        Mis Publicaciones
      </h2>

      {(() => {
        if (loading) {
          return <p className="text-center">Cargando...</p>;
        }
        if (mascotas.length === 0) {
          return <p className="text-center text-gray-500">No has publicado ninguna mascota todavía.</p>;
        }
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
            {mascotas.map((mascota) => {
              if (!mascota || typeof mascota !== 'object' || !mascota.nombre || typeof mascota.sexo !== 'string') {
                console.warn('Mascota inválida detectada:', mascota);
                return null;
              }

              const imgUrl = pickFirstImageUrl(mascota.imagenes) || PLACEHOLDER;

              return (
                <PetCard
                  key={mascota._id}
                  nombre={mascota.nombre}
                  sexo={mascota.sexo}
                  edad={calcularEdad(mascota.fechaNacimiento)}
                  descripcion={mascota.descripcion || 'Sin descripción.'}
                  imagen={imgUrl}
                  redirigir={() => navigate(`/mascotas/${mascota._id}`)}
                />
              );
            })}
          </div>
        );
      })()}
    </div>
  );
};

export default MisPublicaciones;
