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
        if (data?.monto) {
          setMeta(data);

          // Obtener donaciones asociadas a esa meta
          fetch(`http://localhost:3000/api/donaciones/${data?._id}`, {
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
        if (nuevaDonacion?._id) {
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
    <section className="px-2 py-4">
      {/* Dos columnas que miden por el contenido (auto/auto) */}
      <div
        className="
          grid grid-cols-1
          lg:grid-cols-[auto_auto]
          gap-y-8 lg:gap-y-10
          gap-x-4 lg:gap-x-6
          items-start
          justify-center
        "
      >
        {/* Columna izquierda: tarjeta PayPal + progreso */}
        <div className="flex flex-col items-center lg:items-start">
          <div className="inline-block origin-top lg:scale-[.88] md:scale-[.92] sm:scale-100">
            <div className="w-[460px] max-w-full">
              <DonationForm onDonate={handleDonation} goalId={meta?._id} />
            </div>
          </div>

          {meta ? (
            <div className="mt-3 inline-block origin-top lg:scale-[.88] md:scale-[.92] sm:scale-100 w-[460px] max-w-full">
              {meta?.descripcion && (
                <p className="italic text-gray-700 mb-2 text-center">
                  {meta.descripcion}
                </p>
              )}
              <DonationProgress total={total} meta={meta?.monto} />
            </div>
          ) : (
            <p className="mt-6 text-sm text-orange-500 font-medium">
              ⚠️ No hay una meta activa.
            </p>
          )}
        </div>

        {/* Columna derecha: ilustración */}
        <div className="hidden lg:block">
          <img
            src="/donar-illustration.svg"
            alt="Ilustración donaciones"
            className="w-[225px] h-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
            draggable="false"
          />
        </div>
      </div>
    </section>
  );
}

export default DonationSection;
