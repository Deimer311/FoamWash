// =============================================================================
// ARCHIVO  : HeaderAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/HeaderAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de navegación superior del panel de administración con links a todas las secciones.
// =============================================================================

import React from "react";
import '../comun/Header.css';

const HeaderAdmin = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onGoUsuarios,
  onGoServicios,
  onLogout,
  activeTab
}) => {
  const getTabStyle = (tabName) => ({
    color: activeTab === tabName ? 'rgb(133, 198, 255)' : 'white',
    fontWeight: activeTab === tabName ? 'bold' : 'normal'
  });

  return (
    <header className="header-banner">
      <img src="/img/ima9.jpg" alt="Fondo" className="fondo" />

      <h1 className="logo-header" style={{ cursor: "pointer" }} onClick={onGoDashboard}>
        FoamWash
      </h1>

      <nav className="nav-bar">
        <a href="#" className="nav-link" style={getTabStyle('panel')} onClick={(e) => { e.preventDefault(); onGoDashboard(); }}>
          Panel
        </a>
        <a href="#" className="nav-link" style={getTabStyle('agenda')} onClick={(e) => { e.preventDefault(); onGoAgenda(); }}>
          Agenda
        </a>
        <a href="#" className="nav-link" style={getTabStyle('empleados')} onClick={(e) => { e.preventDefault(); onGoEmpleados(); }}>
          Empleados
        </a>
        <a href="#" className="nav-link" style={getTabStyle('usuarios')} onClick={(e) => { e.preventDefault(); if(onGoUsuarios) onGoUsuarios(); }}>
          Usuarios
        </a>
        <a href="#" className="nav-link" style={getTabStyle('servicios')} onClick={(e) => { e.preventDefault(); if(onGoServicios) onGoServicios(); }}>
          Servicios
        </a>
        <a href="#" className="nav-link" style={getTabStyle('reportes')} onClick={(e) => { e.preventDefault(); onGoReportes(); }}>
          Reportes
        </a>
        <a href="#" className="nav-link" style={getTabStyle('perfil')} onClick={(e) => { e.preventDefault(); onGoPerfil(); }}>
          Perfil
        </a>
        <button className="nav-link btn-salir" onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default HeaderAdmin;