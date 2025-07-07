import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { crearSolicitud } from "../../../services/solicitudAdopcionService";
import { useParams } from "react-router-dom";

const FormularioAdopcion = () => {
  const { user } = useContext(AuthContext);
  const { idMascota } = useParams();

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
    aceptaTerminos: false
  });

  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);
  const [pruebaResidencia, setPruebaResidencia] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.aceptaTerminos) return alert("Debes aceptar los términos");

    const data = new FormData();
    data.append("mascota", idMascota);
    data.append("adoptante", user._id);

    Object.entries(form).forEach(([key, value]) => {
      if (key !== "aceptaTerminos") data.append(key, value);
    });

    if (documentoIdentidad) data.append("documentoIdentidad", documentoIdentidad);
    if (pruebaResidencia) data.append("pruebaResidencia", pruebaResidencia);

    try {
      const response = await crearSolicitud(data);
      alert("Solicitud enviada correctamente");
      console.log(response);
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Error al enviar la solicitud");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mt-5 mb-20 mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-purple-600 text-center">Formulario de Solicitud de Adopción</h2>

      {/* Información Personal */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombreCompleto" placeholder="Nombre Completo" onChange={handleChange} required className="input" />
          <input name="cedula" placeholder="Cédula" onChange={handleChange} required className="input" />
          <input type="date" name="fechaNacimiento" onChange={handleChange} required className="input" />
          <input name="telefono" placeholder="Teléfono de contacto" onChange={handleChange} required className="input" />
          <input name="correo" value={form.correo} readOnly className="input bg-gray-100" />
          <input name="direccion" placeholder="Dirección" onChange={handleChange} required className="input" />
          <input name="barrio" placeholder="Barrio/Localidad" onChange={handleChange} required className="input" />
          <input name="ciudad" placeholder="Ciudad" onChange={handleChange} required className="input" />
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
            <select key={name} name={name} onChange={handleChange} required className="input">
              <option value="">{label}</option>
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ))}
        </div>
      </section>

      {/* Adopción */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Información sobre la Adopción</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <textarea name="motivoAdopcion" placeholder="¿Por qué deseas adoptar?" onChange={handleChange} required className="input" />
          <select name="lugarMascota" onChange={handleChange} required className="input">
            <option value="">¿Dónde vivirá?</option>
            <option value="interior">Interior</option>
            <option value="exterior">Exterior</option>
            <option value="mixto">Mixto</option>
          </select>
          <textarea name="reaccionProblemas" placeholder="¿Qué harías ante problemas de salud o conducta?" onChange={handleChange} required className="input" />
          <select name="tiempoSola" onChange={handleChange} required className="input">
            <option value="">¿Tiempo sola?</option>
            <option value="menos de 4 horas">Menos de 4h</option>
            <option value="4-8 horas">4-8h</option>
            <option value="más de 8 horas">Más de 8h</option>
          </select>
          <input name="responsable" placeholder="¿Quién cuidará la mascota?" onChange={handleChange} required className="input" />
          <textarea name="queHariasMudanza" placeholder="¿Qué harías si no puedes llevarla?" onChange={handleChange} required className="input" />
        </div>
      </section>

      {/* Compromisos */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Compromiso y Responsabilidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "aceptaVisitaVirtual", label: "¿Aceptas visita virtual?" },
            { name: "compromisoCuidados", label: "¿Cuidado y atención médica?" },
            { name: "aceptaContrato", label: "¿Aceptarías firmar contrato?" },
          ].map(({ name, label }) => (
            <select key={name} name={name} onChange={handleChange} required className="input">
              <option value="">{label}</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          ))}
        </div>
      </section>

      {/* Archivos */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          Documento de identidad:
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentoIdentidad(e.target.files[0])} className="mt-1" />
        </label>
        <label className="block">
          Prueba de residencia:
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setPruebaResidencia(e.target.files[0])} className="mt-1" />
        </label>
      </section>

      {/* Confirmación */}
      <div className="max-w-5xl mx-auto mb-20 px-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
            <img src="/LogoAdoptme.svg" alt="AdoptMe" className="h-25" />
            <span className="text-x1 font-bold">X</span>
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
                "Entrega De La Mascota – La Mascota Llegará A Su Nuevo Hogar."
            ].map((paso, index) => (
                <li key={index} className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">✔️</span>
                <span>{paso}</span>
                </li>
            ))}
            </ul>
        </div>
      <section className="flex items-center gap-2 mt-10 ml-10">
        <input type="checkbox" name="aceptaTerminos" onChange={handleChange} />
        <span>Declaro que la información es verdadera y acepto el proceso.</span>
      </section>

      {/* Botones */}
      <div className="flex justify-between mt-4">
        <button type="reset" className="px-4 py-2 bg-gray-200 rounded-md">Limpiar</button>
        <button type="submit" className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Enviar</button>
      </div>
        </div>

    </form>
    
  );
  
};

export default FormularioAdopcion;
