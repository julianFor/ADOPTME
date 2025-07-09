import { useEffect } from "react";
import { useNotificaciones } from "../context/NotificationContext";
import { FaCheck, FaTimes, FaClipboardList, FaHeart } from "react-icons/fa";

const iconos = {
  "solicitud-adopcion-creada": <FaClipboardList className="text-2xl" />,
  "solicitud-adopcion-aprobada": <FaCheck className="text-2xl text-green-600" />,
  "solicitud-adopcion-rechazada": <FaTimes className="text-2xl text-red-500" />,
  "proceso-entrega-confirmada": <FaHeart className="text-2xl text-pink-500" />,
  "nueva-solicitud-publicacion": <FaClipboardList className="text-2xl" />,
  "solicitud-publicacion-aprobada": <FaCheck className="text-2xl text-green-600" />,
  "solicitud-publicacion-rechazada": <FaTimes className="text-2xl text-red-500" />,
};

function NotificationModal({ visible, onClose }) {
  const { notificaciones, marcarUnaComoLeida } = useNotificaciones();

  useEffect(() => {
    if (visible) {
      notificaciones.forEach((n) => {
        if (!n.leida) marcarUnaComoLeida(n._id);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="absolute top-20 right-0 z-50 w-80 bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-up border border-gray-200">
      <div className="bg-purple-100 py-3 text-center font-bold text-purple-600 text-lg">
        Notificaciones
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notificaciones.map((n) => (
          <div
            key={n._id}
            className={`flex gap-3 items-start px-4 py-3 border-b border-purple-100 bg-purple-50`}
          >
            <div className="pt-1">{iconos[n.tipo]}</div>

            <div className="flex-1 text-sm">
              <div className="font-bold text-gray-800">
                {getTitulo(n.tipo)}
              </div>
              <div className="text-gray-600 text-xs">{n.mensaje}</div>
            </div>

            {!n.leida && (
              <span className="w-2 h-2 mt-1.5 rounded-full bg-purple-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const getTitulo = (tipo) => {
  switch (tipo) {
    case "solicitud-adopcion-creada":
      return "Nueva Solicitud de Adopción";
    case "solicitud-adopcion-aprobada":
      return "Solicitud Adopción Aprobada";
    case "solicitud-adopcion-rechazada":
      return "Solicitud Adopción Rechazada";
    case "proceso-entrega-confirmada":
      return "Peludito ha sido Adoptado!!!!";
    case "nueva-solicitud-publicacion":
      return "Nueva Solicitud de Publicación";
    case "solicitud-publicacion-aprobada":
      return "Solicitud Publicación Aprobada";
    case "solicitud-publicacion-rechazada":
      return "Solicitud Publicación Rechazada";
    default:
      return "Notificación";
  }
};

export default NotificationModal;
