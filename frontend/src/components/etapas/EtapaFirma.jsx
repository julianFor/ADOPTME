// frontend/src/components/etapas/EtapaFirma.jsx
import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheck, FaTimes, FaFileSignature } from 'react-icons/fa';
import { aprobarEtapa, rechazarEtapa, subirCompromiso } from '../../services/procesoService';
import useUser from '../../hooks/useUser';
import { composeCertificado } from '../../utils/composeCertificado';
import { useToast } from '../../components/ui/ToastProvider';

const EtapaFirma = ({ procesoId, setProceso, proceso }) => {
  const { user } = useUser();
  const { success, error, warning } = useToast();

  const firmaRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [fecha, setFecha] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const puedeGestionarEtapa = () => proceso?.visita?.aprobada === true;

  // Firma (mouse)
  const startDrawing = (e) => {
    const c = firmaRef.current; const ctx = c.getContext('2d');
    ctx.beginPath(); c.isDrawing = true;
    const r = c.getBoundingClientRect();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  };
  const draw = (e) => {
    const c = firmaRef.current; const ctx = c.getContext('2d');
    if (!c.isDrawing) return;
    const r = c.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
  };
  const stopDrawing = () => { if (firmaRef.current) firmaRef.current.isDrawing = false; };

  // Firma (touch)
  const startTouch = (e) => {
    const t = e.touches[0]; const c = firmaRef.current; const r = c.getBoundingClientRect();
    const ctx = c.getContext('2d'); ctx.beginPath(); c.isDrawing = true;
    ctx.moveTo(t.clientX - r.left, t.clientY - r.top);
  };
  const moveTouch = (e) => {
    const t = e.touches[0]; const c = firmaRef.current; if (!c.isDrawing) return;
    const r = c.getBoundingClientRect(); const ctx = c.getContext('2d');
    ctx.lineTo(t.clientX - r.left, t.clientY - r.top);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
  };

  const limpiarFirma = () => {
    const c = firmaRef.current; const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
  };

  const nombreMascota = proceso?.solicitud?.mascota?.nombre || '—';

  const formatearFecha = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d} - ${m} - ${y}`;
  };

  // === Generar imagen y enviar ===
  const generarImagenYEnviar = async () => {
    if (!nombre || !fecha) {
      warning('Por favor completa nombre y fecha.', { title: 'Campos incompletos' });
      return;
    }

    try {
      const { blob, dataUrl } = await composeCertificado({
        plantillaSrc: '/plantillas/certificado_adopcion.png?v=2',
        W: 1600,
        H: 1000,
        datos: {
          adoptante: nombre,
          mascota: nombreMascota || '',
          // Formato del certificado: dd - mm - yyyy
          fecha: formatearFecha(fecha),
          firmaCanvas: firmaRef.current,
        },
        debug: false,
      });

      const formData = new FormData();
      formData.append('compromiso', blob, 'compromiso-firmado.png');

      const res = await subirCompromiso(procesoId, formData);
      setProceso(res.proceso);
      setPreviewUrl(dataUrl); // muestra vista previa

      success('Compromiso enviado correctamente.', { title: 'Enviado' });
      globalThis.localStorage?.setItem(`etapaActual-${procesoId}`, '3');
      // Si deseas recargar: globalThis.location?.reload();
    } catch (err) {
      // Manejo explícito de excepción
      // eslint-disable-next-line no-console
      console.error('Error al enviar compromiso:', err);
      error('Error al enviar compromiso.', { title: 'Error' });
    }
  };

  // URL del asset (Cloudinary)
  const asset = proceso?.compromiso?.archivo;
  const compromisoUrl =
    previewUrl || (typeof asset === 'string' ? asset : asset?.secure_url || '');

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'compromiso');
      setProceso(res.proceso);
      success('Etapa de firma aprobada.', { title: 'Aprobada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al aprobar etapa de firma:', err);
      error('Error al aprobar etapa.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;
    try {
      const res = await rechazarEtapa(procesoId, 'compromiso', motivo);
      setProceso(res.proceso);
      success('Etapa rechazada.', { title: 'Rechazada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error al rechazar etapa de firma:', err);
      error('Error al rechazar etapa.', { title: 'Error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Firma de Compromiso de Adopción</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="nombre-adoptante">
            Nombre Completo del Adoptante
          </label>
          <input
            id="nombre-adoptante"
            type="text"
            placeholder="Nombre Adoptante"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* El certificado no usa documento, pero puedes seguir recogiéndolo si lo necesitas para registro */}
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="doc-adoptante">
            Documento de Identidad (no se imprime):
          </label>
          <input
            id="doc-adoptante"
            type="text"
            placeholder="Número de Documento"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1" htmlFor="fecha-compromiso">
            Fecha:
          </label>
          <input
            id="fecha-compromiso"
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2 items-center">
          <label className="font-semibold mb-2" htmlFor="firma-canvas">
            Firma:
          </label>
          <canvas
            ref={firmaRef}
            id="firma-canvas"
            width={500}
            height={160}
            className="border-2 border-dashed border-purple-400 rounded-md bg-white touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startTouch}
            onTouchMove={moveTouch}
            onTouchEnd={stopDrawing}
            aria-label="Área para dibujar firma"
          />
        </div>
      </form>

      <div className="flex justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={limpiarFirma}
          className="px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-50 transition"
        >
          Limpiar Firma
        </button>

        <button
          type="button"
          onClick={generarImagenYEnviar}
          className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-500 transition"
        >
          Enviar
        </button>
      </div>

      {compromisoUrl && (
        <div className="flex flex-col items-center gap-3 mb-6">
          <img
            src={compromisoUrl}
            alt="Compromiso firmado"
            className="max-w-full w-[900px] rounded-lg shadow"
          />
          <a
            href={compromisoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition text-sm font-medium shadow-md"
          >
            <FaFileSignature className="text-base" />
            Ver imagen en nueva pestaña
          </a>
        </div>
      )}

      {user?.role !== 'adoptante' && (
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handleRechazar}
            disabled={!puedeGestionarEtapa()}
            className="flex items-center gap-2 bg-red-300 text-white px-5 py-2 rounded-full hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTimes /> Rechazar
          </button>
          <button
            type="button"
            onClick={handleAprobar}
            disabled={!puedeGestionarEtapa()}
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaCheck /> Aprobar
          </button>
        </div>
      )}
    </div>
  );
};

EtapaFirma.propTypes = {
  procesoId: PropTypes.string.isRequired,
  setProceso: PropTypes.func.isRequired,
  proceso: PropTypes.shape({
    visita: PropTypes.shape({
      aprobada: PropTypes.bool,
    }),
    solicitud: PropTypes.shape({
      mascota: PropTypes.shape({
        nombre: PropTypes.string,
      }),
    }),
    compromiso: PropTypes.shape({
      archivo: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          secure_url: PropTypes.string,
          url: PropTypes.string,
        }),
      ]),
    }),
  }).isRequired,
};

export default EtapaFirma;
