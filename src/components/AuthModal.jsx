// =============================================================================
// AUTHMODAL.JSX - MODAL DE AUTENTICACIÓN ELEGANTE
// =============================================================================
// Modal que solicita al usuario iniciar sesión o registrarse
// Similar al diseño de la imagen que compartiste
// =============================================================================

import React from 'react';
import './css/AuthModal.css';

/**
 * COMPONENTE: AuthModal
 * 
 * PROPS:
 * - isOpen: Boolean que controla si el modal está visible
 * - onClose: Función para cerrar el modal
 * - onLogin: Función que se ejecuta al hacer clic en "Iniciar sesión"
 * - onRegister: Función que se ejecuta al hacer clic en "Registrarse"
 * - title: Título del modal (opcional)
 * - message: Mensaje descriptivo (opcional)
 */
const AuthModal = ({ 
    isOpen, 
    onClose, 
    onLogin, 
    onRegister,
    title = "Debes iniciar sesión primero",
    message = "Para solicitar un servicio crea una cuenta o inicia sesión."
}) => {
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    // Manejar el clic en el overlay (fondo oscuro)
    const handleOverlayClick = (e) => {
        // Solo cerrar si hacen clic directamente en el overlay, no en el contenido
        if (e.target.classList.contains('auth-modal-overlay')) {
            onClose();
        }
    };

    return (
        <div 
            className="auth-modal-overlay" 
            onClick={handleOverlayClick}
        >
            <div className="auth-modal-content">
                {/* BOTÓN DE CERRAR (X) */}
                <button 
                    className="auth-modal-close"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                {/* ICONO DE FOAMWASH */}
                <div className="auth-modal-icon">
                    <div className="auth-modal-logo">
                        FW
                    </div>
                </div>

                {/* CONTENIDO DEL MODAL */}
                <div className="auth-modal-body">
                    <h2 className="auth-modal-title">{title}</h2>
                    <p className="auth-modal-message">{message}</p>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="auth-modal-actions">
                    <button 
                        className="auth-modal-btn auth-modal-btn-register"
                        onClick={onRegister}
                    >
                        Registrarse
                    </button>
                    <button 
                        className="auth-modal-btn auth-modal-btn-login"
                        onClick={onLogin}
                    >
                        Iniciar sesión
                    </button>
                </div>

                {/* NOTA DE PRIVACIDAD */}
                <p className="auth-modal-note">
                    No compartiremos tu información en este demo.
                </p>
            </div>
        </div>
    );
};

export default AuthModal;

// =============================================================================
// CONCEPTOS CLAVE:
// =============================================================================
//
// 1. RENDERIZADO CONDICIONAL:
//    - if (!isOpen) return null;
//    - No renderiza nada si el modal está cerrado
//    - Mejor rendimiento que usar display: none
//
// 2. PORTAL (OPCIONAL):
//    - En producción, usa ReactDOM.createPortal()
//    - Renderiza el modal fuera del árbol de componentes
//    - Evita problemas con z-index y overflow
//
// 3. ACCESIBILIDAD:
//    - aria-label en botón de cerrar
//    - Esc para cerrar (implementar con useEffect)
//    - Focus trap (mantener el foco dentro del modal)
//
// 4. EVENTOS DE CLIC:
//    - onClick en overlay para cerrar al hacer clic fuera
//    - e.target.classList.contains() para verificar el elemento exacto
//
// =============================================================================