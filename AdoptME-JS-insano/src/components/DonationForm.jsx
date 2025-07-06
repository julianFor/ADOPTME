import { useState, useEffect } from "react";
import "../styles/DonationForm.css";
import ThankYouModal from "./ThankYouModal";

function DonationForm({ onDonate, goalId }) {
  const [form, setForm] = useState({ monto: "" });
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.monto || form.monto <= 0) {
      alert("Por favor, ingresa un monto válido");
      return;
    }

    onDonate({ monto: form.monto });
    setShowModal(true);
    setForm({ monto: "" });
  };

  useEffect(() => {
    const renderPayPalButton = () => {
      if (!window.paypal) return;

      const container = document.getElementById("paypal-button-container");
      if (container) container.innerHTML = "";

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          if (!form.monto || form.monto <= 0) {
            alert("Por favor, ingresa un monto válido");
            return;
          }

          return actions.order.create({
            purchase_units: [
              {
                amount: { value: form.monto.toString() },
              },
            ],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            // Guardar en backend
            fetch("http://localhost:3000/api/donations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
  nombre: details.payer.name.given_name,
  monto: form.monto || 1,
  tipo: "dinero",
  descripcion: "Donación vía PayPal",
  goalId: goalId, // ✅ Pasar la meta activa
}),

            })
              .then((res) => res.json())
              .then(() => {
                setShowModal(true);
                setForm({ monto: "" });
              })
              .catch((err) => {
                console.error("❌ Error:", err);
                alert("❌ Error al guardar la donación.");
              });
          });
        },
        onError: (err) => {
          console.error("❌ Error en PayPal:", err);
          alert("❌ Error al procesar el pago.");
        },
      }).render("#paypal-button-container");
    };

    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src =
        "https://www.paypal.com/sdk/js?client-id=AUtOaREOtmKNYh6mECP1T7oB6uMUFhJXDmMHv3sU_qEZgQj2MwUQGtayeNlsJnA2uYt8HsIbWjXNv0Ct&currency=USD";
      script.onload = renderPayPalButton;
      document.body.appendChild(script);
    } else {
      renderPayPalButton();
    }
  }, [form.monto]);

  return (
    <>
      <form className="donation-form" onSubmit={handleSubmit}>
        <h2>Haz una Donación</h2>
        <input
          type="number"
          name="monto"
          placeholder="Monto (USD)"
          value={form.monto}
          onChange={handleChange}
          required
        />

      

        <div style={{ marginTop: "20px" }}>
          <div id="paypal-button-container"></div>
        </div>
      </form>

      <ThankYouModal show={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

export default DonationForm;
