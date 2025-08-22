import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { createMascota, updateMascota } from "../../../services/mascotaService";

const MascotaExternaFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "",
    tamano: "",
    sexo: "",
    estadoSalud: "",
    fechaNacimiento: "",
    origen: "externo",
    contactoExterno: { nombre: "", telefono: "", correo: "" },
    imagen: null,
    disponible: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        especie: initialData.especie || "",
        tamano: initialData.tamano || initialData["tamaño"] || "",
        sexo: initialData.sexo || "",
        estadoSalud: initialData.estadoSalud || "",
        fechaNacimiento: initialData.fechaNacimiento?.split("T")[0] || "",
        origen: initialData.origen || "externo",
        contactoExterno: {
          nombre: initialData.contactoExterno?.nombre || "",
          telefono: initialData.contactoExterno?.telefono || "",
          correo: initialData.contactoExterno?.correo || ""
        },
        imagen: null,
        disponible: typeof initialData.disponible === "boolean" ? initialData.disponible : true
      });
    } else {
      setFormData({
        nombre: "",
        especie: "",
        tamano: "",
        sexo: "",
        estadoSalud: "",
        fechaNacimiento: "",
        origen: "externo",
        contactoExterno: { nombre: "", telefono: "", correo: "" },
        imagen: null,
        disponible: true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nombres anidados: contactoExterno.nombre, contactoExterno.telefono, contactoExterno.correo
    if (name.startsWith("contactoExterno.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contactoExterno: { ...prev.contactoExterno, [key]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, imagen: e.target.files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      // Campos simples
      data.append("nombre", formData.nombre);
      data.append("especie", formData.especie);
      data.append("tamano", formData.tamano); // <-- SIN ñ
      data.append("sexo", formData.sexo);
      data.append("estadoSalud", formData.estadoSalud);
      data.append("fechaNacimiento", formData.fechaNacimiento);
      data.append("origen", formData.origen || "externo");
      data.append("disponible", String(!!formData.disponible));

      // Contacto externo (bracketed)
      data.append("contactoExterno[nombre]", formData.contactoExterno.nombre);
      data.append("contactoExterno[telefono]", formData.contactoExterno.telefono);
      data.append("contactoExterno[correo]", formData.contactoExterno.correo);

      // Imagen (opcional)
      if (formData.imagen) data.append("imagenes", formData.imagen);

      if (initialData?._id) {
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
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Nombre de la mascota"
                required
                className="input"
              />

              <select
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Especie</option>
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>

              <select
                name="tamano"
                value={formData.tamano}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Tamaño</option>
                <option value="pequeño">Pequeño</option>
                <option value="mediano">Mediano</option>
                <option value="grande">Grande</option>
              </select>

              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Sexo</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            {/* Estado de salud */}
            <div className="grid grid-cols-2 gap-4">
              <select
                name="estadoSalud"
                value={formData.estadoSalud}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Estado de Salud</option>
                <option value="saludable">Saludable</option>
                <option value="en tratamiento">En tratamiento</option>
                <option value="otro">Otro</option>
              </select>

              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                className="input"
              />
            </div>

            {/* Contacto externo */}
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                name="contactoExterno.nombre"
                value={formData.contactoExterno.nombre}
                onChange={handleChange}
                placeholder="Nombre contacto"
                required
                className="input"
              />
              <input
                type="text"
                name="contactoExterno.telefono"
                value={formData.contactoExterno.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                required
                className="input"
              />
              <input
                type="email"
                name="contactoExterno.correo"
                value={formData.contactoExterno.correo}
                onChange={handleChange}
                placeholder="Correo"
                required
                className="input"
              />
            </div>

            {/* Imagen */}
            <input type="file" accept="image/*" onChange={handleFileChange} className="input w-full" />

            {/* Oculto: origen */}
            <input type="hidden" name="origen" value={formData.origen} />

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-400 rounded-md">
                Cancelar
              </button>
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
