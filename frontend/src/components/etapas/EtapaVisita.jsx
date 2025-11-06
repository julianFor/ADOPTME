// frontend/src/components/etapas/EtapaVisita.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import {
  registrarVisita,
  aprobarEtapa,
  rechazarEtapa,
} from '../../services/procesoService';
// toasts
import { useToast } from '../../components/ui/ToastProvider';

const EtapaVisita = ({ proceso, setProceso, procesoId, editable = true }) => {
  const [fecha, setFecha] = useState(proceso?.visita?.fechaVisita?.split('T')[0] || '');
  const [hora, setHora] = useState(proceso?.visita?.horaVisita || '');
  const [responsable, setResponsable] = useState(proceso?.visita?.responsable || '');
  const [observaciones, setObservaciones] = useState(proceso?.visita?.observacionesVisita || '');

  const { success, error, warning } = useToast();

  const puedeGestionarEtapa = () => {
    return proceso?.entrevista?.aprobada === true;
  };

  const handleGuardar = async () => {
    try {
      const datos = {
        fechaVisita: fecha,
        horaVisita: hora,
        responsable,
        observacionesVisita: observaciones,
      };
      const res = await registrarVisita(procesoId, datos);
      setProceso(res.proceso);
      success('Visita guardada correctamente.', { title: 'Guardado' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al guardar visita:', err?.response?.data || err);
      error('Error al guardar visita.', { title: 'Error' });
    }
  };

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'visita');
      setProceso(res.proceso);
      success('Visita aprobada correctamente.', { title: 'Aprobada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al aprobar visita:', err);
      error('No se pudo aprobar la visita.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;

    try {
      const res = await rechazarEtapa(procesoId, 'visita', motivo);
      setProceso(res.proceso);
      success('Visita rechazada.', { title: 'Rechazada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al rechazar visita:', err);
      error('No se pudo rechazar la visita.', { title: 'Error' });
    }
  };

  const generarGoogleCalendarURL = () => {
    if (!fecha || !hora || !responsable) {
      warning('Debes ingresar fecha, hora y responsable para agendar.', { title: 'Advertencia' });
      return;
    }

    const titulo = encodeURIComponent('Visita a la Fundación');
    const detalles = encodeURIComponent(`Responsable: ${responsable}\nObservaciones: ${observaciones}`);
    const location = '';

    const start = new Date(`${fecha}T${hora}`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    // Usar replaceAll (con regex global) en lugar de replace(/.../g, '')
    const formato = (date) => date.toISOString().replaceAll(/[-:]|\.\d{3}/g, '');

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${formato(start)}/${formato(end)}&details=${detalles}&location=${location}&sf=true&output=xml`;

    // Preferir globalThis a window
    globalThis.open?.(url, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Agendar Visita a la Fundación</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="fecha-visita">Fecha Visita:</label>
          <input
            id="fecha-visita"
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={!editable}
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold mb-1" htmlFor="hora-visita">Hora Visita:</label>
          <input
            id="hora-visita"
            type="time"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            disabled={!editable}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="responsable-visita">Responsable en la Fundación</label>
          <input
            id="responsable-visita"
            type="text"
            placeholder="Nombre del cuidador o voluntario"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            readOnly={!editable}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="observaciones-visita">Observaciones</label>
          <input
            id="observaciones-visita"
            type="text"
            placeholder="Notas u observaciones de la visita"
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
              {' '}Agendar en Google Calendar
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
              disabled={!puedeGestionarEtapa()}
              className="flex items-center gap-2 bg-red-300 text-white px-5 py-2 rounded-full hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes /> Rechazar
            </button>

            <button
              type="button"
              onClick={handleAprobar}
              disabled={!puedeGestionarEtapa()}
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck /> Aprobar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

EtapaVisita.propTypes = {
  procesoId: PropTypes.string.isRequired,
  setProceso: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  proceso: PropTypes.shape({
    entrevista: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    visita: PropTypes.shape({
      fechaVisita: PropTypes.string,
      horaVisita: PropTypes.string,
      responsable: PropTypes.string,
      observacionesVisita: PropTypes.string,
    }),
  }).isRequired,
};

export default EtapaVisita;
