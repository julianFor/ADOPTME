import logo from '../assets/images/LogoAdoptmeNegroV2.svg';
import huella1 from '../assets/images/Huella2.svg';
import huella2 from '../assets/images/Huella1.svg';
import fondoOndulado from '../assets/images/footer-wave.svg';
import ilustracion from '../assets/images/footerIlustracion.svg';

function Footer() {
  return (
    <footer className="relative bg-top text-black overflow-hidden pt-5 pb-6 md:pt-10 md:pb-12">
      {/* OLA SUPERIOR */}
      <img
        src={fondoOndulado}
        alt="fondo ondulado"
        className="pointer-events-none select-none absolute top-0 left-1/2 -translate-x-1/2 w-[160%] sm:w-[130%] md:w-full max-w-none z-0"
      />

      {/* HUELLAS SOLO EN DESKTOP */}
      <img
        src={huella1}
        alt="huella"
        className="pointer-events-none select-none hidden md:block absolute left-4 bottom-0 w-32 z-0"
      />
      <img
        src={huella2}
        alt="huella"
        className="pointer-events-none select-none hidden md:block absolute right-0 top-0 w-28 z-0"
      />

      {/* CONTENEDOR PRINCIPAL (sin fondo añadido en móvil) */}
      <div
        className="
          relative z-10 max-w-7xl mx-auto
          px-4 sm:px-6
          pt-8 pb-6 md:py-12
          grid gap-6 md:gap-8
          grid-cols-2 md:grid-cols-3
        "
      >
        {/* COLUMNA IZQUIERDA: logo + contacto (móvil: SIN descripción) */}
        <div className="col-span-1 text-left flex flex-col justify-center">
          <img src={logo} alt="logo" className="w-24 mb-3 md:w-28 md:mb-4" />

          {/* Descripción solo en desktop (no se ve en móvil) */}
          <p className="hidden md:block max-w-md">
            En AdoptMe, conectamos corazones con patas. Facilitamos adopciones seguras y responsables
            para que más peludos encuentren un hogar lleno de amor. 🐾💜
          </p>

          {/* Contacto visible siempre */}
          <div className="mt-1 md:mt-4">
            <p className="break-words">
              <span className="inline-block mr-2">📧</span>
              <a href="mailto:AdoptMe@gmail.com" className="underline">AdoptMe@gmail.com</a>
            </p>
            <p className="mt-1">
              <span className="inline-block mr-2">📞</span> +84938772416
            </p>
          </div>

          <div className="flex gap-4 mt-3 text-xl md:text-2xl">
            <i className="fab fa-instagram" aria-hidden="true" />
            <i className="fab fa-facebook" aria-hidden="true" />
            <i className="fab fa-linkedin" aria-hidden="true" />
          </div>
        </div>

        {/* COLUMNA CENTRAL (DESKTOP): ilustración original; en móvil se oculta */}
        <div className="hidden md:flex justify-center items-center">
          <img src={ilustracion} alt="niño y perro" className="max-w-[300px] w-full" />
        </div>

        {/* COLUMNA DERECHA: MENÚ */}
        <div className="col-span-1 text-left flex flex-col justify-center">
          <h4 className="font-bold text-2xl mb-3 md:mb-4 text-center md:text-left">Menu</h4>
          <ul className="font-semibold text-gray-700 space-y-2 md:space-y-1 text-center md:text-left">
            <li><a href="/">Home</a></li>
            <li><a href="/adoptar">Adopta</a></li>
            <li><a href="/comoAdoptar">¿Cómo Adoptar?</a></li>
            <li><a href="/donar">Donar</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>

        {/* DERECHOS ABAJO (centrados, sin fondo adicional) */}
        <div className="col-span-2 md:col-span-3 text-center mt-2 md:mt-4 text-xs sm:text-sm text-gray-800 font-medium">
          © 2025 AdoptMe. Todos los derechos reservados. Adoptar es amar.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
