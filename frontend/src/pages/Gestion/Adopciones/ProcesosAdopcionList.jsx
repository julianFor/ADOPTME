import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { getAllProcesos } from "../../../services/procesoService";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { getCloudinaryUrl } from "../../../utils/imageUtils";

const SearchBar = ({ value, onChange }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Buscar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
    />
    <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
  </div>
);

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

const PetImage = ({ url }) => {
  if (!url) return <span className="text-gray-400">Sin imagen</span>;
  
  return (
    <img
      src={url}
      alt="mascota"
      className="w-12 h-12 rounded-full object-cover"
    />
  );
};

PetImage.propTypes = {
  url: PropTypes.string
};

const ProcesoRow = ({ proceso, onVerDetalles }) => {
  const imgUrl = getCloudinaryUrl(proceso.solicitud?.mascota?.imagenes?.[0]);
  const etapasCompletadas = contarEtapasCompletadas(proceso);
  const fechaInicio = new Date(proceso.createdAt).toLocaleDateString("es-CO");

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">
        <PetImage url={imgUrl} />
      </td>
      <td className="px-4 py-2">{proceso.solicitud?.mascota?.nombre}</td>
      <td className="px-4 py-2">{proceso.solicitud?.adoptante?.username}</td>
      <td className="px-4 py-2">{fechaInicio}</td>
      <td className="px-4 py-2">
        {proceso.finalizado ? "Finalizado" : "En proceso"}
      </td>
      <td className="px-4 py-2 font-bold text-green-600">{etapasCompletadas}</td>
      <td className="px-4 py-2">
        <button
          onClick={() => onVerDetalles(proceso._id)}
          className="border border-purple-500 text-purple-500 px-3 py-1 rounded-full hover:bg-purple-100 transition"
        >
          Ver Detalles
        </button>
      </td>
    </tr>
  );
};

ProcesoRow.propTypes = {
  proceso: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    finalizado: PropTypes.bool,
    solicitud: PropTypes.shape({
      mascota: PropTypes.shape({
        nombre: PropTypes.string,
        imagenes: PropTypes.array
      }),
      adoptante: PropTypes.shape({
        username: PropTypes.string
      })
    })
  }).isRequired,
  onVerDetalles: PropTypes.func.isRequired
};

const contarEtapasCompletadas = (proceso) => {
  let total = 1; // formulario siempre aprobado
  if (proceso.entrevista?.aprobada) total++;
  if (proceso.visita?.aprobada) total++;
  if (proceso.compromiso?.aprobada) total++;
  if (proceso.entrega?.aprobada) total++;
  return `${total}/5`;
};

const ProcesosAdopcionList = () => {
  const [procesos, setProcesos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const res = await getAllProcesos();
        setProcesos(res.procesos || []);
      } catch (error) {
        console.error("Error al obtener procesos de adopción:", error);
      }
    };
    fetchProcesos();
  }, []);

  const filtrar = procesos.filter((p) =>
    p.solicitud?.adoptante?.username?.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleVerDetalles = (procesoId) => {
    navigate(`/dashboard/admin/procesos-adopcion/${procesoId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Procesos de Adopción</h1>
        <SearchBar value={filtro} onChange={setFiltro} />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Adoptante</th>
              <th className="px-4 py-2">Fecha de Inicio</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Etapas Completadas</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrar.map((proceso) => (
              <ProcesoRow
                key={proceso._id}
                proceso={proceso}
                onVerDetalles={handleVerDetalles}
              />
            ))}
          </tbody>
        </table>
        {filtrar.length === 0 && (
          <p className="text-center text-gray-500 py-6">No hay procesos registrados.</p>
        )}
      </div>
    </div>
  );
};

export default ProcesosAdopcionList;
