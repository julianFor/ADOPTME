// src/pages/Gestion/Adopciones/DetalleProcesoAdopcion.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LineaProgreso from '../../../components/LineaProgreso';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import EtapaFormulario from '../../../components/etapas/EtapaFormulario';
import EtapaEntrevista from '../../../components/etapas/EtapaEntrevista';
import EtapaVisita from '../../../components/etapas/EtapaVisita';
import EtapaFirma from '../../../components/etapas/EtapaFirma';
import EtapaEntrega from '../../../components/etapas/EtapaEntrega';
import { getProcesoPorId } from '../../../services/procesoService';

const DetalleProcesoAdopcion = () => {
  const { procesoId } = useParams();
  const [proceso, setProceso] = useState(null);
  const [etapaActual, setEtapaActual] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProceso = async () => {
      try {
        if (!procesoId) return;
        const response = await getProcesoPorId(procesoId);
        setProceso(response.proceso);
      } catch (error) {
        console.error('Error al obtener el proceso:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProceso();
  }, [procesoId]);
  
  const avanzar = () => {
    if (etapaActual < 4) setEtapaActual(etapaActual + 1);
  };
  
  const retroceder = () => {
    if (etapaActual > 0) setEtapaActual(etapaActual - 1);
  };
  
  console.log('📦 Proceso recibido en EtapaFormulario:', proceso);
  const etapas = proceso
    ? [
        <EtapaFormulario proceso={proceso} />,
        <EtapaEntrevista proceso={proceso} setProceso={setProceso} procesoId={procesoId} />,
        <EtapaVisita proceso={proceso} setProceso={setProceso} procesoId={procesoId} />,
        <EtapaFirma proceso={proceso} setProceso={setProceso} procesoId={procesoId} />,
        <EtapaEntrega proceso={proceso} setProceso={setProceso} procesoId={procesoId} />,
      ]
    : [];

  return (
    <div className="px-6 py-4">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Proceso de Adopción</h2>

      <LineaProgreso proceso={proceso} />


      <div className="my-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando proceso...</p>
        ) : (
          etapas[etapaActual] || <p className="text-center text-red-500">No se encontró el proceso</p>
        )}
      </div>

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
    </div>
  );
};

export default DetalleProcesoAdopcion;
