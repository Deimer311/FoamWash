// =============================================================================
// ARCHIVO  : HeaderAdmin.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// NOTA     : Todos los emojis reemplazados por SVG. Props 100% compatibles.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../autenticacion/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcGrid    = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" height="7"/><rect x="14" y="3" height="7"/><rect x="14" y="14" height="7"/><rect x="3" y="14" height="7"/></svg>;
const IcCal     = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcUsers   = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
const IcBar     = () => <svg height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcBell    = () => <svg height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const IcUser    = ({ size = 15, color = 'currentColor' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcPieChart= ({ size = 15, color = 'currentColor' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>;
const IcLogout  = ({ size = 15, color = '#ff6b6b' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcEmployee= ({ size = 14, color = 'currentColor' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcKey     = ({ size = 14, color = 'currentColor' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;
const IcBroom   = ({ size = 14, color = 'currentColor' }) => <svg height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19l4-4"/><path d="M9.5 9.5L15 4l5 5-5.5 5.5"/><path d="M3 21l6-6"/><path d="M9 15l3-3"/></svg>;

const HeaderAdmin = ({
    onGoDashboard, onGoAgenda, onGoEmpleados,
    onGoReportes,  onGoPerfil, onGoUsuarios,
    onGoServicios, onLogout,   activeTab,
}) => {
    const { user } = useAuth();
    const [scrolled,    setScrolled]    = useState(false);
    const [avatarOpen,  setAvatarOpen]  = useState(false);
    const [gestionOpen, setGestionOpen] = useState(false);
    const [imgError,    setImgError]    = useState(false);
    const avatarRef  = useRef(null);
    const gestionRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (avatarRef.current  && !avatarRef.current.contains(e.target))  setAvatarOpen(false);
            if (gestionRef.current && !gestionRef.current.contains(e.target)) setGestionOpen(false);
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
        if (!user?.nombre) return 'AD';
        return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    };

    const isActive = (tab) => activeTab === tab;

    return (
        <>
            <style>{`
                .ha-header {
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

                /* Logo */
                .ha-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; flex-shrink: 0; }
                .ha-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 800; color: #fff; letter-spacing: -0.3px;
                    box-shadow: 0 2px 10px rgba(0,102,255,0.35); flex-shrink: 0;
                }
                .ha-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
                .ha-logo-tag { font-size: 9px; font-weight: 700; color: #0099ff; letter-spacing: 1px; text-transform: uppercase; vertical-align: super; margin-left: 2px; }

                /* Nav */
                .ha-nav { display: flex; align-items: center; gap: 2px; }
                .ha-nav-btn {
                    position: relative; padding: 7px 14px; border-radius: 7px; border: none;
                    background: transparent; color: rgba(255,255,255,0.55); font-size: 13.5px;
                    font-weight: 500; font-family: inherit; cursor: pointer;
                    transition: color 0.18s, background 0.18s;
                    white-space: nowrap; display: flex; align-items: center; gap: 6px;
                }
                .ha-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .ha-nav-btn.active { color: #fff; background: rgba(0,102,255,0.18); }
                .ha-nav-btn.active::after {
                    content: ''; position: absolute; bottom: -1px; left: 50%; transform: translateX(-50%);
                    width: 18px; height: 2px; background: #0099ff; border-radius: 2px;
                }

                /* Dropdown Gestión */
                .ha-dropdown-wrap { position: relative; }
                .ha-chevron {
                    display: inline-flex; align-items: center; justify-content: center;
                    transition: transform 0.22s ease;
                    opacity: 0.6;
                }
                .ha-chevron.open { transform: rotate(180deg); }
                .ha-chevron svg { display: block; }

                .ha-dropdown {
                    position: absolute; top: calc(100% + 10px); left: 50%;
                    transform: translateX(-50%);
                    background: rgba(10,14,38,0.97); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.09); border-radius: 12px;
                    padding: 6px; min-width: 190px;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                    animation: haDropIn 0.2s cubic-bezier(.34,1.56,.64,1); z-index: 10;
                }
                @keyframes haDropIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }

                .ha-drop-item {
                    display: flex; align-items: center; gap: 10px;
                    padding: 9px 12px; border-radius: 8px; border: none;
                    background: transparent; color: rgba(255,255,255,0.65);
                    font-size: 13px; font-weight: 500; font-family: inherit;
                    cursor: pointer; width: 100%; text-align: left; transition: all 0.15s ease;
                }
                .ha-drop-item:hover { background: rgba(0,102,255,0.15); color: #fff; }

                .ha-drop-icon {
                    width: 28px; height: 28px; border-radius: 7px;
                    background: rgba(0,102,255,0.15);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }

                .ha-drop-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 6px; }

                /* Right side */
                .ha-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

                .ha-notif {
                    width: 34px; height: 34px; border-radius: 8px;
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09);
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: rgba(255,255,255,0.5); transition: all 0.2s; position: relative;
                }
                .ha-notif:hover { background: rgba(255,255,255,0.1); color: #fff; }

                /* Avatar */
                .ha-avatar-wrap { position: relative; }
                .ha-avatar-btn {
                    display: flex; align-items: center; gap: 8px;
                    padding: 4px 10px 4px 4px;
                    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50px; cursor: pointer; transition: all 0.2s ease;
                }
                .ha-avatar-btn:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.2); }

                .ha-avatar-img {
                    width: 30px; height: 30px; border-radius: 50%; overflow: hidden;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-size: 11px; font-weight: 700; font-family: inherit; flex-shrink: 0;
                }
                .ha-avatar-img img { width: 100%; height: 100%; object-fit: cover; }

                .ha-avatar-info { display: flex; flex-direction: column; align-items: flex-start; }
                .ha-avatar-name {
                    font-size: 12px; font-weight: 600; color: #fff; line-height: 1.2;
                    max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .ha-avatar-role { font-size: 10px; color: #0099ff; font-weight: 600; letter-spacing: 0.3px; }

                /* Avatar dropdown */
                .ha-avatar-dd {
                    position: absolute; top: calc(100% + 10px); right: 0;
                    background: rgba(10,14,38,0.97); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.09); border-radius: 14px;
                    min-width: 220px; overflow: hidden;
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                    animation: haDropIn 0.2s cubic-bezier(.34,1.56,.64,1); z-index: 10;
                }
                .ha-dd-head {
                    padding: 14px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
                    background: rgba(0,102,255,0.08);
                }
                .ha-dd-name { font-size: 13px; font-weight: 700; color: #fff; font-family: inherit; }
                .ha-dd-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; font-family: inherit; }

                .ha-dd-item {
                    display: flex; align-items: center; gap: 10px; padding: 10px 14px;
                    font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer;
                    border: none; background: transparent; font-family: inherit; font-weight: 500;
                    width: 100%; text-align: left; transition: all 0.15s ease;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }
                .ha-dd-item:last-child { border-bottom: none; color: #ff6b6b; }
                .ha-dd-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
                .ha-dd-item:last-child:hover { background: rgba(255,80,80,0.1); color: #ff6b6b; }

                .ha-dd-icon {
                    width: 28px; height: 28px; border-radius: 7px;
                    background: rgba(0,102,255,0.12);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .ha-dd-item:last-child .ha-dd-icon { background: rgba(255,80,80,0.12); }

                @media (max-width: 900px) {
                    .ha-header { padding: 0 20px; }
                    .ha-nav-btn .ha-nav-label { display: none; }
                    .ha-avatar-info { display: none; }
                    .ha-avatar-btn { padding: 4px; }
                }
                @media (max-width: 600px) {
                    .ha-logo-text { display: none; }
                    .ha-notif { display: none; }
                }
            `}</style>

            <header className="ha-header">
                {/* Logo */}
                <div className="ha-logo" onClick={onGoDashboard}>
                    <div className="ha-logo-mark"><img src="/LogoFW.jpeg" alt="Logo FoamWash" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /></div>
                    <span className="ha-logo-text">FoamWash<span className="ha-logo-tag">AD</span></span>
                </div>

                {/* Nav */}
                <nav className="ha-nav">
                    <button className={`ha-nav-btn${isActive('panel') ? ' active' : ''}`} onClick={onGoDashboard}>
                        <IcGrid /><span className="ha-nav-label">Panel</span>
                    </button>

                    <button className={`ha-nav-btn${isActive('agenda') ? ' active' : ''}`} onClick={onGoAgenda}>
                        <IcCal /><span className="ha-nav-label">Agenda</span>
                    </button>

                    {/* Dropdown Gestión */}
                    <div className="ha-dropdown-wrap" ref={gestionRef}>
                        <button
                            className={`ha-nav-btn${['empleados','usuarios','servicios'].includes(activeTab) ? ' active' : ''}`}
                            onClick={() => setGestionOpen(o => !o)}
                        >
                            <IcUsers />
                            <span className="ha-nav-label">Gestión</span>
                            <span className={`ha-chevron${gestionOpen ? ' open' : ''}`}>
                                <svg height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                        </button>

                        {gestionOpen && (
                            <div className="ha-dropdown">
                                <button className="ha-drop-item" onClick={() => { onGoEmpleados?.(); setGestionOpen(false); }}>
                                    <span className="ha-drop-icon"><IcEmployee size={14} color="rgba(0,180,255,0.9)" /></span>
                                    Empleados
                                </button>
                                <button className="ha-drop-item" onClick={() => { onGoUsuarios?.(); setGestionOpen(false); }}>
                                    <span className="ha-drop-icon"><IcKey size={14} color="rgba(0,180,255,0.9)" /></span>
                                    Usuarios
                                </button>
                                <div className="ha-drop-divider" />
                                <button className="ha-drop-item" onClick={() => { onGoServicios?.(); setGestionOpen(false); }}>
                                    <span className="ha-drop-icon"><IcBroom size={14} color="rgba(0,180,255,0.9)" /></span>
                                    Servicios
                                </button>
                            </div>
                        )}
                    </div>

                    <button className={`ha-nav-btn${isActive('reportes') ? ' active' : ''}`} onClick={onGoReportes}>
                        <IcBar /><span className="ha-nav-label">Reportes</span>
                    </button>
                </nav>

                {/* Right */}
                <div className="ha-right">
                    <div className="ha-notif" title="Notificaciones"><IcBell /></div>

                    <div className="ha-avatar-wrap" ref={avatarRef}>
                        <div className="ha-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>
                            <div className="ha-avatar-img">
                                {fotoUrl && !imgError
                                    ? <img src={fotoUrl} alt="Admin" onError={() => setImgError(true)} />
                                    : getIniciales()
                                }
                            </div>
                            <div className="ha-avatar-info">
                                <span className="ha-avatar-name">{user?.nombre || 'Administrador'}</span>
                                <span className="ha-avatar-role">Admin</span>
                            </div>
                        </div>

                        {avatarOpen && (
                            <div className="ha-avatar-dd">
                                <div className="ha-dd-head">
                                    <div className="ha-dd-name">{user?.nombre || 'Administrador'}</div>
                                    <div className="ha-dd-email">{user?.email || ''}</div>
                                </div>
                                <button className="ha-dd-item" onClick={() => { onGoPerfil?.(); setAvatarOpen(false); }}>
                                    <span className="ha-dd-icon"><IcUser size={14} color="rgba(0,180,255,0.9)" /></span>
                                    Mi perfil
                                </button>
                                <button className="ha-dd-item" onClick={() => { onGoDashboard?.(); setAvatarOpen(false); }}>
                                    <span className="ha-dd-icon"><IcPieChart size={14} color="rgba(0,180,255,0.9)" /></span>
                                    Dashboard
                                </button>
                                <button className="ha-dd-item" onClick={() => {
                                    if (window.confirm('¿Cerrar sesión?')) { onLogout?.(); }
                                    setAvatarOpen(false);
                                }}>
                                    <span className="ha-dd-icon"><IcLogout size={14} color="#ff6b6b" /></span>
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

export default HeaderAdmin;
