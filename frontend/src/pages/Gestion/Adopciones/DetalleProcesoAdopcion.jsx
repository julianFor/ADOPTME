// src/components/adopciones/LineaProgreso.jsx

import React from 'react';
import {
  FaFileAlt,
  FaUsers,
  FaHome,
  FaFileSignature,
  FaDog,
} from 'react-icons/fa';

const etapas = [
  {
    nombre: 'Formulario Completado',
    icono: <FaFileAlt size={28} />,
    estado: 'completado',
  },
  {
    nombre: 'Entrevista Virtual',
    icono: <FaUsers size={28} />,
    estado: 'activo',
  },
  {
    nombre: 'Visita al Refugio',
    icono: <FaHome size={28} />,
    estado: 'pendiente',
  },
  {
    nombre: 'Firmar Compromiso',
    icono: <FaFileSignature size={28} />,
    estado: 'pendiente',
  },
  {
    nombre: 'Entrega de la Mascota',
    icono: <FaDog size={28} />,
    estado: 'pendiente',
  },
];

const getEstadoClase = (estado) => {
  switch (estado) {
    case 'completado':
      return 'bg-green-100 text-black border-green-500';
    case 'activo':
      return 'bg-yellow-100 text-black border-yellow-400 shadow-md';
    case 'pendiente':
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getColorLinea = (estado) => {
  switch (estado) {
    case 'completado':
      return 'bg-green-500';
    case 'activo':
      return 'bg-yellow-400';
    case 'pendiente':
    default:
      return 'bg-purple-300';
  }
};

const getColorPunto = (estado) => {
  switch (estado) {
    case 'completado':
      return 'border-green-500';
    case 'activo':
      return 'border-yellow-400';
    case 'pendiente':
    default:
      return 'border-purple-300';
  }
};

const LineaProgreso = () => {
  return (
    <div className="text-center mb-12 px-4">
      <h2 className="text-2xl font-bold text-purple-600 mb-6">Tu progreso</h2>

      {/* Línea y puntos */}
      <div className="relative flex justify-between items-center w-full max-w-5xl mx-auto mb-10 px-4">
        {/* Línea de fondo entre el primer y último punto */}
        <div className="absolute top-1/2 left-[10%] right-[10%] h-2 bg-purple-300 z-0 rounded-full -translate-y-1/2" />

        {/* Línea de progreso sobre la base (puede hacerse dinámica después) */}
        <div className="absolute top-1/2 left-[10%] w-[30%] h-2 bg-green-500 z-10 rounded-full -translate-y-1/2 transition-all duration-500" />

        {/* Puntos de etapa */}
        {etapas.map((etapa, idx) => (
          <div key={idx} className="relative z-20 flex flex-col items-center w-1/5">
            <div
              className={`w-6 h-6 rounded-full border-4 bg-white ${getColorPunto(etapa.estado)}`}
            ></div>
          </div>
        ))}
      </div>

      {/* Tarjetas de etapa */}
      <div className="flex justify-between items-start max-w-5xl mx-auto gap-2 px-4">
        {etapas.map((etapa, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center w-40 py-3 rounded-lg border ${getEstadoClase(etapa.estado)}`}
          >
            <div className="mb-2">{etapa.icono}</div>
            <p className="text-sm font-medium text-center leading-tight">
              {etapa.nombre}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LineaProgreso;
