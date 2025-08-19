// src/components/necesidades/NecesidadCard.jsx
import { FaWhatsapp } from "react-icons/fa";
import ProgressBar from "./ProgressBar";

const URG = {
  alta: "bg-[#FFE3E3] text-[#D65353]",
  media: "bg-[#FFECC7] text-[#C07A17]",
  baja: "bg-[#DAF5E9] text-[#1D9C72]",
};

export default function NecesidadCard({ item }) {
  const img = item?.imagenPrincipal?.url || "/placeholder-catdog.jpg";
  const pct = Math.min(100, Math.round((item.recibido / item.objetivo) * 100));

  return (
    <article
      className="
        w-full rounded-[24px] bg-white
        shadow-[0px_12px_40px_rgba(0,0,0,0.08)]
        overflow-hidden
      "
      style={{ border: "1px solid #EFE9FD" }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Imagen grande a la izquierda, esquinas muy redondeadas */}
        <div className="sm:w-[48%]">
          <img
            src={img}
            alt={item.titulo}
            className="w-full h-[260px] sm:h-full object-cover sm:rounded-l-[24px]"
            loading="lazy"
          />
        </div>

        {/* Contenido a la derecha */}
        <div className="flex-1 p-5 sm:p-6">
          {/* Título */}
          <h3 className="text-[22px] sm:text-[24px] font-semibold text-[#332D41] leading-tight">
            {item.titulo}
          </h3>

          {/* Fecha */}
          <p className="mt-1 text-[13px] text-[#6B7280]">
            Fecha Publicación: {formatFecha(item.fechaPublicacion)}
          </p>

          {/* Chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium bg-[#EFE9FD] text-[#7C3AED]">
              {capital(item.categoria)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${URG[item.urgencia] || URG.media}`}
            >
              {capital(item.urgencia)}
            </span>
          </div>

          {/* Descripción breve */}
          {item.descripcionBreve && (
            <p className="mt-3 text-[14px] text-[#6B7280] leading-relaxed">
              {item.descripcionBreve}
            </p>
          )}

          {/* Barra + texto “2 Unidades / 5 Unidades” */}
          <div className="mt-4">
            <ProgressBar value={pct} />
            <div className="mt-2 text-[14px] text-[#374151]">
              <span className="font-medium">{item.recibido} Unidades</span>
              <span className="mx-1">/</span>
              <span className="font-medium">{item.objetivo} Unidades</span>
            </div>
          </div>

          {/* CTA alineado a la derecha (WhatsApp + Donar) */}
          <div className="mt-4 flex justify-end">
            <a
              href={`https://wa.me/573024529227?text=Hola,%20quiero%20ayudar%20con:%20${encodeURIComponent(
                item.titulo
              )}`}
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex items-center gap-2
                h-[44px] px-6 rounded-full
                text-white font-semibold
                bg-gradient-to-r from-[#A855F7] to-[#8B5CF6]
                shadow-[0_10px_20px_rgba(168,85,247,0.25)]
                hover:opacity-95 transition
              "
            >
              <span className="w-[28px] h-[28px] rounded-full bg-white/20 flex items-center justify-center">
                <FaWhatsapp className="text-white text-lg" />
              </span>
              Donar
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function capital(s = "") {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function formatFecha(fecha) {
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}
