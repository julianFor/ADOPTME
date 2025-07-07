import { useState } from 'react';
import { FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import {
  agendarEntrevista,
  aprobarEtapa,
  rechazarEtapa,
} from '../../services/procesoService';

const EtapaEntrevista = ({ proceso, setProceso, procesoId, editable = true }) => {
  const [fecha, setFecha] = useState(proceso?.entrevista?.fechaEntrevista?.split('T')[0] || '');
  const [enlace, setEnlace] = useState(proceso?.entrevista?.enlaceMeet || '');
  const [observaciones, setObservaciones] = useState(proceso?.entrevista?.observacionesEntrevista || '');

  const handleGuardar = async () => {
    try {
      const datos = {
        fechaEntrevista: fecha,
        enlaceMeet: enlace,
        observacionesEntrevista: observaciones
      };
      const res = await agendarEntrevista(procesoId, datos);
      setProceso(res.proceso);
      alert('Entrevista guardada correctamente.');
    } catch (error) {
      console.error('Error al guardar entrevista:', error.response?.data || error);
      alert('Error al guardar entrevista');
    }
  };

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'entrevista');
      setProceso(res.proceso);
      alert('Entrevista aprobada correctamente.');
    } catch (error) {
      console.error('Error al aprobar entrevista:', error);
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;

    try {
      const res = await rechazarEtapa(procesoId, 'entrevista', motivo);
      setProceso(res.proceso);
      alert('Entrevista rechazada.');
    } catch (error) {
      console.error('Error al rechazar entrevista:', error);
    }
  };

  const generarGoogleCalendarURL = () => {
    if (!fecha) {
      alert('Debes ingresar la fecha de la entrevista');
      return;
    }

    const titulo = encodeURIComponent('Entrevista de Adopción');
    const detalles = encodeURIComponent(`Observaciones: ${observaciones || 'N/A'}`);
    const location = ''; // dejamos que Google Calendar cree el Meet

    const start = new Date(`${fecha}T10:00:00`);
    const end = new Date(`${fecha}T11:00:00`);
    const formato = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${formato(start)}/${formato(end)}&details=${detalles}&location=${location}&sf=true&output=xml`;

    window.open(url, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Agendar Entrevista Virtual</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="font-semibold mb-1">Fecha Entrevista:</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={!editable}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1">Enlace MEET</label>
          <input
            type="text"
            placeholder="https://meet.google.com/xxx-xxxx-xxx"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            readOnly={!editable}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Observaciones</label>
          <input
            type="text"
            placeholder="Notas u observaciones"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            readOnly={!editable}
          />
        </div>
      </form>

      {editable && (
        <>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              type="button"
              onClick={generarGoogleCalendarURL}
              className="flex items-center gap-2 px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-50 transition"
            >
              <img
                src="https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png"
                alt="Google"
                className="w-5 h-5"
              />
              Agendar en Google Calendar
            </button>

            <button
              type="button"
              onClick={handleGuardar}
              className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-500 transition"
            >
              Guardar
            </button>
          </div>

          <div className="flex gap-4 mt-6 justify-end">
            <button
              type="button"
              onClick={handleRechazar}
              className="flex items-center gap-2 bg-red-300 text-white px-5 py-2 rounded-full hover:bg-red-400 transition"
            >
              <FaTimes /> Rechazar
            </button>

            <button
              type="button"
              onClick={handleAprobar}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition"
            >
              <FaCheck /> Aprobar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EtapaEntrevista;
