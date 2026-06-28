// =============================================================================
// ARCHIVO  : ServicesHeader.jsx — REDISEÑO PREMIUM UNIFICADO
// PROYECTO : FoamWash
// NOTA     : Sincronizado con diseño HeaderCliente. Distintivo de rol: LG
//            Nav centrado absoluto, botón login separado a la derecha.
// =============================================================================

import React, { useState, useEffect } from 'react';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcHome    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcDoc     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcService = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcLogin   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;

const ServicesHeader = ({ onBackToHome, onGoToLogin, onCotizacionPublica }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <style>{`
                .sv-header {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 1000;
                    height: 64px;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 0 40px;
                    background: rgba(8,12,30,0.92);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .sv-header.scrolled {
                    background: rgba(8,12,30,0.97);
                    border-color: rgba(255,255,255,0.09);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
                }

                /* Columna izquierda: logo */
                .sv-logo {
                    display: flex; align-items: center; gap: 10px;
                    cursor: pointer; user-select: none;
                    justify-self: start;
                }
                .sv-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 800; color: #fff;
                    box-shadow: 0 2px 10px rgba(0,102,255,0.35);
                }
                .sv-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
                .sv-logo-tag {
                    font-size: 9px; font-weight: 700; color: #0099ff;
                    letter-spacing: 1px; text-transform: uppercase;
                    vertical-align: super; margin-left: 2px;
                }

                /* Columna central: nav */
                .sv-nav {
                    display: flex; align-items: center; gap: 2px;
                    justify-self: center;
                }
                .sv-nav-btn {
                    position: relative;
                    padding: 7px 14px; border-radius: 7px; border: none;
                    background: transparent; color: rgba(255,255,255,0.55);
                    font-size: 13.5px; font-weight: 500; font-family: inherit;
                    cursor: pointer; transition: color 0.18s, background 0.18s;
                    display: flex; align-items: center; gap: 6px;
                    white-space: nowrap;
                }
                .sv-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .sv-nav-btn.active { color: #fff; background: rgba(0,102,255,0.18); }
                .sv-nav-btn.active::after {
                    content: ''; position: absolute;
                    bottom: -1px; left: 50%; transform: translateX(-50%);
                    width: 18px; height: 2px; background: #0099ff; border-radius: 2px;
                }

                /* Columna derecha: botón login */
                .sv-right {
                    display: flex; align-items: center;
                    justify-self: end;
                }
                .sv-login-btn {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 8px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff; font-size: 13.5px; font-weight: 600;
                    font-family: inherit; border: none; cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                    box-shadow: 0 4px 14px rgba(26,86,255,0.35);
                    white-space: nowrap;
                }
                .sv-login-btn:hover { opacity: 0.9; transform: translateY(-1px); }

                @media (max-width: 800px) {
                    .sv-header { padding: 0 20px; grid-template-columns: auto 1fr auto; }
                    .sv-nav { justify-self: end; gap: 0; }
                    .sv-nav-btn span { display: none; }
                    .sv-right { display: none; }
                }
            `}</style>

            <header className={`sv-header${scrolled ? ' scrolled' : ''}`}>

                {/* Columna 1: Logo */}
                <div className="sv-logo" onClick={onBackToHome}>
                    <div className="sv-logo-mark"><img src="/LogoFW.jpeg" alt="Logo FoamWash" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /></div>
                    <span className="sv-logo-text">
                        FoamWash<span className="sv-logo-tag">LG</span>
                    </span>
                </div>

                {/* Columna 2: Nav centrado */}
                <nav className="sv-nav">
                    <button className="sv-nav-btn" onClick={onBackToHome}>
                        <IcHome /><span>Hogar</span>
                    </button>
                    <button className="sv-nav-btn" onClick={onCotizacionPublica}>
                        <IcDoc /><span>Cotización</span>
                    </button>
                    <button
                        className="sv-nav-btn active"
                        onClick={() => document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <IcService /><span>Agendar</span>
                    </button>
                </nav>

                {/* Columna 3: Botón login */}
                <div className="sv-right">
                    <button className="sv-login-btn" onClick={onGoToLogin}>
                        <IcLogin /><span>Iniciar Sesión</span>
                    </button>
                </div>

            </header>
        </>
    );
};

export default ServicesHeader;
