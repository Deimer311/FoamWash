// =============================================================================
// ARCHIVO  : HeaderEmpleado.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/HeaderEmpleado.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de navegación del panel del trabajador.
// =============================================================================

import React from "react";
import '../comun/Header.css'; // Reutilizamos el mismo CSS del Header

const HeaderEmpleado = ({
  onGoAgendaEmpleado,
  onGoPerfil,
  onLogout,
  activeTab
}) => {
  const getTabStyle = (tabName) => ({
    color: activeTab === tabName ? 'rgb(133, 198, 255)' : 'white',
    fontWeight: activeTab === tabName ? 'bold' : 'normal'
  });

  return (
    <header className="header-banner">
      {/* Usamos la misma imagen de fondo */}
      <img src="/img/ima9.jpg" alt="Fondo" className="fondo" />

      <h1 className="logo-header" style={{ cursor: "pointer" }} onClick={onGoAgendaEmpleado}>
        FoamWash
      </h1>

      <nav className="nav-bar">
        <a 
          href="#" 
          className="nav-link" 
          style={getTabStyle('agenda')} 
          onClick={(e) => { 
            e.preventDefault(); 
            onGoAgendaEmpleado(); 
          }}
        >
          Agenda
        </a>
        <a 
          href="#" 
          className="nav-link" 
          style={getTabStyle('perfil')} 
          onClick={(e) => { 
            e.preventDefault(); 
            onGoPerfil(); 
          }}
        >
          Perfil
        </a>
        <button 
          className="nav-link btn-salir" 
          onClick={onLogout} 
          style={{
            background: 'none', 
            border: 'none', 
            cursor: 'pointer'
          }}
        >
          Cerrar Sesión
        </button>
      </nav>
    </header>
  );
};

export default HeaderEmpleado;