import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarAdmin from '../components/dashboard/SidebarAdmin';

import UsersList from './Gestion/Users/UsersList';
import MascotaFundacionList from './Gestion/Mascotas/MascotaFundacionList';
import MascotaExternaList from './Gestion/Mascotas/MascotaExternaList';

import SolicitudesPorMascotaList from '../pages/Gestion/SolicitudesAdopcion/SolicitudesPorMascotaList';
import SolicitudesDetalleMascota from '../pages/Gestion/SolicitudesAdopcion/SolicitudesDetalleMascota';
import SolicitudDetalle from '../pages/Gestion/SolicitudesAdopcion/SolicitudDetalle';
import DetalleProcesoAdopcion from '../pages/Gestion/Adopciones/DetalleProcesoAdopcion';


import ProcesosAdopcionList from '../pages/Gestion/Adopciones/ProcesosAdopcionList';

const DashboardAdmin = () => {
  return (
    <div className="flex">
      <SidebarAdmin />
      <main className="flex-1 p-6">
        <Routes>
          {/* Usuarios */}
          <Route path="usuarios" element={<UsersList />} />

          {/* Mascotas */}
          <Route path="mascotas/fundacion" element={<MascotaFundacionList />} />
          <Route path="mascotas/externas" element={<MascotaExternaList />} />

          {/* Solicitudes de Adopción */}
          <Route path="solicitudes-adopcion" element={<SolicitudesPorMascotaList />} />
          <Route path="solicitudes-adopcion/:id" element={<SolicitudesDetalleMascota />} />
          <Route path="solicitudes-adopcion/detalle/:id" element={<SolicitudDetalle />} />

          {/* Procesos de Adopción */}
          <Route path="procesos-adopcion" element={<ProcesosAdopcionList />} />
          <Route path="procesos-adopcion/:procesoId" element={<DetalleProcesoAdopcion />} />

        </Routes>
      </main>
    </div>
  );
};

export default DashboardAdmin;
