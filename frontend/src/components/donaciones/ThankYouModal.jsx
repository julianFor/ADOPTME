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

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };

  const handleOverlayKeyDown = (e) => {
    // Cerrar con teclado: Escape, Enter o Space
    if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      role="button"
      tabIndex={0}
      aria-label="Cerrar modal de agradecimiento"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-[9999]"
    >
      <div className="animate-fade-in-up z-[10000]">
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
