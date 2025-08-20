// src/pages/Gestion/AdminHome.jsx
import React, { useEffect, useMemo, useState } from 'react';
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

const AdminHome = () => {
  // ----- KPIs -----
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // ----- Procesos en curso -----
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
    <div className="space-y-6">
      {/* Saludo */}
      <h1 className="text-[28px] sm:text-[30px] font-medium tracking-tight text-gray-700">
        Hola Admin <span className="align-middle">👋</span>,
      </h1>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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

/* ---------- Componentes UI ---------- */

const ringMap = {
  emerald: 'from-emerald-100/90 to-emerald-50',
  sky: 'from-sky-100/90 to-sky-50',
  fuchsia: 'from-fuchsia-100/90 to-fuchsia-50',
  purple: 'from-purple-100/90 to-purple-50',
};

function StatCard({ color = 'purple', icon, title, value, delta, loading = false }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex items-center gap-5">
      <div className={`h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br ${ringMap[color]} shadow-inner`}>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-medium text-gray-900 leading-none">
            {loading ? '—' : value}
          </span>
          {delta?.trim() && !loading && (
            <span className="text-xs font-semibold text-emerald-600">{delta}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivityCard() {
  const [tab, setTab] = useState('adopcion'); // adopcion | publicacion | donaciones
  const [rango] = useState('Mensual');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // cache simple por pestaña para no reconsultar si ya se cargó
  const [cache, setCache] = useState({});

  useEffect(() => {
    let alive = true;

    const load = async () => {
      // si tenemos cache, úsalo
      if (cache[tab]) {
        setData(cache[tab]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let resp;
        if (tab === 'adopcion') resp = await getSeriesAdopcion({ months: 6 });
        else if (tab === 'publicacion') resp = await getSeriesPublicacion({ months: 6 });
        else resp = await getSeriesDonaciones({ months: 6 }); // { currency, series }
        const series = resp?.series || [];
        if (!alive) return;
        setData(series);
        setCache(prev => ({ ...prev, [tab]: series }));
      } catch (e) {
        console.error('load series error', e);
        if (alive) setData([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [tab]);

  const Tab = ({ id, children }) => (
    <button
      onClick={() => setTab(id)}
      className={[
        'px-4 py-2 rounded-full text-sm font-semibold transition',
        tab === id ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-gray-500 hover:bg-gray-50',
      ].join(' ')}
    >
      {children}
    </button>
  );

  // Fallback suave si no hay datos
  const chartData = useMemo(() => (data?.length ? data : [{ name: '—', val: 0 }]), [data]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-bold">Actividad de Adopciones</h3>
        <button className="inline-flex items-center gap-2 text-sm text-gray-600 border rounded-lg px-3 py-1.5 hover:bg-gray-50">
          {rango}
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="mt-0.5">
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5">
        <Tab id="adopcion">Solicitudes Adopción</Tab>
        <Tab id="publicacion">Solicitudes Publicación</Tab>
        <Tab id="donaciones">Donaciones</Tab>
      </div>

      {/* Chart */}
      <div className="h-[280px] -mx-2 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#eee" />
            <XAxis dataKey="name" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
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
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ProcesosEnCurso({ rows = [], loading = false }) {
  const fmt = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
    // Si quieres al estilo de tu captura: '13/08/2025'
  };

  const data = rows?.length ? rows : (loading ? [] : []);
  const empty = !loading && !rows?.length;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 font-bold">Procesos de Adopción en Curso</h3>
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
            {data.map((r, i) => {
              const etapaVisual = `${(r.aprobadas ?? 0) + 1}/5`;
              return (
                <tr key={r._id || i} className="border-t border-gray-100">
                  <td className="py-3 px-3 text-gray-800">{r?.mascota?.nombre || '—'}</td>
                  <td className="py-3 px-3 text-gray-800">{r?.adoptante?.nombre || '—'}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1">
                      {etapaVisual}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-800">{fmt(r?.fecha)}</td>
                  <td className="py-3 px-3">
                    <button className="text-xs font-semibold bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition">
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
