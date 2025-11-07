import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiClipboard,
  FiVideo,
  FiMapPin,
  FiEdit3,
  FiFileText,
  FiUserCheck,
  FiPhoneCall,
} from "react-icons/fi";

function useInView({ root = null, rootMargin = "0px", threshold = 0.15 } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.unobserve(el); // dispara una vez
      }
    }, { root, rootMargin, threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [root, rootMargin, threshold]);

  return [ref, inView];
}

const ComoAdoptar = () => {
  // --- Animaciones para Opción 1 ---
  const [ref1O1, v1O1] = useInView();
  const [ref2O1, v2O1] = useInView();
  const [ref3O1, v3O1] = useInView();
  const [ref4O1, v4O1] = useInView();

  // --- Animaciones para Opción 2 ---
  const [ref1O2, v1O2] = useInView();
  const [ref2O2, v2O2] = useInView();
  const [ref3O2, v3O2] = useInView();

  return (
    <div className="px-4 sm:px-8 md:px-16 lg:px-24 py-10 max-w-screen-xl mx-auto text-gray-800">
      {/* Título principal */}
      <div className="max-w-[900px] mx-auto mb-10">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-center text-3xl font-extrabold text-purple-500 ">
            Cómo Adoptar en AdoptMe
          </h2>
          <img
            src="/paw-title.svg"
            alt=""
            className="h-7 sm:h-8 w-auto select-none"
            draggable="false"
          />
        </div>

        <p className="mt-6 text-center text-xl text-gray-800 font-semibold">
          <span className="inline-block align-middle mr-2">🐾</span>{' '}
          ¿Cómo funciona la adopción en nuestra plataforma?
        </p>

        <p className="mt-2 text-center text-[17px] text-gray-600">
          En AdoptMe ofrecemos dos formas de adopción seguras y responsables:
        </p>
      </div>

      {/* Opciones de adopción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 justify-items-center">
        {/* Fundación */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-md transition transform scale-90">
          <img
            src="/gaticueva-logo.png"
            alt="La Gaticueva"
            className="h-28 object-contain mb-4"
          />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            <span className="text-purple-600"> Opción 1:</span> Adopción con la Fundación Gaticueva
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
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center hover:shadow-md transition transform scale-90">
          <img
            src="/persona-externa.png"
            alt="Persona externa"
            className="h-28 object-contain mb-4"
          />
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            <span className="text-purple-600"> Opción 2:</span> Adopción desde una Persona Externa
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
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda */}
          <div className="px-2">
            <h3 className="text-[26px] sm:text-[28px] font-extrabold leading-[1.15] tracking-tight">
              <span className="text-purple-600 block">Opción 1</span>
              <span className="text-purple-600">Fundación Gaticueva</span>
            </h3>
            <p className="mt-4 text-[16px] text-gray-800 max-w-[500px] leading-[1.6]">
              Para poder adoptar con la fundación, se deben seguir los siguientes pasos:
            </p>
            <div className="mt-8">
              <img
                src="/ilustracion-fundacion.svg"
                alt="Ilustración: persona con mascota"
                className="w-full max-w-[420px] h-80 select-none"
                draggable="false"
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[135%] md:w-[150%] lg:w-[160%] h-[340px] md:h-[380px] lg:h-[400px] bg-purple-200/60 rounded-l-[80px] md:rounded-l-[100px] pointer-events-none -z-10"
            />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Paso 1 */}
              <article
                ref={ref1O1}
                className={`bg-white rounded-[22px] shadow-lg ring-1 ring-black/5 px-8 py-9 transition-all duration-[1200ms] ease-out ${
                  v1O1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: v1O1 ? "120ms" : "0ms" }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                  <FiClipboard className="text-[22px] text-purple-600" />
                </div>
                <h4 className="text-center font-bold text-[16px]">Paso 1: Formulario de Adopción</h4>
                <p className="mt-2 text-center text-[13.5px] text-gray-600">
                  Llena un formulario de adopción con tus datos y experiencia.
                </p>
              </article>

              {/* Paso 2 */}
              <article
                ref={ref2O1}
                className={`bg-white rounded-[22px] shadow-lg ring-1 ring-black/5 px-8 py-9 transition-all duration-[1200ms] ease-out sm:translate-y-[-26px] ${
                  v2O1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: v2O1 ? "240ms" : "0ms" }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <FiVideo className="text-[22px] text-amber-500" />
                </div>
                <h4 className="text-center font-bold text-[16px]">Paso 2: Evaluación y Entrevista</h4>
                <p className="mt-2 text-center text-[13.5px] text-gray-600">
                  La fundación evaluará tu solicitud y agendará una videollamada.
                </p>
              </article>

              {/* Paso 3 */}
              <article
                ref={ref3O1}
                className={`bg-white rounded-[22px] shadow-lg ring-1 ring-black/5 px-8 py-9 transition-all duration-[1200ms] ease-out sm:-translate-y-1 ${
                  v3O1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: v3O1 ? "360ms" : "0ms" }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100">
                  <FiMapPin className="text-[22px] text-pink-500" />
                </div>
                <h4 className="text-center font-bold text-[16px]">Paso 3: Visita a la Fundación</h4>
                <p className="mt-2 text-center text-[13.5px] text-gray-600">
                  Si eres apto, visitarás la fundación para conocer a la mascota.
                </p>
              </article>

              {/* Paso 4 */}
              <article
                ref={ref4O1}
                className={`bg-white rounded-[22px] shadow-lg ring-1 ring-black/5 px-8 py-9 transition-all duration-[1200ms] ease-out sm:translate-y-[-16px] ${
                  v4O1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: v4O1 ? "480ms" : "0ms" }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <FiEdit3 className="text-[22px] text-green-500" />
                </div>
                <h4 className="text-center font-bold text-[16px]">Paso 4: Firma del Compromiso</h4>
                <p className="mt-2 text-center text-[13.5px] text-gray-600">
                  Si todo está bien, firmarás un compromiso de adopción.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* Opción 2: Persona Externa */}
      <section className="mb-20">
        <h3 className="text-center text-[28px] sm:text-[32px] font-extrabold text-purple-600">
          Opción 2: Persona Externa
        </h3>
        <p className="mt-3 text-center text-gray-700">
          AdoptMe permite que personas responsables postulen mascotas en adopción.
          <br />
          <span className="italic">¿Cómo funciona?</span>
        </p>
        <div className="relative max-w-6xl mx-auto mt-12">
          <img
            src="/curve-1.svg"
            alt=""
            aria-hidden="true"
            className="hidden md:block absolute top-[10px] left-[22%] w-[23%] max-w-[360px]"
            draggable="false"
          />
          <img
            src="/curve-2.svg"
            alt=""
            aria-hidden="true"
            className="hidden md:block absolute top-[70px] right-[21%] w-[23%] max-w-[400px]"
            draggable="false"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Paso 1 */}
            <div
              ref={ref1O2}
              className={`flex flex-col items-center text-center transition-all duration-[1000ms] ease-out ${
                v1O2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: v1O2 ? "120ms" : "0ms" }}
            >
              <div className="rounded-[26px] shadow-lg p-6 bg-gradient-to-br from-purple-600 to-purple-500">
                <FiFileText className="text-white text-[34px]" />
              </div>
              <h4 className="mt-4 text-[16.5px] font-extrabold text-purple-600">Diligenciar Formulario</h4>
              <p className="mt-2 text-gray-600 max-w-[320px]">
                Cada persona que quiera publicar una mascota deberá llenar un formulario detallado.
              </p>
            </div>

            {/* Paso 2 */}
            <div
              ref={ref2O2}
              className={`flex flex-col items-center text-center transition-all duration-[1000ms] ease-out ${
                v2O2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: v2O2 ? "240ms" : "0ms" }}
            >
              <div className="rounded-[26px] shadow-lg p-6 bg-gradient-to-br from-purple-600 to-purple-500">
                <FiUserCheck className="text-white text-[34px]" />
              </div>
              <h4 className="mt-4 text-[16.5px] font-extrabold text-purple-600">Revisión del Formulario</h4>
              <p className="mt-2 text-gray-600 max-w-[320px]">
                Un administrador de AdoptMe revisará la información antes de aprobar la publicación.
              </p>
            </div>

            {/* Paso 3 */}
            <div
              ref={ref3O2}
              className={`flex flex-col items-center text-center transition-all duration-[1000ms] ease-out ${
                v3O2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: v3O2 ? "360ms" : "0ms" }}
            >
              <div className="rounded-[26px] shadow-lg p-6 bg-gradient-to-br from-purple-600 to-purple-500">
                <FiPhoneCall className="text-white text-[34px]" />
              </div>
              <h4 className="mt-4 text-[16.5px] font-extrabold text-purple-600">Adoptar</h4>
              <p className="mt-2 text-gray-600 max-w-[320px]">
                Al seleccionar una de estas mascotas, verás el contacto del dueño y recomendaciones para una adopción segura.
              </p>
            </div>
          </div>
        </div>

        {/* CTA inferior */}
        <div className="mt-12 text-center bg-purple-50 rounded-xl py-6 px-4">
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
      </section>
    </div>
  );
};

export default ComoAdoptar;
