import { createContext, useState, useEffect, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import {
  contarNoLeidas,
  getMisNotificaciones,
  marcarComoLeida
} from "../services/notificacionService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);

  const cargarNotificaciones = async () => {
    try {
      setCargando(true);
      const res = await getMisNotificaciones();
      setNotificaciones(res.data?.notificaciones || res);
      const resContador = await contarNoLeidas();
      setNoLeidas(resContador.data?.noLeidas ?? resContador);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    } finally {
      setCargando(false);
    }
  };

  const marcarUnaComoLeida = async (id) => {
    try {
      await marcarComoLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n._id === id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => prev - 1);
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  useEffect(() => {
    if (user) {
      cargarNotificaciones();
    }
  }, [user]);

  // ✅ useMemo para valor estable del contexto
  const value = useMemo(() => ({
    notificaciones,
    noLeidas,
    cargarNotificaciones,
    marcarUnaComoLeida,
    cargando
  }), [notificaciones, noLeidas, cargando]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ✅ Validación de props
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotificaciones = () => useContext(NotificationContext);
