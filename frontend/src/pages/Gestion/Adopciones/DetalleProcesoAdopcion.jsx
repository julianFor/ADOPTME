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
  const [etapaActual, setEtapaActual] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(UserContext);
  const rol = user?.role;

  // Cargar el proceso
  useEffect(() => {
    const fetchProceso = async () => {
      try {
        // Condición invertida para mejorar legibilidad
        if (procesoId) {
          const response = await getProcesoPorId(procesoId);
          setProceso(response.proceso);
        }
      } catch (error) {
        console.error('Error al obtener el proceso:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProceso();
  }, [procesoId]);

  // Restaurar etapa desde localStorage cuando el proceso esté listo
  useEffect(() => {
    const datosListos = loading === false && proceso !== null;
    const requiereInicializacion = etapaActual === null;
    
    if (datosListos && requiereInicializacion) {
      const etapaGuardada = localStorage.getItem(`etapaActual-${procesoId}`);
      const etapaInicial = etapaGuardada !== null ? Number.parseInt(etapaGuardada, 10) : 0;
      setEtapaActual(etapaInicial);
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
        <EtapaFormulario key="formulario" proceso={proceso} editable={!esSoloLectura} />,
        <EtapaEntrevista
          key="entrevista"
          proceso={proceso}
          setProceso={setProceso}
          procesoId={procesoId}
          editable={!esSoloLectura}
        />,
        <EtapaVisita
          key="visita"
          proceso={proceso}
          setProceso={setProceso}
          procesoId={procesoId}
          editable={!esSoloLectura}
        />,
        <EtapaFirma
          key="firma"
          proceso={proceso}
          setProceso={setProceso}
          procesoId={procesoId}
          puedeFirmar={puedeFirmar}
        />,
        <EtapaEntrega
          key="entrega"
          proceso={proceso}
          setProceso={setProceso}
          procesoId={procesoId}
          editable={!esSoloLectura}
        />,
      ]
    : [];

  return (
    <div className="px-6 py-4">
      <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">
        Proceso de Adopción
      </h2>

      <LineaProgreso proceso={proceso} />

      <div className="my-4">
        {!loading && etapaActual !== null ? (
          etapas[etapaActual] || <p className="text-center text-red-500">No se encontró el proceso</p>
        ) : (
          <p className="text-center text-gray-500">Cargando proceso...</p>
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