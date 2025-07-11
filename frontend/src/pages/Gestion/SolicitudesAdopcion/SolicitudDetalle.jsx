import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getSolicitudById,
  rechazarSolicitud
} from '../../../services/solicitudAdopcionService';
import { crearProceso } from '../../../services/procesoService';

const SolicitudDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await getSolicitudById(id);
        setSolicitud(response);
      } catch (error) {
        console.error('Error al cargar solicitud:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSolicitud();
  }, [id]);

  const handleAprobar = async () => {
    try {
      await crearProceso(solicitud._id);
      alert('Solicitud aprobada y proceso de adopción creado.');
      navigate('/dashboard/admin/solicitudes-adopcion');
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      alert('No se pudo aprobar la solicitud.');
    }
  };

  const handleRechazar = async () => {
    try {
      await rechazarSolicitud(solicitud._id);
      alert('Solicitud rechazada.');
      navigate('/dashboard/admin/solicitudes-adopcion');
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      alert('No se pudo rechazar la solicitud.');
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando solicitud...</p>;
  if (!solicitud) return <p className="text-center mt-10">Solicitud no encontrada</p>;

  return (
    <div className="max-w-5xl ml-10 mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-purple-600 mb-6">Detalle de Solicitud de Adopción</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <p><strong>Nombre completo:</strong> {solicitud.nombreCompleto}</p>
        <p><strong>Cédula:</strong> {solicitud.cedula}</p>
        <p><strong>Fecha de nacimiento:</strong> {solicitud.fechaNacimiento?.split('T')[0]}</p>
        <p><strong>Dirección:</strong> {solicitud.direccion}</p>
        <p><strong>Barrio:</strong> {solicitud.barrio}</p>
        <p><strong>Ciudad:</strong> {solicitud.ciudad}</p>
        <p><strong>Teléfono:</strong> {solicitud.telefono}</p>
        <p><strong>Correo:</strong> {solicitud.correo}</p>
        <p><strong>Tipo de vivienda:</strong> {solicitud.tipoVivienda}</p>
        <p><strong>Tenencia:</strong> {solicitud.tenenciaVivienda}</p>
        <p><strong>Acuerdo familiar:</strong> {solicitud.acuerdoFamiliar}</p>
        <p><strong>¿Hay niños?:</strong> {solicitud.hayNinos}</p>
        <p><strong>¿Otras mascotas?:</strong> {solicitud.otrasMascotas}</p>
        <p><strong>¿Alergias?:</strong> {solicitud.alergias}</p>
        <p className="md:col-span-2"><strong>Motivo de adopción:</strong> {solicitud.motivoAdopcion}</p>
        <p><strong>Lugar donde vivirá:</strong> {solicitud.lugarMascota}</p>
        <p><strong>Reacción ante problemas:</strong> {solicitud.reaccionProblemas}</p>
        <p><strong>Tiempo que pasará sola:</strong> {solicitud.tiempoSola}</p>
        <p><strong>Responsable:</strong> {solicitud.responsable}</p>
        <p><strong>¿Qué harías si te mudas?:</strong> {solicitud.queHariasMudanza}</p>
        <p><strong>Acepta visita virtual:</strong> {solicitud.aceptaVisitaVirtual}</p>
        <p><strong>Compromiso de cuidados:</strong> {solicitud.compromisoCuidados}</p>
        <p><strong>Acepta contrato:</strong> {solicitud.aceptaContrato}</p>
        <p><strong>Mascota:</strong> {solicitud.mascota?.nombre}</p>
      </div>

      <div className="mt-8 flex gap-4 flex-wrap">
        {solicitud.documentoIdentidad && (
          <a
            href={`http://localhost:3000/uploads/${solicitud.documentoIdentidad}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Ver Documento de Identidad
          </a>
        )}
        {solicitud.pruebaResidencia && (
          <a
            href={`http://localhost:3000/uploads/${solicitud.pruebaResidencia}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Ver Prueba de Residencia
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

export default SolicitudDetalle;
