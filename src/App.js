// =============================================================================
// APP.JS - COMPONENTE PRINCIPAL CON INTEGRACIÓN DE LOGIN
// =============================================================================
// Este archivo controla si mostramos la página principal o el login
// usando un estado simple.
// =============================================================================

import React, { useState } from 'react'; // ← Importar useState
import './styles.css';
import './components/css/login.css'; // ← IMPORTANTE: Importar estilos del login

// Importar todos los componentes
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import ServiciosPage from './components/ServiciosPage.jsx';

import useBubbles from './hooks/useBubbles';

const App = () => {
    // -------------------------------------------------------------------------
    // ESTADO: Controla qué página mostrar
    // -------------------------------------------------------------------------
    /**
     * Posibles valores:
     * - 'home'      → Página principal (index)
     * - 'login'     → Página de login/registro
     * - 'servicios' → Página de servicios
     */
    const [currentPage, setCurrentPage] = useState('home');

    // Iniciar animación de burbujas solo en la página principal
    useBubbles('.container');

    // -------------------------------------------------------------------------
    // FUNCIONES DE NAVEGACIÓN
    // -------------------------------------------------------------------------
    
    /**
     * Navega a la página principal
     */
    const goToHome = () => {
        setCurrentPage('home');
        console.log('🏠 Navegando a: Inicio');
    };

    /**
     * Navega a la página de login
     */
    const goToLogin = () => {
        setCurrentPage('login');
        console.log('🔐 Navegando a: Login');
    };

    /**
     * Navega a la página de servicios
     */
    const goToServicios = () => {
        setCurrentPage('servicios');
        console.log('🧼 Navegando a: Servicios');
    };

    // -------------------------------------------------------------------------
    // RENDERIZADO CONDICIONAL CON SWITCH
    // -------------------------------------------------------------------------
    
    switch (currentPage) {
        case 'login':
            // PÁGINA DE LOGIN
            return <LoginPage onBackToHome={goToHome} />;
        
        case 'servicios':
            // PÁGINA DE SERVICIOS
            // IMPORTANTE: Pasar TANTO goToHome COMO goToLogin
            return (
                <ServiciosPage 
                    onBackToHome={goToHome}
                    onGoToLogin={goToLogin}
                />
            );
        
        case 'home':
        default:
            // PÁGINA PRINCIPAL (HOME)
            return (
                <>
                    <div className="background-image-container"></div>
                    
                    <div className="container">
                        <Header onLoginClick={goToLogin} />
                        
                        {/* IMPORTANTE: Pasar goToServicios a MainContent */}
                        <MainContent onServiciosClick={goToServicios} />
                        
                        <div className="foam-effect"></div>
                        
                        <Footer />
                    </div>
                </>
            );
    }
};

export default App;

// =============================================================================
// CONCEPTOS CLAVE:
// =============================================================================
//
// 1. NAVEGACIÓN CON SWITCH:
//    - Más limpio que múltiples if/else
//    - Fácil agregar más páginas
//
// 2. PROPS MÚLTIPLES:
//    - ServiciosPage recibe DOS funciones:
//      · onBackToHome → Para volver al inicio
//      · onGoToLogin → Para ir al login desde servicios
//
// 3. FUNCIONES DE NAVEGACIÓN:
//    - goToHome(), goToLogin(), goToServicios()
//    - Todas hacen lo mismo: setCurrentPage(valor)
//    - Separadas por claridad
//
// =============================================================================