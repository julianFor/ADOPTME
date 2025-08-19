// src/pages/Donar.jsx
import { useState, useEffect } from "react";
import DonationSection from "../components/donaciones/DonationSection";
import DonationQRSection from "../components/donaciones/DonationQRSection";
import NeedsCatalog from "../components/necesidades/NeedsCatalog";

export default function Donar() {
  // 1) Recuperar la pestaña guardada en localStorage o usar "metas" por defecto
  const [tab, setTab] = useState(() => {
    return localStorage.getItem("donarTab") || "metas";
  });

  // 2) Guardar cada vez que cambie
  useEffect(() => {
    localStorage.setItem("donarTab", tab);
  }, [tab]);

  return (
    <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Título */}
      <h1 className="text-center text-2xl sm:text-3xl font-extrabold tracking-wide flex items-center justify-center gap-2 sm:gap-3">
        <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 bg-clip-text text-transparent">
          Tu Huella en su Futuro
        </span>
        <img
          src="/paw-title.svg"
          alt="Huellita"
          className="h-7 sm:h-8 w-auto select-none"
          draggable="false"
        />
      </h1>

      {/* Tabs */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <TabButton
          active={tab === "metas"}
          onClick={() => setTab("metas")}
          label="Metas Monetarias"
        />
        <TabButton
          active={tab === "necesidades"}
          onClick={() => setTab("necesidades")}
          label="Necesidades de la Fundación"
        />
      </div>

      <section className="mt-8">
        {tab === "metas" ? (
          <>
            <DonationSection />
            <DonationQRSection />
          </>
        ) : (
          <NeedsCatalog />
        )}
      </section>
    </main>
  );
}

function TabButton({ active, label, onClick }) {
  const commonText =
    "w-full h-11 sm:h-12 rounded-full font-medium text-purple-600";
  const widthWrap = "w-[280px] sm:w-[340px]";

  if (active) {
    return (
      <div
        className={`${widthWrap} rounded-full p-[2px] bg-gradient-to-r from-purple-600 to-purple-300 shadow-[0_6px_0_#E9E4FB]`}
      >
        <button
          type="button"
          aria-pressed="true"
          onClick={onClick}
          className={`${commonText} bg-white`}
        >
          {label}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-pressed="false"
      onClick={onClick}
      className={`${widthWrap} ${commonText} bg-white shadow-[0_6px_0_#E9E4FB]`}
    >
      {label}
    </button>
  );
}
