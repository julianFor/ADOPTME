import logo from '../assets/images/LogoAdoptmeNegroV2.svg';
import huella1 from '../assets/images/Huella2.svg';
import huella2 from '../assets/images/Huella1.svg'; // corregido
import fondoOndulado from '../assets/images/footer-wave.svg';
import ilustracion from '../assets/images/footerIlustracion.svg'; // nuevo import para evitar error
 // este svg es la forma de fondo

function Footer() {
  return (
    <footer className="relative bg-cover bg-top text-black  pb-6 overflow-hidden">
      {/* Forma ondulada como fondo */}
    <img src={fondoOndulado} alt="fondo ondulado" className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-screen-xl -z-10" />

      {/* Huellas sobresalientes */}
      <img src={huella1} alt="huella" className="absolute left-12 bottom-0 w-32 z-10" />
      <img src={huella2} alt="huella" className="absolute right-0 top-0 w-15 z-10" />

      <div className="container mx-auto px-6 flex flex-wrap justify-between items-center">
        {/* Columna 1: Logo y descripción */}
        <div className="w-full md:w-1/3 mb-8 md:mb-0">
          <img src={logo} alt="logo" className="w-30 mb-2" />
          <p className="mt-2">
            En AdoptMe, conectamos corazones con patas. Facilitamos adopciones seguras y responsables para que más peludos encuentren un hogar lleno de amor. 🐾💜
          </p>
          <p className="mt-4">
            <span className="inline-block mr-2">📧</span> <a href="mailto:anhdansgvn@gmail.com" className="underline">anhdansgvn@gmail.com</a>
          </p>
          <p className="mt-1">
            <span className="inline-block mr-2">📞</span> +84938772416
          </p>
          <div className="flex gap-3 mt-4 text-2xl">
            <i className="fab fa-instagram" />
            <i className="fab fa-facebook" />
            <i className="fab fa-linkedin" />
          </div>
        </div>

        {/* Columna 2: Imagen del niño con perro */}
        <div className="w-full md:w-1/3 flex justify-center mb-8 md:mb-0">
        <img src={ilustracion} alt="niño y perro" className="w-70 rounded-lg " />
        </div>

        {/* Columna 3: Menú */}
        <div className="w-full md:w-1/3">
          <h4 className="font-bold text-2xl mb-4">Menu</h4>
          <ul className="space-y-2 font-semibold text-gray-700">
            <li><a href="#">Home</a></li>
            <li><a href="#">Adopta</a></li>
            <li><a href="#">¿Cómo Adoptar?</a></li>
            <li><a href="#">Donar</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-8 text-gray-800 font-medium">
        © 2025 AdoptMe. Todos los derechos reservados. Adoptar es amar.
      </div>
    </footer>
  );
}

export default Footer;
