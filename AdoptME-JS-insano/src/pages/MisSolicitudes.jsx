import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/MisSolicitudes.css';

const MisSolicitudes = ({ user }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('solicitudesAdopcion/mias', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSolicitudes(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'aprobada':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'rechazada':
        return { backgroundColor: '#f8d7da', color: '#721c24' };
      case 'en proceso':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41' };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando tus solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="mis-solicitudes-container">
      <h1>Mis Solicitudes de Adopción</h1>
      
      {solicitudes.length === 0 ? (
        <div className="no-solicitudes">
          <p>No tienes solicitudes de adopción registradas.</p>
          <Link to="/adoptar" className="btn-explorar">
            Explorar mascotas disponibles
          </Link>
        </div>
      ) : (
        <div className="solicitudes-list">
          {solicitudes.map((solicitud) => (
            <div key={solicitud._id} className="solicitud-card">
              <div className="solicitud-header">
                {/* Cambio principal aquí: accedemos a name en lugar de mascota.nombre */}
                <h3>{solicitud.mascota?.name || solicitud.mascota?.nombre || 'Mascota no especificada'}</h3>
                <span 
                  className="estado-badge"
                  style={getEstadoStyle(solicitud.estado)}
                >
                  {solicitud.estado}
                </span>
              </div>
              
              <div className="solicitud-details">
                <p><strong>Fecha:</strong> {formatDate(solicitud.createdAt)}</p>
                <p><strong>Especie:</strong> {solicitud.mascota?.species || solicitud.mascota?.especie || 'No especificada'}</p>
                <p><strong>Raza:</strong> {solicitud.mascota?.breed || solicitud.mascota?.raza || 'No especificada'}</p>
                
                {solicitud.motivoAdopcion && (
                  <p><strong>Motivo:</strong> {solicitud.motivoAdopcion}</p>
                )}
                
                {solicitud.comentarios && (
                  <div className="comentarios">
                    <strong>Comentarios:</strong>
                    <p>{solicitud.comentarios}</p>
                  </div>
                )}
              </div>
              
              {solicitud.mascota?._id && (
                <Link 
                  to={`/mascota/${solicitud.mascota._id}`} 
                  className="btn-ver-mascota"
                >
                  Ver mascota
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisSolicitudes;