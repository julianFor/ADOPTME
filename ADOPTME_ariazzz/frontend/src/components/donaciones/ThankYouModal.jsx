import { useEffect } from "react";

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

  return (
    <div
      id="modal-overlay"
      onClick={handleOverlayClick}
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

export default ThankYouModal;
