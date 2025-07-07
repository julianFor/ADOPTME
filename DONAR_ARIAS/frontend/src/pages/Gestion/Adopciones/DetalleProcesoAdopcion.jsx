import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import LineaProgreso from '../../../components/LineaProgreso';
import EtapaFormulario from '../../../components/etapas/EtapaFormulario';
import EtapaEntrevista from '../../../components/etapas/EtapaEntrevista';
import EtapaVisita from '../../../components/etapas/EtapaVisita';
import EtapaFirma from '../../../components/etapas/EtapaFirma';
import EtapaEntrega from '../../../components/etapas/EtapaEntrega';
import { getProcesoPorId } from '../../../services/procesoService';
import { UserContext } from '../../../context/UserContext';

const DetalleProcesoAdopcion = () => {
  const { procesoId } = useParams();
  const [proceso, setProceso] = useState(null);
  const [etapaActual, setEtapaActual] = useState(null); // inicia en null
  const [loading, setLoading] = useState(true);

  const { user } = useContext(UserContext);
  const rol = user?.role;

  // Cargar el proceso
useEffect(() => {
  const fetchProceso = async () => {
    try {
      if (!procesoId) return;
      const response = await getProcesoPorId(procesoId);
      setProceso(response.proceso);
    } catch (error) {
      console.error('Error al obtener el proceso:', error);
    } finally {
      setLoading(false); // ✅ Aquí estaba el error: L mayúscula
    }
  };

  fetchProceso();
}, [procesoId]);


  // Restaurar etapa desde localStorage una vez que el proceso esté cargado
  useEffect(() => {
    if (!loading && proceso && etapaActual === null) {
      const guardada = localStorage.getItem(`etapaActual-${procesoId}`);
      setEtapaActual(guardada !== null ? parseInt(guardada, 10) : 0);
    }
  }, [loading, proceso, etapaActual, procesoId]);

  // Guardar etapa actual cada vez que cambie
  useEffect(() => {
    if (etapaActual !== null) {
      localStorage.setItem(`etapaActual-${procesoId}`, etapaActual);
    }
  }, [etapaActual, procesoId]);

  const avanzar = () => {
    if (etapaActual < 4) setEtapaActual(etapaActual + 1);
  };

  const retroceder = () => {
    if (etapaActual > 0) setEtapaActual(etapaActual - 1);
  };

  const esSoloLectura = rol === 'adoptante';
  const puedeFirmar = rol === 'adoptante';

  const etapas = proceso
    ? [
        <EtapaFormulario proceso={proceso} editable={!esSoloLectura} />,
        <EtapaEntrevista proceso={proceso} setProceso={setProceso} procesoId={procesoId} editable={!esSoloLectura} />,
        <EtapaVisita proceso={proceso} setProceso={setProceso} procesoId={procesoId} editable={!esSoloLectura} />,
        <EtapaFirma proceso={proceso} setProceso={setProceso} procesoId={procesoId} puedeFirmar={puedeFirmar} />,
        <EtapaEntrega proceso={proceso} setProceso={setProceso} procesoId={procesoId} editable={!esSoloLectura} />,
      ]
    : [];

  return (
    <div className="px-6 py-4">
      <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">Proceso de Adopción</h2>

      <LineaProgreso proceso={proceso} />

      <div className="my-4">
        {loading || etapaActual === null ? (
          <p className="text-center text-gray-500">Cargando proceso...</p>
        ) : (
          etapas[etapaActual] || <p className="text-center text-red-500">No se encontró el proceso</p>
        )}
      </div>

      {etapaActual !== null && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={retroceder}
            disabled={etapaActual === 0}
            className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={avanzar}
            disabled={etapaActual === etapas.length - 1}
            className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default DetalleProcesoAdopcion;
