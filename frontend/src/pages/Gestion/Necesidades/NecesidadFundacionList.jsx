import React, { useEffect, useMemo, useState } from "react";
import {
  listarNecesidades,
  eliminarNecesidad,
} from "../../../services/necesidadService";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ConfirmModal from "../../../components/ConfirmModal";
import NecesidadFormModal from "../../../components/necesidades/NecesidadFormModal";

/* ====== Helpers ====== */
const formatFecha = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const estadoLabel = (e) =>
  (
    {
      activa: "Pendiente",
      pausada: "Pausada",
      cumplida: "Cumplida",
      vencida: "Vencida",
    }[e] || e || "-"
  );

const getImagenPrincipal = (item) =>
  item?.imagenPrincipal?.url || "/placeholder-catdog.jpg";

export default function NecesidadFundacionList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [searchText, setSearchText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null); // null = crear

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listarNecesidades({
        estado: "",
        limit: 200,
        page: 1,
        sort: "-fechaPublicacion",
      });
      setRows(res.data || []);
    } catch (err) {
      console.error("Error al listar necesidades:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((n) =>
      `${n.titulo} ${n.categoria} ${n.urgencia} ${estadoLabel(n.estado)}`
        .toLowerCase()
        .includes(q)
    );
  }, [rows, searchText]);

  /* ====== handlers ====== */
  const onEditar = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const onEliminar = (row) => {
    setToDelete(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (!toDelete) return;
      await eliminarNecesidad(toDelete._id);
      await fetchData();
    } catch (e) {
      console.error("Error al eliminar:", e);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const onCrear = () => {
    setSelectedRow(null);
    setShowModal(true);
  };

  const handleSaved = async () => {
    await fetchData();
  };

  /* ====== render body de tabla ====== */
  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <tr key={`need-row-skeleton-${index}`} className="border-b">
          <td className="px-4 py-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
          </td>
        </tr>
      ));
    }

    if (filtered.length > 0) {
      return filtered.map((n) => (
        <tr key={n._id} className="border-b hover:bg-gray-50">
          <td className="px-4 py-3">
            <img
              src={getImagenPrincipal(n)}
              alt={n.titulo}
              className="w-12 h-12 rounded-full object-cover"
            />
          </td>
          <td className="px-4 py-3">
            <div className="font-medium text-gray-800">{n.titulo}</div>
            <div className="text-xs text-gray-400 capitalize">
              {n.categoria} · {n.urgencia}
            </div>
          </td>
          <td className="px-4 py-3">{n.objetivo}u</td>
          <td className="px-4 py-3">{formatFecha(n.fechaPublicacion)}</td>
          <td className="px-4 py-3">{estadoLabel(n.estado)}</td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-center gap-4">
              <PencilIcon
                title="Editar"
                className="h-5 w-5 text-purple-500 cursor-pointer"
                onClick={() => onEditar(n)}
              />
              <TrashIcon
                title="Eliminar"
                className="h-5 w-5 text-purple-500 cursor-pointer"
                onClick={() => onEliminar(n)}
              />
            </div>
          </td>
        </tr>
      ));
    }

    return (
      <tr>
        <td colSpan={7} className="py-8 text-center text-gray-500">
          No hay necesidades que coincidan con la búsqueda.
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Necesidades de la Fundación</h1>

        <div className="flex gap-4">
          {/* Search */}
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

          {/* Añadir */}
          <button
            onClick={onCrear}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Añadir Necesidad
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b text-left text-gray-400 font-light">
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Necesidad</th>
              <th className="px-4 py-2">Cantidad</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>{renderTableBody()}</tbody>
        </table>
      </div>

      {/* Modal confirmar eliminación */}
      <ConfirmModal
        isOpen={confirmOpen}
        message={`¿Eliminar la necesidad "${toDelete?.titulo}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Modal crear/editar */}
      <NecesidadFormModal
        isOpen={showModal}
        initialData={selectedRow}
        onClose={() => setShowModal(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
