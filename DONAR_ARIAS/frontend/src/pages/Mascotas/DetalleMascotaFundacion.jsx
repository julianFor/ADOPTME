import React from 'react';
import { useNavigate } from 'react-router-dom';
import PeluditosRelacionados from './PeluditosRelacionados';

const DetalleMascotaFundacion = ({ mascota }) => {
  const navigate = useNavigate();

  const irAFormularioAdopcion = () => {
    navigate(`/adopcion/${mascota._id}`);
  };

  return (
    <div className="pt-10">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-purple-600 mb-10">
        Presentación de Mascota 🐾
      </h2>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 px-5">
        <div className="md:w-1/2 flex justify-center">
          <img
            src={`http://localhost:3000/uploads/${mascota.imagenes?.[0]}`}
            alt={mascota.nombre}
            className="rounded-3xl bg-green-100 max-h-[400px] object-contain"
          />
        </div>

        <div className="md:w-1/2 space-y-6">
          <h3 className="text-3xl font-extrabold leading-snug text-gray-600">
            Hola mi nombre es{' '}
            <span className="text-purple-500">{mascota.nombre}</span>
          </h3>

          <div>
            <p className="text-lg font-semibold mb-1">Descripción:</p>
            <p className="text-gray-700 text-base leading-relaxed">
              {mascota.descripcion}
            </p>
          </div>

          <div>
            <p className="text-lg font-semibold mb-2">Características:</p>
            <div className="flex flex-col items-center gap-6">
              {/* Características */}
              <div className="flex flex-wrap gap-4 justify-center">
                {/* Sexo */}
                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700 capitalize">
                    {mascota.sexo}
                  </span>
                  <span className="text-xs text-gray-600">Sexo</span>
                </div>

                {/* Edad */}
                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700">
                    {calcularEdad(mascota.fechaNacimiento)}
                  </span>
                  <span className="text-xs text-gray-600">Edad</span>
                </div>

                {/* Esterilizado */}
                <div className="bg-purple-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700">
                    {mascota.esterilizado ? 'Sí' : 'No'}
                  </span>
                  <span className="text-xs text-gray-600">Esterilizad@</span>
                </div>

                {/* Origen */}
                <div className="bg-orange-200 w-[100px] h-[70px] rounded-xl flex flex-col justify-center items-center text-sm">
                  <span className="font-semibold text-gray-700">Fundación</span>
                  <span className="text-xs text-gray-600">Origen</span>
                </div>
              </div>

              {/* Botón adoptar */}
              <button
                onClick={irAFormularioAdopcion}
                className="bg-purple-400 text-white font-bold text-sm w-[160px] h-[50px] rounded-full hover:bg-purple-500 transition"
              >
                Adoptar
              </button>
            </div>
          </div>
        </div>
      </div>

      <PeluditosRelacionados origen="fundacion" mascotaId={mascota._id} />
    </div>
  );
};

// Utilidad para calcular edad a partir de fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'Edad desconocida';
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  return `${edad} año${edad > 1 ? 's' : ''}`;
}

export default DetalleMascotaFundacion;
