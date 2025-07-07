import React from "react";
import { Link } from "react-router-dom";
import {
  FaPaw,
  FaPhoneAlt,
  FaHome,
  FaTools,
  FaThumbtack,
  FaCheckCircle,
} from "react-icons/fa";

const ComoAdoptar = () => {
  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 max-w-screen-xl mx-auto text-gray-800">
      {/* Título principal */}
      <h2 className="text-center text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
        ¿Cómo Adoptar en AdoptMe? <span className="inline-block text-4xl">🐾</span>
      </h2>
      <p className="text-center text-lg text-gray-700 mb-10">
        En AdoptMe ofrecemos dos formas de adopción seguras y responsables:
      </p>

      {/* Opciones de adopción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Fundación */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-md transition">
          <img
            src="/public/gaticueva-logo.png"
            alt="La Gaticueva"
            className="h-30 object-contain mb-4"
          />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            <span className="text-purple-600">
              <FaHome className="inline mr-1" /> Opción 1:
            </span>{" "}
            Adopción con la Fundación Gaticueva
          </h3>
          <p className="mb-4 text-gray-600">
            Proceso estructurado y supervisado para garantizar el bienestar de la mascota.
          </p>
          <Link
            to="/adoptar"
            className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition font-semibold"
          >
            Adoptar
          </Link>
        </div>

        {/* Persona externa */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-md transition">
          <img
            src="/public/persona-externa.png"
            alt="Persona externa"
            className="h-30 object-contain mb-4"
          />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            <span className="text-purple-600">
              <FaPhoneAlt className="inline mr-1" /> Opción 2:
            </span>{" "}
            Adopción desde una Persona Externa
          </h3>
          <p className="mb-4 text-gray-600">
            AdoptMe permite que personas responsables postulen mascotas en adopción.
          </p>
          <Link
            to="/adoptar"
            className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition font-semibold"
          >
            Adoptar
          </Link>
        </div>
      </div>

      {/* Pasos opción 1 */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-gray-700 mb-6">
          <FaHome className="inline mr-2 text-purple-600" />
          <span className="text-purple-600">Opción 1:</span> Adopción con la Fundación Gaticueva
        </h3>

        <div className="space-y-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6"
            >
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold uppercase text-gray-800 mb-1">
                  {step === 1 && "Formulario de Adopción"}
                  {step === 2 && "Evaluación y Entrevista"}
                  {step === 3 && "Visita a la Fundación"}
                  {step === 4 && "Firma del Compromiso"}
                </h4>
                <p className="text-gray-600">
                  {step === 1 && "Llena un formulario de adopción con tus datos y experiencia."}
                  {step === 2 && "La fundación evaluará tu solicitud y agendará una videollamada."}
                  {step === 3 && "Si eres apto, visitarás la fundación para conocer a la mascota."}
                  {step === 4 && "Si todo está bien, firmarás un compromiso de adopción."}
                </p>
              </div>
              <div className="flex-shrink-0 max-w-xs w-full">
                <img
                  src={`/public/paso${step}.png`}
                  alt={`Paso ${step}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opción 2 */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-gray-700 mb-4">
          <FaPhoneAlt className="inline mr-2 text-purple-600" />
          <span className="text-purple-600">Opción 2:</span> Adopción desde una Persona Externa
        </h3>
        <p className="text-gray-700 mb-4">
          AdoptMe permite que personas responsables postulen mascotas en adopción.
        </p>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-1">
            <FaTools className="inline mr-2 text-purple-600" />
            ¿Cómo funciona?
          </h4>
          <ul className="list-disc list-inside text-gray-700">
            <li>Llenar un formulario detallado para publicar una mascota.</li>
            <li>Un administrador revisa antes de aprobar la publicación.</li>
            <li>El adoptante puede ver el contacto y proceder de forma segura.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-1">
            <FaThumbtack className="inline mr-2 text-purple-600" />
            Recomendaciones:
          </h4>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <FaCheckCircle className="mt-1 mr-2 text-green-600" />
              <span>Pregunta sobre la historia y salud de la mascota.</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="mt-1 mr-2 text-green-600" />
              <span>Pide fotos y vídeos recientes.</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="mt-1 mr-2 text-green-600" />
              <span>Encuentro en lugar seguro.</span>
            </li>
            <li className="flex items-start">
              <FaCheckCircle className="mt-1 mr-2 text-green-600" />
              <span>Adopciones en AdoptMe son 100% gratuitas.</span>
            </li>
          </ul>
        </div>

        <div className="text-center bg-purple-50 rounded-xl py-6 px-4">
          <p className="text-lg font-semibold mb-3 text-gray-800">
            ¿Tienes una mascota para dar en adopción?
          </p>
          <p className="mb-4 text-gray-700">
            Haz clic en el botón y sigue los pasos para enviar tu solicitud.
          </p>
          <Link
            to="/publicaciones"
            className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition font-semibold"
          >
            Postular Mascota
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComoAdoptar;
