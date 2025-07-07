import React, { useEffect, useState } from "react";
import {
  getMascotasFundacion,
  deleteMascota,
} from "../../../services/mascotaService";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MascotaFundacionFormModal from "./MascotaFundacionFormModal";
import ConfirmModal from "../../../components/ConfirmModal";

const MascotaFundacionList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [mascotaToDelete, setMascotaToDelete] = useState(null);

  const fetchMascotas = async () => {
    try {
      const response = await getMascotasFundacion();
      setMascotas(response.data);
    } catch (error) {
      console.error("Error al obtener mascotas:", error);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  const handleCrear = () => {
    setSelectedMascota(null);
    setShowModal(true);
  };

  const handleEditar = (mascota) => {
    setSelectedMascota(mascota);
    setShowModal(true);
  };

  const handleEliminar = (mascota) => {
    setMascotaToDelete(mascota);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteMascota(mascotaToDelete._id);
      fetchMascotas();
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
    } finally {
      setShowConfirmModal(false);
      setMascotaToDelete(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Mascotas Fundación</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
          </div>
          <button
            onClick={handleCrear}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Añadir Mascota
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Especie</th>
              <th className="px-4 py-2">Edad</th>
              <th className="px-4 py-2">Estado Salud</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {mascotas.map((mascota) => (
              <tr key={mascota._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                    <img
                    src={`http://localhost:3000/uploads/${mascota.imagenes?.[0]}`}
                    alt="mascota"
                    className="w-12 h-12 rounded-full object-cover"
                    />
                </td>
                <td className="px-4 py-2">{mascota.nombre}</td>
                <td className="px-4 py-2">{mascota.especie}</td>
                <td className="px-4 py-2">
                {mascota.fechaNacimiento
                    ? Math.floor((new Date() - new Date(mascota.fechaNacimiento)) / (1000 * 60 * 60 * 24 * 365)) + " años"
                    : "No especificado"}
                </td>
                <td className="px-4 py-2">{mascota.estadoSalud}</td>
                <td className="px-4 py-2">
                {mascota.disponible ? "Disponible" : "No disponible"}
                </td>
                <td className="px-4 py-2 flex justify-center gap-4">
                  <PencilIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer"
                    onClick={() => handleEditar(mascota)}
                  />
                  <TrashIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer"
                    onClick={() => handleEliminar(mascota)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {mascotas.length === 0 && (
          <p className="text-center text-gray-500 py-6">No hay mascotas registradas.</p>
        )}
      </div>

      <MascotaFundacionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => {
          setShowModal(false);
          fetchMascotas();
        }}
        initialData={selectedMascota}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        message={`¿Estás seguro de eliminar a "${mascotaToDelete?.nombre}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default MascotaFundacionList;
