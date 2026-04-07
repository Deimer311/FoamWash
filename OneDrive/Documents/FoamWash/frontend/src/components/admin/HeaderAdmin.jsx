// =============================================================================
// ARCHIVO  : HeaderAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/HeaderAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de navegación superior del panel de administración.
//
// FIX FOTO EN HEADER:
//   El problema era que 'user' se recibía como prop pero App.js nunca la pasaba,
//   por lo que siempre era undefined. Solución: obtener user desde useAuth()
//   directamente, igual que HeaderCliente. Se mantienen además todas las mejoras
//   de cache-busting, imgError y useMemo que ya existían.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from '../autenticacion/AuthContext';
import '../comun/Header.css';

// ── Base URL del servidor (usa variable de entorno, igual que PerfilAdmin) ────
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const HeaderAdmin = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onGoUsuarios,
  onGoServicios,
  onLogout,
  activeTab,
}) => {

  // ✅ FIX: leer user desde el contexto, no desde prop
  const { user } = useAuth();

  const [gestionOpen, setGestionOpen] = useState(false);
  const [avatarOpen,  setAvatarOpen]  = useState(false);
  const [imgError,    setImgError]    = useState(false);

  const gestionRef = useRef(null);
  const avatarRef  = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (gestionRef.current && !gestionRef.current.contains(e.target)) setGestionOpen(false);
      if (avatarRef.current  && !avatarRef.current.contains(e.target))  setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Resetear error cuando cambia la foto para intentar cargar la nueva
  useEffect(() => {
    setImgError(false);
  }, [user?.foto_perfil]);

  const isGestionActive = ['empleados', 'usuarios', 'servicios'].includes(activeTab);

  const getGestionLabel = () => {
    if (activeTab === 'empleados') return 'Empleados';
    if (activeTab === 'usuarios')  return 'Usuarios';
    if (activeTab === 'servicios') return 'Servicios';
    return 'Gestión';
  };

  const getTabStyle = (tabName) => ({
    color: activeTab === tabName ? 'rgb(133, 198, 255)' : 'white',
    fontWeight: activeTab === tabName ? 'bold' : 'normal'
  });

  const getGestionStyle = () => ({
    color: isGestionActive ? 'rgb(133, 198, 255)' : 'white',
    fontWeight: isGestionActive ? 'bold' : 'normal'
  });

  const getIniciales = () => {
    if (!user?.nombre) return 'AD';
    return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  // Cache-busting con timestamp para forzar recarga cuando foto_perfil cambia
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
        .admin-gestion-wrap { position: relative; }
        .admin-gestion-btn {
          display: flex; align-items: center; gap: 5px;
          background: none; border: none; cursor: pointer;
          padding: 8px 15px; border-radius: 8px;
          font-size: 18px; font-weight: 600;
          transition: all 0.3s ease;
        }
        .admin-gestion-btn:hover {
          color: #5BC0DE !important;
          background-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .admin-chevron { font-size: 10px; opacity: 0.8; transition: transform 0.2s; }
        .admin-chevron.open { transform: rotate(180deg); }
        .admin-gestion-dd {
          position: absolute; top: calc(100% + 8px);
          left: 50%; transform: translateX(-50%);
          background: white; border-radius: 12px; min-width: 170px;
          overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          border: 0.5px solid rgba(0,0,0,0.08); z-index: 9999;
          animation: ddFadeIn 0.15s ease;
        }
        .admin-dd-item {
          padding: 11px 18px; font-size: 15px; color: #333;
          cursor: pointer; display: flex; align-items: center;
          gap: 10px; border-bottom: 0.5px solid #f0f0f0;
          transition: background 0.15s; font-weight: 500;
        }
        .admin-dd-item:last-child { border-bottom: none; }
        .admin-dd-item:hover { background: #f0f4ff; color: #1a2fff; }
        .admin-avatar-wrap { position: relative; padding: 4px 0 4px 8px; }
        .admin-avatar-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.5); overflow: hidden;
          cursor: pointer; background: linear-gradient(135deg, #5BC0DE, #223BFF);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 700;
          transition: all 0.2s; flex-shrink: 0;
        }
        .admin-avatar-btn:hover { border-color: white; transform: scale(1.08); }
        .admin-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
        .admin-avatar-dd {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: white; border-radius: 12px; min-width: 190px;
          overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          border: 0.5px solid rgba(0,0,0,0.08); z-index: 9999;
          animation: ddFadeInRight 0.15s ease;
        }
        .admin-avatar-header { padding: 14px 18px 10px; border-bottom: 0.5px solid #f0f0f0; }
        .admin-avatar-name { font-size: 14px; font-weight: 600; color: #222; }
        .admin-avatar-role { font-size: 12px; color: #888; margin-top: 2px; }
        .admin-avatar-item {
          padding: 11px 18px; font-size: 14px; color: #333;
          cursor: pointer; display: flex; align-items: center;
          gap: 10px; border-bottom: 0.5px solid #f0f0f0; transition: background 0.15s;
        }
        .admin-avatar-item:last-child { border-bottom: none; color: #e53935; }
        .admin-avatar-item:hover { background: #f5f8ff; }
        @keyframes ddFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes ddFadeInRight {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="header-banner" style={{ overflow: 'visible', zIndex: 1000 }}>
        <img src="/img/ima9.jpg" alt="Fondo" className="fondo" />

        <h1 className="logo-header" style={{ cursor: "pointer" }} onClick={onGoDashboard}>
          FoamWash
          <span style={{ fontSize: '0.5em', color: '#EFB810' }}>AD</span>
        </h1>

        <nav className="nav-bar">

          {/* Panel */}
          <a href="#" className="nav-link" style={getTabStyle('panel')}
            onClick={(e) => { e.preventDefault(); onGoDashboard(); }}>
            Panel
          </a>

          {/* Agenda */}
          <a href="#" className="nav-link" style={getTabStyle('agenda')}
            onClick={(e) => { e.preventDefault(); onGoAgenda(); }}>
            Agenda
          </a>

          {/* Gestión — dropdown */}
          <div className="admin-gestion-wrap" ref={gestionRef}>
            <button
              className="admin-gestion-btn"
              style={getGestionStyle()}
              onClick={() => setGestionOpen(o => !o)}
            >
              {getGestionLabel()}
              <span className={`admin-chevron ${gestionOpen ? 'open' : ''}`}>▾</span>
            </button>

            {gestionOpen && (
              <div className="admin-gestion-dd">
                <div className="admin-dd-item"
                  onClick={() => { onGoEmpleados(); setGestionOpen(false); }}>
                  👥 Empleados
                </div>
                <div className="admin-dd-item"
                  onClick={() => { if(onGoUsuarios) onGoUsuarios(); setGestionOpen(false); }}>
                  👤 Usuarios
                </div>
                <div className="admin-dd-item"
                  onClick={() => { if(onGoServicios) onGoServicios(); setGestionOpen(false); }}>
                  🧹 Servicios
                </div>
              </div>
            )}
          </div>

          {/* Reportes */}
          <a href="#" className="nav-link" style={getTabStyle('reportes')}
            onClick={(e) => { e.preventDefault(); onGoReportes(); }}>
            Reportes
          </a>

          {/* Avatar */}
          <div className="admin-avatar-wrap" ref={avatarRef}>
            <div className="admin-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>
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
              <div className="admin-avatar-dd">
                <div className="admin-avatar-header">
                  <div className="admin-avatar-name">{user?.nombre || 'Administrador'}</div>
                  <div className="admin-avatar-role">{user?.email || 'admin@foamwash.com'}</div>
                </div>
                <div className="admin-avatar-item"
                  onClick={() => { onGoPerfil(); setAvatarOpen(false); }}>
                  👤 Mi perfil
                </div>
                <div className="admin-avatar-item"
                  onClick={() => { onLogout(); setAvatarOpen(false); }}>
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

export default HeaderAdmin;