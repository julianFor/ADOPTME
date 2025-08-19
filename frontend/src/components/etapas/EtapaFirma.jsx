import { useRef, useState } from 'react';
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
    const c = firmaRef.current, ctx = c.getContext('2d');
    ctx.beginPath(); c.isDrawing = true;
    const r = c.getBoundingClientRect();
    ctx.moveTo(e.clientX - r.left, e.clientY - r.top);
  };
  const draw = (e) => {
    const c = firmaRef.current, ctx = c.getContext('2d');
    if (!c.isDrawing) return;
    const r = c.getBoundingClientRect();
    ctx.lineTo(e.clientX - r.left, e.clientY - r.top);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
  };
  const stopDrawing = () => { firmaRef.current.isDrawing = false; };

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
    const c = firmaRef.current, ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
  };

  const nombreMascota = proceso?.solicitud?.mascota?.nombre || '—';

  const formatearFecha = (iso) => {
    if (!iso) return '';
    const [y,m,d] = iso.split('-');
    return `${d} - ${m} - ${y}`;
  };

  // === NUEVO: generar imagen y enviar ===
  const generarImagenYEnviar = async () => {
    if (!nombre || !fecha) {
      // alert('Por favor completa nombre y fecha');
      warning('Por favor completa nombre y fecha.', { title: 'Campos incompletos' });
      return;
    }

    try {
      const { blob, dataUrl } = await composeCertificado({
        // usa la plantilla que subiste a /public; el ?v=2 evita cache si la acabas de reemplazar
        plantillaSrc: '/plantillas/certificado_adopcion.png?v=2',
        W: 1600,
        H: 1000,
        datos: {
          adoptante: nombre,
          mascota: nombreMascota || '',
          // Formato del certificado: dd - mm - yyyy
          fecha: formatearFecha(fecha),
          firmaCanvas: firmaRef.current
        },
        // ponlo en true para ver cajas guía rojas; cuando quede perfecto, pásalo a false
        debug: false
      });

      const formData = new FormData();
      formData.append('compromiso', blob, 'compromiso-firmado.png');

      const res = await subirCompromiso(procesoId, formData);
      setProceso(res.proceso);
      setPreviewUrl(dataUrl); // muestra enseguida

      // alert('Compromiso enviado correctamente.');
      success('Compromiso enviado correctamente.', { title: 'Enviado' });
      localStorage.setItem(`etapaActual-${procesoId}`, '3');
      // Si quieres recargar: window.location.reload();
    } catch (err) {
      console.error('Error al enviar compromiso:', err);
      // alert('Error al enviar compromiso.');
      error('Error al enviar compromiso.', { title: 'Error' });
    }
  };

  // URL del asset (Cloudinary)
  const asset = proceso?.compromiso?.archivo;
  const compromisoUrl =
    previewUrl ||
    (typeof asset === 'string' ? asset : asset?.secure_url || '');

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'compromiso');
      setProceso(res.proceso);
      // alert('Etapa de firma aprobada.');
      success('Etapa de firma aprobada.', { title: 'Aprobada' });
    } catch (err) {
      // alert('Error al aprobar etapa.');
      error('Error al aprobar etapa.', { title: 'Error' });
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?'); if (!motivo) return;
    try {
      const res = await rechazarEtapa(procesoId, 'compromiso', motivo);
      setProceso(res.proceso);
      // alert('Etapa rechazada.');
      success('Etapa rechazada.', { title: 'Rechazada' });
    } catch (err) {
      // alert('Error al rechazar etapa.');
      error('Error al rechazar etapa.', { title: 'Error' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Firma de Compromiso de Adopción</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Nombre Completo del Adoptante</label>
          <input type="text" placeholder="Nombre Adoptante" className="border border-gray-300 rounded-md px-4 py-2"
                 value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>

        {/* El certificado no usa documento, pero puedes seguir recogiéndolo si lo necesitas para registro */}
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Documento de Identidad (no se imprime):</label>
          <input type="text" placeholder="Número de Documento" className="border border-gray-300 rounded-md px-4 py-2"
                 value={documento} onChange={(e) => setDocumento(e.target.value)} />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Fecha:</label>
          <input type="date" className="border border-gray-300 rounded-md px-4 py-2"
                 value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>

        <div className="flex flex-col md:col-span-2 items-center">
          <label className="font-semibold mb-2">Firma:</label>
          <canvas
            ref={firmaRef}
            width={500} height={160}
            className="border-2 border-dashed border-purple-400 rounded-md bg-white touch-none"
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            onTouchStart={startTouch} onTouchMove={moveTouch} onTouchEnd={stopDrawing}
          />
        </div>
      </form>

      <div className="flex justify-center gap-4 mb-6">
        <button type="button" onClick={limpiarFirma}
          className="px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-full hover:bg-purple-50 transition">
          Limpiar Firma
        </button>

        <button type="button" onClick={generarImagenYEnviar}
          className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-500 transition">
          Enviar
        </button>
      </div>

      {compromisoUrl && (
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src={compromisoUrl} alt="Compromiso firmado" className="max-w-full w-[900px] rounded-lg shadow" />
          <a href={compromisoUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition text-sm font-medium shadow-md">
            <FaFileSignature className="text-base" />
            Ver imagen en nueva pestaña
          </a>
        </div>
      )}

      {user?.role !== 'adoptante' && (
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={handleRechazar} disabled={!puedeGestionarEtapa()}
            className="flex items-center gap-2 bg-red-300 text-white px-5 py-2 rounded-full hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <FaTimes /> Rechazar
          </button>
          <button type="button" onClick={handleAprobar} disabled={!puedeGestionarEtapa()}
            className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-full hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <FaCheck /> Aprobar
          </button>
        </div>
      )}
    </div>
  );
};

export default EtapaFirma;
