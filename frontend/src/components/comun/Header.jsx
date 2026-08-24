// =============================================================================
// ARCHIVO  : Header.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/Header.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// REDISEÑO : Mejorado para coherencia visual y jerarquía de marca
// =============================================================================

import React from 'react';
import './Header.css';

const Header = ({ onLoginClick }) => {
    return (
        <header className="header">
            {/* INFORMACIÓN DE CONTACTO */}
            <div className="contact-info">
                <div className="contact-icon">
                    <svg height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                </div>
                <div className="contact-text">
                    <span className="contact-label">Contáctanos</span>
                    <a href="tel:3144368571" className="contact-number">314 436 8571</a>
                </div>
            </div>

            {/* LOGO CENTRADO */}
            <div className="logo">
                FoamWash
                <span className="logo-suffix">LG</span>
            </div>

            {/* BOTÓN LOGIN */}
            <div className="header-actions">
                <button
                    className="login-btn"
                    onClick={onLoginClick}
                >
                    Iniciar sesión
                </button>
            </div>
        </header>
    );
};

export default Header;