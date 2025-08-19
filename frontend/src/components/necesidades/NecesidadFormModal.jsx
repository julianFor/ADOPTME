// src/pages/Gestion/Necesidades/NecesidadFormModal.jsx
import { useEffect, useMemo, useState } from "react";
import {
  crearNecesidad,
  actualizarNecesidad,
  getNecesidadById,
} from "../../services/necesidadService";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useToast } from "../../components/ui/ToastProvider";

const CATEGORIAS = ["comida", "camas", "juguetes", "arena", "medicina", "higiene", "otro"];
const URGENCIAS = ["alta", "media", "baja"];
const ESTADOS   = ["activa", "pausada", "cumplida", "vencida"];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export default function NecesidadFormModal({
  isOpen,
  onClose,
  onSaved,
  initialData = null, // si viene => editar; si no => crear
}) {
  const { success, error, info } = useToast();
  const isEdit = Boolean(initialData?._id);

  const [form, setForm] = useState({
    titulo: "",
    categoria: "comida",
    urgencia: "media",
    descripcionBreve: "",
    objetivo: 1,
    recibido: 0,
    fechaLimite: "",
    estado: "activa",
    visible: true,
    imagenPrincipalUrl: "", // solo preview en edición
    fechaPublicacion: "",   // display-only
  });
  const [fileImagen, setFileImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateImageFile = (file) => {
    if (!file) return "Archivo inválido.";
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Solo JPG/PNG/WEBP.";
    if (file.size > MAX_IMAGE_BYTES) return "La imagen supera el tamaño máximo de 5 MB.";
    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileImagen(null);
      return;
    }
    const msg = validateImageFile(file);
    if (msg) {
      error(msg, { duration: 5000 });
      e.target.value = "";
      setFileImagen(null);
      return;
    }
    setFileImagen(file);
    info("Imagen lista para subir.", { duration: 2000 });
  };

  // ===== Carga inicial (editar) =====
  useEffect(() => {
    if (!isOpen) return;

    const hydrate = async () => {
      setErr("");
      if (isEdit) {
        try {
          setLoading(true);
          const { data } = await getNecesidadById(initialData._id);
          const flatLimit = data?.fechaLimite
            ? new Date(data.fechaLimite).toISOString().slice(0, 10)
            : "";
          const urlExistente =
            typeof data?.imagenPrincipal === "string"
              ? data.imagenPrincipal
              : data?.imagenPrincipal?.url || "";

          setForm({
            titulo: data.titulo ?? "",
            categoria: data.categoria ?? "comida",
            urgencia: data.urgencia ?? "media",
            descripcionBreve: data.descripcionBreve ?? "",
            objetivo: data.objetivo ?? 1,
            recibido: data.recibido ?? 0,
            fechaLimite: flatLimit,
            estado: data.estado ?? "activa",
            visible: data.visible ?? true,
            imagenPrincipalUrl: urlExistente,
            fechaPublicacion: data.fechaPublicacion || "",
          });
          setFileImagen(null); // en edición, solo se reemplaza si el usuario adjunta
        } catch (e) {
          console.error(e);
          setErr("No se pudo cargar la necesidad");
          error("No se pudo cargar la necesidad");
        } finally {
          setLoading(false);
        }
      } else {
        setForm({
          titulo: "",
          categoria: "comida",
          urgencia: "media",
          descripcionBreve: "",
          objetivo: 1,
          recibido: 0,
          fechaLimite: "",
          estado: "activa",
          visible: true,
          imagenPrincipalUrl: "",
          fechaPublicacion: new Date().toISOString(),
        });
        setFileImagen(null);
      }
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, initialData?._id]);

  // ===== Validación mínima =====
  const canSubmit = useMemo(() => {
    const tieneImagen = isEdit ? (form.imagenPrincipalUrl || fileImagen) : !!fileImagen;
    return (
      form.titulo.trim() &&
      form.descripcionBreve.trim() &&
      form.objetivo >= 1 &&
      tieneImagen
    );
  }, [form, fileImagen, isEdit]);

  // ===== Submit (FormData => backend multer/cloudinary) =====
  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!canSubmit) {
      const msg = "Completa los campos obligatorios (*)";
      setErr(msg);
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("titulo", form.titulo.trim());
      fd.append("categoria", form.categoria);
      fd.append("urgencia", form.urgencia);
      fd.append("descripcionBreve", form.descripcionBreve.trim());
      fd.append("objetivo", String(form.objetivo ?? 1));
      fd.append("recibido", String(form.recibido ?? 0));
      if (form.fechaLimite) fd.append("fechaLimite", form.fechaLimite);
      fd.append("estado", form.estado);
      fd.append("visible", String(!!form.visible));

      // nombre EXACTO esperado por el middleware: 'imagenPrincipal'
      // - Crear: obligatorio
      // - Editar: solo si el usuario adjunta un nuevo archivo
      if (!isEdit && !fileImagen) {
        setErr("La imagen principal es obligatoria.");
        setLoading(false);
        return;
      }
      if (fileImagen) {
        fd.append("imagenPrincipal", fileImagen);
      }

      if (isEdit) {
        await actualizarNecesidad(initialData._id, fd); // headers multipart en el servicio
        success("Necesidad actualizada.", { duration: 3000 });
      } else {
        await crearNecesidad(fd); // headers multipart en el servicio
        success("Necesidad creada.", { duration: 3000 });
      }

      onSaved?.();
      onClose?.();
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || "No se pudo guardar la necesidad");
      error(e?.response?.data?.message || "No se pudo guardar la necesidad");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fechaPubText = form.fechaPublicacion
    ? new Date(form.fechaPublicacion).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <div className="fixed inset-0 z-[80]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-0 flex items-start justify-center overflow-auto pt-8 pb-10">
        <div className="w-full max-w-[560px] bg-white rounded-2xl shadow-xl p-6 relative">
          {/* header */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            type="button"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <h2 className="text-center text-2xl font-bold mb-4">
            {isEdit ? "Editar Necesidad" : "Crear Necesidad"}
          </h2>

          <form onSubmit={submit} encType="multipart/form-data" className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm mb-1">Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => onChange("titulo", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Ej. Comida húmeda para gatitos"
                required
                maxLength={120}
              />
            </div>

            {/* Urgencia */}
            <div>
              <label className="block text-sm mb-1">Prioridad *</label>
              <div className="flex gap-6 items-center">
                {URGENCIAS.map((u) => (
                  <label key={u} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="urgencia"
                      value={u}
                      checked={form.urgencia === u}
                      onChange={() => onChange("urgencia", u)}
                    />
                    <span className="capitalize">{u}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm mb-1">Descripción *</label>
              <textarea
                rows={3}
                value={form.descripcionBreve}
                onChange={(e) => onChange("descripcionBreve", e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Describe por qué se necesita y a quién ayuda"
                required
                maxLength={500}
              />
            </div>

            {/* Objetivo / Recibido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-sm mb-1">Meta *</label>
                <input
                  type="number"
                  min={1}
                  value={form.objetivo}
                  onChange={(e) => onChange("objetivo", Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 pr-16"
                  required
                />
                <span className="absolute right-3 top-[34px] text-gray-400 text-sm">
                  unidades
                </span>
              </div>
              <div className="relative">
                <label className="block text-sm mb-1">Recibido</label>
                <input
                  type="number"
                  min={0}
                  value={form.recibido}
                  onChange={(e) => onChange("recibido", Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 pr-16"
                />
                <span className="absolute right-3 top-[34px] text-gray-400 text-sm">
                  unidades
                </span>
              </div>
            </div>

            {/* Categoría / Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Categoría *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => onChange("categoria", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 capitalize"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Estado *</label>
                <select
                  value={form.estado}
                  onChange={(e) => onChange("estado", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 capitalize"
                >
                  {ESTADOS.map((s) => (
                    <option key={s} value={s} className="capitalize">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Fecha de Publicación</label>
                <div className="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-600">
                  {fechaPubText}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Fecha Límite</label>
                <input
                  type="date"
                  value={form.fechaLimite || ""}
                  onChange={(e) => onChange("fechaLimite", e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Imagen principal (única) */}
            <div className="border rounded-md p-3">
              <label className="block text-sm mb-2">Imagen principal *</label>

              {/* preview en edición */}
              {form.imagenPrincipalUrl && (
                <img
                  src={form.imagenPrincipalUrl}
                  alt="preview principal"
                  className="mb-3 w-40 h-40 object-cover rounded-md border"
                />
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full"
                required={!isEdit}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-2">
                * Solo imágenes (JPG/PNG/WEBP), máx. 5MB.
              </p>
            </div>

            {/* errores */}
            {err && <p className="text-red-600 text-sm">{err}</p>}

            {/* CTA */}
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full h-12 rounded-full text-white font-semibold
                         bg-gradient-to-r from-[#A855F7] to-[#8B5CF6]
                         shadow-[0_10px_20px_rgba(168,85,247,0.25)]
                         disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
