// =============================================================================
// ARCHIVO  : HeaderCliente.jsx — REDISEÑO PREMIUM UNIFICADO
// PROYECTO : FoamWash
// NOTA     : Sincronizado con diseño Admin. Emojis reemplazados por SVG.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../autenticacion/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// ── SVG Icons (Adaptados para el flujo de Cliente) ───────────────────────────
const IcHome    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcService = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcDoc     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcUser    = ({ size = 15, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcLogout  = ({ size = 15, color = '#ff6b6b' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const HeaderCliente = ({ onBackToHome, onCotizacion, onPerfil, onServicios, activeLink }) => {
    const { user, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const avatarRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { setImgError(false); }, [user?.foto_perfil]);

    const fotoUrl = useMemo(() => {
        if (!user?.foto_perfil) return null;
        const base = user.foto_perfil.startsWith('http')
            ? user.foto_perfil
            : `${API_BASE_URL}${user.foto_perfil}`;
        return `${base}${base.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }, [user?.foto_perfil]);

    const getIniciales = () => {
        if (!user?.nombre) return 'CL';
        return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        if (window.confirm('¿Cerrar sesión?')) {
            logout();
            setAvatarOpen(false);
        }
    };

    return (
        <>
            <style>{`
                .hc-header {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 1000;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 40px;
                    background: ${scrolled ? 'rgba(8,12,30,0.97)' : 'rgba(8,12,30,0.92)'};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,${scrolled ? '0.09' : '0.06'});
                    box-shadow: ${scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none'};
                    transition: background 0.3s ease, box-shadow 0.3s ease;
                }

                .hc-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
                .hc-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 800; color: #fff;
                    box-shadow: 0 2px 10px rgba(0,102,255,0.35);
                }
                .hc-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
                .hc-logo-tag { font-size: 9px; font-weight: 700; color: #0099ff; letter-spacing: 1px; text-transform: uppercase; vertical-align: super; margin-left: 2px; }

                .hc-nav { display: flex; align-items: center; gap: 2px; }
                .hc-nav-btn {
                    position: relative; padding: 7px 14px; border-radius: 7px; border: none;
                    background: transparent; color: rgba(255,255,255,0.55); font-size: 13.5px;
                    font-weight: 500; font-family: inherit; cursor: pointer;
                    transition: color 0.18s, background 0.18s;
                    display: flex; align-items: center; gap: 6px;
                }
                .hc-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .hc-nav-btn.active { color: #fff; background: rgba(0,102,255,0.18); }
                .hc-nav-btn.active::after {
                    content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
                    width: 18px; height: 2px; background: #0099ff; border-radius: 2px;
                }

                .hc-right { display: flex; align-items: center; gap: 14px; }

                .hc-avatar-wrap { position: relative; }
                .hc-avatar-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 10px 4px 4px; /* Exactamente igual al Admin */
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .hc-avatar-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .hc-avatar-img {
                    width: 30px; 
                    height: 30px;
                    border-radius: 50%;
                    overflow: hidden;
                    /* Usamos el gradiente exacto del Admin */
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    font-size: 11px; /* Tamaño de fuente compacto y profesional */
                    font-weight: 700;
                    font-family: inherit;
                    flex-shrink: 0;
                    /* Esta sombra es la que le da el toque "premium" */
                    box-shadow: 0 2px 10px rgba(0, 102, 255, 0.35);
                }
                .hc-avatar-img img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .hc-avatar-dd {
                    position: absolute; top: calc(100% + 10px); right: 0;
                    background: rgba(10,14,38,0.97); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.09); border-radius: 14px;
                    min-width: 220px; overflow: hidden;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                    animation: hcDropIn 0.2s cubic-bezier(.34,1.56,.64,1); z-index: 10;
                }
                @keyframes hcDropIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .hc-dd-head {
                    padding: 14px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
                    background: rgba(0,102,255,0.08);
                }
                .hc-dd-name { font-size: 13px; font-weight: 700; color: #fff; }
                .hc-dd-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

                .hc-dd-item {
                    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
                    font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer;
                    border: none; background: transparent; font-family: inherit; font-weight: 500;
                    width: 100%; text-align: left; transition: all 0.15s ease;
                }
                .hc-dd-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
                .hc-dd-item.logout { color: #ff6b6b; }
                .hc-dd-item.logout:hover { background: rgba(255,80,80,0.1); }

                .hc-dd-icon {
                    width: 28px; height: 28px; border-radius: 7px;
                    background: rgba(0,102,255,0.12);
                    display: flex; align-items: center; justify-content: center;
                }
                .hc-dd-item.logout .hc-dd-icon { background: rgba(255,80,80,0.12); }

                @media (max-width: 800px) {
                    .hc-header { padding: 0 20px; }
                    .hc-nav-label { display: none; }
                }
            `}</style>

            <header className="hc-header">
                {/* Logo */}
                <div className="hc-logo" onClick={onBackToHome}>
                    <div className="hc-logo-mark"><img src="/LogoFW.jpeg" alt="Logo FoamWash" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /></div>
                    <span className="hc-logo-text">FoamWash<span className="hc-logo-tag">CL</span></span>
                </div>

                {/* Nav */}
                <nav className="hc-nav">
                    <button 
                        className={`hc-nav-btn ${activeLink === 'inicio' ? 'active' : ''}`} 
                        onClick={onBackToHome}
                    >
                        <IcHome /><span className="hc-nav-label">Inicio</span>
                    </button>
                    <button 
                        className={`hc-nav-btn ${activeLink === 'cotizacion' ? 'active' : ''}`} 
                        onClick={onCotizacion}
                    >
                        <IcDoc /><span className="hc-nav-label">Cotizar</span>
                    </button>
                    <button 
                        className={`hc-nav-btn ${activeLink === 'agendar' ? 'active' : ''}`} 
                        onClick={onServicios}
                    >
                        <IcService /><span className="hc-nav-label">Agendar</span>
                    </button>

                </nav>

                {/* Perfil / Avatar */}
                <div className="hc-right">
                    <div className="hc-avatar-wrap" ref={avatarRef}>
                        <div className="hc-avatar-btn" onClick={() => setAvatarOpen(!avatarOpen)}>
                            <div className="hc-avatar-img">
                                {fotoUrl && !imgError
                                    ? <img src={fotoUrl} alt="User" onError={() => setImgError(true)} />
                                    : getIniciales()
                                }
                            </div>
                            <IcUser size={14} color="rgba(255,255,255,0.6)" />
                        </div>

                        {avatarOpen && (
                            <div className="hc-avatar-dd">
                                <div className="hc-dd-head">
                                    <div className="hc-dd-name">{user?.nombre || 'Cliente'}</div>
                                    <div className="hc-dd-email">{user?.email || ''}</div>
                                </div>
                                
                                <button className="hc-dd-item" onClick={() => { onPerfil?.(); setAvatarOpen(false); }}>
                                    <span className="hc-dd-icon"><IcUser size={14} color="#0099ff" /></span>
                                    Mi Perfil
                                </button>

                                <button className="hc-dd-item logout" onClick={handleLogout}>
                                    <span className="hc-dd-icon"><IcLogout size={14} /></span>
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
};

export default HeaderCliente;
