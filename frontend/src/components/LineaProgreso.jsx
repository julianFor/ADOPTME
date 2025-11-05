// src/components/LineaProgreso.jsx

import PropTypes from 'prop-types';
import { FaUsers, FaHome, FaPenFancy, FaPaw } from 'react-icons/fa';
import { MdChecklist } from 'react-icons/md';

const etapas = [
  { titulo: 'Formulario', campo: null, icono: <MdChecklist /> },
  { titulo: 'Entrevista', campo: 'entrevista', icono: <FaUsers /> },
  { titulo: 'Visita Fundación', campo: 'visita', icono: <FaHome /> },
  { titulo: 'Firma Compromiso', campo: 'compromiso', icono: <FaPenFancy /> },
  { titulo: 'Entrega Mascota', campo: 'entrega', icono: <FaPaw /> },
];

const LineaProgreso = ({ proceso }) => {
  if (!proceso) return null;

  // Determina el estado de cada etapa
  const getEstadoEtapa = (index) => {
    if (index === 0) return 'aprobado'; // Formulario siempre aprobado

    const campo = etapas[index].campo;
    const anteriorCampo = etapas[index - 1].campo;

    const actual = proceso?.[campo];
    const anterior =
      index === 1 ? true : proceso?.[anteriorCampo]?.aprobada === true;

    if (actual?.aprobada === true) return 'aprobado';
    if (anterior) return 'en proceso';
    return 'pendiente';
  };

  // Determina la última etapa aprobada o en proceso
  const calcularEtapaActual = () => {
    for (let i = etapas.length - 1; i >= 0; i--) {
      const estado = getEstadoEtapa(i);
      if (estado === 'aprobado' || estado === 'en proceso') return i;
    }
    return 0;
  };

  const etapaActual = calcularEtapaActual();

  // Funciones auxiliares para estilos y texto
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

  const getWidth = (etapa) => {
    switch (etapa) {
      case 0:
        return 'w-0';
      case 1:
        return 'w-[25%]';
      case 2:
        return 'w-[50%]';
      case 3:
        return 'w-[75%]';
      default:
        return 'w-full';
    }
  };

  const getEstadoTexto = (estado) => {
    if (estado === 'aprobado') return 'Aprobado';
    if (estado === 'en proceso') return 'En proceso';
    return 'Pendiente';
  };

  return (
    <div className="relative bg-white shadow-md rounded-xl px-4 py-6 mb-8">
      {/* Línea de progreso */}
      <div className="absolute top-11 left-[10%] w-[80%] h-1 bg-gray-300 z-0">
        <div
          className={`h-full transition-all duration-300 ${getWidth(
            etapaActual
          )} bg-green-500`}
        ></div>
      </div>

      {/* Etapas */}
      <div className="flex justify-between items-center relative z-10">
        {etapas.map((etapa) => {
          const estado = getEstadoEtapa(etapa.titulo === 'Formulario' ? 0 : etapas.indexOf(etapa));
          return (
            <div key={etapa.titulo} className="flex flex-col items-center w-1/5">
              <div
                className={`rounded-full border-4 p-3 text-xl bg-white ${getColor(
                  estado
                )}`}
              >
                {etapa.icono}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                ETAPA {etapas.indexOf(etapa) + 1}
              </span>
              <h3 className="text-sm font-semibold text-center">{etapa.titulo}</h3>
              <span className={`text-xs px-2 py-1 rounded-full mt-1 ${getBadge(estado)}`}>
                {getEstadoTexto(estado)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Validación de props con PropTypes
LineaProgreso.propTypes = {
  proceso: PropTypes.objectOf(
    PropTypes.shape({
      aprobada: PropTypes.bool,
    })
  ).isRequired,
};

export default LineaProgreso;