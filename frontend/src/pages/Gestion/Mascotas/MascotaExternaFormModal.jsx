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
    tamano: "",
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

  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        especie: initialData.especie || "",
        tamano: initialData.tamano || initialData.tamaño || "",
        sexo: initialData.sexo || "",
        estado: initialData.estado || "Disponible",
        estadoSalud: initialData.estadoSalud || "",
        fechaNacimiento: initialData.fechaNacimiento?.split("T")[0] || "",
        contactoExterno: {
          nombre: initialData.contactoExterno?.nombre || "",
          telefono: initialData.contactoExterno?.telefono || "",
          email: initialData.contactoExterno?.email || initialData.contactoExterno?.correo || ""
        },
        imagen: null
      });
    } else {
      setFormData({
        nombre: "",
        especie: "",
        tamano: "",
        sexo: "",
        estado: "Disponible",
        estadoSalud: "",
        fechaNacimiento: "",
        contactoExterno: { nombre: "", telefono: "", email: "" },
        imagen: null
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Campos del contacto externo
    if (name === "contactoNombre" || name === "contactoTelefono" || name === "contactoEmail") {
      setFormData(prev => ({
        ...prev,
        contactoExterno: {
          ...prev.contactoExterno,
          [name.replace("contacto", "").toLowerCase()]: value
        }
      }));
    } 
    // Campos principales
    else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe exceder los 5MB");
      return;
    }
    setFormData(prev => ({
      ...prev,
      imagen: file
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validación básica
      if (!formData.nombre || !formData.especie || !formData.tamano || !formData.sexo) {
        throw new Error("Por favor complete todos los campos requeridos");
      }

      const data = new FormData();
      
      // Campos principales
      data.append('nombre', formData.nombre);
      data.append('especie', formData.especie);
      data.append('tamano', formData.tamano);
      data.append('sexo', formData.sexo);
      data.append('estado', formData.estado);
      data.append('estadoSalud', formData.estadoSalud);
      data.append('fechaNacimiento', formData.fechaNacimiento);
      
      // Contacto externo
      data.append('contactoExterno[nombre]', formData.contactoExterno.nombre);
      data.append('contactoExterno[telefono]', formData.contactoExterno.telefono);
      data.append('contactoExterno[email]', formData.contactoExterno.email);
      
      // Imagen
      if (formData.imagen) {
        data.append('imagen', formData.imagen);
      }

      if (initialData) {
        await updateMascota(initialData._id, data);
      } else {
        await createMascota(data);
      }

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error al guardar mascota:", error);
      setError(error.message || "Ocurrió un error al guardar la mascota");
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
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre, Especie, Tamaño, Sexo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre de la mascota"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie</label>
                <input
                  type="text"
                  name="especie"
                  value={formData.especie}
                  onChange={handleChange}
                  placeholder="Ej: Perro, Gato, etc."
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                <input
                  type="text"
                  name="tamano"
                  value={formData.tamano}
                  onChange={handleChange}
                  placeholder="Ej: Pequeño, Mediano, Grande"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccione sexo</option>
                  <option value="macho">Macho</option>
                  <option value="hembra">Hembra</option>
                </select>
              </div>
            </div>

            {/* Estado y Estado de salud */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Adoptado">Adoptado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de Salud</label>
                <input
                  type="text"
                  name="estadoSalud"
                  value={formData.estadoSalud}
                  onChange={handleChange}
                  placeholder="Ej: Saludable, En tratamiento"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Datos de contacto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Datos de Contacto</label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    name="contactoNombre"
                    value={formData.contactoExterno.nombre}
                    onChange={handleChange}
                    placeholder="Nombre contacto"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="contactoTelefono"
                    value={formData.contactoExterno.telefono}
                    onChange={handleChange}
                    placeholder="Teléfono"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="contactoEmail"
                    value={formData.contactoExterno.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de la Mascota</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {formData.imagen && (
                <p className="mt-1 text-sm text-gray-500">Archivo seleccionado: {formData.imagen.name}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
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