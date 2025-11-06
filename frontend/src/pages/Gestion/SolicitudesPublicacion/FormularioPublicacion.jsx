import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { crearSolicitud } from '../../../services/solicitudPublicacionService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ui/ToastProvider';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_FOTOS = 5;

// --- Sanitizadores ---
const onlyDigits = (v) => (v || '').replace(/\D+/g, '');
const onlyLettersSpaces = (v) =>
  (v || '').replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');
const addressSafe = (v) =>
  (v || '').replace(/[^a-zA-Z0-9ÁÉÍÓÚÜÑáéíóúüñ\s#\-\.,]/g, '');
const textSafe = (v) => (v || '').replace(/[<>]/g, '');

const SANITIZE = {
  nombre: onlyLettersSpaces,
  cedula: onlyDigits,
  telefono: onlyDigits,
  ciudad: onlyLettersSpaces,
  barrio: onlyLettersSpaces,
  direccion: addressSafe,

  nombreMascota: onlyLettersSpaces,
  raza: onlyLettersSpaces,
  personalidad: textSafe,
  historia: textSafe,
};

// Bloqueos extra para números
const preventNonDigitsBeforeInput = (e) => {
  if (/\D/.test(e.data || '')) e.preventDefault();
};
const preventNonDigitsKeyDown = (e) => {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
  if (allowed.includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};
const handlePasteDigitsOnly = (e, setter) => {
  e.preventDefault();
  const pasted = (e.clipboardData.getData('text') || '').replace(/\D+/g, '');
  if (typeof setter === 'function') setter(pasted);
};

const FormularioPublicacion = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [form, setForm] = useState({
    // Contacto
    nombre: '',
    cedula: '',
    correo: user?.email || '',
    telefono: '',
    ciudad: '',
    barrio: '',
    direccion: '',
    // Mascota
    nombreMascota: '',
    especie: '',
    raza: '',
    fechaNacimiento: '',
    tamaño: '', // 👈 con ñ (coherente con backend)
    sexo: '',
    estadoSalud: '',
    personalidad: '',
    historia: '',
    // Condiciones
    aceptaVisita: false,
    aceptaVerificacion: false,
    tieneCondiciones: false,
    // Confirmaciones
    esResponsable: false,
    noSolicitaPago: false,
    aceptaVerificacion2: false,
    // Consentimiento
    aceptaTerminos: false,
  });

  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [enviando, setEnviando] = useState(false);

  // Handlers controlados
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const sanitizer = SANITIZE[name];
    const cleaned = sanitizer ? sanitizer(value) : value;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleaned,
    }));
  };

  // Validación: archivo imagen único (doc identidad)
  const handleDocumentoIdentidad = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentoIdentidad(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      error('Solo se permiten imágenes (JPG, PNG o WEBP).', { duration: 5000 });
      e.target.value = '';
      setDocumentoIdentidad(null);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      error('La imagen del documento supera 5 MB.', { duration: 6000 });
      e.target.value = '';
      setDocumentoIdentidad(null);
      return;
    }
    setDocumentoIdentidad(file);
    info('Documento adjuntado correctamente.', { duration: 2500 });
  };

  // Validación: múltiples imágenes (mascota)
  const handleImagenes = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setImagenes([]);
      return;
    }

    const valid = [];
    let rechazadas = 0;

    for (const f of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        rechazadas++;
        continue;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        rechazadas++;
        continue;
      }
      valid.push(f);
      if (valid.length >= MAX_FOTOS) break;
    }

    if (rechazadas > 0) {
      error(`${rechazadas} archivo(s) rechazado(s) por tipo/tamaño.`, { duration: 5000 });
    }
    if (files.length > MAX_FOTOS) {
      info(`Máximo ${MAX_FOTOS} fotos. Se truncó la selección.`, { duration: 3500 });
    }

    setImagenes(valid.slice(0, MAX_FOTOS));
    if (valid.length) info(`${valid.length} foto(s) cargada(s).`, { duration: 2500 });
    if (valid.length === 0) e.target.value = '';
  };

  const resetForm = () => {
    setForm((prev) => ({
      ...prev,
      nombre: '',
      cedula: '',
      telefono: '',
      ciudad: '',
      barrio: '',
      direccion: '',
      nombreMascota: '',
      especie: '',
      raza: '',
      fechaNacimiento: '',
      tamaño: '',
      sexo: '',
      estadoSalud: '',
      personalidad: '',
      historia: '',
      aceptaVisita: false,
      aceptaVerificacion: false,
      tieneCondiciones: false,
      esResponsable: false,
      noSolicitaPago: false,
      aceptaVerificacion2: false,
      aceptaTerminos: false,
    }));
    setDocumentoIdentidad(null);
    setImagenes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.aceptaTerminos) {
      info('Debes aceptar los términos para continuar.', { duration: 4500 });
      return;
    }
    if (!imagenes.length) {
      info('Adjunta al menos una foto de la mascota.', { duration: 4500 });
      return;
    }

    const data = new FormData();

    // contacto[...]
    data.append('contacto[nombre]', form.nombre);
    data.append('contacto[cedula]', form.cedula);
    data.append('contacto[correo]', form.correo);
    data.append('contacto[telefono]', form.telefono);
    data.append('contacto[ciudad]', form.ciudad);
    data.append('contacto[barrio]', form.barrio);
    data.append('contacto[direccion]', form.direccion);

    // mascota[...]
    data.append('mascota[nombre]', form.nombreMascota);
    data.append('mascota[especie]', form.especie);
    data.append('mascota[raza]', form.raza);
    data.append('mascota[fechaNacimiento]', form.fechaNacimiento);
    data.append('mascota[tamaño]', form.tamaño); // 👈 con ñ
    data.append('mascota[sexo]', form.sexo);
    data.append('mascota[estadoSalud]', form.estadoSalud);
    data.append('mascota[personalidad]', form.personalidad);
    data.append('mascota[historia]', form.historia);

    // condiciones[...]
    data.append('condiciones[aceptaVisita]', String(form.aceptaVisita));
    data.append('condiciones[aceptaVerificacion]', String(form.aceptaVerificacion));
    data.append('condiciones[tieneCondiciones]', String(form.tieneCondiciones));

    // confirmaciones[...]
    data.append('confirmaciones[esResponsable]', String(form.esResponsable));
    data.append('confirmaciones[noSolicitaPago]', String(form.noSolicitaPago));
    data.append('confirmaciones[aceptaVerificacion]', String(form.aceptaVerificacion2));

    if (documentoIdentidad) data.append('documentoIdentidad', documentoIdentidad);
    imagenes.forEach((img) => data.append('imagenes', img));

    try {
      setEnviando(true);
      const res = await crearSolicitud(data);
      console.log(res);
      success('Solicitud de Publicación enviada correctamente.', { duration: 4000 });
      resetForm();

      // 🟣 Redirección según rol (espera breve para que se vea el toast)
      setTimeout(() => {
        if (user?.role === 'adoptante') {
          // Vista de publicaciones propias del adoptante
          navigate('/dashboard/adoptante/mis-solicitudes-publicacion');
        } else if (user?.role === 'admin') {
          // Vista donde el admin revisa/gestiona solicitudes de publicación
          navigate('/dashboard/admin/mis-solicitudes-publicacion');
        } else if (user?.role === 'adminFundacion') {
          // La fundación no gestiona publicaciones externas; lo llevamos a su dashboard
          navigate('/dashboard/adminFundacion/mis-solicitudes-publicacion');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (e) {
      console.error('Error al enviar solicitud:', e);
      error(e?.response?.data?.message || 'Error al enviar la solicitud.', { duration: 7000 });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-5xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md space-y-8"
    >
      <h2 className="text-2xl font-bold text-purple-600 text-center">
        Formulario para Postular una Mascota
      </h2>

      {/* Contacto */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Datos de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nombre"
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={handleChange}
            required
            className="input"
            pattern="^[a-zA-ZÀ-ÿ\s]+$"
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
            onPaste={(e) =>
              handlePasteDigitsOnly(e, (v) => setForm((p) => ({ ...p, cedula: v.slice(0, 15) })))
            }
            required
            className="input"
            pattern="^[0-9]+$"
            inputMode="numeric"
            title="Solo se permiten números"
            maxLength={15}
            autoComplete="off"
          />

          <input
            name="correo"
            value={form.correo}
            readOnly
            className="input bg-gray-100"
          />

          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
            onBeforeInput={preventNonDigitsBeforeInput}
            onKeyDown={preventNonDigitsKeyDown}
            onPaste={(e) =>
              handlePasteDigitsOnly(e, (v) => setForm((p) => ({ ...p, telefono: v.slice(0, 15) })))
            }
            required
            className="input"
            pattern="^[0-9]+$"
            inputMode="tel"
            title="Solo se permiten números"
            maxLength={15}
            autoComplete="tel"
          />

          <input
            name="ciudad"
            placeholder="Ciudad"
            value={form.ciudad}
            onChange={handleChange}
            required
            className="input"
            pattern="^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
          />

          <input
            name="barrio"
            placeholder="Barrio"
            value={form.barrio}
            onChange={handleChange}
            required
            className="input"
            pattern="^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]+$"
            title="Solo se permiten letras y espacios"
            maxLength={80}
          />

          <input
            name="direccion"
            placeholder="Dirección"
            value={form.direccion}
            onChange={handleChange}
            required
            className="input"
            pattern="^[a-zA-Z0-9ÁÉÍÓÚÜÑáéíóúüñ\s#\-\.,]+$"
            title="Solo letras, números y # - . ,"
            maxLength={120}
            autoComplete="address-line1"
          />
        </div>
      </section>

      {/* Mascota */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🐾 Información de la Mascota</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nombreMascota"
            placeholder="Nombre de la mascota"
            value={form.nombreMascota}
            onChange={handleChange}
            required
            className="input"
            pattern="^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]+$"
            title="Solo letras y espacios"
            maxLength={50}
          />

          <input
            name="raza"
            placeholder="Raza (opcional)"
            value={form.raza}
            onChange={handleChange}
            className="input"
            pattern="^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]*$"
            title="Solo letras y espacios"
            maxLength={50}
          />

          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={handleChange}
            required
            className="input"
          />

          <select
            name="especie"
            value={form.especie}
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
            name="tamaño"
            value={form.tamaño}
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
            value={form.sexo}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Sexo</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>

          <select
            name="estadoSalud"
            value={form.estadoSalud}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Estado de salud</option>
            <option value="saludable">Saludable</option>
            <option value="en tratamiento">En tratamiento</option>
            <option value="otro">Otro</option>
          </select>

          <textarea
            name="personalidad"
            placeholder="Personalidad y comportamiento"
            value={form.personalidad}
            onChange={handleChange}
            required
            className="input"
            maxLength={500}
          />
          <textarea
            name="historia"
            placeholder="Historia o antecedentes relevantes"
            value={form.historia}
            onChange={handleChange}
            required
            className="input"
            maxLength={500}
          />
        </div>
      </section>

      {/* Condiciones */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Condiciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aceptaVisita" checked={form.aceptaVisita} onChange={handleChange} />
            ¿Acepta visitas?
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aceptaVerificacion" checked={form.aceptaVerificacion} onChange={handleChange} />
            ¿Acepta verificación?
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="tieneCondiciones" checked={form.tieneCondiciones} onChange={handleChange} />
            ¿Tiene condiciones para el adoptante?
          </label>
        </div>
      </section>

      {/* Confirmaciones */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Confirmaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="esResponsable" checked={form.esResponsable} onChange={handleChange} />
            Soy responsable de esta mascota
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="noSolicitaPago" checked={form.noSolicitaPago} onChange={handleChange} />
            No solicito pago por la adopción
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="aceptaVerificacion2" checked={form.aceptaVerificacion2} onChange={handleChange} />
            Acepto verificación de información
          </label>
        </div>
      </section>

      {/* Archivos (solo imágenes) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          Documento de identidad:
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleDocumentoIdentidad}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            * Solo <span className="font-medium">imágenes</span> (JPG/PNG/WEBP). Máx. 5&nbsp;MB.
          </p>
        </label>

        <label className="block">
          Fotos de la mascota (hasta {MAX_FOTOS}):
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImagenes}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            * Solo <span className="font-medium">imágenes</span> (JPG/PNG/WEBP), máx. {MAX_FOTOS} fotos y 5&nbsp;MB cada una.
          </p>
        </label>
      </section>

      {/* Confirmación final */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="aceptaTerminos"
          checked={form.aceptaTerminos}
          onChange={handleChange}
        />
        <span>Declaro que la información es verídica y autorizo su revisión por el equipo de AdoptMe.</span>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="reset"
          className="px-4 py-2 bg-gray-200 rounded-md"
          disabled={enviando}
          onClick={() => {
            resetForm();
            info('Formulario limpiado.', { duration: 2500 });
          }}
        >
          Limpiar
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>
    </form>
  );
};

export default FormularioPublicacion;
