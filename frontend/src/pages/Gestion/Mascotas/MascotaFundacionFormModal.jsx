import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  createMascota,
  updateMascota,
} from "../../../services/mascotaService";

const MascotaFundacionFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    nombre: "",
    especie: "gato",
    raza: "",
    fechaNacimiento: "",
    sexo: "hembra",
    tamano: "mediano",
    descripcion: "",
    estadoSalud: "saludable",
    esterilizado: false,
    origen: "fundacion",
  });
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        tamano: initialData.tamano || initialData.tamaño || "mediano",
        fechaNacimiento: initialData.fechaNacimiento
          ? new Date(initialData.fechaNacimiento).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({
        nombre: "",
        especie: "gato",
        raza: "",
        fechaNacimiento: "",
        sexo: "hembra",
        tamano: "mediano",
        descripcion: "",
        estadoSalud: "saludable",
        esterilizado: false,
        origen: "fundacion",
      });
      setImagen(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setImagen(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    for (const key in form) {
      formData.append(key, form[key]);
    }

    if (imagen) {
      formData.append("imagenes", imagen);
    }

    try {
      if (initialData) {
        await updateMascota(initialData._id, formData);
      } else {
        await createMascota(formData);
      }
      onSubmit();
    } catch (error) {
      console.error("Error al guardar mascota:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white p-6 rounded-md max-w-lg w-full shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">
            {initialData ? "Editar Mascota" : "Registrar Mascota"}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <select name="especie" value={form.especie} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="gato">Gato</option>
              <option value="perro">Perro</option>
              <option value="otro">Otro</option>
            </select>
            <input name="raza" placeholder="Raza" value={form.raza} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            <select name="sexo" value={form.sexo} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="hembra">Hembra</option>
              <option value="macho">Macho</option>
            </select>
            <select name="tamano" value={form.tamano} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="pequeño">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
            <select name="estadoSalud" value={form.estadoSalud} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="saludable">Saludable</option>
              <option value="en tratamiento">En tratamiento</option>
              <option value="otro">Otro</option>
            </select>
            <textarea name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="esterilizado" checked={form.esterilizado} onChange={handleChange} />
              <label htmlFor="esterilizado">Esterilizado</label>
            </div>
            <input type="file" name="imagenes" accept="image/*" onChange={handleFileChange} className="w-full" />
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                {initialData ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default MascotaFundacionFormModal;
