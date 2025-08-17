import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarAdoptante from '../components/dashboard/SidebarAdoptante';

import AdoptanteHome from './Gestion/Dashboards/AdoptanteHome';
import MisSolicitudesAdopcion from '../pages/Gestion/SolicitudesAdopcion/MisSolicitudesAdopcion';
import DetallesMiSolicitudAdopcion from '../pages/Gestion/SolicitudesAdopcion/DetallesMiSolicitudAdopcion';

import MisProcesosAdopcion from "../pages/Gestion/Adopciones/MisProcesosAdopcion";
import DetalleProcesoAdopcion from "../pages/Gestion/Adopciones/DetalleProcesoAdopcion";

import MisSolicitudesPublicacion from "../pages/Gestion/SolicitudesPublicacion/MisSolicitudesPublicacion";
import DetallesMiSolicitudPublicacion from "../pages/Gestion/SolicitudesPublicacion/DetallesMiSolicitudPublicacion";

import MisPublicaciones from '../pages/Gestion/SolicitudesPublicacion/MisPublicaciones';

const DashboardAdoptante = () => {
  return (
    <div className="flex">
      <SidebarAdoptante />
      <main className="flex-1 p-6">
        <Routes>
          <Route index element={<AdoptanteHome />} />
          {/* Mi Actividad - Solicitudes de Adopción */}
          <Route path="mis-solicitudes" element={<MisSolicitudesAdopcion />} />
          <Route path="mis-solicitudes/:id" element={<DetallesMiSolicitudAdopcion />} />

          {/* Mi Actividad - Procesos de Adopción */}
          <Route path="mis-procesos" element={<MisProcesosAdopcion />} />
          <Route path="mis-procesos/:procesoId" element={<DetalleProcesoAdopcion />} />

          {/* Mi Actividad - Solicitudes de Publicación */}
          <Route path="mis-solicitudes-publicacion" element={<MisSolicitudesPublicacion />} />
          <Route path="mis-solicitudes-publicacion/:id" element={<DetallesMiSolicitudPublicacion />} />

          {/* Mi Actividad - Publicaciones Aprobadas */}
          <Route path="mis-publicaciones" element={<MisPublicaciones />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardAdoptante;
