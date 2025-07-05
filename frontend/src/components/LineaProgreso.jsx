// src/components/LineaProgreso.jsx

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

  return (
    <div className="relative bg-white shadow-md rounded-xl px-4 py-6 mb-8">
      {/* Línea de progreso */}
      <div className="absolute top-11 left-[10%] w-[80%] h-1 bg-gray-300 z-0">
        <div
          className={`h-full transition-all duration-300 ${
            etapaActual === 0
              ? 'w-0'
              : etapaActual === 1
              ? 'w-[25%]'
              : etapaActual === 2
              ? 'w-[50%]'
              : etapaActual === 3
              ? 'w-[75%]'
              : 'w-full'
          } bg-green-500`}
        ></div>
      </div>

      {/* Etapas */}
      <div className="flex justify-between items-center relative z-10">
        {etapas.map((etapa, index) => {
          const estado = getEstadoEtapa(index);
          return (
            <div key={index} className="flex flex-col items-center w-1/5">
              <div className={`rounded-full border-4 p-3 text-xl bg-white ${getColor(estado)}`}>
                {etapa.icono}
              </div>
              <span className="text-xs text-gray-500 mt-1">ETAPA {index + 1}</span>
              <h3 className="text-sm font-semibold text-center">{etapa.titulo}</h3>
              <span className={`text-xs px-2 py-1 rounded-full mt-1 ${getBadge(estado)}`}>
                {estado === 'aprobado'
                  ? 'Aprobado'
                  : estado === 'en proceso'
                  ? 'En proceso'
                  : 'Pendiente'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LineaProgreso;
