import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { crearSolicitud } from '../../../services/solicitudPublicacionService';

const FormularioPublicacion = () => {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    nombre: '',
    cedula: '',
    correo: user?.email || '',
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
    aceptaVerificacion2: false, // evitar conflicto con el anterior
    aceptaTerminos: false
  });

  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);
  const [imagenes, setImagenes] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.aceptaTerminos) {
      alert('Debes aceptar los términos');
      return;
    }

    const data = new FormData();

    data.append('contacto[nombre]', form.nombre);
    data.append('contacto[cedula]', form.cedula);
    data.append('contacto[correo]', form.correo);
    data.append('contacto[telefono]', form.telefono);
    data.append('contacto[ciudad]', form.ciudad);
    data.append('contacto[barrio]', form.barrio);
    data.append('contacto[direccion]', form.direccion);

    data.append('mascota[nombre]', form.nombreMascota);
    data.append('mascota[especie]', form.especie);
    data.append('mascota[raza]', form.raza);
    data.append('mascota[fechaNacimiento]', form.fechaNacimiento);
    data.append('mascota[tamaño]', form.tamaño);
    data.append('mascota[sexo]', form.sexo);
    data.append('mascota[estadoSalud]', form.estadoSalud);
    data.append('mascota[personalidad]', form.personalidad);
    data.append('mascota[historia]', form.historia);

    data.append('condiciones[aceptaVisita]', form.aceptaVisita);
    data.append('condiciones[aceptaVerificacion]', form.aceptaVerificacion);
    data.append('condiciones[tieneCondiciones]', form.tieneCondiciones);

    data.append('confirmaciones[esResponsable]', form.esResponsable);
    data.append('confirmaciones[noSolicitaPago]', form.noSolicitaPago);
    data.append('confirmaciones[aceptaVerificacion]', form.aceptaVerificacion2);

    if (documentoIdentidad) data.append('documentoIdentidad', documentoIdentidad);
    imagenes.forEach((img) => data.append('imagenes', img));

    try {
      const res = await crearSolicitud(data);
      alert('Solicitud enviada con éxito');
      console.log(res);
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('Error al enviar solicitud');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md space-y-8">
      <h2 className="text-2xl font-bold text-purple-600 text-center">Formulario para Postular una Mascota</h2>

      {/* Contacto */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Datos de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombre" placeholder="Nombre completo" onChange={handleChange} required className="input" />
          <input name="cedula" placeholder="Cédula" onChange={handleChange} required className="input" />
          <input name="correo" value={form.correo} readOnly className="input bg-gray-100" />
          <input name="telefono" placeholder="Teléfono" onChange={handleChange} required className="input" />
          <input name="ciudad" placeholder="Ciudad" onChange={handleChange} required className="input" />
          <input name="barrio" placeholder="Barrio" onChange={handleChange} required className="input" />
          <input name="direccion" placeholder="Dirección" onChange={handleChange} required className="input" />
        </div>
      </section>

      {/* Mascota */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">🐾 Información de la Mascota</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nombreMascota" placeholder="Nombre de la mascota" onChange={handleChange} required className="input" />
          <input name="raza" placeholder="Raza (opcional)" onChange={handleChange} className="input" />
          <input type="date" name="fechaNacimiento" onChange={handleChange} required className="input" />
          <select name="especie" onChange={handleChange} required className="input">
            <option value="">Especie</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>
          <select name="tamaño" onChange={handleChange} required className="input">
            <option value="">Tamaño</option>
            <option value="pequeño">Pequeño</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
          </select>
          <select name="sexo" onChange={handleChange} required className="input">
            <option value="">Sexo</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
          </select>
          <select name="estadoSalud" onChange={handleChange} required className="input">
            <option value="">Estado de salud</option>
            <option value="saludable">Saludable</option>
            <option value="en tratamiento">En tratamiento</option>
            <option value="otro">Otro</option>
          </select>
          <textarea name="personalidad" placeholder="Personalidad y comportamiento" onChange={handleChange} required className="input" />
          <textarea name="historia" placeholder="Historia o antecedentes relevantes" onChange={handleChange} required className="input" />
        </div>
      </section>

      {/* Condiciones */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Condiciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label><input type="checkbox" name="aceptaVisita" onChange={handleChange} /> ¿Acepta visitas?</label>
          <label><input type="checkbox" name="aceptaVerificacion" onChange={handleChange} /> ¿Acepta verificación?</label>
          <label><input type="checkbox" name="tieneCondiciones" onChange={handleChange} /> ¿Tiene condiciones para el adoptante?</label>
        </div>
      </section>

      {/* Confirmaciones */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">📌 Confirmaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label><input type="checkbox" name="esResponsable" onChange={handleChange} /> Soy responsable de esta mascota</label>
          <label><input type="checkbox" name="noSolicitaPago" onChange={handleChange} /> No solicito pago por la adopción</label>
          <label><input type="checkbox" name="aceptaVerificacion2" onChange={handleChange} /> Acepto verificación de información</label>
        </div>
      </section>

      {/* Archivos */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label>Documento de identidad:
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentoIdentidad(e.target.files[0])} className="mt-1" />
        </label>
        <label>Fotos de la mascota (hasta 5):
          <input type="file" multiple accept="image/*" onChange={(e) => setImagenes(Array.from(e.target.files))} className="mt-1" />
        </label>
      </section>

      {/* Confirmación final */}
      <div className="flex items-center gap-2">
        <input type="checkbox" name="aceptaTerminos" onChange={handleChange} />
        <span>Declaro que la información es verídica y autorizo su revisión por el equipo de AdoptMe.</span>
      </div>

      <div className="flex justify-end gap-4">
        <button type="reset" className="px-4 py-2 bg-gray-200 rounded-md">Limpiar</button>
        <button type="submit" className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Enviar Solicitud</button>
      </div>
    </form>
  );
};

export default FormularioPublicacion;
