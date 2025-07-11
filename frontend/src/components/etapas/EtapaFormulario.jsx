// src/components/etapas/EtapaFormulario.jsx
import { FaCheckCircle } from 'react-icons/fa';

const EtapaFormulario = ({ proceso }) => {
  const solicitud = proceso?.solicitud;

  if (!solicitud) {
    return <p className="text-gray-500">No se encontró información de la solicitud.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Alerta de formulario aprobado */}
      <div className="border-2 border-purple-500 bg-white text-purple-600 rounded-lg p-4 flex items-center gap-3 mb-6">
        <FaCheckCircle className="text-2xl" />
        <p className="font-medium">El formulario del adoptante ha sido aprobado. Puedes continuar con el proceso.</p>
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

      {/* Botones PDF */}
      <div className="flex flex-wrap gap-4 mt-6">
        {solicitud.documentoIdentidad && (
          <a
            href={`http://localhost:3000/uploads/${solicitud.documentoIdentidad}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-purple-500 transition"
          >
            Ver Documento de Identidad
          </a>
        )}

        {solicitud.pruebaResidencia && (
          <a
            href={`http://localhost:3000/uploads/${solicitud.pruebaResidencia}`}
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

export default EtapaFormulario;
