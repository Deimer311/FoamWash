// =============================================================================
// ARCHIVO  : FooterAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/FooterAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Footer exclusivo del panel de administración.
// =============================================================================

import React, { useState, useEffect } from 'react';

const FooterAdmin = ({
  // Navigation — mirrors AdminDashboard's nav props
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,

  // Opens ReportesModal (parent passes the setter)
  onOpenReportes,

  // Live KPI snapshot — feed from AdminDashboard's state
  kpiSnapshot = {
    ordeneHoy: 6,
    ordensPendientes: 18,
    empleadosActivos: 3,
    ingresosMes: '$4.200.000'
  }
}) => {
  const currentYear = new Date().getFullYear();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredAction, setHoveredAction] = useState(null);
  const [pulseKpi, setPulseKpi] = useState(false);

  // Subtle pulse on KPIs every 8 s to signal live data
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKpi(true);
      setTimeout(() => setPulseKpi(false), 600);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // ── Nav links ── matches AdminDashboard navigation props
  const navLinks = [
    { name: 'Panel',      icon: 'panel',     action: onGoDashboard },
    { name: 'Agenda',     icon: 'agenda',    action: onGoAgenda },
    { name: 'Empleados',  icon: 'empleados', action: onGoEmpleados },
    { name: 'Reportes',   icon: 'reportes',  action: onGoReportes },
    { name: 'Perfil',     icon: 'perfil',    action: onGoPerfil }
  ];

  // ── Quick admin actions (CTA column) ──
  const quickActions = [
    {
      label: 'Ver Reportes completos',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
      action: onOpenReportes,
      highlight: true
    },
    {
      label: 'Nueva orden',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      action: onGoAgenda,
      highlight: false
    },
    {
      label: 'Gestionar empleados',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      action: onGoEmpleados,
      highlight: false
    }
  ];

  // ── Nav-link icon SVGs ──
  const navIcon = (type) => {
    const props = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
    switch (type) {
      case 'panel':
        return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
      case 'agenda':
        return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
      case 'empleados':
        return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>;
      case 'reportes':
        return <svg {...props}><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
      case 'perfil':
        return <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="8" r="4"/></svg>;
      default:
        return null;
    }
  };

  return (
    <footer style={{
      width: '100%',
      backgroundColor: '#0F172A',
      color: '#E2E8F0',
      marginTop: 'auto'
    }}>

      {/* ─── Top bar: live system-status strip ─── */}
      <div style={{
        backgroundColor: '#1E293B',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '22px 40px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>

          {/* Status: Sistema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#F1F5F9', marginBottom: '2px' }}>
                Estado del Sistema
              </h3>
              <p style={{ fontSize: '13px', color: '#34D399', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#34D399',
                  boxShadow: '0 0 6px rgba(52, 211, 153, 0.6)',
                  animation: 'footerPulse 2s ease-in-out infinite'
                }} />
                Operational — todos los módulos activos
              </p>
            </div>
          </div>

          {/* Last sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#F1F5F9', marginBottom: '2px' }}>
                Última sincronización
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                Hace menos de 1 minuto
              </p>
            </div>
          </div>

          {/* Session info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#F1F5F9', marginBottom: '2px' }}>
                Sesión Segura
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                Conectado como <span style={{ color: '#A78BFA', fontWeight: 600 }}>Administrador</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main 4-column grid ─── */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '56px 40px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '48px'
      }}>

        {/* Col 1 — Brand + version */}
        <div style={{ maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '900', color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>FW</div>
            <div>
              <h2 style={{
                fontSize: '24px', fontWeight: '900', margin: 0,
                background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>FoamWash</h2>
              <span style={{
                fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px',
                textTransform: 'uppercase', color: '#4A90D9',
                background: 'rgba(59,130,246,0.12)', padding: '2px 8px',
                borderRadius: '20px', border: '1px solid rgba(59,130,246,0.25)'
              }}>Admin Panel</span>
            </div>
          </div>

          <p style={{ fontSize: '13px', lineHeight: '1.7', color: '#94A3B8', marginBottom: '22px' }}>
            Centro de control operativo. Gestiona órdenes, personal y reportes desde un solo lugar con visibilidad en tiempo real.
          </p>

          {/* Version + build */}
          <div style={{
            padding: '14px 16px', borderRadius: '10px',
            backgroundColor: '#1E293B', border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Versión del sistema</span>
              <span style={{ fontSize: '12px', color: '#60A5FA', fontWeight: 600 }}>v2.4.1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Entorno</span>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#34D399',
                background: 'rgba(52,211,153,0.1)', padding: '2px 8px',
                borderRadius: '10px'
              }}>Production</span>
            </div>
          </div>
        </div>

        {/* Col 2 — Navegación admin */}
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: '700', color: '#F1F5F9',
            marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1.2px',
            position: 'relative', paddingBottom: '12px'
          }}>
            Navegación
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '36px', height: '3px',
              background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: '2px'
            }} />
          </h3>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((link, i) => (
              <li key={i}>
                <button
                  onClick={link.action}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    background: hoveredLink === link.name ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                    color: hoveredLink === link.name ? '#60A5FA' : '#94A3B8',
                    fontSize: '14px', fontWeight: 500,
                    padding: '10px 12px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    transition: 'all 0.25s ease',
                    transform: hoveredLink === link.name ? 'translateX(4px)' : 'translateX(0)'
                  }}
                >
                  <span style={{ color: hoveredLink === link.name ? '#60A5FA' : '#4A6FA5', transition: 'color 0.25s' }}>
                    {navIcon(link.icon)}
                  </span>
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — Live KPI mini-panel */}
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: '700', color: '#F1F5F9',
            marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1.2px',
            position: 'relative', paddingBottom: '12px'
          }}>
            Métricas en Vivo
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '36px', height: '3px',
              background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: '2px'
            }} />
            {/* live badge */}
            <span style={{
              position: 'absolute', top: '0px', right: '0',
              fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px',
              color: '#34D399', background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.3)',
              padding: '2px 7px', borderRadius: '12px', textTransform: 'uppercase'
            }}>● Live</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Órdenes hoy',        value: kpiSnapshot.ordeneHoy,         color: '#3B82F6', icon: '📋' },
              { label: 'Órdenes pendientes', value: kpiSnapshot.ordensPendientes,  color: '#F59E0B', icon: '⏳' },
              { label: 'Empleados activos',  value: kpiSnapshot.empleadosActivos,  color: '#10B981', icon: '👥' },
              { label: 'Ingresos del mes',   value: kpiSnapshot.ingresosMes,       color: '#8B5CF6', icon: '💰' }
            ].map((kpi, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px', borderRadius: '10px',
                backgroundColor: '#1E293B', border: '1px solid #334155',
                transition: 'border-color 0.4s',
                borderColor: pulseKpi ? kpi.color + '55' : '#334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{kpi.icon}</span>
                  <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{kpi.label}</span>
                </div>
                <span style={{
                  fontSize: '14px', fontWeight: '700', color: kpi.color,
                  transition: 'transform 0.4s',
                  transform: pulseKpi ? 'scale(1.08)' : 'scale(1)',
                  display: 'inline-block'
                }}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 4 — Admin CTAs (connects to ReportesModal + nav) */}
        <div>
          <h3 style={{
            fontSize: '14px', fontWeight: '700', color: '#F1F5F9',
            marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1.2px',
            position: 'relative', paddingBottom: '12px'
          }}>
            Acciones Rápidas
            <div style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '36px', height: '3px',
              background: 'linear-gradient(90deg, #3B82F6, #2563EB)', borderRadius: '2px'
            }} />
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quickActions.map((act, i) => (
              <button
                key={i}
                onClick={act.action}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  border: act.highlight
                    ? (hoveredAction === i ? '1px solid #3B82F6' : '1px solid rgba(59,130,246,0.35)')
                    : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '13px 16px',
                  background: act.highlight
                    ? (hoveredAction === i
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.12))'
                        : 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.06))')
                    : (hoveredAction === i ? 'rgba(59,130,246,0.06)' : '#1E293B'),
                  color: act.highlight ? '#60A5FA' : (hoveredAction === i ? '#E2E8F0' : '#94A3B8'),
                  fontSize: '13.5px', fontWeight: 600,
                  transition: 'all 0.25s ease',
                  transform: hoveredAction === i ? 'translateX(4px)' : 'translateX(0)'
                }}
              >
                <span style={{
                  color: act.highlight ? '#60A5FA' : (hoveredAction === i ? '#60A5FA' : '#4A6FA5'),
                  transition: 'color 0.25s', flexShrink: 0
                }}>
                  {act.icon}
                </span>
                {act.label}
                {act.highlight && (
                  <span style={{
                    marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
                    color: '#3B82F6', background: 'rgba(59,130,246,0.15)',
                    padding: '2px 7px', borderRadius: '10px'
                  }}>Nuevo</span>
                )}
              </button>
            ))}
          </div>

          {/* Horario operativo */}
          <div style={{
            marginTop: '20px', padding: '14px 16px', borderRadius: '10px',
            backgroundColor: '#1E293B', border: '1px solid #334155'
          }}>
            <div style={{
              fontSize: '13px', fontWeight: '600', color: '#F1F5F9',
              marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ fontSize: '15px' }}>🕐</span> Horario Operativo
            </div>
            <div style={{ fontSize: '12.5px', color: '#94A3B8' }}>
              Lun – Sáb: 8:00 AM – 6:00 PM
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Soporte Admin: 24 / 7
            </div>
          </div>
        </div>
      </div>

      {/* ─── Divider ─── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #334155, transparent)' }} />
      </div>

      {/* ─── Copyright bar ─── */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ fontSize: '13px', color: '#64748B' }}>
          © {currentYear}{' '}
          <span style={{
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700'
          }}>FoamWash</span>
          {' '}· Panel de Administración · Todos los derechos reservados.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Hecho con <span style={{ color: '#EF4444' }}>❤️</span> en Colombia
          </span>
          <span style={{
            fontSize: '11px', color: '#4A6FA5', fontWeight: 600,
            border: '1px solid #334155', padding: '3px 10px',
            borderRadius: '12px', letterSpacing: '0.5px'
          }}>
            FW-ADMIN v2.4.1
          </span>
        </div>
      </div>

      {/* Keyframes for live-pulse dot */}
      <style>{`
        @keyframes footerPulse {
          0%, 100% { box-shadow: 0 0 6px rgba(52,211,153,0.6); }
          50%      { box-shadow: 0 0 12px rgba(52,211,153,0.9); }
        }
      `}</style>
    </footer>
  );
};

export default FooterAdmin;