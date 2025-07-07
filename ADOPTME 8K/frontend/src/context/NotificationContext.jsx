import { createContext, useState, useEffect, useContext } from "react";
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
      setNotificaciones(res.data?.notificaciones || res); // adaptado a ambos formatos
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

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        noLeidas,
        cargarNotificaciones,
        marcarUnaComoLeida,
        cargando
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificaciones = () => useContext(NotificationContext);
