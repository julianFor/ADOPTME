import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMascotaById } from '../../services/mascotaService'; // ✅

import DetalleMascotaFundacion from './DetalleMascotaFundacion';
import DetalleMascotaExterna from './DetalleMascotaExterna';

const MascotaDetalle = () => {
  const { id } = useParams();
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const data = await getMascotaById(id); // ✅
        console.log("Mascota recibida:", data);
        setMascota(data);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de la mascota.');
      } finally {
        setLoading(false);
      }
    };

    fetchMascota();
  }, [id]);

  if (loading) return <p className="text-center py-10">Cargando...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;
  if (!mascota) return null;

console.log("Origen recibido:", mascota.origen);
console.log("Condición:", mascota?.origen?.trim().toLowerCase() === 'fundacion');

  // Renderizar vista según el origen
  return (
    
    <>
        {mascota?.origen?.trim().toLowerCase() === 'fundacion' ? (
    <DetalleMascotaFundacion mascota={mascota} />
    ) : (
    <DetalleMascotaExterna mascota={mascota} />
    )}

    </>
  );
};

export default MascotaDetalle;
