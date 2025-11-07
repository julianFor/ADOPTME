// src/components/ThankYouModal.jsx
import { useEffect } from "react";
import PropTypes from "prop-types";

function ThankYouModal({ show, onClose }) {
  useEffect(() => {
    if (!show) return;

    const timeout = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timeout);
  }, [show, onClose]);

  if (!show) return null;

  const handleOverlayKeyDown = (e) => {
    // Cerrar con teclado: Escape, Enter o Space
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]"
    >
      {/* Button that covers the entire overlay for accessibility and click handling */}
      <button
        type="button"
        aria-label="Cerrar modal de agradecimiento"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
        className="absolute inset-0 w-full h-full opacity-0 cursor-default"
      />
      <div className="animate-fade-in-up z-[10000] relative">
        <img
          src="/Gatitogracias.png"
          alt="Gracias por tu donación"
          className="w-56 h-auto mx-auto rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

ThankYouModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ThankYouModal;
