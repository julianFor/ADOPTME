import logo from '../assets/images/LogoAdoptmeNegroV2.svg';
import huella1 from '../assets/images/Huella2.svg';
import huella2 from '../assets/images/Huella1.svg';
import fondoOndulado from '../assets/images/footer-wave.svg';
import ilustracion from '../assets/images/footerIlustracion.svg';

function Footer() {
  return (
    <footer className="relative bg-cover bg-top text-black pt-5 pb-6 overflow-hidden">
      {/* Fondo ondulado */}
      <img
        src={fondoOndulado}
        alt="fondo ondulado"
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-none z-0"
      />

      {/* Huellas */}
      <img
        src={huella1}
        alt="huella"
        className="absolute left-4 bottom-0 w-20 h-70 sm:w-28 md:w-32 z-0"
      />
      <img
        src={huella2}
        alt="huella"
        className="absolute right-0 top-0 w-20 sm:w-24 md:w-28 z-0"
      />

      {/* Contenido principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1: Logo y texto */}
        <div>
          <img src={logo} alt="logo" className="w-28 mb-4" />
          <p>
            En AdoptMe, conectamos corazones con patas. Facilitamos adopciones seguras y responsables para que más peludos encuentren un hogar lleno de amor. 🐾💜
          </p>
          <p className="mt-4">
            <span className="inline-block mr-2">📧</span>{' '}
            <a href="mailto:AdoptMe@gmail.com" className="underline">
              AdoptMe@gmail.com
            </a>
          </p>
          <p className="mt-1">
            <span className="inline-block mr-2">📞</span> +84938772416
          </p>
          <div className="flex gap-4 mt-4 text-2xl">
            <i className="fab fa-instagram" />
            <i className="fab fa-facebook" />
            <i className="fab fa-linkedin" />
          </div>
        </div>

        {/* Columna 2: Imagen */}
        <div className="flex justify-center items-center">
          <img src={ilustracion} alt="niño y perro" className="max-w-[300px] w-full" />
        </div>

        {/* Columna 3: Menú */}
        <div>
          <h4 className="font-bold text-2xl mb-4">Menu</h4>
          <ul className="space-y-2 font-semibold text-gray-700">
            <li><a href="/">Home</a></li>
            <li><a href="/adoptar">Adopta</a></li>
            <li><a href="/comoAdoptar">¿Cómo Adoptar?</a></li>
            <li><a href="/donar">Donar</a></li>
            <li><a href="/contacto">Contacto</a></li>
          </ul>
        </div>
      </div>

      {/* Derechos reservados */}
      <div className="relative z-10 text-center mt-6 text-sm text-gray-800 font-medium">
        © 2025 AdoptMe. Todos los derechos reservados. Adoptar es amar.
      </div>
    </footer>
  );
}

export default Footer;
