// src/components/necesidades/CalloutContacto.jsx
import { FaWhatsapp } from "react-icons/fa";

export default function CalloutContacto({
  whatsappHref = "https://wa.me/573024529227",
  imgSrc = "/gatoConGafas.png",
}) {
  // ---- knobs para micro-ajustes 1:1 con Figma ----
  const OPEN_W = 188;   // ancho pill abierto (px)
  const CLOSED_W = 47;  // ancho pill cerrado (solo ícono)
  const ICON_SIZE = 44; // diámetro del círculo (px)
  const ICON_RIGHT = 0; // separación del borde derecho interno (px)

  return (
    <section
      className="relative bg-white rounded-[28px] max-w-[800px] mx-auto"
      style={{
        border: "1.5px solid #C9B8FF",
        padding: "0px 30px", // top/bottom 22, laterales 24 (igual a Figma)
      }}
    >
      {/* Keyframes exactos y suavizados */}
      <style>{`
        @keyframes pillOpenClose {
          0%   { width: ${OPEN_W}px; padding-left: 22px; padding-right: ${ICON_SIZE + ICON_RIGHT + 10}px; }
          38%  { width: ${OPEN_W}px; padding-left: 22px; padding-right: ${ICON_SIZE + ICON_RIGHT + 10}px; }
          50%  { width: ${CLOSED_W}px; padding-left: 12px; padding-right: 12px; }
          88%  { width: ${CLOSED_W}px; padding-left: 12px; padding-right: 12px; }
          100% { width: ${OPEN_W}px; padding-left: 22px; padding-right: ${ICON_SIZE + ICON_RIGHT + 10}px; }
        }
        @keyframes labelOpenClose {
          0%   { opacity: 1; max-width: 160px; transform: translateX(0); }
          38%  { opacity: 1; max-width: 160px; transform: translateX(0); }
          50%  { opacity: 0; max-width: 0;    transform: translateX(-6px); }
          88%  { opacity: 0; max-width: 0;    transform: translateX(-6px); }
          100% { opacity: 1; max-width: 160px; transform: translateX(0); }
        }
        @keyframes iconBeat {
          0%,100% { transform: translateY(-50%) scale(1); }
          50%     { transform: translateY(-50%) scale(1.06); }
        }
      `}</style>

      <div
        className="
          grid items-center
          gap-0
          md:grid-cols-[1fr_auto]  
        "
      >
        {/* TEXTO (izquierda) */}
        <div className="min-w-0">
          <h3 className="text-[26px] font-semibold leading-tight" style={{ color: "#111827" }}>
            ¿Quieres donar algo a la fundación?
          </h3>
          <p className="mt-2 text-[18px] leading-6" style={{ color: "#6B7280" }}>
            Contáctanos y dona con amor.
          </p>

          {/* BOTÓN (abre/cierra) */}
          <div className="mt-5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Contactanos por WhatsApp"
              className="
                relative inline-flex items-center justify-start
                h-[48px] rounded-full bg-white font-semibold
                border shadow-[0_6px_0_#E9E4FB]
                overflow-hidden
              "
              style={{
                borderColor: "#C9B8FF",
                animation: "pillOpenClose 3.4s ease-in-out infinite",
              }}
            >
              {/* Texto “Contactanos” (se oculta/abre) */}
              <span
                className="text-[16px] whitespace-nowrap select-none"
                style={{
                  color: "#7C3AED",
                  animation: "labelOpenClose 3.4s ease-in-out infinite",
                  overflow: "hidden",
                  lineHeight: "48px",
                }}
              >
                Contactanos
              </span>

              {/* Ícono WhatsApp DENTRO del pill, pegado al borde derecho */}
              <span
                className="absolute top-1/2 flex items-center justify-center rounded-full"
                style={{
                  right: ICON_RIGHT,
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  background: "linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)",
                  boxShadow: "0 10px 20px rgba(168,85,247,0.25)",
                  transform: "translateY(-50%)",
                  animation: "iconBeat 1.6s ease-in-out infinite",
                }}
              >
                <FaWhatsapp color="#fff" size={20} />
              </span>
            </a>
          </div>
        </div>

        {/* GATO (derecha) – proporción y cercanía como en Figma */}
        <div className="hidden md:block">
          <img
            src={imgSrc}
            alt="Gato con gafas"
            className="select-none"
            draggable="false"
            style={{
              height: 290,
              width: "auto",
              marginRight: 8, // lo aproxima al borde como en Figma
            }}
          />
        </div>
      </div>
    </section>
  );
}
