import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  createMascota,
  updateMascota
} from "../../../services/mascotaService";

const MascotaExternaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    tamaño: "",
    sexo: "",
    estado: "Disponible",
    estadoSalud: "",
    fechaNacimiento: "",
    contactoExterno: {
      nombre: "",
      telefono: "",
      email: ""
    },
    imagen: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fechaNacimiento: initialData.fechaNacimiento?.split("T")[0] || "",
        contactoExterno: {
          nombre: initialData.contactoExterno?.nombre || "",
          telefono: initialData.contactoExterno?.telefono || "",
          email: initialData.contactoExterno?.email || "",
        },
        imagen: null
      });
    } else {
      setFormData({
        nombre: "",
        especie: "",
        tamaño: "",
        sexo: "",
        estado: "Disponible",
        estadoSalud: "",
        fechaNacimiento: "",
        contactoExterno: { nombre: "", telefono: "", email: "" },
        imagen: null
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["nombre", "telefono", "email"].includes(name)) {
      setFormData({
        ...formData,
        contactoExterno: { ...formData.contactoExterno, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, imagen: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "contactoExterno") {
          data.append("contactoExterno[nombre]", value.nombre);
          data.append("contactoExterno[telefono]", value.telefono);
          data.append("contactoExterno[email]", value.email);
        } else if (key === "imagen" && value) {
          data.append("imagenes", value);
        } else {
          data.append(key, value);
        }
      });

      if (initialData) {
        await updateMascota(initialData._id, data);
      } else {
        await createMascota(data);
      }

      onSubmit();
    } catch (error) {
      console.error("Error al guardar mascota:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
          <Dialog.Title className="text-xl font-semibold mb-4">
            {initialData ? "Editar Mascota Externa" : "Crear Mascota Externa"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre, Especie, Tamaño, Sexo */}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required className="input" />
              <input type="text" name="especie" value={formData.especie} onChange={handleChange} placeholder="Especie" required className="input" />
              <input type="text" name="tamaño" value={formData.tamaño} onChange={handleChange} placeholder="Tamaño" required className="input" />
              <select name="sexo" value={formData.sexo} onChange={handleChange} required className="input">
                <option value="">Sexo</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            {/* Estado y Estado de salud */}
            <div className="grid grid-cols-2 gap-4">
              <select name="estado" value={formData.estado} onChange={handleChange} className="input">
                <option value="Disponible">Disponible</option>
                <option value="En proceso">En proceso</option>
                <option value="Adoptado">Adoptado</option>
              </select>
              <input type="text" name="estadoSalud" value={formData.estadoSalud} onChange={handleChange} placeholder="Estado de Salud" required className="input" />
            </div>

            {/* Fecha de nacimiento */}
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required className="input w-full" />

            {/* Datos de contacto */}
            <div className="grid grid-cols-3 gap-4">
              <input type="text" name="nombre" value={formData.contactoExterno.nombre} onChange={handleChange} placeholder="Nombre contacto" required className="input" />
              <input type="text" name="telefono" value={formData.contactoExterno.telefono} onChange={handleChange} placeholder="Teléfono" required className="input" />
              <input type="email" name="email" value={formData.contactoExterno.email} onChange={handleChange} placeholder="Correo electrónico" required className="input" />
            </div>

            {/* Imagen */}
            <input type="file" accept="image/*" onChange={handleFileChange} className="input w-full" />

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-400 rounded-md">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md">
                {initialData ? "Guardar Cambios" : "Crear Mascota"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MascotaExternaFormModal;
