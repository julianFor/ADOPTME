import { useState, useEffect } from "react";
import DonationForm from "./DonationForm";
import DonationProgress from "./DonationProgress";

function DonationSection() {
  const [donaciones, setDonaciones] = useState([]);
  const [meta, setMeta] = useState(null);

  // ✅ Obtener meta activa
  useEffect(() => {
    fetch("http://localhost:3000/api/donation-goal/actual")
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setMeta(data);
        }
      })
      .catch((err) => console.error("❌ Error al obtener la meta:", err));
  }, []);

  // ✅ Obtener donaciones de esa meta
  useEffect(() => {
    if (!meta?._id) return;
    fetch(`http://localhost:3000/api/donations/${meta._id}`)
      .then((res) => res.json())
      .then((data) => setDonaciones(data))
      .catch((err) => console.error("❌ Error al obtener donaciones:", err));
  }, [meta]);

  const handleDonation = (form) => {
    fetch("http://localhost:3000/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, goalId: meta._id }), // ✅ AÑADIDO
    })
      .then((res) => res.json())
      .then((nuevaDonacion) => {
        if (nuevaDonacion && nuevaDonacion._id) {
          setDonaciones((prev) => [...prev, nuevaDonacion]);
        } else {
          alert("❌ Error al guardar donación.");
        }
      })
      .catch((err) => {
        console.error("❌ Error al donar:", err);
        alert("❌ Error al enviar donación.");
      });
  };

  const total = donaciones.reduce((sum, d) => sum + Number(d.monto), 0);

  return (
    <section className="donations-section">
      {/* ✅ PASAMOS el goalId al formulario */}
      <DonationForm onDonate={handleDonation} goalId={meta?._id} />

      {meta ? (
        <>
          {meta.descripcion && (
            <p style={{ fontStyle: "italic", marginTop: "1rem", color: "#444" }}>
              📝 {meta.descripcion}
            </p>
          )}
          <DonationProgress total={total} meta={meta.monto} currency="USD" />
          {total >= meta.monto && (
            <p style={{ marginTop: "10px", color: "green", fontWeight: "bold" }}>
              🎉 ¡Meta alcanzada!
            </p>
          )}
        </>
      ) : (
        <p style={{ marginTop: "1rem" }}>⚠️ No hay una meta activa.</p>
      )}
    </section>
  );
}

export default DonationSection;
