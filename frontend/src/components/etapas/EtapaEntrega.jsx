import { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { aprobarEtapa, rechazarEtapa, registrarEntrega } from '../../services/procesoService';
import useUser from '../../hooks/useUser';

const EtapaEntrega = ({ procesoId, setProceso, proceso }) => {
  const { user } = useUser();

  const [fechaEntrega, setFechaEntrega] = useState('');
  const [personaEntrega, setPersonaEntrega] = useState('');
  const [observacionesEntrega, setObservacionesEntrega] = useState('');

  const puedeGestionarEtapa = () => {
    return proceso?.compromiso?.aprobada === true;
  };

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
    alert('Por favor completa la fecha y el nombre de quien entrega.');
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
    alert('Entrega registrada exitosamente.');

    // ✅ Guardar etapa actual como 4 (etapa entrega)
    localStorage.setItem(`etapaActual-${procesoId}`, '4');

    // ✅ Recargar para reflejar el cambio y avanzar en el componente padre
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert('Error al registrar entrega.');
  }
};

const handleAprobar = async () => {
  try {
    const res = await aprobarEtapa(procesoId, 'entrega');
    setProceso(res.proceso);
    alert('Etapa de entrega aprobada.');

    // ✅ Guardar en localStorage y recargar
    localStorage.setItem(`etapaActual-${procesoId}`, '4');
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert('Error al aprobar etapa.');
  }
};
  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;
    try {
      const res = await rechazarEtapa(procesoId, 'entrega', motivo);
      setProceso(res.proceso);
      alert('Etapa rechazada.');
    } catch (error) {
      console.error(error);
      alert('Error al rechazar etapa.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Entrega de la Mascota</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Fecha de Entrega:</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Nombre de Quien Recibe la Mascota:</label>
          <input
            type="text"
            placeholder="Nombre"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={personaEntrega}
            onChange={(e) => setPersonaEntrega(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Observaciones:</label>
          <input
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

export default EtapaEntrega;
