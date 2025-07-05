import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { FaCheck, FaTimes, FaFileSignature } from 'react-icons/fa';
import { aprobarEtapa, rechazarEtapa, subirCompromiso } from '../../services/procesoService';
import useUser from '../../hooks/useUser';

const EtapaFirma = ({ procesoId, setProceso, proceso }) => {
  const { user } = useUser();
  const canvasRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [fecha, setFecha] = useState('');
  const [verPDF, setVerPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);

  const puedeGestionarEtapa = () => proceso?.visita?.aprobada === true;

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    canvas.isDrawing = true;
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas.isDrawing) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    canvasRef.current.isDrawing = false;
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generarPDFYEnviar = async () => {
    if (!nombre || !documento || !fecha) {
      alert('Por favor completa todos los campos');
      return;
    }

    const canvas = canvasRef.current;
    const firmaURL = canvas.toDataURL('image/png');
    const doc = new jsPDF();

    doc.setFontSize(12);
    doc.text('Compromiso de Adopción Responsable', 20, 20);
    doc.text(`Yo, ${nombre}, identificado/a con documento de identidad número ${documento}, me comprometo a:`, 20, 30);

    const texto = [
      '1. Brindar al animal adoptado un hogar seguro, amoroso y permanente.',
      '2. Proporcionarle alimentación adecuada, agua limpia, atención veterinaria y cuidados generales.',
      '3. No abandonarlo, venderlo ni regalarlo sin previa notificación a la Fundación.',
      '4. Permitir visitas de seguimiento por parte de la Fundación para verificar su bienestar.',
      '5. Asumir toda responsabilidad civil y legal por el animal una vez entregado.',
      '6. Declaro haber recibido la información completa del animal adoptado y entender mis deberes como adoptante.',
    ];

    texto.forEach((line, i) => {
      doc.text(line, 20, 45 + i * 8);
    });

    doc.text(`Fecha: ${fecha}`, 20, 100);
    doc.text('Firma del Adoptante:', 20, 110);
    doc.addImage(firmaURL, 'PNG', 60, 115, 100, 30);

    const blob = doc.output('blob');
    const formData = new FormData();
    formData.append('compromiso', blob, 'compromiso.pdf');

    try {
      const res = await subirCompromiso(procesoId, formData);
      setProceso(res.proceso);
      alert('Compromiso enviado correctamente.');

      // ✅ Guardar etapa actual en localStorage
      localStorage.setItem(`etapaActual-${procesoId}`, '3');

      // ✅ Recargar para mantener estado coherente
      window.location.reload();
    } catch (error) {
      console.error('Error al enviar compromiso:', error);
      alert('Error al enviar compromiso.');
    }
  };

  const handleAprobar = async () => {
    try {
      const res = await aprobarEtapa(procesoId, 'compromiso');
      setProceso(res.proceso);
      alert('Etapa de firma aprobada.');
    } catch (error) {
      console.error(error);
      alert('Error al aprobar etapa.');
    }
  };

  const handleRechazar = async () => {
    const motivo = prompt('¿Cuál es el motivo del rechazo?');
    if (!motivo) return;
    try {
      const res = await rechazarEtapa(procesoId, 'compromiso', motivo);
      setProceso(res.proceso);
      alert('Etapa rechazada.');
    } catch (error) {
      console.error(error);
      alert('Error al rechazar etapa.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Firma de Compromiso de Adopción</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Nombre Completo del Adoptante</label>
          <input
            type="text"
            placeholder="Nombre Adoptante"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Documento de Identidad:</label>
          <input
            type="text"
            placeholder="Número de Documento"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="font-semibold mb-1">Fecha:</label>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-4 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:col-span-2 items-center">
          <label className="font-semibold mb-2">Firma:</label>
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="border-2 border-dashed border-purple-400 rounded-md bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          ></canvas>
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
          onClick={generarPDFYEnviar}
          className="bg-gradient-to-r from-purple-500 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-purple-500 transition"
        >
          Enviar
        </button>
      </div>

      {proceso?.compromiso?.archivo && (
        <div className="flex justify-center mb-6">
          <a
            href={`http://localhost:3000/uploads/${proceso.compromiso.archivo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition text-sm font-medium shadow-md"
          >
            <FaFileSignature className="text-base" />
            Ver PDF Compromiso Firmado
          </a>
        </div>
      )}

      {verPDF && pdfURL && (
        <div className="flex justify-center mb-6">
          <a
            href={pdfURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition"
          >
            <FaFileSignature />
            Ver PDF Compromiso Firmado
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

export default EtapaFirma;
