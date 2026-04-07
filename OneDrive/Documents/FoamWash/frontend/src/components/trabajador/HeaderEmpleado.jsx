// =============================================================================
// ARCHIVO  : HeaderEmpleado.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/HeaderEmpleado.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de navegación del panel del trabajador con avatar de usuario.
//
// FIX FOTO EN HEADER:
//   El problema era que 'user' se recibía como prop pero App.js nunca la pasaba,
//   por lo que siempre era undefined. Solución: obtener user desde useAuth()
//   directamente, igual que HeaderCliente. Se añaden además las mejoras de
//   API_BASE_URL, cache-busting con timestamp, imgError y useMemo para que
//   la foto se recargue correctamente al guardar cambios.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from '../autenticacion/AuthContext';
import '../comun/Header.css';

// ── Base URL del servidor (usa variable de entorno) ───────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

const HeaderEmpleado = ({
  onGoAgendaEmpleado,
  onGoPerfil,
  onLogout,
  activeTab,
}) => {

  // ✅ FIX: leer user desde el contexto, no desde prop
  const { user } = useAuth();

  const [avatarOpen, setAvatarOpen] = useState(false);
  // ✅ Estado para manejar error de carga de imagen (igual que HeaderAdmin)
  const [imgError, setImgError]     = useState(false);

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

  const getTabStyle = (tabName) => ({
    color: activeTab === tabName ? 'rgb(133, 198, 255)' : 'white',
    fontWeight: activeTab === tabName ? 'bold' : 'normal'
  });

  const getIniciales = () => {
    if (!user?.nombre) return 'TR';
    return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  // ✅ Cache-busting con timestamp + API_BASE_URL (igual que HeaderAdmin)
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
        .emp-avatar-wrap { position: relative; }
        .emp-avatar-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.5); overflow: hidden;
          cursor: pointer; background: linear-gradient(135deg, #5BC0DE, #223BFF);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 700;
          transition: all 0.2s; flex-shrink: 0;
        }
        .emp-avatar-btn:hover { border-color: white; transform: scale(1.08); }
        .emp-avatar-btn img { width: 100%; height: 100%; object-fit: cover; }
        .emp-avatar-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white; border-radius: 12px; min-width: 190px;
          overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          border: 0.5px solid rgba(0,0,0,0.08); z-index: 9999;
          animation: empFadeIn 0.15s ease;
        }
        .emp-avatar-header { padding: 14px 18px 10px; border-bottom: 0.5px solid #f0f0f0; }
        .emp-avatar-name { font-size: 14px; font-weight: 600; color: #222; }
        .emp-avatar-role { font-size: 12px; color: #888; margin-top: 2px; }
        .emp-avatar-item {
          padding: 11px 18px; font-size: 14px; color: #333;
          cursor: pointer; display: flex; align-items: center;
          gap: 10px; border-bottom: 0.5px solid #f0f0f0; transition: background 0.15s;
        }
        .emp-avatar-item:last-child { border-bottom: none; color: #e53935; }
        .emp-avatar-item:hover { background: #f5f8ff; }
        @keyframes empFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="header-banner" style={{ overflow: 'visible', zIndex: 1000 }}>
        <img src="/img/ima9.jpg" alt="Fondo" className="fondo" />

        <h1 className="logo-header" style={{ cursor: "pointer" }} onClick={onGoAgendaEmpleado}>
          FoamWash
          <span style={{ fontSize: '0.5em', color: '#28A745' }}>EM</span>
        </h1>

        <nav className="nav-bar">
          <a href="#" className="nav-link" style={getTabStyle('agenda')}
            onClick={(e) => { e.preventDefault(); onGoAgendaEmpleado(); }}>
            Agenda
          </a>

          {/* Avatar */}
          <div className="emp-avatar-wrap" ref={avatarRef}>
            <div className="emp-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>
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
              <div className="emp-avatar-dd">
                <div className="emp-avatar-header">
                  <div className="emp-avatar-name">{user?.nombre || 'Trabajador'}</div>
                  <div className="emp-avatar-role">{user?.email || ''}</div>
                </div>
                <div className="emp-avatar-item" onClick={() => { onGoPerfil(); setAvatarOpen(false); }}>
                  👤 Mi perfil
                </div>
                <div className="emp-avatar-item" onClick={() => { onLogout(); setAvatarOpen(false); }}>
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

export default HeaderEmpleado;