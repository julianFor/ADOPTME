import React, { useEffect, useState } from "react";
import {
  getMascotasExternas,
  deleteMascota,
} from "../../../services/mascotaService";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MascotaExternaFormModal from "./MascotaExternaFormModal";
import ConfirmModal from "../../../components/ConfirmModal";

const MascotaExternaList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [filteredMascotas, setFilteredMascotas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [mascotaToDelete, setMascotaToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      const response = await getMascotasExternas();
      if (response && response.data) {
        setMascotas(response.data);
        setFilteredMascotas(response.data);
      } else {
        throw new Error("Formato de respuesta inesperado");
      }
    } catch (error) {
      console.error("Error al obtener mascotas externas:", error);
      setError("Error al cargar las mascotas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMascotas(mascotas);
    } else {
      const filtered = mascotas.filter(mascota =>
        mascota.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mascota.contactoExterno?.nombre && 
         mascota.contactoExterno.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredMascotas(filtered);
    }
  }, [searchTerm, mascotas]);

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
      await fetchMascotas();
    } catch (error) {
      console.error("Error al eliminar mascota externa:", error);
      setError("Error al eliminar la mascota. Por favor, inténtalo de nuevo.");
    } finally {
      setShowConfirmModal(false);
      setMascotaToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchMascotas}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Reintentar</title>
              <path d="M14.66 15.66A8 8 0 1 1 17 10h-2a6 6 0 1 0-1.76 4.24l1.42 1.42zM12 10h8l-4 4-4-4z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Mascotas Externas</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o contacto"
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              <th className="px-4 py-2">Publicada Por</th>
              <th className="px-4 py-2">Teléfono Contacto</th>
              <th className="px-4 py-2">Correo Contacto</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredMascotas.map((mascota) => (
              <tr key={mascota._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  {mascota.imagenes?.[0] ? (
                    <img
                      src={`http://localhost:3000/uploads/${mascota.imagenes[0]}`}
                      alt="mascota"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/48';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">{mascota.nombre || '-'}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.nombre || '-'}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.telefono || '-'}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.correo || mascota.contactoExterno?.email || '-'}</td>
                <td className="px-4 py-2">{mascota.estado || '-'}</td>
                <td className="px-4 py-2 flex justify-center gap-4">
                  <PencilIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer hover:text-purple-700"
                    onClick={() => handleEditar(mascota)}
                  />
                  <TrashIcon
                    className="h-5 w-5 text-purple-500 cursor-pointer hover:text-purple-700"
                    onClick={() => handleEliminar(mascota)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMascotas.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            {searchTerm ? "No se encontraron mascotas con ese criterio" : "No hay mascotas registradas."}
          </p>
        )}
      </div>

      <MascotaExternaFormModal
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

export default MascotaExternaList;
