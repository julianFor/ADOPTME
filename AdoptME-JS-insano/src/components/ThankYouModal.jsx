import "../styles/ThankYouModal.css";

function ThankYouModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="thanks-modal" onClick={onClose}>
      <img
        src="/img/Gatitogracias.png"
        alt="Gracias por tu donación"
        className="thanks-image-only"
      />
    </div>
  );
}

export default ThankYouModal;

