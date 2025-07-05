import React, { useState } from 'react';
import '../styles/Formulario2.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Formulario2 = () => {
  const [formData, setFormData] = useState({
    contacto: {
      nombre: '',
      cedula: '',
      correo: '',
      telefono: '',
      ciudad: '',
      barrio: '',
      direccion: ''
    },
    mascota: {
      nombre: '',
      especie: '',
      raza: '',
      fechaNacimiento: '',
      tamaño: '',
      sexo: '',
      estadoSalud: '',
      personalidad: '',
      historia: ''
    },
    condiciones: {
      aceptaVisita: false,
      aceptaVerificacion: false,
      tieneCondiciones: false
    },
    confirmaciones: {
      esResponsable: false,
      noSolicitaPago: false,
      aceptaVerificacion: false
    }
  });
  
  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);
  const [imagenesMascota, setImagenesMascota] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'documentoIdentidad') {
      setDocumentoIdentidad(e.target.files[0]);
    } else if (e.target.name === 'imagenesMascota') {
      setImagenesMascota(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validación básica del frontend
      if (imagenesMascota.length < 3) {
        throw new Error('Debes subir al menos 3 imágenes de la mascota');
      }

      const formDataToSend = new FormData();
      
      // Agregar datos del formulario
      formDataToSend.append('contacto', JSON.stringify(formData.contacto));
      formDataToSend.append('mascota', JSON.stringify(formData.mascota));
      formDataToSend.append('condiciones', JSON.stringify(formData.condiciones));
      formDataToSend.append('confirmaciones', JSON.stringify(formData.confirmaciones));
      
      // Agregar archivos
      if (documentoIdentidad) {
        formDataToSend.append('documento', documentoIdentidad);
      }
      
      if (imagenesMascota.length > 0) {
        imagenesMascota.forEach((file) => {
          formDataToSend.append('imagenes', file);
        });
      }

      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/publicaciones', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert('Solicitud enviada con éxito!');
      navigate('/mis-solicitudes');
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setError(error.response?.data?.message || error.message || 'Error al enviar el formulario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-section">
      <h1>🐾 <span>Formulario de Publicación De Mascota</span> 🐾</h1>
      <p className="subtitulo">🐾 Comparte la historia de tu mascota y ayúdala a encontrar un hogar amoroso 💕</p>

      {error && <div className="error-message">{error}</div>}

      <h2>📌 Información del Publicador</h2>
      <form id="formularioAdopcion" onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="contacto.nombre">Nombre Completo</label>
          <input 
            type="text" 
            id="contacto.nombre" 
            name="contacto.nombre" 
            placeholder="Tu Nombre" 
            required 
            onChange={handleChange}
            value={formData.contacto.nombre}
          />

          <label htmlFor="contacto.cedula">Cédula de ciudadanía</label>
          <input 
            type="text" 
            id="contacto.cedula" 
            name="contacto.cedula" 
            placeholder="Tu Cédula" 
            required 
            onChange={handleChange}
            value={formData.contacto.cedula}
          />

          <label htmlFor="contacto.correo">Correo electrónico</label>
          <input 
            type="email" 
            id="contacto.correo" 
            name="contacto.correo" 
            placeholder="tucorreo@email.com" 
            required 
            onChange={handleChange}
            value={formData.contacto.correo}
          />

          <label htmlFor="contacto.telefono">Teléfono de contacto</label>
          <input 
            type="tel" 
            id="contacto.telefono" 
            name="contacto.telefono" 
            placeholder="Tu Teléfono de contacto" 
            required 
            onChange={handleChange}
            value={formData.contacto.telefono}
          />

          <label htmlFor="contacto.ciudad">Ciudad</label>
          <input 
            type="text" 
            id="contacto.ciudad" 
            name="contacto.ciudad" 
            placeholder="Tu Ciudad" 
            required 
            onChange={handleChange}
            value={formData.contacto.ciudad}
          />

          <label htmlFor="contacto.barrio">Barrio/Localidad</label>
          <input 
            type="text" 
            id="contacto.barrio" 
            name="contacto.barrio" 
            placeholder="Tu Barrio/Localidad" 
            required 
            onChange={handleChange}
            value={formData.contacto.barrio}
          />

          <label htmlFor="contacto.direccion">Dirección de residencia</label>
          <input 
            type="text" 
            id="contacto.direccion" 
            name="contacto.direccion" 
            placeholder="Tu Dirección de residencia" 
            onChange={handleChange}
            value={formData.contacto.direccion}
          />
        </fieldset>

        <h2>📎 Adjuntar Documento de Identidad</h2>
        <p>(Para validar identidad y evitar fraudes)</p>

        <div className="file-upload">
          <label htmlFor="documentoIdentidad">Elegir Archivo</label>
          <input
            type="file"
            id="documentoIdentidad"
            name="documentoIdentidad"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            required
          />
          <span>{documentoIdentidad ? documentoIdentidad.name : 'No se ha seleccionado ningún archivo'}</span>
        </div>

        <h2>📌 Información de la Mascota</h2>

        <label htmlFor="mascota.nombre">Nombre de la mascota:</label>
        <input 
          type="text" 
          id="mascota.nombre" 
          name="mascota.nombre" 
          placeholder="Nombre de la mascota" 
          onChange={handleChange}
          value={formData.mascota.nombre}
          required
        />

        <label htmlFor="mascota.especie">Especie:</label>
        <select 
          id="mascota.especie" 
          name="mascota.especie"
          onChange={handleChange}
          value={formData.mascota.especie}
          required
        >
          <option value="">Seleccionar</option>
          <option value="perro">Perro</option>
          <option value="gato">Gato</option>
          <option value="otro">Otro</option>
        </select>

        <label htmlFor="mascota.raza">Raza:</label>
        <input 
          type="text" 
          id="mascota.raza" 
          name="mascota.raza" 
          placeholder="Raza de la mascota" 
          onChange={handleChange}
          value={formData.mascota.raza}
          required
        />

        <label htmlFor="mascota.fechaNacimiento">Fecha aproximada de nacimiento:</label>
        <input 
          type="date" 
          id="mascota.fechaNacimiento" 
          name="mascota.fechaNacimiento" 
          onChange={handleChange}
          value={formData.mascota.fechaNacimiento}
        />

        <label htmlFor="mascota.tamaño">Tamaño:</label>
        <select 
          id="mascota.tamaño" 
          name="mascota.tamaño"
          onChange={handleChange}
          value={formData.mascota.tamaño}
          required
        >
          <option value="">Seleccionar</option>
          <option value="pequeño">Pequeño</option>
          <option value="mediano">Mediano</option>
          <option value="grande">Grande</option>
        </select>

        <label htmlFor="mascota.sexo">Sexo:</label>
        <select 
          id="mascota.sexo" 
          name="mascota.sexo"
          onChange={handleChange}
          value={formData.mascota.sexo}
          required
        >
          <option value="">Seleccionar</option>
          <option value="macho">Macho</option>
          <option value="hembra">Hembra</option>
        </select>

        <label htmlFor="mascota.estadoSalud">Estado de salud:</label>
        <select 
          id="mascota.estadoSalud" 
          name="mascota.estadoSalud"
          onChange={handleChange}
          value={formData.mascota.estadoSalud}
          required
        >
          <option value="">Seleccionar</option>
          <option value="saludable">Saludable</option>
          <option value="en tratamiento">En tratamiento</option>
          <option value="otro">Otro</option>
        </select>

        <label htmlFor="mascota.personalidad">Personalidad y comportamiento:</label>
        <textarea 
          id="mascota.personalidad" 
          name="mascota.personalidad" 
          placeholder="Describe la personalidad de tu mascota" 
          onChange={handleChange}
          value={formData.mascota.personalidad}
          required
        />

        <label htmlFor="mascota.historia">Historia de la mascota:</label>
        <textarea 
          id="mascota.historia" 
          name="mascota.historia" 
          placeholder="Cuéntanos la historia de tu mascota" 
          onChange={handleChange}
          value={formData.mascota.historia}
        />

        <label htmlFor="imagenesMascota">📎 Adjuntar mínimo 3 fotos de la mascota</label>
        <div className="file-upload">
          <input
            type="file"
            id="imagenesMascota"
            name="imagenesMascota"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            required
          />
          <label htmlFor="imagenesMascota">Elegir Archivo</label>
          <span>
            {imagenesMascota.length > 0 
              ? `${imagenesMascota.length} archivos seleccionados` 
              : 'No se ha seleccionado ningún archivo'}
          </span>
        </div>

        <h2>📌 Confirmaciones y Condiciones</h2>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="condiciones.aceptaVisita" 
            onChange={handleChange}
            checked={formData.condiciones.aceptaVisita}
            required
          />
          ¿Estás dispuesto/a a hacer una visita o videollamada para validar el hogar del adoptante?
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="condiciones.aceptaVerificacion" 
            onChange={handleChange}
            checked={formData.condiciones.aceptaVerificacion}
            required
          />
          ¿Estás de acuerdo en que AdoptMe haga un proceso de verificación antes de publicar la mascota?
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="condiciones.tieneCondiciones" 
            onChange={handleChange}
            checked={formData.condiciones.tieneCondiciones}
          />
          ¿Tienes algún requisito especial para el adoptante?
        </label>

        <h2>📌 Confirmación Final</h2>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="confirmaciones.esResponsable" 
            onChange={handleChange}
            checked={formData.confirmaciones.esResponsable}
            required
          />
          Declaro que toda la información proporcionada es verdadera y que soy el responsable legítimo de esta mascota.
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="confirmaciones.noSolicitaPago" 
            onChange={handleChange}
            checked={formData.confirmaciones.noSolicitaPago}
            required
          />
          Me comprometo a no solicitar ningún pago o beneficio económico por la adopción de esta mascota.
        </label>

        <label className="checkbox-label">
          <input 
            type="checkbox" 
            name="confirmaciones.aceptaVerificacion" 
            onChange={handleChange}
            checked={formData.confirmaciones.aceptaVerificacion}
            required
          />
          Acepto que AdoptMe realice un proceso de verificación antes de publicar la mascota.
        </label>

        <div className="botones">
          <button type="reset" className="btn-limpiar">Limpiar</button>
          <button 
            type="submit" 
            className="btn-enviar"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Formulario2;