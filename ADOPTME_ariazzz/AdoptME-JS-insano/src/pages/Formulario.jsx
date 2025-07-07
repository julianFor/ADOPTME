// src/pages/Formulario.jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Formulario.css';

export default function Formulario() {
  const { mascotaId } = useParams(); // Obtén el ID de la URL si está en la ruta
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    mascota: mascotaId || '',
    nombreCompleto: '',
    cedula: '',
    fechaNacimiento: '',
    direccion: '',
    barrio: '',
    ciudad: '',
    telefono: '',
    correo: '',
    tipoVivienda: '',
    tenenciaVivienda: '',
    acuerdoFamiliar: '',
    hayNinos: '',
    otrasMascotas: '',
    alergias: '',
    motivoAdopcion: '',
    lugarMascota: '',
    reaccionProblemas: '',
    tiempoSola: '',
    responsable: '',
    queHariasMudanza: '',
    aceptaVisitaVirtual: '',
    compromisoCuidados: '',
    aceptaContrato: '',
    documentoIdentidad: null,
    pruebaResidencia: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Verifica que mascotaId esté disponible
    if (!mascotaId) {
      setError('Debes seleccionar una mascota para adoptar');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Incluye el campo mascota explícitamente
      formDataToSend.append('mascota', mascotaId);

      // Agrega el resto de los campos del formulario
      Object.keys(formData).forEach(key => {
        if (key === 'mascota') return; // Ya lo agregamos arriba
        if (key === 'documentoIdentidad' || key === 'pruebaResidencia') {
          if (formData[key]) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado. Por favor inicia sesión.');
      }

      const response = await axios.post(
        'http://localhost:5000/api/solicitudesAdopcion',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Solicitud creada:', response.data);
      alert('¡Solicitud enviada con éxito!');
      navigate('/mis-solicitudes');
    } catch (err) {
      console.error('Error al enviar la solicitud:', err);
      setError(err.response?.data?.message || err.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formulario-adopcion">
      <h1>🐾 <span>Formulario de Solicitud de Adopción</span> 🐾</h1>
      <p className="subtitulo">🐾 Asegurémonos de que cada mascota encuentre el hogar ideal 💕</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>📌 Información Personal</h2>

        <label htmlFor="nombreCompleto">Nombre Completo</label>
        <input type="text" id="nombreCompleto" placeholder="Tu Nombre" value={formData.nombreCompleto} onChange={handleChange} required />

        <label htmlFor="cedula">Cédula de ciudadanía</label>
        <input type="text" id="cedula" placeholder="Tu Cédula" value={formData.cedula} onChange={handleChange} required />

        <label htmlFor="fechaNacimiento">Fecha de nacimiento:</label>
        <input type="date" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />

        <label htmlFor="direccion">Dirección de residencia:</label>
        <input type="text" id="direccion" placeholder="Tu Dirección" value={formData.direccion} onChange={handleChange} required />

        <label htmlFor="barrio">Barrio/Localidad:</label>
        <input type="text" id="barrio" placeholder="Tu Barrio" value={formData.barrio} onChange={handleChange} required />

        <label htmlFor="ciudad">Ciudad:</label>
        <input type="text" id="ciudad" placeholder="Tu Ciudad" value={formData.ciudad} onChange={handleChange} required />

        <label htmlFor="telefono">Teléfono de contacto:</label>
        <input type="tel" id="telefono" placeholder="Tu Teléfono" value={formData.telefono} onChange={handleChange} required />

        <label htmlFor="correo">Correo electrónico:</label>
        <input type="email" id="correo" placeholder="tucorreo@email.com" value={formData.correo} onChange={handleChange} required />

        <h2>📌 Información sobre el Hogar</h2>

        <label htmlFor="tipoVivienda">Tipo de vivienda:</label>
        <select id="tipoVivienda" value={formData.tipoVivienda} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="casa">Casa</option>
          <option value="apartamento">Apartamento</option>
          <option value="otro">Otro</option>
        </select>

        <label htmlFor="tenenciaVivienda">¿La vivienda es propia o arrendada?</label>
        <select id="tenenciaVivienda" value={formData.tenenciaVivienda} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="propia">Propia</option>
          <option value="arrendada">Arrendada</option>
        </select>

        <label htmlFor="acuerdoFamiliar">¿Todos los miembros del hogar están de acuerdo con la adopción?</label>
        <select id="acuerdoFamiliar" value={formData.acuerdoFamiliar} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <label htmlFor="hayNinos">¿Hay niños en casa?</label>
        <select id="hayNinos" value={formData.hayNinos} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <label htmlFor="otrasMascotas">¿Tienes otras mascotas en casa?</label>
        <select id="otrasMascotas" value={formData.otrasMascotas} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <label htmlFor="alergias">¿Alguien en casa tiene alergias a los animales?</label>
        <select id="alergias" value={formData.alergias} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <h2>📌 Información sobre la Adopción</h2>

        <label htmlFor="motivoAdopcion">¿Por qué deseas adoptar una mascota?</label>
        <textarea id="motivoAdopcion" placeholder="Escribe tu respuesta" value={formData.motivoAdopcion} onChange={handleChange} required rows="3" />

        <label htmlFor="lugarMascota">¿Dónde vivirá la mascota?</label>
        <select id="lugarMascota" value={formData.lugarMascota} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="interior">Dentro de la casa</option>
          <option value="exterior">En el exterior</option>
          <option value="mixto">Mixto (interior y exterior)</option>
        </select>

        <label htmlFor="reaccionProblemas">¿Qué harías si la mascota presenta problemas de salud o comportamiento?</label>
        <textarea id="reaccionProblemas" placeholder="Escribe tu respuesta" value={formData.reaccionProblemas} onChange={handleChange} required rows="3" />

        <label htmlFor="tiempoSola">¿Cuánto tiempo pasará la mascota sola diariamente?</label>
        <select id="tiempoSola" value={formData.tiempoSola} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="menos de 4 horas">Menos de 4 horas</option>
          <option value="4-8 horas">4 a 8 horas</option>
          <option value="más de 8 horas">Más de 8 horas</option>
        </select>

        <label htmlFor="responsable">¿Quién será el responsable principal de la mascota?</label>
        <input type="text" id="responsable" placeholder="Escribe tu respuesta" value={formData.responsable} onChange={handleChange} required />

        <label htmlFor="queHariasMudanza">¿Qué harías si cambias de residencia y no puedes llevar a la mascota?</label>
        <textarea id="queHariasMudanza" placeholder="Escribe tu respuesta" value={formData.queHariasMudanza} onChange={handleChange} required rows="3" />

        <h2>📌 Compromiso y Responsabilidad</h2>

        <label htmlFor="aceptaVisitaVirtual">¿Estás dispuesto(a) a recibir una visita virtual para validar el hogar?</label>
        <select id="aceptaVisitaVirtual" value={formData.aceptaVisitaVirtual} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <label htmlFor="compromisoCuidados">¿Te comprometes a brindar atención veterinaria y cuidados adecuados a la mascota?</label>
        <select id="compromisoCuidados" value={formData.compromisoCuidados} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <label htmlFor="aceptaContrato">¿Aceptas firmar un contrato de adopción?</label>
        <select id="aceptaContrato" value={formData.aceptaContrato} onChange={handleChange} required>
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        <h2>📌 Adjuntar Documentos</h2>

        <div className="adjuntar-documentos">
          <label htmlFor="documentoIdentidad">📄 Documento de Identidad (Formato: JPG, PNG, PDF)</label>
          <input 
            type="file" 
            id="documentoIdentidad" 
            name="documentoIdentidad" 
            accept=".jpg, .jpeg, .png, .pdf" 
            onChange={handleFileChange}
            required 
          />

          <label htmlFor="pruebaResidencia">🏠 Prueba de Residencia (Ejemplo: Recibo de servicios públicos)</label>
          <input 
            type="file" 
            id="pruebaResidencia" 
            name="pruebaResidencia" 
            accept=".jpg, .jpeg, .png, .pdf" 
            onChange={handleFileChange}
            required 
          />
        </div>
       
        <h2>📌 Confirmación Final</h2>

        <div className="confirmacion-final">
          <label className="checkbox-label">
            <input type="checkbox" required />
            <span>
              Declaro que toda la información proporcionada es verdadera y acepto el proceso de adopción.
            </span>
          </label>
        </div>

        <div className="botones">
          <button type="reset" className="btn-limpiar">Limpiar</button>
          <button type="submit" className="btn-enviar" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
      
      <div>
        <img src="../img/Gaticueva2.png" alt="Imagen central" />
      </div>
    </div>
  );
}