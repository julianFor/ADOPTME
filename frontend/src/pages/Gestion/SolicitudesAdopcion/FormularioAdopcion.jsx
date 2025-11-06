// src/pages/Gestion/Adopciones/FormularioAdopcion.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { crearSolicitud } from "../../../services/solicitudAdopcionService";
import { useParams, useNavigate } from "react-router-dom";
// 🔔 Toasts personalizados
import { useToast } from "../../../components/ui/ToastProvider";

// ✅ Set para check de tipos
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const FormularioAdopcion = () => {
  const { user } = useContext(AuthContext);
  const { idMascota } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  // --- Sanitizadores (sin replace global) ---
  const onlyDigits = (v) =>
    Array.from((v || "")).filter((ch) => ch >= "0" && ch <= "9").join("");

  // letras Unicode + espacios
  const onlyLettersSpaces = (v) =>
    (v || "").match(/[\p{L}\s]/gu)?.join("") ?? "";

  // letras, números, espacios y # - . ,
  const addressSafe = (v) =>
    (v || "").match(/[\p{L}\p{N}\s#\-,.]/gu)?.join("") ?? "";

  // quita < y >
  const textSafe = (v) => (v || "").replaceAll("<", "").replaceAll(">", "");

  const SANITIZE = {
    nombreCompleto: onlyLettersSpaces,
    cedula: onlyDigits,
    telefono: onlyDigits,
    direccion: addressSafe,
    barrio: onlyLettersSpaces,
    ciudad: onlyLettersSpaces,
    responsable: onlyLettersSpaces,
    motivoAdopcion: textSafe,
    reaccionProblemas: textSafe,
    queHariasMudanza: textSafe,
  };

  const [form, setForm] = useState({
    nombreCompleto: "",
    cedula: "",
    fechaNacimiento: "",
    direccion: "",
    barrio: "",
    ciudad: "",
    telefono: "",
    correo: user?.email || "",
    tipoVivienda: "",
    tenenciaVivienda: "",
    acuerdoFamiliar: "",
    hayNinos: "",
    otrasMascotas: "",
    alergias: "",
    motivoAdopcion: "",
    lugarMascota: "",
    reaccionProblemas: "",
    tiempoSola: "",
    responsable: "",
    queHariasMudanza: "",
    aceptaVisitaVirtual: "",
    compromisoCuidados: "",
    aceptaContrato: "",
    aceptaTerminos: false,
  });

  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);
  const [pruebaResidencia, setPruebaResidencia] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // --- Handlers genéricos controlados ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const sanitizer = SANITIZE[name];
    const cleaned = sanitizer ? sanitizer(value) : value;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : cleaned,
    }));
  };

  // Bloqueos extra para números
  const preventNonDigitsBeforeInput = (e) => {
    if (/\D/.test(e.data || "")) e.preventDefault();
  };
  const preventNonDigitsKeyDown = (e) => {
    const allowed = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };
  const handlePasteDigitsOnly = (e, field, maxLen) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D+/g, "");
    const next = maxLen ? pasted.slice(0, maxLen) : pasted;
    setForm((prev) => ({ ...prev, [field]: next }));
  };

  // --- Validación de imágenes (solo JPG/PNG/WEBP, máx 5MB) ---
  const handleImageOnly = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setter(null);
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      error("Solo se permiten imágenes JPG, PNG o WEBP.", { duration: 5000 });
      e.target.value = "";
      setter(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      error("La imagen supera el tamaño máximo de 5 MB.", { duration: 6000 });
      e.target.value = "";
      setter(null);
      return;
    }
    setter(file);
    info("Archivo adjuntado correctamente.", { duration: 2500 });
  };

  const resetForm = () => {
    setForm({
      nombreCompleto: "",
      cedula: "",
      fechaNacimiento: "",
      direccion: "",
      barrio: "",
      ciudad: "",
      telefono: "",
      correo: user?.email || "",
      tipoVivienda: "",
      tenenciaVivienda: "",
      acuerdoFamiliar: "",
      hayNinos: "",
      otrasMascotas: "",
      alergias: "",
      motivoAdopcion: "",
      lugarMascota: "",
      reaccionProblemas: "",
      tiempoSola: "",
      responsable: "",
      queHariasMudanza: "",
      aceptaVisitaVirtual: "",
      compromisoCuidados: "",
      aceptaContrato: "",
      aceptaTerminos: false,
    });
    setDocumentoIdentidad(null);
    setPruebaResidencia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Verificación explícita de los 3 campos requeridos por el backend
    const faltantes = ["aceptaVisitaVirtual", "compromisoCuidados", "aceptaContrato"].filter(
      (k) => !form[k] || String(form[k]).trim() === ""
    );
    if (faltantes.length) {
      info("Completa las preguntas de Compromiso y Responsabilidad.", { duration: 4500 });
      return;
    }

    if (!form.aceptaTerminos) {
      info("Debes aceptar los términos para continuar.", { duration: 4500 });
      return;
    }

    const data = new FormData();
    if (idMascota) data.append("mascota", idMascota);
    if (user?._id) data.append("adoptante", user._id);

    // ✅ for...of en lugar de forEach
    for (const [key, value] of Object.entries(form)) {
      if (key === "aceptaTerminos") continue;
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        data.append(key, value);
      }
    }

    if (documentoIdentidad) data.append("documentoIdentidad", documentoIdentidad);
    if (pruebaResidencia) data.append("pruebaResidencia", pruebaResidencia);

    try {
      setEnviando(true);
      const response = await crearSolicitud(data);
      console.log(response);
      success("Solicitud de Adopción Enviada Correctamente.", { duration: 4000 });
      resetForm();

      setTimeout(() => {
        if (user?.role === "adoptante") {
          navigate("/dashboard/adoptante/mis-solicitudes");
        } else if (user?.role === "adminFundacion") {
          navigate("/dashboard/adminFundacion/mis-solicitudes");
        } else if (user?.role === "admin") {
          navigate("/dashboard/admin/mis-solicitudes");
        } else {
          navigate("/");
        }
      }, 1500);
    } catch (e) {
      console.error("Error al enviar solicitud:", e);
      error(
        e?.response?.data?.message || "Error al enviar la solicitud. Intenta nuevamente.",
        { duration: 7000 }
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-5xl mt-5 mb-20 mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-bold text-purple-600 text-center">
        Formulario de Solicitud de Adopción{" "}
        <span className="inline-block">
          <img
            src="/paw-title.svg"
            alt="Huellita"
            className=" h-7 sm:h-8 w-auto select-none"
            draggable="false"
          />
        </span>
      </h2>

      {/* Información Personal */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nombreCompleto"
            placeholder="Nombre Completo"
            value={form.nombreCompleto}
            onChange={handleChange}
            required
            className="input"
            pattern="^[\p{L}\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
            autoComplete="name"
          />

          <input
            name="cedula"
            placeholder="Cédula"
            value={form.cedula}
            onChange={handleChange}
            onBeforeInput={preventNonDigitsBeforeInput}
            onKeyDown={preventNonDigitsKeyDown}
            onPaste={(e) => handlePasteDigitsOnly(e, "cedula", 15)}
            required
            className="input"
            pattern="^\d+$"
            inputMode="numeric"
            title="Solo se permiten números"
            maxLength={15}
            autoComplete="off"
          />

          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={handleChange}
            required
            className="input"
            autoComplete="bday"
          />

          <input
            name="telefono"
            placeholder="Teléfono de contacto"
            value={form.telefono}
            onChange={handleChange}
            onBeforeInput={preventNonDigitsBeforeInput}
            onKeyDown={preventNonDigitsKeyDown}
            onPaste={(e) => handlePasteDigitsOnly(e, "telefono", 15)}
            required
            className="input"
            pattern="^\d+$"
            inputMode="tel"
            title="Solo se permiten números"
            maxLength={15}
            autoComplete="tel"
          />

          <input name="correo" value={form.correo} readOnly className="input bg-gray-100" />

          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            required
            className="input"
            pattern="^[\p{L}\p{N}\s#\-,.]+$"
            title="Solo letras, números y # - . ,"
            maxLength={120}
            autoComplete="address-line1"
          />

          <input
            name="barrio"
            placeholder="Barrio/Localidad"
            value={form.barrio}
            onChange={handleChange}
            required
            className="input"
            pattern="^[\p{L}\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
            autoComplete="address-level2"
          />

          <input
            name="ciudad"
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={handleChange}
            required
            className="input"
            pattern="^[\p{L}\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
            autoComplete="address-level2"
          />
        </div>
      </section>

      {/* Información del Hogar */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Información sobre el Hogar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "tipoVivienda", label: "Tipo de vivienda", options: ["casa", "apartamento", "otro"] },
            { name: "tenenciaVivienda", label: "¿Propia o arrendada?", options: ["propia", "arrendada"] },
            { name: "acuerdoFamiliar", label: "¿Todos están de acuerdo?", options: ["si", "no"] },
            { name: "hayNinos", label: "¿Hay niños en casa?", options: ["si", "no"] },
            { name: "otrasMascotas", label: "¿Otras mascotas?", options: ["si", "no"] },
            { name: "alergias", label: "¿Alergias en casa?", options: ["si", "no"] },
          ].map(({ name, label, options }) => (
            <select
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">{label}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ))}
        </div>
      </section>

      {/* Adopción */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Información sobre la Adopción</h3>
        <div className="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-4">
          <textarea
            name="motivoAdopcion"
            placeholder="¿Por qué deseas adoptar?"
            value={form.motivoAdopcion}
            onChange={handleChange}
            required
            className="input"
            maxLength={500}
          />
          <select
            name="lugarMascota"
            value={form.lugarMascota}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">¿Dónde vivirá?</option>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="mixto">Mixto</option>
          </select>
          <textarea
            name="reaccionProblemas"
            placeholder="¿Qué harías ante problemas de salud o conducta?"
            value={form.reaccionProblemas}
            onChange={handleChange}
            required
            className="input"
            maxLength={500}
          />
          <select
            name="tiempoSola"
            value={form.tiempoSola}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">¿Tiempo sola?</option>
            <option value="menos de 4 horas">Menos de 4h</option>
            <option value="4-8 horas">4-8h</option>
            <option value="más de 8 horas">Más de 8h</option>
          </select>
          <input
            name="responsable"
            placeholder="¿Quién cuidará la mascota?"
            value={form.responsable}
            onChange={handleChange}
            required
            className="input"
            pattern="^[\p{L}\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
          />
          <textarea
            name="queHariasMudanza"
            placeholder="¿Qué harías si no puedes llevarla?"
            value={form.queHariasMudanza}
            onChange={handleChange}
            required
            className="input"
            maxLength={500}
          />
        </div>
      </section>

      {/* 🔁 Compromiso y Responsabilidad (REQUERIDO por backend) */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Compromiso y Responsabilidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "aceptaVisitaVirtual", label: "¿Aceptas visita virtual?" },
            { name: "compromisoCuidados", label: "¿Cuidado y atención médica?" },
            { name: "aceptaContrato", label: "¿Aceptarías firmar contrato?" },
          ].map(({ name, label }) => (
            <select
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">{label}</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          ))}
        </div>
      </section>

      {/* Archivos (solo imágenes) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span>Documento de identidad:</span>{" "}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageOnly(setDocumentoIdentidad)}
            className="mt-1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            * Sube una <span className="font-medium">imagen</span> (JPG/PNG/WEBP) clara del documento. Máx. 5&nbsp;MB.
          </p>
        </label>

        <label className="block">
          <span>Prueba de residencia:</span>{" "}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageOnly(setPruebaResidencia)}
            className="mt-1"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            * Adjunta una <span className="font-medium">imagen</span> (JPG/PNG/WEBP) del recibo o certificado. Máx. 5&nbsp;MB.
          </p>
        </label>
      </section>

      {/* Confirmación */}
      <div className="max-w-5xl mx-auto mb-20 px-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <img src="/LogoAdoptme.svg" alt="AdoptMe" className="h-25" />
            <span className="text-xl font-bold">X</span>
            <img src="/LogoGaticueva.svg" alt="La Gaticueva" className="h-15" />
          </div>

          <h3 className="text-purple-600 font-bold text-lg text-center mb-4">
            🐾 Pasos después de enviar el formulario en AdoptMe 🐾
          </h3>

          <ul className="space-y-3 text-gray-700">
            {[
              "Revisión Del Formulario – La Fundación Evaluará La Información Enviada.",
              "Entrevista Virtual – Se Agendará Una Videollamada Para Conocer Mejor Al Adoptante Y Validar Su Entorno.",
              "Visita A La Fundación – El Adoptante Conocerá A La Mascota En Persona.",
              "Firma Del Compromiso – Se Firmará El Acuerdo De Adopción.",
              "Entrega De La Mascota – La Mascota Llegará A Su Nuevo Hogar.",
            ].map((paso) => (
              <li key={paso} className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✔️</span>
                <span>{paso}</span>
              </li>
            ))}
          </ul>
        </div>

        <section className="flex items-center gap-2 mt-10 ml-10">
          <input
            type="checkbox"
            name="aceptaTerminos"
            checked={form.aceptaTerminos}
            onChange={handleChange}
          />
          <span>Declaro que la información es verdadera y acepto el proceso.</span>
        </section>

        {/* Botones */}
        <div className="flex justify-between mt-4">
          <button
            type="reset"
            className="px-4 py-2 bg-gray-200 rounded-md"
            disabled={enviando}
            onClick={() => {
              resetForm();
              info("Formulario limpiado.", { duration: 2500 });
            }}
          >
            Limpiar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioAdopcion;
