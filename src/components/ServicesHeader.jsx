// =============================================================================
// SERVICESHEADER.JSX - HEADER DE LA PÁGINA DE SERVICIOS
// =============================================================================
// Header con navegación y logo para la página de servicios
// =============================================================================

import React from 'react';

/**
 * COMPONENTE: ServicesHeader
 * 
 * PROPS:
 * - onBackToHome: Función para volver a la página principal
 * - onGoToLogin: Función para ir a la página de login
 * 
 * CONCEPTO CLAVE:
 * Este componente es "presentacional" (solo muestra UI, no maneja lógica compleja)
 */
const ServicesHeader = ({ onBackToHome, onGoToLogin, onCotizacion }) => {
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
                
                {/* ✅ AHORA CON LA PROP CORRECTA */}
                <a 
                    href="#" 
                    className="nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        onCotizacion(); // ✅ Ahora sí funcionará
                    }}
                >
                    Cotización
                </a>
                
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

// =============================================================================
// CONCEPTOS CLAVE:
// =============================================================================
//
// 1. COMPONENTE PRESENTACIONAL:
//    - Solo se encarga de mostrar UI
//    - Recibe datos y funciones por props
//    - No maneja estado complejo
//
// 2. e.preventDefault():
//    - Evita el comportamiento por defecto de los enlaces
//    - Permite que React maneje la navegación
//
// 3. scrollIntoView():
//    - Método del DOM que hace scroll hasta un elemento
//    - behavior: 'smooth' → Scroll suave (animado)
//    - Útil para navegación dentro de la misma página
//
// 4. FLUJO DE NAVEGACIÓN AL LOGIN:
//    - Usuario hace clic en "Iniciar Sesión"
//    ↓
//    - Se ejecuta onClick
//    ↓
//    - e.preventDefault() evita la navegación del enlace
//    ↓
//    - Se ejecuta onGoToLogin() (viene de las props)
//    ↓
//    - onGoToLogin ejecuta goToLogin() en App.js
//    ↓
//    - setCurrentPage('login') cambia el estado
//    ↓
//    - React re-renderiza y muestra <LoginPage />
//
// =============================================================================