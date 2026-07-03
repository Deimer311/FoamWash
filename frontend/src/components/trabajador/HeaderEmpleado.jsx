// =============================================================================
// ARCHIVO  : HeaderEmpleado.jsx — REDISEÑO PREMIUM UNIFICADO
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/HeaderEmpleado.jsx
// NOTA     : Sincronizado con diseño HeaderCliente. Distintivo de rol: EM
//            FIX: em-nav-label visible en desktop, oculto solo en móvil.
//            Mantiene fix de useAuth(), API_BASE_URL, cache-busting y imgError.
// =============================================================================

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from '../autenticacion/AuthContext';

// ── Base URL del servidor ─────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcCalendar = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcUser     = ({ size = 15, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcLogout   = ({ size = 15, color = '#ff6b6b' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const HeaderEmpleado = ({
  onGoAgendaEmpleado,
  onGoPerfil,
  onLogout,
  activeTab,
}) => {
  const { user } = useAuth();

  const [scrolled, setScrolled]     = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [imgError, setImgError]     = useState(false);
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
    if (!user?.nombre) return 'EM';
    return user.nombre.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <>
      <style>{`
        .em-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          background: rgba(8,12,30,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          overflow: visible;
        }
        .em-header.scrolled {
          background: rgba(8,12,30,0.97);
          border-color: rgba(255,255,255,0.09);
          box-shadow: 0 4px 24px rgba(0,0,0,0.4);
        }

        .em-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
        .em-logo-mark {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #0066ff, #00b8ff);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: #fff;
          box-shadow: 0 2px 10px rgba(0,102,255,0.35);
        }
        .em-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
        .em-logo-tag {
          font-size: 9px; font-weight: 700; color: #28A745;
          letter-spacing: 1px; text-transform: uppercase;
          vertical-align: super; margin-left: 2px;
        }

        .em-nav { display: flex; align-items: center; gap: 2px; }

        .em-nav-btn {
          position: relative;
          padding: 7px 14px;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.55);
          font-size: 13.5px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.18s, background 0.18s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .em-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .em-nav-btn.active { color: #fff; background: rgba(0,102,255,0.18); }
        .em-nav-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 50%;
          transform: translateX(-50%);
          width: 18px; height: 2px;
          background: #0099ff;
          border-radius: 2px;
        }

        .em-right { display: flex; align-items: center; gap: 14px; }

        .em-avatar-wrap { position: relative; }
        .em-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px; cursor: pointer;
          transition: all 0.2s ease;
        }
        .em-avatar-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.2);
        }

        .em-avatar-img {
          width: 30px; height: 30px; border-radius: 50%; overflow: hidden;
          background: linear-gradient(135deg, #0066ff, #00b8ff);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 11px; font-weight: 700; font-family: inherit;
          flex-shrink: 0; box-shadow: 0 2px 10px rgba(0,102,255,0.35);
        }
        .em-avatar-img img { width: 100%; height: 100%; object-fit: cover; }

        .em-avatar-dd {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: rgba(10,14,38,0.97); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 14px;
          min-width: 220px; overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          animation: emDropIn 0.2s cubic-bezier(.34,1.56,.64,1); z-index: 10;
        }
        @keyframes emDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .em-dd-head {
          padding: 14px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(0,102,255,0.08);
        }
        .em-dd-name  { font-size: 13px; font-weight: 700; color: #fff; }
        .em-dd-email { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }

        .em-dd-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          font-size: 13px; color: rgba(255,255,255,0.65); cursor: pointer;
          border: none; background: transparent; font-family: inherit; font-weight: 500;
          width: 100%; text-align: left; transition: all 0.15s ease;
        }
        .em-dd-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .em-dd-item.logout { color: #ff6b6b; }
        .em-dd-item.logout:hover { background: rgba(255,80,80,0.1); }

        .em-dd-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(0,102,255,0.12);
          display: flex; align-items: center; justify-content: center;
        }
        .em-dd-item.logout .em-dd-icon { background: rgba(255,80,80,0.12); }

        @media (max-width: 800px) {
          .em-header { padding: 0 20px; }
          .em-nav-btn span { display: none; }
        }
      `}</style>

      <header className={`em-header${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <div className="em-logo" onClick={onGoAgendaEmpleado}>
          <div className="em-logo-mark"><img src="/LogoFW.jpeg" alt="Logo FoamWash" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} /></div>
          <span className="em-logo-text">
            FoamWash<span className="em-logo-tag">EM</span>
          </span>
        </div>

        {/* Nav — mismo link original (Agenda) con SVG añadido */}
        <nav className="em-nav">
          <button
            className={`em-nav-btn${activeTab === 'agenda' ? ' active' : ''}`}
            onClick={onGoAgendaEmpleado}
          >
            <IcCalendar /><span>Agenda</span>
          </button>
        </nav>

        {/* Avatar */}
        <div className="em-right">
          <div className="em-avatar-wrap" ref={avatarRef}>
            <div className="em-avatar-btn" onClick={() => setAvatarOpen(o => !o)}>
              <div className="em-avatar-img">
                {fotoUrl && !imgError
                  ? <img src={fotoUrl} alt="Perfil" onError={() => setImgError(true)} />
                  : getIniciales()
                }
              </div>
              <IcUser size={14} color="rgba(255,255,255,0.6)" />
            </div>

            {avatarOpen && (
              <div className="em-avatar-dd">
                <div className="em-dd-head">
                  <div className="em-dd-name">{user?.nombre || 'Trabajador'}</div>
                  <div className="em-dd-email">{user?.email || ''}</div>
                </div>
                <button className="em-dd-item" onClick={() => { onGoPerfil(); setAvatarOpen(false); }}>
                  <span className="em-dd-icon"><IcUser size={14} color="#0099ff" /></span>
                  Mi perfil
                </button>
                <button className="em-dd-item logout" onClick={() => { onLogout(); setAvatarOpen(false); }}>
                  <span className="em-dd-icon"><IcLogout size={14} /></span>
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

export default HeaderEmpleado;
