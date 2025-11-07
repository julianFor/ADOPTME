import React, { useEffect, useState } from "react";
import {
  getMascotasFundacion,
  deleteMascota,
} from "../../../services/mascotaService";
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import MascotaFundacionFormModal from "./MascotaFundacionFormModal";
import ConfirmModal from "../../../components/ConfirmModal";

// 🟢 Funciones auxiliares para reducir complejidad
const calcularDiferencias = (dob, today) => {
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  let days = today.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthIndex = (today.getMonth() - 1 + 12) % 12;
    const prevMonthYear =
      prevMonthIndex === 11 ? today.getFullYear() - 1 : today.getFullYear();
    days += new Date(prevMonthYear, prevMonthIndex + 1, 0).getDate();
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
};

const formatearEdad = ({ years, months, days }) => {
  if (years > 0) return `${years} año${years === 1 ? "" : "s"}`;
  if (months > 0) return `${months} mes${months === 1 ? "" : "es"}`;
  return `${days} día${days === 1 ? "" : "s"}`;
};

const formatSimpleAge = (fechaNacimiento) => {
  if (!fechaNacimiento) {
    return "No especificado";
  }

  const dob = new Date(fechaNacimiento);
  const esNumeroValido = Number.isFinite(dob.getTime());
  
  if (!esNumeroValido) {
    return "No especificado";
  }

  const today = new Date();
  const esFechaFutura = dob > today;
  
  if (esFechaFutura) {
    return "Fecha inválida";
  }
  
  const diferencias = calcularDiferencias(dob, today);
  return formatearEdad(diferencias);
};

const MascotaFundacionList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [searchText, setSearchText] = useState("");
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

  // 🟣 Filtro por nombre, especie, estado de salud o disponibilidad
  const filteredMascotas = mascotas.filter((m) =>
    `${m.nombre} ${m.especie} ${m.estadoSalud} ${m.disponible ? "Disponible" : "No disponible"}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // 🔸 Obtener imagen principal (URL válida o placeholder)
  const getImagenPrincipal = (imagenes) => {
    const tieneImagenValida = imagenes && Array.isArray(imagenes) && imagenes[0] && typeof imagenes[0] === "string" && imagenes[0].startsWith("http");
    return tieneImagenValida ? imagenes[0] : "https://via.placeholder.com/300x300?text=AdoptMe";
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
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
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
                  <td className="px-4 py-2">{mascota.especie}</td>
                  <td className="px-4 py-2">{formatSimpleAge(mascota.fechaNacimiento)}</td>
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
              {filteredMascotas.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No hay mascotas que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
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