export default function DonationQRSection() {
  return (
    <section className="relative mt-14 mb-10 sm:mt-16">
      {/* Título */}
      <h2 className="text-center text-2xl sm:text-3xl font-extrabold text-purple-600 flex items-center justify-center gap-2">
        Apoyanos con tu Donacion
        <img
          src="/paw-title.svg"
          alt=""
          className="h-6 sm:h-7 w-auto select-none"
          draggable="false"
        />
      </h2>

      {/* Contenido principal */}
      <div className="relative max-w-4xl mx-auto mt-6 sm:mt-8 px-4">
        {/* Ilustraciones laterales (más grandes que las tarjetas) */}
        <img
          src="/dog-balloons.svg"
          alt=""
          className="hidden md:block absolute -left-20 lg:-left-24 top-1/2 -translate-y-1/2 w-48 lg:w-56 select-none pointer-events-none"
          draggable="false"
        />
        <img
          src="/cat-balloons.svg"
          alt=""
          className="hidden md:block absolute -right-[120px] lg:-right-[160px] top-1/2 -translate-y-1/2 w-[260px] lg:w-[300px]  select-none pointer-events-none"
          draggable="false"
        />

        {/* Tarjetas QR (sin sombra, borde sutil) */}
        <div
          className="
            grid grid-cols-1
            sm:grid-cols-[min-content_min-content]   /* columnas del ancho del contenido */
            justify-center
            gap-5 sm:gap-6                            /* separación pequeña entre tarjetas */
            justify-items-center
          "
        >
          {/* NEQUI */}
          <div className="w-[250px] sm:w-[260px] bg-white rounded-[18px] border border-[#ECEAF5] p-5 text-center">
            <img
              src="/qr-nequi.svg"
              alt="QR Nequi"
              className="w-[195px] h-[195px] mx-auto rounded-md"
              draggable="false"
            />
            <div className="mt-3">
              <img
                src="/logo-nequi.svg"
                alt="Nequi"
                className="h-7 mx-auto w-auto"
                draggable="false"
              />
              <div className="mt-1 text-gray-600 font-semibold tracking-wide">
                3024529227
              </div>
            </div>
          </div>

          {/* DAVIPLATA */}
          <div className="w-[250px] sm:w-[260px] bg-white rounded-[18px] border border-[#ECEAF5] p-5 text-center">
            <img
              src="/qr-daviplata.svg"
              alt="QR Daviplata"
              className="w-[195px] h-[195px] mx-auto rounded-md"
              draggable="false"
            />
            <div className="mt-3">
              <img
                src="/logo-daviplata.svg"
                alt="Daviplata"
                className="h-7 mx-auto w-auto"
                draggable="false"
              />
              <div className="mt-1 text-gray-600 font-semibold tracking-wide">
                3024529227
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
