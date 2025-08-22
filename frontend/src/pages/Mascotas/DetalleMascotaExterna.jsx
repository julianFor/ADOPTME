import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, User, MessageCircle } from 'lucide-react';
import PeluditosRelacionados from './PeluditosRelacionados';
import axiosClient from '../../services/axiosClient';

const DetalleMascotaExterna = () => {
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerMascota = async () => {
      try {
        const response = await axiosClient.get(`/mascotas/${id}`);
        setMascota(response.data);
      } catch (error) {
        console.error("Error al obtener la mascota:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerMascota();
  }, [id]);

  if (cargando) {
    return (
      <div className="pt-28 text-center text-gray-500 text-lg">
        Cargando datos de la mascota...
        <div className="mt-6 flex justify-center">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="pt-28 text-center text-red-500 text-lg">
        No se encontró la mascota 😿
      </div>
    );
  }

  const { contactoExterno = {} } = mascota;

  // === Imagen principal (misma lógica que en Adoptar) ===
  const getImagenPrincipal = (imagenes) => {
    if (!imagenes) return "https://via.placeholder.com/600x400?text=AdoptMe";
    const primera = Array.isArray(imagenes) ? imagenes[0] : imagenes; // compatibilidad array/string
    if (!primera) return "https://via.placeholder.com/600x400?text=AdoptMe";
    if (typeof primera === "string" && primera.startsWith("http")) return primera; // Cloudinary u otra URL
    return "https://via.placeholder.com/600x400?text=AdoptMe";
  };

  return (
    <div className="pt-10">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-600 mb-10">
        Presentación de Mascota <span className="inline-block"><img
          src="/paw-title.svg"
          alt="Huellita"
          className="h-7 sm:h-8 w-auto select-none"
          draggable="false"
        /></span>
      </h2>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-5">
        {/* Imagen */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={getImagenPrincipal(mascota.imagenes)}
            alt={mascota.nombre}
            className="rounded-3xl bg-green-100 max-h-[400px] object-contain"
          />
        </div>

        {/* Información */}
        <div className="md:w-1/2 space-y-6">
          <h3 className="text-3xl font-extrabold leading-snug text-gray-600">
            Hola mi nombre es{' '}
            <span className="text-purple-500">{mascota.nombre}</span>
          </h3>

          {/* Contacto externo */}
          <div className="space-y-1 text-sm text-gray-700">
            <p className="flex items-center gap-2">
              <User className="w-4 h-4" /> {contactoExterno.nombre || 'Sin nombre'}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> {contactoExterno.telefono || 'Sin teléfono'}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> {contactoExterno.correo || 'Sin correo'}
            </p>
            <p className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 mt-0.5" /> {contactoExterno.observaciones || 'Sin comentarios'}
            </p>
          </div>

          {/* Descripción */}
          <div>
            <p className="text-lg font-semibold mb-1">Descripción:</p>
            <p className="text-gray-700 text-base leading-relaxed">
              {mascota.descripcion}
            </p>
          </div>

          {/* Características */}
          <div>
            <p className="text-lg font-semibold mb-2">Características:</p>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700 capitalize">
                    {mascota.sexo}
                  </span>
                  <span className="text-xs text-gray-600">Sexo</span>
                </div>

                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700">
                    {calcularEdad(mascota.fechaNacimiento)}
                  </span>
                  <span className="text-xs text-gray-600">Edad</span>
                </div>

                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700">
                    {mascota.esterilizado ? 'Sí' : 'No'}
                  </span>
                  <span className="text-xs text-gray-600">Esterilizad@</span>
                </div>

                <div className="bg-orange-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700 capitalize">
                    {mascota.origen}
                  </span>
                  <span className="text-xs text-gray-600">Origen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relacionados */}
      <PeluditosRelacionados origen="externo" mascotaId={mascota._id} />
    </div>
  );
};

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "N/A";
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let años = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) años--;
  if (años <= 0) {
    const meses = Math.max(
      1,
      (hoy.getMonth() + 12 * hoy.getFullYear()) -
      (nacimiento.getMonth() + 12 * nacimiento.getFullYear())
    );
    return `${meses} mes${meses !== 1 ? "es" : ""}`;
  }
  return `${años} año${años !== 1 ? "s" : ""}`;
}

export default DetalleMascotaExterna;
