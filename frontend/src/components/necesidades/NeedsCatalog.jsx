// src/components/necesidades/NeedsCatalog.jsx
import { useEffect, useState } from "react";
import { listarNecesidades } from "../../services/necesidadService";
import NecesidadCard from "./NecesidadCard";
import CalloutContacto from "./CalloutContacto";

export default function NeedsCatalog() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    estado: "activa",
    limit: 6,
    page: 1,
    sort: "-fechaPublicacion",
  });

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const r = await listarNecesidades(filters);
        if (on) setResp(r);
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => (on = false);
  }, [filters]);

  const onPage = (dir) =>
    setFilters((f) => ({
      ...f,
      page: Math.max(1, Math.min(resp.pages || 1, f.page + dir)),
    }));

  return (
    <div className="space-y-10">
      {/* GRID: 1 col en mobile, 2 en md+ para igualar Figma */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ✅ Corregido: se usa un UID en lugar del índice */}
          {Array.from({ length: 4 }).map(() => {
            const uid = crypto.randomUUID();
            return (
              <div
                key={uid}
                className="h-64 bg-purple-50 rounded-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] animate-pulse"
              />
            );
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resp.data?.map((n) => (
              <NecesidadCard key={n._id} item={n} />
            ))}
          </div>

          {/* Paginación muy sutil (coincide con tu estilo) */}
          {resp.pages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onPage(-1)}
                disabled={resp.page <= 1}
                className="h-10 px-6 rounded-full bg-white border border-purple-200 shadow-[0_6px_0_#E9E4FB] disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-600">
                {resp.page} / {resp.pages}
              </span>
              <button
                onClick={() => onPage(+1)}
                disabled={resp.page >= resp.pages}
                className="h-10 px-6 rounded-full bg-white border border-purple-200 shadow-[0_6px_0_#E9E4FB] disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Bloque de contacto igual al Figma */}
          <CalloutContacto
            whatsapp1="https://wa.me/573001112233"
            whatsapp2="https://wa.me/573004445566"
          />
        </>
      )}
    </div>
  );
}
