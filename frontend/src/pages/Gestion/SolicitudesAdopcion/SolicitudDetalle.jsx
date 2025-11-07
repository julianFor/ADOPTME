import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSolicitudById,
  rechazarSolicitud
} from '../../../services/solicitudAdopcionService';
import { crearProceso } from '../../../services/procesoService';
import { useToast } from '../../../components/ui/ToastProvider';

import { getDocumentUrl } from '../../../utils/cloudinaryUtils';

const SolicitudDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await getSolicitudById(id);
        setSolicitud(response);
      } catch (error_) {
        console.error('Error al cargar solicitud:', error_);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [id]);

  const handleAprobar = async () => {
    try {
      await crearProceso(solicitud._id);
      success('Solicitud aprobada y proceso de adopción creado.', { title: 'Aprobada' });
      navigate('/dashboard/admin/solicitudes-adopcion');
    } catch (error_) {
      console.error('Error al aprobar solicitud:', error_);
      error('No se pudo aprobar la solicitud.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    try {
      await rechazarSolicitud(solicitud._id);
      success('Solicitud rechazada.', { title: 'Rechazada' });
      navigate('/dashboard/admin/solicitudes-adopcion');
    } catch (error_) {
      console.error('Error al rechazar solicitud:', error_);
      error('No se pudo rechazar la solicitud.', { title: 'Error' });
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando solicitud...</p>;
  if (!solicitud) return <p className="text-center mt-10">Solicitud no encontrada</p>;

  const urlDocId = getDocumentUrl(solicitud.documentoIdentidad);
  const urlResidencia = getDocumentUrl(solicitud.pruebaResidencia);

  return (
    <div className="max-w-5xl ml-10 mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-purple-600 mb-6">Detalle de Solicitud de Adopción</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <InfoField label="Nombre completo" value={solicitud.nombreCompleto} />
        <InfoField label="Cédula" value={solicitud.cedula} />
        <InfoField label="Fecha de nacimiento" value={solicitud.fechaNacimiento?.split('T')[0]} />
        <InfoField label="Dirección" value={solicitud.direccion} />
        <InfoField label="Barrio" value={solicitud.barrio} />
        <InfoField label="Ciudad" value={solicitud.ciudad} />
        <InfoField label="Teléfono" value={solicitud.telefono} />
        <InfoField label="Correo" value={solicitud.correo} />
        <InfoField label="Tipo de vivienda" value={solicitud.tipoVivienda} />
        <InfoField label="Tenencia" value={solicitud.tenenciaVivienda} />
        <InfoField label="Acuerdo familiar" value={solicitud.acuerdoFamiliar} />
        <InfoField label="¿Hay niños?" value={solicitud.hayNinos} />
        <InfoField label="¿Otras mascotas?" value={solicitud.otrasMascotas} />
        <InfoField label="¿Alergias?" value={solicitud.alergias} />
        <InfoField label="Motivo de adopción" value={solicitud.motivoAdopcion} className="md:col-span-2" />
        <InfoField label="Lugar donde vivirá" value={solicitud.lugarMascota} />
        <InfoField label="Reacción ante problemas" value={solicitud.reaccionProblemas} />
        <InfoField label="Tiempo que pasará sola" value={solicitud.tiempoSola} />
        <InfoField label="Responsable" value={solicitud.responsable} />
        <InfoField label="¿Qué harías si te mudas?" value={solicitud.queHariasMudanza} />
        <InfoField label="Acepta visita virtual" value={solicitud.aceptaVisitaVirtual} />
        <InfoField label="Compromiso de cuidados" value={solicitud.compromisoCuidados} />
        <InfoField label="Acepta contrato" value={solicitud.aceptaContrato} />
        <InfoField label="Mascota" value={solicitud.mascota?.nombre} />
      </div>

      <div className="mt-8 flex gap-4 flex-wrap">
        <DocumentButton url={urlDocId} label="Ver Documento de Identidad" />
        <DocumentButton url={urlResidencia} label="Ver Prueba de Residencia" />
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

const InfoField = ({ label, value, className = '' }) => (
  <p className={className}>
    <strong>{label}:</strong> {value}
  </p>
);

InfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  className: PropTypes.string
};

const DocumentButton = ({ url, label }) => {
  if (!url) return null;
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
    >
      {label}
    </a>
  );
};

DocumentButton.propTypes = {
  url: PropTypes.string,
  label: PropTypes.string.isRequired
};

export default SolicitudDetalle;