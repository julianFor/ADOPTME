// src/pages/DashboardAdmin.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarAdmin from '../components/dashboard/SidebarAdmin';

// 👇 nuevo import
import AdminHome from './Gestion/Dashboards/AdminHome';

import UsersList from './Gestion/Users/UsersList';
import MascotaFundacionList from './Gestion/Mascotas/MascotaFundacionList';
import MascotaExternaList from './Gestion/Mascotas/MascotaExternaList';

import SolicitudesPorMascotaList from '../pages/Gestion/SolicitudesAdopcion/SolicitudesPorMascotaList';
import SolicitudesDetalleMascota from '../pages/Gestion/SolicitudesAdopcion/SolicitudesDetalleMascota';
import MisSolicitudesAdopcion from '../pages/Gestion/SolicitudesAdopcion/MisSolicitudesAdopcion';
import DetallesMiSolicitudAdopcion from '../pages/Gestion/SolicitudesAdopcion/DetallesMiSolicitudAdopcion';

import SolicitudDetalle from '../pages/Gestion/SolicitudesAdopcion/SolicitudDetalle';
import ProcesosAdopcionList from '../pages/Gestion/Adopciones/ProcesosAdopcionList';
import DetalleProcesoAdopcion from '../pages/Gestion/Adopciones/DetalleProcesoAdopcion';
import MisProcesosAdopcion from "../pages/Gestion/Adopciones/MisProcesosAdopcion";

import ListaSolicitudesPublicacion from '../pages/Gestion/SolicitudesPublicacion/ListaSolicitudesPublicacion';
import DetalleSolicitudPublicacion from '../pages/Gestion/SolicitudesPublicacion/DetalleSolicitudPublicacion';
import MisSolicitudesPublicacion from "../pages/Gestion/SolicitudesPublicacion/MisSolicitudesPublicacion";
import DetallesMiSolicitudPublicacion from "../pages/Gestion/SolicitudesPublicacion/DetallesMiSolicitudPublicacion";
import MisPublicaciones from '../pages/Gestion/SolicitudesPublicacion/MisPublicaciones';

import DonationGoalCRUD from '../components/donaciones/DonationGoalCRUD';

const DashboardAdmin = () => {
  return (
    <div className="flex">
      <SidebarAdmin />
      <main className="flex-1 p-6">
        <Routes>
          {/* 👇 Ruta por defecto del dashboard */}
          <Route index element={<AdminHome />} />

          {/* Usuarios */}
          <Route path="usuarios" element={<UsersList />} />

          {/* Mascotas */}
          <Route path="mascotas/fundacion" element={<MascotaFundacionList />} />
          <Route path="mascotas/externas" element={<MascotaExternaList />} />

          {/* Solicitudes de Adopción */}
          <Route path="solicitudes-adopcion" element={<SolicitudesPorMascotaList />} />
          <Route path="solicitudes-adopcion/:id" element={<SolicitudesDetalleMascota />} />
          <Route path="solicitudes-adopcion/detalle/:id" element={<SolicitudDetalle />} />
          <Route path="mis-solicitudes" element={<MisSolicitudesAdopcion />} />
          <Route path="mis-solicitudes/:id" element={<DetallesMiSolicitudAdopcion />} />

          {/* Procesos de Adopción */}
          <Route path="procesos-adopcion" element={<ProcesosAdopcionList />} />
          <Route path="procesos-adopcion/:procesoId" element={<DetalleProcesoAdopcion />} />
          <Route path="mis-procesos" element={<MisProcesosAdopcion />} />

          {/* Solicitudes de Publicación */}
          <Route path="solicitudes-publicacion" element={<ListaSolicitudesPublicacion />} />
          <Route path="solicitudes-publicacion/:id" element={<DetalleSolicitudPublicacion />} />
          <Route path="mis-solicitudes-publicacion" element={<MisSolicitudesPublicacion />} />
          <Route path="mis-solicitudes-publicacion/:id" element={<DetallesMiSolicitudPublicacion />} />
          <Route path="mis-publicaciones" element={<MisPublicaciones />} />

          {/* Donaciones */}
          <Route path="donaciones/meta" element={<DonationGoalCRUD />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardAdmin;
