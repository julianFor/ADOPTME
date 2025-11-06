// frontend/src/components/etapas/EtapaEntrega.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { aprobarEtapa, rechazarEtapa, registrarEntrega } from '../../services/procesoService';
import useUser from '../../hooks/useUser';
// toasts
import { useToast } from '../../components/ui/ToastProvider';

const EtapaEntrega = ({ procesoId, setProceso, proceso }) => {
  const { user } = useUser();
  const { success, error, warning } = useToast();

  const [fechaEntrega, setFechaEntrega] = useState('');
  const [personaEntrega, setPersonaEntrega] = useState('');
  const [observacionesEntrega, setObservacionesEntrega] = useState('');

  const puedeGestionarEtapa = () => proceso?.compromiso?.aprobada === true;

  useEffect(() => {
    if (proceso?.entrega) {
      if (proceso.entrega.fechaEntrega) {
        setFechaEntrega(proceso.entrega.fechaEntrega.slice(0, 10));
      }
      setPersonaEntrega(proceso.entrega.personaEntrega || '');
      setObservacionesEntrega(proceso.entrega.observacionesEntrega || '');
    }
  }, [proceso]);

  const handleGuardar = async () => {
    if (!fechaEntrega || !personaEntrega) {
      warning('Por favor completa la fecha y el nombre de quien entrega.', { title: 'Campos incompletos' });
      return;
    }

    const datosEntrega = {
      fechaEntrega,
      personaEntrega,
      observacionesEntrega,
    };

    try {
      const res = await registrarEntrega(procesoId, datosEntrega);
      setProceso(res.proceso);
      success('Entrega registrada exitosamente.', { title: 'Guardado' });

      // Guardar etapa actual como 4 (etapa entrega)
      globalThis.localStorage?.setItem(`etapaActual-${procesoId}`, '4');

      // Recargar para reflejar el cambio y avanzar en el componente padre
      globalThis.location?.reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      error('Error al registrar entrega.', { title: 'Error' });
    }
  };

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'entrega');
      setProceso(res.proceso);
      success('Etapa de entrega aprobada.', { title: 'Aprobada' });

      // Guardar en localStorage y recargar
      globalThis.localStorage?.setItem(`etapaActual-${procesoId}`, '4');
      globalThis.location?.reload();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      error('Error al aprobar etapa.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    const motivo = globalThis.prompt?.('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;
    try {
      const res = await rechazarEtapa(procesoId, 'entrega', motivo);
      setProceso(res.proceso);
      success('Etapa rechazada.', { title: 'Rechazada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      error('Error al rechazar etapa.', { title: 'Error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Entrega de la Mascota</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="fecha-entrega">
            Fecha de Entrega:
          </label>
          <input
            id="fecha-entrega"
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="persona-entrega">
            Nombre de Quien Recibe la Mascota:
          </label>
          <input
            id="persona-entrega"
            type="text"
            placeholder="Nombre"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={personaEntrega}
            onChange={(e) => setPersonaEntrega(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="observaciones-entrega">
            Observaciones:
          </label>
          <input
            id="observaciones-entrega"
            type="text"
            placeholder="Notas u observaciones"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={observacionesEntrega}
            onChange={(e) => setObservacionesEntrega(e.target.value)}
          />
        </div>
      </div>

      {(user?.role === 'admin' || user?.role === 'adminFundacion') && (
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleGuardar}
            className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-500 transition"
          >
            Guardar
          </button>
        </div>
      )}

      {user?.role !== 'adoptante' && (
        <div className="flex gap-4 justify-end">
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
      )}
    </div>
  );
};

EtapaEntrega.propTypes = {
  procesoId: PropTypes.string.isRequired,
  setProceso: PropTypes.func.isRequired,
  proceso: PropTypes.shape({
    compromiso: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    entrega: PropTypes.shape({
      fechaEntrega: PropTypes.string, // ISO date string (YYYY-MM-DD or ISO)
      personaEntrega: PropTypes.string,
      observacionesEntrega: PropTypes.string,
    }),
  }).isRequired,
};

export default EtapaEntrega;
