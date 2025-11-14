// =============================================================================
// HEADER.JSX - ENCABEZADO CON BOTÓN DE LOGIN FUNCIONAL
// =============================================================================
// Este componente muestra el header de la página principal.
// Ahora el botón "Iniciar sesión" realmente funciona.
// =============================================================================

import React from 'react';
// import '../styles.css'
/**
 * COMPONENTE: Header
 * 
 * PROPS:
 * - onLoginClick: Función que se ejecuta cuando el usuario hace clic en "Iniciar sesión"
 * 
 * CONCEPTO CLAVE - PROPS COMO FUNCIONES:
 * Las props no solo pueden ser datos (strings, números, objetos).
 * También pueden ser FUNCIONES que el componente hijo ejecuta.
 * 
 * Esto permite que el componente hijo "le avise" al padre que algo pasó.
 * En este caso: "¡El usuario quiere ir al login!"
 */
const Header = ({ onLoginClick }) => {
    return (
        <div className="header">
            {/* INFORMACIÓN DE CONTACTO */}
            <div className="contact-info">
                <h1>☎</h1>
                <div className="contact-text">
                    <h3>Contactanos</h3>
                    <p>3144368571</p>
                </div>
            </div>
            
            {/* LOGO CENTRADO */}
            <center>
                <div className="logo">
                    FoamWash
                    <span style={{ fontSize: '0.7em' }}>LG</span>
                </div>
            </center>
            
            <button 
                className="login-btn"
                onClick={onLoginClick}
            >
                Iniciar sesión
            </button>
        </div>
    );
};

export default Header;

// =============================================================================
// FLUJO COMPLETO DEL EVENTO:
// =============================================================================
//
// 1. Usuario hace clic en el botón "Iniciar sesión"
//    ↓
// 2. Se ejecuta el evento onClick del botón
//    ↓
// 3. onClick ejecuta la función onLoginClick (que viene de las props)
//    ↓
// 4. onLoginClick ejecuta: () => setShowLogin(true)
//    ↓
// 5. setShowLogin(true) cambia el estado en App.js
//    ↓
// 6. React detecta el cambio de estado y re-renderiza App.js
//    ↓
// 7. Como showLogin ahora es true, el if en App.js renderiza <LoginPage />
//    ↓
// 8. El usuario ve la página de login
//
// =============================================================================
//
// CONCEPTOS CLAVE:
//
// 1. PROPS DESTRUCTURING:
//    - const Header = ({ onLoginClick }) => { ... }
//    - Es lo mismo que: const Header = (props) => { const onLoginClick = props.onLoginClick; }
//    - Más limpio y legible
//
// 2. CALLBACKS HACIA ARRIBA:
//    - El padre (App.js) pasa una función al hijo (Header.jsx)
//    - El hijo ejecuta esa función cuando algo sucede
//    - Esto permite que el hijo "comunique" eventos al padre
//
// 3. EVENTOS EN REACT:
//    - onClick en React vs onclick en HTML
//    - React usa camelCase para todos los eventos
//    - onClick recibe una FUNCIÓN, no una STRING
//
// =============================================================================