import React, { createContext, useContext, useCallback, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

let _id = 0;
const makeId = () => `${Date.now()}-${_id++}`;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const remove = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
    const t = timersRef.current[id];
    if (t) {
      clearTimeout(t);
      delete timersRef.current[id];
    }
  }, []);

  const push = useCallback((payload) => {
    const id = makeId();
    const toast = {
      id,
      type: payload.type ?? "info",           // "success" | "error" | "info"
      message: payload.message ?? "",
      duration: payload.duration ?? 4000,     // ms
    };
    setToasts((ts) => [...ts, toast]);

    // Autocierre
    timersRef.current[id] = setTimeout(() => remove(id), toast.duration);
  }, [remove]);

  const api = useMemo(() => ({
    push,
    success: (message, opts = {}) => push({ type: "success", message, ...opts }),
    error:   (message, opts = {}) => push({ type: "error", message, ...opts }),
    info:    (message, opts = {}) => push({ type: "info", message, ...opts }),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Contenedor fijo inferior-izquierdo */}
      <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
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

const TYPE_STYLES = {
  success: {
    ring: "ring-1 ring-emerald-200",
    bg: "bg-white",
    text: "text-emerald-700",
    icon: "✓",
    bar: "bg-emerald-500",
  },
  error: {
    ring: "ring-1 ring-rose-200",
    bg: "bg-white",
    text: "text-rose-700",
    icon: "✕",
    bar: "bg-rose-500",
  },
  info: {
    ring: "ring-1 ring-indigo-200",
    bg: "bg-white",
    text: "text-indigo-700",
    icon: "i",
    bar: "bg-indigo-500",
  },
};

const Toast = ({ toast, onClose }) => {
  const { type, message, duration } = toast;
  const styles = TYPE_STYLES[type] ?? TYPE_STYLES.info;

  // Barra con transición de ancho (100% → 0%) según duración
  const [start, setStart] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setStart(true), 20); // permitir pintar antes de animar
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto ${styles.bg} ${styles.ring} shadow-xl rounded-xl min-w-[280px] max-w-[420px] overflow-hidden`}
    >
      <div className="p-4 pr-10 relative">
        <div className={`text-sm leading-5 ${styles.text} flex items-start gap-3`}>
          <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            {styles.icon}
          </span>
          <span className="text-neutral-800">{message}</span>
        </div>

        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
        >
          ×
        </button>
      </div>

      {/* Barra de tiempo */}
      <div className="h-1 bg-neutral-200/70">
        <div
          className={`h-full ${styles.bar}`}
          style={{
            width: start ? "0%" : "100%",
            transitionProperty: "width",
            transitionTimingFunction: "linear",
            transitionDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  );
};
