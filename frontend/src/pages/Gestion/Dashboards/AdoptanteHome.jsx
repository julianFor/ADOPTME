// src/pages/Gestion/Dashboards/AdoptanteHome.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FiFilePlus } from 'react-icons/fi';
import { FaRegClipboard, FaPaw } from 'react-icons/fa';

import {
  getAdoptanteSummary,
  getMisProcesosEnCurso,
  getMisSolicitudesPublicacion,
} from '../../../services/dashboardService';

const AdoptanteHome = () => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [procesos, setProcesos] = useState([]);
  const [loadingProc, setLoadingProc] = useState(true);

  const [solPubs, setSolPubs] = useState([]);
  const [loadingSolPubs, setLoadingSolPubs] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingSummary(true);
        const s = await getAdoptanteSummary();
        if (alive) setSummary(s);
      } catch (e) {
        console.error('getAdoptanteSummary error', e);
      } finally {
        if (alive) setLoadingSummary(false);
      }
    })();

    (async () => {
      try {
        setLoadingProc(true);
        const p = await getMisProcesosEnCurso({ limit: 10 });
        if (alive) setProcesos(p?.rows || []);
      } catch (e) {
        console.error('getMisProcesosEnCurso error', e);
      } finally {
        if (alive) setLoadingProc(false);
      }
    })();

    (async () => {
      try {
        setLoadingSolPubs(true);
        const r = await getMisSolicitudesPublicacion({ limit: 10 });
        if (alive) setSolPubs(r?.rows || []);
      } catch (e) {
        console.error('getMisSolicitudesPublicacion error', e);
      } finally {
        if (alive) setLoadingSolPubs(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Saludo */}
      <h1 className="text-[22px] sm:text-[28px] md:text-[30px] font-medium tracking-tight text-gray-700">
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
                className="w-[160px] sm:w-[180px] md:w-[200px] drop-shadow-[0_15px_40px_rgba(139,92,246,0.12)]"
              />
            </div>
          </div>
        </div>

        {/* KPIs (3) */}
        <div className="xl:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            color="emerald"
            icon={<FaRegClipboard className="text-emerald-600" />}
            title="Solicitudes Adopción"
            value={loadingSummary ? '—' : (summary?.solicitudesAdopcion?.total ?? 0)}
          />
          <StatCard
            color="sky"
            icon={<FiFilePlus className="text-sky-600" />}
            title="Solicitudes Publicación"
            value={loadingSummary ? '—' : (summary?.solicitudesPublicacion?.total ?? 0)}
          />
          <StatCard
            color="fuchsia"
            icon={<FaPaw className="text-fuchsia-600" />}
            title="Publicaciones en AdoptMe"
            value={loadingSummary ? '—' : (summary?.publicacionesAdoptMe?.total ?? 0)}
          />
        </div>
      </section>

      {/* Dos tarjetas: Procesos en curso / Mis solicitudes de publicación */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ProcesosEnCurso rows={procesos} loading={loadingProc} />
        <MisSolicitudesPublicacion rows={solPubs} loading={loadingSolPubs} />
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
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
      <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-gradient-to-br ${ringMap[color]} shadow-inner`}>
        <div className="text-xl sm:text-2xl">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-end gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-medium text-gray-900 leading-none">{value}</span>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  color: PropTypes.oneOf(['emerald', 'sky', 'fuchsia', 'purple']),
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

/* ---------- Cards ---------- */

function ProcesosEnCurso({ rows = [], loading = false }) {
  const navigate = useNavigate();

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // S3923: evitar condición que devuelve lo mismo en ambas ramas
  const data = rows?.length ? rows : [];
  const empty = !loading && !rows?.length;

  const goList = () => navigate('/dashboard/adoptante/mis-procesos');
  const goDetail = (id) => id && navigate(`/dashboard/adoptante/mis-procesos/${id}`);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg">Mis Procesos de Adopción en Curso</h3>
        <button
          onClick={goList}
          className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition"
        >
          Ver Todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-gray-500 font-semibold">
              <th className="text-left py-3 px-3">Mascota</th>
              <th className="text-left py-3 px-3 hidden sm:table-cell">Adoptante</th>
              <th className="text-left py-3 px-3">Etapa</th>
              <th className="text-left py-3 px-3 hidden md:table-cell">Fecha</th>
              <th className="text-left py-3 px-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="py-6 px-3 text-gray-400" colSpan={5}>Cargando…</td>
              </tr>
            )}
            {empty && (
              <tr>
                <td className="py-6 px-3 text-gray-400" colSpan={5}>No tienes procesos en curso</td>
              </tr>
            )}
            {data.map((r, i) => {
              const etapaVisual = `${(r.aprobadas ?? 0) + 1}/5`;
              return (
                <tr key={r._id || i} className="border-t border-gray-100">
                  <td className="py-3 px-3 text-gray-800">{r?.mascota?.nombre || '—'}</td>
                  <td className="py-3 px-3 text-gray-800 hidden sm:table-cell">{r?.adoptante?.nombre || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center rounded-lg bg-purple-50 text-purple-700 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1">
                      {etapaVisual}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-800 hidden md:table-cell">{fmt(r?.fecha)}</td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => goDetail(r?._id)}
                      disabled={!r?._id}
                      className={[
                        "text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg transition",
                        r?._id ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      ].join(' ')}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProcesosEnCurso.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
};

function MisSolicitudesPublicacion({ rows = [], loading = false }) {
  const navigate = useNavigate();

  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-CO');
  };

  const estadoColor = (estado = '') => {
    const e = estado.toLowerCase();
    if (e === 'aprobada') return 'text-emerald-600';
    if (e === 'rechazada') return 'text-rose-600';
    return 'text-amber-600'; // pendiente u otros
  };

  // S3923: evitar condición que devuelve lo mismo en ambas ramas
  const data = rows?.length ? rows : [];
  const empty = !loading && !rows?.length;

  const goList = () => navigate('/dashboard/adoptante/mis-solicitudes-publicacion');
  const goDetail = (id) => id && navigate(`/dashboard/adoptante/mis-solicitudes-publicacion/${id}`);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg">Mis Solicitudes de Publicación</h3>
        <button
          onClick={goList}
          className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition"
        >
          Ver Todos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="text-gray-500 font-semibold">
              <th className="text-left py-3 px-3">Mascota</th>
              <th className="text-left py-3 px-3 hidden sm:table-cell">Especie</th>
              <th className="text-left py-3 px-3">Estado</th>
              <th className="text-left py-3 px-3 hidden md:table-cell">Fecha</th>
              <th className="text-left py-3 px-3">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="py-6 px-3 text-gray-400" colSpan={5}>Cargando…</td>
              </tr>
            )}
            {empty && (
              <tr>
                <td className="py-6 px-3 text-gray-400" colSpan={5}>No tienes solicitudes registradas.</td>
              </tr>
            )}
            {data.map((r, i) => (
              <tr key={r._id || i} className="border-t border-gray-100">
                <td className="py-3 px-3 text-gray-800">{r.mascota || '—'}</td>
                <td className="py-3 px-3 text-gray-800 hidden sm:table-cell">{r.especie || '—'}</td>
                <td className={`py-3 px-3 font-semibold ${estadoColor(r.estado)}`}>{r.estado || 'Pendiente'}</td>
                <td className="py-3 px-3 text-gray-800 hidden md:table-cell">{fmt(r.fecha)}</td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => goDetail(r?._id)}
                    disabled={!r?._id}
                    className={[
                      "text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg transition",
                      r?._id ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    ].join(' ')}
                  >
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

MisSolicitudesPublicacion.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
};
