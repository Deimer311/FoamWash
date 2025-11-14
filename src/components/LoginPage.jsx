// =============================================================================
// LOGINPAGE.JSX - COMPONENTE PRINCIPAL DEL LOGIN CON EFECTO CARD FLIP
// =============================================================================
// Este componente maneja el toggle entre la vista de Login y Registro.
// Replica el efecto de "tarjeta deslizante" del HTML original.
// =============================================================================

import React, { useState } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';
import './css/login.css'; // Importar los estilos del login

/**
 * COMPONENTE PRINCIPAL: LoginPage
 * 
 * ESTADO:
 * - isRegisterActive: boolean que controla si mostramos Login o Registro
 * 
 * CONCEPTO CLAVE:
 * - En React, el "estado" (state) es información que puede cambiar y hace que 
 *   el componente se vuelva a renderizar cuando cambia.
 * - useState() es un Hook que nos permite agregar estado a componentes funcionales.
 */
const LoginPage = ({ onBackToHome }) => {
    // -------------------------------------------------------------------------
    // 1. ESTADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    // useState devuelve un array con 2 elementos:
    // [0] = valor actual del estado
    // [1] = función para actualizar ese estado
    // 
    // Usamos "destructuring" para nombrarlos:
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    
    // isRegisterActive = false → Muestra LOGIN
    // isRegisterActive = true  → Muestra REGISTRO

    // -------------------------------------------------------------------------
    // 2. FUNCIONES MANEJADORAS DE EVENTOS
    // -------------------------------------------------------------------------
    
    /**
     * Cambia a la vista de REGISTRO
     * Se ejecuta cuando el usuario hace clic en el botón "Registrar"
     */
    const switchToRegister = () => {
        setIsRegisterActive(true); // Actualiza el estado a true
        // Cuando el estado cambia, React vuelve a renderizar el componente
    };
    
    /**
     * Cambia a la vista de LOGIN
     * Se ejecuta cuando el usuario hace clic en el botón "Iniciar sesión"
     */
    const switchToLogin = () => {
        setIsRegisterActive(false); // Actualiza el estado a false
    };
    
    /**
     * Maneja la redirección después del login/registro exitoso
     * @param {string} redirectUrl - URL a la que redirigir
     */
    const handleRedirect = (redirectUrl) => {
        console.log('Redirigiendo a:', redirectUrl);
        // En React Router usarías: navigate(redirectUrl)
        // Por ahora solo mostramos el mensaje
        alert(`¡Sesión iniciada! Redirigiendo a: ${redirectUrl}`);
    };

    // -------------------------------------------------------------------------
    // 3. RENDERIZADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    return (
        <>
            {/* FONDO DE LA PÁGINA */}
            <div className="background"></div>

            {/* LOGO HEADER */}
            <center>
                <a href="./index.html" style={{ textDecoration: 'none' }}>
                    <h1 className="logo-header">FoamWash</h1>
                </a>
            </center>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="container">
                {/* 
                    TARJETA CON EFECTO FLIP
                    
                    CONCEPTO CLAVE - CLASES CONDICIONALES:
                    - En HTML puro: agregábamos/quitábamos clases con JS
                    - En React: usamos template literals y expresiones condicionales
                    
                    `card-wrapper ${isRegisterActive ? 'register-active' : ''}`
                    
                    Esto significa:
                    - Si isRegisterActive es true  → "card-wrapper register-active"
                    - Si isRegisterActive es false → "card-wrapper"
                    
                    La clase 'register-active' activa las animaciones CSS del flip
                */}
                <div className={`card-wrapper ${isRegisterActive ? 'register-active' : ''}`}>

                    {/* =================================================== */}
                    {/* LADO IZQUIERDO: FORMULARIOS (LOGIN Y REGISTRO)     */}
                    {/* =================================================== */}
                    <div className="card-side form-side">
                        {/* 
                            RENDERIZADO CONDICIONAL:
                            - En React podemos mostrar/ocultar componentes con operadores lógicos
                            - {!isRegisterActive && <LoginView />} significa:
                              "Si isRegisterActive es FALSE, renderiza LoginView"
                            - El operador && (AND) funciona así:
                              · Si la primera parte es true, evalúa y devuelve la segunda parte
                              · Si la primera parte es false, no evalúa la segunda parte
                        */}
                        
                        {/* Mostrar LOGIN cuando isRegisterActive es false */}
                        {!isRegisterActive && (
                            <LoginView onRedirect={handleRedirect} />
                        )}
                        
                        {/* Mostrar REGISTRO cuando isRegisterActive es true */}
                        {isRegisterActive && (
                            <RegisterView onRedirect={handleRedirect} />
                        )}
                    </div>

                    {/* =================================================== */}
                    {/* LADO DERECHO: TOGGLE/MENSAJES DE BIENVENIDA        */}
                    {/* =================================================== */}
                    <div className="card-side toggle-side">
                        
                        {/* CONTENIDO CUANDO LOGIN ESTÁ ACTIVO */}
                        {/* Se muestra cuando isRegisterActive es false */}
                        <div className={`toggle-content login-active-content ${!isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Hola amig@!</h2>
                            
                            <p className="toggle-text">
                                Si no tienes una cuenta<br />
                                puedes crear una nueva
                            </p>
                            
                            {/* 
                                EVENTOS EN REACT:
                                - En HTML: onclick="funcionJS()"
                                - En React: onClick={funcionReact}
                                
                                DIFERENCIAS IMPORTANTES:
                                1. En React usamos camelCase: onClick, onChange, onSubmit
                                2. Pasamos una REFERENCIA a la función (sin paréntesis)
                                3. Si ponemos paréntesis onClick={switchToRegister()}, 
                                   se ejecutaría inmediatamente al renderizar
                            */}
                            <button 
                                className="toggle-button" 
                                onClick={switchToRegister}
                            >
                                Registrar
                            </button>
                        </div>
                        
                        {/* CONTENIDO CUANDO REGISTRO ESTÁ ACTIVO */}
                        {/* Se muestra cuando isRegisterActive es true */}
                        <div className={`toggle-content register-active-content ${isRegisterActive ? 'active' : ''}`}>
                            <h2 className="toggle-title">¡Bienvenido de nuevo!</h2>
                            
                            <p className="toggle-text">
                                Si ya tienes una cuenta<br />
                                puedes iniciar sesión
                            </p>
                            
                            <button 
                                className="toggle-button" 
                                onClick={switchToLogin}
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default LoginPage;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
// 
// 1. ESTADO (STATE):
//    - useState() para manejar datos que cambian
//    - Cuando el estado cambia, React re-renderiza el componente
// 
// 2. RENDERIZADO CONDICIONAL:
//    - {condicion && <Componente />}  → Renderiza si la condición es true
//    - {condicion ? <A /> : <B />}    → Renderiza A si true, B si false
// 
// 3. CLASES CONDICIONALES:
//    - className={`clase-base ${condicion ? 'clase-adicional' : ''}`}
//    - Permite aplicar CSS dinámicamente según el estado
// 
// 4. EVENTOS EN REACT:
//    - onClick, onChange, onSubmit (camelCase)
//    - Pasamos referencias a funciones (sin paréntesis)
// 
// 5. PROPS:
//    - onRedirect={handleRedirect} pasa la función como prop
//    - Los componentes hijos pueden llamar a esa función
// 
// =============================================================================