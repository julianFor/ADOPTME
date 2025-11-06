// src/pages/Gestion/AdminHome.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FiUsers, FiFilePlus, FiCheckCircle } from 'react-icons/fi';
import { FaPaw } from 'react-icons/fa';

import {
  getSummary,
  getSeriesAdopcion,
  getSeriesPublicacion,
  getSeriesDonaciones,
  getProcesosEnCurso
} from '../../../services/dashboardService';

/* ---------- Mapas/constantes ---------- */
const ringMap = {
  emerald: 'from-emerald-100/90 to-emerald-50',
  sky: 'from-sky-100/90 to-sky-50',
  fuchsia: 'from-fuchsia-100/90 to-fuchsia-50',
  purple: 'from-purple-100/90 to-purple-50',
};

/* ---------- Componentes UI externos (no anidados) ---------- */

function StatCard({ color = 'purple', icon, title, value, delta, loading = false }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
      <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center bg-gradient-to-br ${ringMap[color]} shadow-inner`}>
        <div className="text-xl sm:text-2xl">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-end gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl font-medium text-gray-900 leading-none">
            {loading ? '—' : value}
          </span>
          {delta?.trim() && !loading && (
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">{delta}</span>
          )}
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  color: PropTypes.oneOf(['emerald', 'sky', 'fuchsia', 'purple']),
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  delta: PropTypes.string,
  loading: PropTypes.bool,
};

function Tab({ id, active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={[
        'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition',
        active ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-gray-500 hover:bg-gray-50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

Tab.propTypes = {
  id: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node,
};

function ActivityCard() {
  const [tab, setTab] = useState('adopcion');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState({});

  useEffect(() => {
    let alive = true;

    const load = async () => {
      // cache simple por pestaña
      if (cache[tab]) {
        setData(cache[tab]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let resp;
        if (tab === 'adopcion') {
          resp = await getSeriesAdopcion({ months: 6 });
        } else if (tab === 'publicacion') {
          resp = await getSeriesPublicacion({ months: 6 });
        } else {
          resp = await getSeriesDonaciones({ months: 6 });
        }
        const series = resp?.series || [];
        if (!alive) return;
        setData(series);
        setCache((prev) => ({ ...prev, [tab]: series }));
      } catch (e) {
        console.error('load series error', e);
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [tab, cache]);

  const chartData = useMemo(() => (data?.length ? data : [{ name: '—', val: 0 }]), [data]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg">Actividad de Adopciones</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
        <Tab id="adopcion" active={tab === 'adopcion'} onClick={setTab}>Solicitudes Adopción</Tab>
        <Tab id="publicacion" active={tab === 'publicacion'} onClick={setTab}>Solicitudes Publicación</Tab>
        <Tab id="donaciones" active={tab === 'donaciones'} onClick={setTab}>Donaciones</Tab>
      </div>

      {/* altura del gráfico adaptativa */}
      <div className="h-[220px] sm:h-[260px] md:h-[280px] -mx-1 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eee" />
            <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a3a3a3', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #f1f1f1' }}
              cursor={{ stroke: '#DDD' }}
              formatter={(value) => [value, loading ? 'Cargando...' : '']}
            />
            <Area
              type="monotone"
              dataKey="val"
              stroke="#8B5CF6"
              fill="url(#colorP)"
              strokeWidth={3}
              isAnimationActive
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

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

  // quitar ternario redundante (antes devolvía [] en ambos casos)
  const data = rows?.length ? rows : [];
  const empty = !loading && !rows?.length;

  const goList = () => navigate('/dashboard/admin/procesos-adopcion');
  const goDetail = (id) => {
    if (!id) return;
    navigate(`/dashboard/admin/procesos-adopcion/${id}`);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2l shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-gray-900 font-bold text-base sm:text-lg">Procesos de Adopción en Curso</h3>
        <button
          type="button"
          onClick={goList}
          className="text-xs sm:text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition"
        >
          Ver Todos
        </button>
      </div>

      {/* Tabla con scroll horizontal y columnas reducibles en móvil */}
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
                <td className="py-6 px-3 text-gray-400" colSpan={5}>No hay procesos en curso</td>
              </tr>
            )}
            {data.map((r) => {
              const etapaVisual = `${(r.aprobadas ?? 0) + 1}/5`;
              const id = r?._id;
              return (
                <tr key={id} className="border-t border-gray-100">
                  <td className="py-3 px-3 text-gray-800">{r?.mascota?.nombre || '—'}</td>
                  <td className="py-3 px-3 text-gray-800 hidden sm:table-cell">{r?.adoptante?.nombre || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1">
                      {etapaVisual}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-800 hidden md:table-cell">{fmt(r?.fecha)}</td>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      disabled={!id}
                      onClick={() => goDetail(id)}
                      className={[
                        "text-[11px] sm:text-xs font-semibold px-3 py-1.5 rounded-lg transition",
                        id ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
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

/* ---------- Página ---------- */

const AdminHome = () => {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [procesos, setProcesos] = useState([]);
  const [loadingProc, setLoadingProc] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingSummary(true);
        const s = await getSummary();
        if (alive) setSummary(s);
      } catch (e) {
        console.error('getSummary error', e);
      } finally {
        if (alive) setLoadingSummary(false);
      }
    })();

    (async () => {
      try {
        setLoadingProc(true);
        const p = await getProcesosEnCurso({ limit: 10 });
        if (alive) setProcesos(p?.rows || []);
      } catch (e) {
        console.error('getProcesosEnCurso error', e);
      } finally {
        if (alive) setLoadingProc(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-7">
      <h1 className="text-[22px] sm:text-[28px] md:text-[30px] font-medium tracking-tight text-gray-700">
        Hola Admin <span className="align-middle">👋</span>,
      </h1>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          loading={loadingSummary}
          color="emerald"
          icon={<FaPaw className="text-emerald-600" />}
          title="Mascotas Disponibles"
          value={summary?.mascotasDisponibles?.total ?? 0}
          delta={summary ? `+${summary?.mascotasDisponibles?.creacionesEsteMes ?? 0} este mes` : ''}
        />
        <StatCard
          loading={loadingSummary}
          color="sky"
          icon={<FiUsers className="text-sky-600" />}
          title="Solicitudes de Adopción"
          value={summary?.solicitudesAdopcion?.total ?? 0}
          delta={summary ? `+${summary?.solicitudesAdopcion?.creacionesEsteMes ?? 0} este mes` : ''}
        />
        <StatCard
          loading={loadingSummary}
          color="fuchsia"
          icon={<FiFilePlus className="text-fuchsia-600" />}
          title="Solicitudes de Publicación"
          value={summary?.solicitudesPublicacion?.total ?? 0}
          delta={summary ? `+${summary?.solicitudesPublicacion?.creacionesEsteMes ?? 0} este mes` : ''}
        />
        <StatCard
          loading={loadingSummary}
          color="purple"
          icon={<FiCheckCircle className="text-purple-600" />}
          title="Adopciones Completadas"
          value={summary?.adopcionesCompletadas?.total ?? 0}
          delta=""
        />
      </section>

      {/* Gráfico + Tabla */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ActivityCard />
        <ProcesosEnCurso rows={procesos} loading={loadingProc} />
      </section>
    </div>
  );
};

export default AdminHome;
