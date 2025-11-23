// =============================================================================
// LOGINVIEW.JSX - FORMULARIO DE INICIO DE SESIÓN
// =============================================================================
// Este componente maneja el formulario de login y la autenticación de usuarios.
// Usa el sistema de tokens de AuthUtils.js
// =============================================================================

import React, { useState } from 'react';
import { simulateLogin, registrarSesionActiva } from '../utils/AuthUtils';

/**
 * COMPONENTE: LoginView
 * 
 * PROPS:
 * - onRedirect: función que se ejecuta después del login exitoso
 * 
 * CONCEPTO CLAVE - FORMULARIOS EN REACT:
 * En React, los formularios son "controlados" cuando el valor de los inputs
 * está sincronizado con el estado del componente.
 * Esto significa que React es la "fuente única de verdad" para los valores.
 */
const LoginView = ({ onRedirect }) => {
    // -------------------------------------------------------------------------
    // 1. ESTADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    
    // Estado para los campos del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Estado para mensajes de error/éxito
    // CONCEPTO: Objeto en el estado para manejar múltiples propiedades relacionadas
    const [message, setMessage] = useState({ 
        text: '',           // Texto del mensaje
        isError: false,     // ¿Es un error? (para el color rojo/verde)
        isLoading: false    // ¿Está cargando? (para deshabilitar el botón)
    });

    // -------------------------------------------------------------------------
    // 2. FUNCIÓN MANEJADORA DEL FORMULARIO
    // -------------------------------------------------------------------------
    
    /**
     * Se ejecuta cuando el usuario envía el formulario (hace clic en "Iniciar Sesión")
     * @param {Event} e - Evento del formulario
     * 
     * CONCEPTO CLAVE - e.preventDefault():
     * Por defecto, al enviar un formulario HTML, el navegador recarga la página.
     * preventDefault() evita ese comportamiento para que React maneje todo.
     */
    const handleLogin = (e) => {
        e.preventDefault(); // ¡IMPORTANTE! Evita que la página se recargue
        
        // Limpiar mensaje anterior y mostrar estado de carga
        setMessage({ text: '', isError: false, isLoading: true });

        // =====================================================================
        // PROCESO DE AUTENTICACIÓN
        // =====================================================================
        
        // PASO 1: Llamar a la función de login (verifica credenciales)
        const result = simulateLogin(email, password);

        // PASO 2: Verificar el resultado
        if (result.success) {
            // ✅ LOGIN EXITOSO
            
            // Mostrar mensaje de éxito
            setMessage({ 
                text: result.message, 
                isError: false, 
                isLoading: false 
            });

            // PASO 3: Registrar la sesión en localStorage
            // Esto guarda el token y permite que el usuario permanezca logueado
            registrarSesionActiva(
                result.email,    // Email del usuario
                result.role,     // Rol (admin, trabajador, cliente)
                result.token,    // Token único de autenticación
                result.redirect  // URL de redirección
            );
            
            // PASO 4: Redirigir después de 1.5 segundos (para que vea el mensaje)
            setTimeout(() => {
                if (onRedirect) {
                    onRedirect(result.redirect);
                }
            }, 1500);

        } else {
            // ❌ LOGIN FALLIDO (credenciales incorrectas)
            setMessage({ 
                text: result.message, 
                isError: true, 
                isLoading: false 
            });
        }
    };

    // -------------------------------------------------------------------------
    // 3. RENDERIZADO DEL COMPONENTE
    // -------------------------------------------------------------------------
    
    return (
        <div className="form-content login-view">
            <h2 className="title">Iniciar sesión</h2>
            
            {/* 
                MENSAJES DE ESTADO
                
                RENDERIZADO CONDICIONAL:
                - Solo mostramos el mensaje si message.text tiene contenido
                - {message.text && <div>...</div>} 
                → Si message.text es una cadena vacía "", no renderiza nada
                → Si message.text tiene contenido, renderiza el div
            */}
            {message.text && (
                <div className={`message-area ${message.isError ? 'error-message' : 'success-message'}`}>
                    {message.isLoading ? 'Cargando...' : message.text}
                </div>
            )}

            {/* 
                FORMULARIO CONTROLADO
                
                CONCEPTO CLAVE:
                - value={email}  → El input muestra el valor del estado
                - onChange={(e) => setEmail(e.target.value)}  → Actualiza el estado cuando el usuario escribe
                
                FLUJO:
                1. Usuario escribe "h" en el input
                2. Se dispara el evento onChange
                3. Ejecuta setEmail(e.target.value) donde e.target.value es "h"
                4. El estado email cambia a "h"
                5. React re-renderiza y el input muestra "h"
                
                ¿POR QUÉ ES IMPORTANTE?
                - React siempre sabe el valor actual del input
                - Podemos validar, formatear o transformar el valor antes de guardarlo
                - Podemos controlar qué caracteres se permiten escribir
            */}
            <form className="form" onSubmit={handleLogin}>
                {/* INPUT DE EMAIL */}
                <div className="input-group">
                    <input 
                        type="email" 
                        className="input-field" 
                        placeholder="Correo electrónico" 
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* INPUT DE CONTRASEÑA */}
                <div className="input-group">
                    <input 
                        type="password" 
                        className="input-field" 
                        placeholder="Contraseña" 
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* ENLACE "OLVIDASTE TU CONTRASEÑA" */}
                <div className="forgot-password">
                    <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                {/* 
                    BOTÓN DE ENVÍO
                    
                    CONCEPTO - disabled:
                    - Deshabilita el botón mientras está cargando (message.isLoading)
                    - Evita que el usuario haga clic múltiples veces
                    - En CSS, el botón deshabilitado suele tener opacidad reducida
                */}
                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={message.isLoading}
                >
                    {message.isLoading ? 'Cargando...' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    );
};

export default LoginView;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
// 
// 1. FORMULARIOS CONTROLADOS:
//    - value={estado} + onChange={actualizaEstado}
//    - React controla el valor del input en todo momento
// 
// 2. e.preventDefault():
//    - Evita el comportamiento por defecto del navegador
//    - Esencial para formularios en React
// 
// 3. MANEJO DE ESTADOS COMPLEJOS:
//    - Usar objetos en useState para agrupar datos relacionados
//    - setMessage({ text: '...', isError: true, isLoading: false })
// 
// 4. EVENTOS EN INPUTS:
//    - onChange: se ejecuta cada vez que el usuario escribe
//    - e.target.value: obtiene el valor actual del input
// 
// 5. AUTENTICACIÓN CON TOKENS:
//    - simulateLogin() verifica credenciales
//    - registrarSesionActiva() guarda el token en localStorage
//    - El token permite mantener la sesión activa
// 
// 6. RENDERIZADO CONDICIONAL:
//    - {condicion && <Componente />}
//    - Mostrar/ocultar elementos según el estado
// 
// =============================================================================