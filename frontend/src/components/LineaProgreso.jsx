// src/components/LineaProgreso.jsx

import PropTypes from 'prop-types';
import { FaUsers, FaHome, FaPenFancy, FaPaw } from 'react-icons/fa';
import { MdChecklist } from 'react-icons/md';

const etapas = [
  { titulo: 'Formulario', campo: null, icono: <MdChecklist /> }, // No tiene campo asociado
  { titulo: 'Entrevista', campo: 'entrevista', icono: <FaUsers /> },
  { titulo: 'Visita Fundación', campo: 'visita', icono: <FaHome /> },
  { titulo: 'Firma Compromiso', campo: 'compromiso', icono: <FaPenFancy /> },
  { titulo: 'Entrega Mascota', campo: 'entrega', icono: <FaPaw /> },
];

const LineaProgreso = ({ proceso }) => {
  if (!proceso) return null;

  const getEstadoEtapa = (index) => {
    if (index === 0) return 'aprobado'; // Siempre aprobado

    const campo = etapas[index].campo;
    const anteriorCampo = etapas[index - 1].campo;

    const actual = proceso?.[campo];
    const anterior =
      index === 1
        ? true // La anterior a Entrevista es Formulario, que siempre está aprobada
        : proceso?.[anteriorCampo]?.aprobada === true;

    if (actual?.aprobada === true) return 'aprobado';
    if (anterior) return 'en proceso';

    return 'pendiente';
  };

  const calcularEtapaActual = () => {
    for (let i = etapas.length - 1; i >= 0; i--) {
      const estado = getEstadoEtapa(i);
      if (estado === 'aprobado' || estado === 'en proceso') return i;
    }
    return 0;
  };

  const etapaActual = calcularEtapaActual();

  const getColor = (estado) => {
    if (estado === 'aprobado') return 'text-green-500 border-green-500';
    if (estado === 'en proceso') return 'text-purple-500 border-purple-500';
    return 'text-gray-400 border-gray-300';
  };

  const getBadge = (estado) => {
    if (estado === 'aprobado') return 'bg-green-100 text-green-600';
    if (estado === 'en proceso') return 'bg-purple-100 text-purple-600';
    return 'bg-gray-100 text-gray-500';
  };

  // Evita ternarios anidados (S3358) para el ancho de la barra
  const widthClassByStep = (step) => {
    if (step === 0) return 'w-0';
    if (step === 1) return 'w-[25%]';
    if (step === 2) return 'w-[50%]';
    if (step === 3) return 'w-[75%]';
    return 'w-full';
  };

  // Evita ternarios anidados (S3358) para la etiqueta
  const getEtiquetaEstado = (estado) => {
    if (estado === 'aprobado') return 'Aprobado';
    if (estado === 'en proceso') return 'En proceso';
    return 'Pendiente';
  };

  return (
    <div className="relative bg-white shadow-md rounded-xl px-4 py-6 mb-8">
      {/* Línea de progreso */}
      <div className="absolute top-11 left-[10%] w-[80%] h-1 bg-gray-300 z-0">
        <div
          className={`h-full transition-all duration-300 ${widthClassByStep(etapaActual)} bg-green-500`}
        ></div>
      </div>

      {/* Etapas */}
      <div className="flex justify-between items-center relative z-10">
        {etapas.map((etapa, index) => {
          const estado = getEstadoEtapa(index);
          return (
            <div key={etapa.titulo} className="flex flex-col items-center w-1/5">
              <div className={`rounded-full border-4 p-3 text-xl bg-white ${getColor(estado)}`}>
                {etapa.icono}
              </div>
              <span className="text-xs text-gray-500 mt-1">ETAPA {index + 1}</span>
              <h3 className="text-sm font-semibold text-center">{etapa.titulo}</h3>
              <span className={`text-xs px-2 py-1 rounded-full mt-1 ${getBadge(estado)}`}>
                {getEtiquetaEstado(estado)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

LineaProgreso.propTypes = {
  proceso: PropTypes.shape({
    entrevista: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    visita: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    compromiso: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    entrega: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
  }),
};

export default LineaProgreso;
