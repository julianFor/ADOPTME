import React, { useEffect, useState } from "react";
import {
  getMascotasExternas,
  deleteMascota,
} from "../../../services/mascotaService";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MascotaExternaFormModal from "./MascotaExternaFormModal";
import ConfirmModal from "../../../components/ConfirmModal";

const MascotaExternaList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [searchText, setSearchText] = useState(""); // ← filtro
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [mascotaToDelete, setMascotaToDelete] = useState(null);

  const fetchMascotas = async () => {
    try {
      const response = await getMascotasExternas();
      setMascotas(response.data);
    } catch (error) {
      console.error("Error al obtener mascotas externas:", error);
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, []);

  // ✅ handleCrear eliminado porque no se usaba

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
      console.error("Error al eliminar mascota externa:", error);
    } finally {
      setShowConfirmModal(false);
      setMascotaToDelete(null);
    }
  };

  const filteredMascotas = mascotas.filter((m) =>
    `${m.nombre} ${m.contactoExterno?.nombre} ${m.contactoExterno?.telefono} ${m.contactoExterno?.correo} ${m.estado}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const getImagenPrincipal = (imagenes) => {
    if (!imagenes) return "https://via.placeholder.com/300x300?text=AdoptMe";
    const primera = Array.isArray(imagenes) ? imagenes[0] : imagenes;
    if (!primera) return "https://via.placeholder.com/300x300?text=AdoptMe";
    if (typeof primera === "string" && primera.startsWith("http")) return primera;
    return "https://via.placeholder.com/300x300?text=AdoptMe";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lista Mascotas Externas</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-4 pr-10 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-purple-500 absolute right-3 top-2.5" />
          </div>
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
                  <img
                    src={getImagenPrincipal(mascota.imagenes)}
                    alt="mascota"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-2">{mascota.nombre}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.nombre}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.telefono}</td>
                <td className="px-4 py-2">{mascota.contactoExterno?.correo}</td>
                <td className="px-4 py-2">{mascota.estado}</td>
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

        {filteredMascotas.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No hay mascotas que coincidan con la búsqueda.
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