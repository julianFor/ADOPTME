import React, { createContext, useContext, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

let _id = 0;
const makeId = () => `${Date.now()}-${_id++}`;

export const ToastProvider = ({
  children,
  position = "bottom-left", // bottom-left | bottom-right | top-right | top-left (por si después lo quieres mover)
  max = 5,                   // máximo de toasts apilados
}) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});
  const remainingRef = useRef({}); // para pausar/reanudar en hover

  // limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
      remainingRef.current = {};
    };
  }, []);

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    delete remainingRef.current[id];
  }, []);

  const startTimer = useCallback((toast) => {
    const { id, duration } = toast;
    if (!duration) return;
    const startedAt = Date.now();
    remainingRef.current[id] = { remaining: duration, startedAt };

    timersRef.current[id] = setTimeout(() => remove(id), duration);
  }, [remove]);

  const push = useCallback((payload) => {
    const id = makeId();
    const toast = {
      id,
      type: payload.type ?? "info",                // success | error | info | warning
      title: payload.title ?? "",                  // opcional
      message: payload.message ?? "",
      duration: payload.duration ?? 4000,          // ms
      action: payload.action ?? null,              // { label, onClick }
    };

    setToasts((ts) => {
      const next = [...ts, toast];
      // respeta límite máximo (quita el más antiguo visualmente)
      return next.length >  max ? next.slice(next.length - max) : next;
    });

    startTimer(toast);
  }, [max, startTimer]);

  const api = useMemo(() => ({
    push,
    success: (message, opts = {}) => push({ type: "success", message, ...opts }),
    error:   (message, opts = {}) => push({ type: "error",   message, ...opts }),
    info:    (message, opts = {}) => push({ type: "info",    message, ...opts }),
    warning: (message, opts = {}) => push({ type: "warning", message, ...opts }),
  }), [push]);

  // clases por posición
  const posCls = useMemo(() => {
    const map = {
      "bottom-left":  "bottom-4 left-4",
      "bottom-right": "bottom-4 right-4",
      "top-right":    "top-4 right-4",
      "top-left":     "top-4 left-4",
    };
    return map[position] ?? map["bottom-left"];
  }, [position]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={`fixed ${posCls} z-[100] flex flex-col gap-3 pointer-events-none`}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            toast={t}
            onClose={() => remove(t.id)}
            onPause={() => {
              // pausa en hover
              const timer = timersRef.current[t.id];
              if (timer) {
                clearTimeout(timer);
                const rec = remainingRef.current[t.id];
                if (rec) {
                  const elapsed = Date.now() - rec.startedAt;
                  rec.remaining = Math.max(0, rec.remaining - elapsed);
                }
              }
            }}
            onResume={() => {
              // reanuda al salir del hover
              const rec = remainingRef.current[t.id];
              if (rec && rec.remaining > 0) {
                rec.startedAt = Date.now();
                timersRef.current[t.id] = setTimeout(() => remove(t.id), rec.remaining);
              }
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider />");
  return ctx;
};

// ---- Estilos por tipo (alineados con el diseño actual del proyecto)
const TYPES = {
  success: {
    ring: "ring-1 ring-emerald-200",
    text: "text-emerald-700",
    iconWrap: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
    Icon: FiCheckCircle,
    ariaRole: "status",
  },
  error: {
    ring: "ring-1 ring-rose-200",
    text: "text-rose-700",
    iconWrap: "bg-rose-50 text-rose-600",
    bar: "bg-rose-500",
    Icon: FiXCircle,
    ariaRole: "alert",
  },
  info: {
    ring: "ring-1 ring-indigo-200",
    text: "text-indigo-700",
    iconWrap: "bg-indigo-50 text-indigo-600",
    bar: "bg-indigo-500",
    Icon: FiInfo,
    ariaRole: "status",
  },
  warning: {
    ring: "ring-1 ring-amber-200",
    text: "text-amber-700",
    iconWrap: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
    Icon: FiAlertTriangle,
    ariaRole: "alert",
  },
};

const Toast = ({ toast, onClose, onPause, onResume }) => {
  const { type, title, message, duration } = toast;
  const sty = TYPES[type] ?? TYPES.info;
  const Icon = sty.Icon;

  // animación de entrada
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // progreso (100%→0%)
  const [start, setStart] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStart(true), 20);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role={sty.ariaRole}
      aria-live="polite"
      onMouseEnter={onPause}
      onMouseLeave={onResume}
      className={[
        "pointer-events-auto bg-white shadow-xl rounded-xl min-w-[280px] max-w-[420px] overflow-hidden",
        "transition-all duration-200",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        sty.ring,
      ].join(" ")}
    >
      <div className="p-4 pr-10 relative">
        <div className="text-sm leading-5 text-neutral-800 flex items-start gap-3">
          <span className={`mt-[2px] inline-flex h-7 w-7 items-center justify-center rounded-full ${sty.iconWrap}`}>
            <Icon className="text-lg" />
          </span>
          <div className="flex-1">
            {title ? <p className={`font-semibold ${sty.text}`}>{title}</p> : null}
            <p className="mt-0.5">{message}</p>
          </div>
        </div>

        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
        >
          <FiX />
        </button>
      </div>

      {/* Barra de tiempo */}
      {duration ? (
        <div className="h-1 bg-neutral-200/70">
          <div
            className={`h-full ${sty.bar}`}
            style={{
              width: start ? "0%" : "100%",
              transitionProperty: "width",
              transitionTimingFunction: "linear",
              transitionDuration: `${duration}ms`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
};
