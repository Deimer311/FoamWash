// =============================================================================
// ARCHIVO  : HeaderCliente.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/HeaderCliente.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de navegación del panel del cliente con avatar de usuario.
//   Unificado con HeaderAdmin y HeaderEmpleado: API_BASE_URL desde variable
//   de entorno, cache-busting con timestamp, imgError y useMemo.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../autenticacion/AuthContext';

// ── Base URL del servidor (usa variable de entorno) ───────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const HeaderCliente = ({ onBackToHome, onCotizacion, onPerfil, onServicios, activeLink }) => {

    const { user, logout } = useAuth();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [imgError,   setImgError]   = useState(false);
    const avatarRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Resetear error cuando cambia la foto para intentar cargar la nueva
    useEffect(() => {
        setImgError(false);
    }, [user?.foto_perfil]);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
            if (onBackToHome) onBackToHome();
        }
    };

    const handleAgendar = (e) => {
        e.preventDefault();
        if (onServicios) {
            onServicios();
            return;
        }
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getIniciales = () => {
        if (!user?.nombre) return 'CL';
        return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
    };

    const getLinkStyle = (link) => ({
        color: activeLink === link ? 'rgb(133, 198, 255)' : undefined
    });

    // ✅ Cache-busting con timestamp + API_BASE_URL (igual que HeaderAdmin y HeaderEmpleado)
    const fotoUrl = useMemo(() => {
        if (!user?.foto_perfil) return null;
        const base = user.foto_perfil.startsWith('http')
            ? user.foto_perfil
            : `${API_BASE_URL}${user.foto_perfil}`;
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}t=${Date.now()}`;
    }, [user?.foto_perfil]);

    const mostrarImagen = fotoUrl && !imgError;

    return (
        <>
            <style>{`
                .cli-avatar-wrap { position: relative; }
                .cli-avatar-btn {
                    width: 38px; height: 38px; border-radius: 50%;
                    border: 2.5px solid rgba(255,255,255,0.5); overflow: hidden;
                    cursor: pointer; background: linear-gradient(135deg, #5BC0DE, #223BFF);
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-size: 13px; font-weight: 700;
                    transition: all 0.2s; flex-shrink: 0;
                }
                .cli-avatar-btn:hover { border-color: white; transform: scale(1.08); }
                .cli-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
                .cli-avatar-dd {
                    position: absolute; top: calc(100% + 10px); right: 0;
                    background: white; border-radius: 12px; min-width: 190px;
                    overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                    border: 0.5px solid rgba(0,0,0,0.08); z-index: 9999;
                    animation: cliFadeIn 0.15s ease;
                }
                .cli-avatar-header { padding: 14px 18px 10px; border-bottom: 0.5px solid #f0f0f0; }
                .cli-avatar-name { font-size: 14px; font-weight: 600; color: #222; }
                .cli-avatar-role { font-size: 12px; color: #888; margin-top: 2px; }
                .cli-avatar-item {
                    padding: 11px 18px; font-size: 14px; color: #333;
                    cursor: pointer; display: flex; align-items: center;
                    gap: 10px; border-bottom: 0.5px solid #f0f0f0; transition: background 0.15s;
                }
                .cli-avatar-item:last-child { border-bottom: none; color: #e53935; }
                .cli-avatar-item:hover { background: #f5f8ff; }
                @keyframes cliFadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <header className="header-banner" style={{ overflow: 'visible', zIndex: 1000 }}>
                <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />

                <h1 className="logo-header" style={{ cursor: 'pointer' }} onClick={onBackToHome}>
                    FoamWash
                    <span style={{ fontSize: '0.5em', color: '#D81B9C' }}>CL</span>
                </h1>

                <nav className="nav-bar">
                    <a href="#" className="nav-link" style={getLinkStyle('hogar')} onClick={(e) => { e.preventDefault(); onBackToHome(); }}>
                        Hogar
                    </a>
                    <a href="#" className="nav-link" style={getLinkStyle('cotizacion')} onClick={(e) => { e.preventDefault(); if(onCotizacion) onCotizacion(); }}>
                        Cotización
                    </a>
                    <a href="#" className="nav-link" style={getLinkStyle('agendar')} onClick={handleAgendar}>
                        Agendar
                    </a>

                    <div className="cli-avatar-wrap" ref={avatarRef}>
                        <div className="cli-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>
                            {/* Si la imagen falla, muestra iniciales automáticamente */}
                            {mostrarImagen
                                ? <img
                                    src={fotoUrl}
                                    alt="Perfil"
                                    onError={() => setImgError(true)}
                                  />
                                : getIniciales()
                            }
                        </div>

                        {avatarOpen && (
                            <div className="cli-avatar-dd">
                                <div className="cli-avatar-header">
                                    <div className="cli-avatar-name">{user?.nombre || 'Cliente'}</div>
                                    <div className="cli-avatar-role">{user?.email || ''}</div>
                                </div>
                                <div className="cli-avatar-item" onClick={() => { if(onPerfil) onPerfil(); setAvatarOpen(false); }}>
                                    👤 Mi perfil
                                </div>
                                <div className="cli-avatar-item" onClick={handleLogout}>
                                    🚪 Cerrar sesión
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
};

export default HeaderCliente;