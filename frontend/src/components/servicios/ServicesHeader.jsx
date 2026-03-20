// =============================================================================
// ARCHIVO  : ServicesHeader.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/servicios/ServicesHeader.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Encabezado de la sección de servicios públicos.
// =============================================================================

import React from 'react';

/**
 * PROPS:
 * - onBackToHome:          Volver a la página principal
 * - onGoToLogin:           Ir a la página de login
 * - onCotizacionPublica:   Ir SIEMPRE a CotizacionPage (flujo público, sin branching)
 */
const ServicesHeader = ({ onBackToHome, onGoToLogin, onCotizacionPublica }) => {
    return (
        <header className="header-banner">
            <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
            <h1 
                className="logo-header"
                onClick={onBackToHome}
                style={{ cursor: 'pointer' }}
            >
                FoamWash
            </h1>
            
            <nav className="nav-bar">
                {/* Hogar */}
                <a
                    href="#"
                    className="nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        onBackToHome();
                    }}
                >
                    Hogar
                </a>
                
                {/* Cotización → siempre va a CotizacionPage (público) */}
                <a 
                    href="#" 
                    className="nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        onCotizacionPublica();
                    }}
                >
                    Cotización
                </a>
                
                {/* Agendar → resaltado, hace scroll a los servicios */}
                <a 
                    href="#" 
                    className="nav-link" 
                    style={{ color: 'rgb(133, 198, 255)' }}
                    onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('.services-section')?.scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    }}
                >
                    Agendar
                </a>
                
                {/* Iniciar Sesión */}
                <a
                    href="#" 
                    className="nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        onGoToLogin();
                    }}
                >
                    Iniciar Sesión
                </a>
            </nav>
        </header>
    );
};

export default ServicesHeader;