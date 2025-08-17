// src/pages/Gestion/Dashboards/AdoptanteHome.jsx
import React from 'react';
import { FiFilePlus } from 'react-icons/fi';
import { FaRegClipboard, FaPaw } from 'react-icons/fa';

const AdoptanteHome = () => {
  return (
    <div className="space-y-6">
      {/* Saludo */}
      <h1 className="text-[28px] sm:text-[30px] font-medium tracking-tight text-gray-700">
        Hola Adoptante <span className="align-middle">👋</span>,
      </h1>

      {/* Cabecera con ilustración + KPIs */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
        {/* Ilustración */}
        <div className="xl:col-span-3">
          <div className="relative">
            <div className="xl:col-span-3 flex justify-center">
  <img
    src="/adoptante-cat.svg"
    alt="AdoptMe cat"
    className="w-[200px] sm:w-[180px] drop-shadow-[0_15px_40px_rgba(139,92,246,0.12)]"
  />
</div>

          </div>
        </div>

        {/* KPIs (3) */}
        <div className="xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            color="emerald"
            icon={<FaRegClipboard className="text-emerald-600" />}
            title="Solicitudes Adopción"
            value="2"
          />
          <StatCard
            color="sky"
            icon={<FiFilePlus className="text-sky-600" />}
            title="Solicitudes Publicación"
            value="12"
          />
          <StatCard
            color="fuchsia"
            icon={<FaPaw className="text-fuchsia-600" />}
            title="Publicaciones en AdoptMe"
            value="2"
          />
        </div>
      </section>

      {/* Dos tarjetas: Procesos en curso / Mis solicitudes de publicación */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProcesosEnCurso />
        <MisSolicitudesPublicacion />
      </section>
    </div>
  );
};

export default AdoptanteHome;

/* ---------- UI helpers ---------- */
const ringMap = {
  emerald: 'from-emerald-100/90 to-emerald-50',
  sky: 'from-sky-100/90 to-sky-50',
  fuchsia: 'from-fuchsia-100/90 to-fuchsia-50',
  purple: 'from-purple-100/90 to-purple-50',
};

function StatCard({ color = 'purple', icon, title, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex items-center gap-5">
      <div className={`h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br ${ringMap[color]} shadow-inner`}>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-medium text-gray-900 leading-none">{value}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cards ---------- */

function ProcesosEnCurso() {
  const rows = [
    { mascota: 'Rabies', adoptante: 'Rabies', etapa: '1/5', fecha: '13/08/2025' },
    { mascota: 'Rabies', adoptante: 'Rabies', etapa: '1/5', fecha: '13/08/2025' },
    { mascota: 'Rabies', adoptante: 'Rabies', etapa: '1/5', fecha: '13/08/2025' },
    { mascota: 'Rabies', adoptante: 'Rabies', etapa: '1/5', fecha: '13/08/2025' },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-bold">Mis Procesos de Adopcion en Curso</h3>
        <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition">
          Ver Todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 font-semibold">
              <th className="text-left py-3 px-3">Mascota</th>
              <th className="text-left py-3 px-3">Adoptante</th>
              <th className="text-left py-3 px-3">etapa</th>
              <th className="text-left py-3 px-3">fecha</th>
              <th className="text-left py-3 px-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-3 px-3 text-gray-800">{r.mascota}</td>
                <td className="py-3 px-3 text-gray-800">{r.adoptante}</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center justify-center rounded-lg bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1">
                    {r.etapa}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-800">{r.fecha}</td>
                <td className="py-3 px-3">
                  <button className="text-xs font-semibold bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MisSolicitudesPublicacion() {
  const rows = [
    { mascota: 'Rabies', especie: 'gato', estado: 'Pendiente', fecha: '13/08/2025' },
    { mascota: 'Rabies', especie: 'gato', estado: 'Pendiente', fecha: '13/08/2025' },
    { mascota: 'Rabies', especie: 'gato', estado: 'Aprobada', fecha: '13/08/2025' },
    { mascota: 'Rabies', especie: 'gato', estado: 'Rechazada', fecha: '13/08/2025' },
  ];

  const estadoColor = (estado) => {
    if (estado === 'Aprobada') return 'text-emerald-600';
    if (estado === 'Rechazada') return 'text-rose-600';
    return 'text-amber-600';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-bold">Mis Solicitudes de Publicación</h3>
        <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition">
          Ver Todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500 font-semibold">
              <th className="text-left py-3 px-3">Mascota</th>
              <th className="text-left py-3 px-3">Especie</th>
              <th className="text-left py-3 px-3">Estado</th>
              <th className="text-left py-3 px-3">fecha</th>
              <th className="text-left py-3 px-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="py-3 px-3 text-gray-800">{r.mascota}</td>
                <td className="py-3 px-3 text-gray-800">{r.especie}</td>
                <td className={`py-3 px-3 font-semibold ${estadoColor(r.estado)}`}>{r.estado}</td>
                <td className="py-3 px-3 text-gray-800">{r.fecha}</td>
                <td className="py-3 px-3">
                  <button className="text-xs font-semibold bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
