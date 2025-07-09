import { useState, useEffect } from "react";
import DonationForm from "./DonationForm";
import DonationProgress from "./DonationProgress";

function DonationSection() {
  const [donaciones, setDonaciones] = useState([]);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    // Obtener la meta actual
    fetch("http://localhost:3000/api/metas/actual", {
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token"),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.monto) {
          setMeta(data);

          // Obtener donaciones asociadas a esa meta
          fetch(`http://localhost:3000/api/donaciones/${data._id}`, {
            headers: {
              "Content-Type": "application/json",
              "x-access-token": localStorage.getItem("token"),
            },
          })
            .then((res) => res.json())
            .then((dons) => setDonaciones(dons))
            .catch((err) =>
              console.error("❌ Error al cargar donaciones:", err)
            );
        } else {
          console.warn("⚠️ No hay meta activa.");
        }
      })
      .catch((err) => {
        console.error("❌ Error al obtener la meta:", err);
      });
  }, []);

  const handleDonation = (form) => {
    const body = { ...form, goalId: meta?._id };

    fetch("http://localhost:3000/api/donaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": localStorage.getItem("token"),
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((nuevaDonacion) => {
        if (nuevaDonacion && nuevaDonacion._id) {
          setDonaciones((prev) => [...prev, nuevaDonacion]);
        } else {
          alert("❌ Error al guardar la donación.");
        }
      })
      .catch((err) => {
        console.error("❌ Error al donar:", err);
        alert("❌ Ocurrió un error al enviar la donación.");
      });
  };

  const total = donaciones.reduce((sum, d) => sum + Number(d.monto), 0);

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <DonationForm onDonate={handleDonation} goalId={meta?._id} />
      </div>

      {meta !== null ? (
        <div className="mt-6 w-full max-w-lg text-center">
          {meta.descripcion && (
            <p className="italic text-gray-700 mb-2"> {meta.descripcion}</p>
          )}
          <DonationProgress total={total} meta={meta.monto} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-orange-500 font-medium">
          ⚠️ No hay una meta activa.
        </p>
      )}
    </section>
  );
}

export default DonationSection;
