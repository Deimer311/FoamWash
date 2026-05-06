// =============================================================================
// ARCHIVO  : AdminServicios.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/AdminServicios.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Vista de servicios disponibles para el administrador.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import FooterAdmin from './FooterAdmin';

const defaultServicios = [
  {
    id: 1,
    nombre: 'Limpieza de Muebles',
    descripcion: 'Servicio profesional de limpieza profunda de muebles tapizados con tecnología de vapor y extracción.',
    precioBase: 90000,
    duracion: 80,        
    imagen: "/img/imag1.jpg", 
    activo: true,
    popular: true,
    creadoEn: '2024-01-15',
  },
  {
    id: 2,
    nombre: 'Sillas de Comedor',
    descripcion: 'Limpieza especializada para sillas de comedor, eliminando manchas difíciles y bacterias.',
    precioBase: 80000,
    duracion: 60,
    imagen: '/img/imag2.jpg',
    activo: true,
    popular: false,
    creadoEn: '2024-01-20',
  },
  {
    id: 3,
    nombre: 'Limpieza de Tapetes',
    descripcion: 'Limpieza y desinfección profunda de tapetes con equipos industriales de última generación.',
    precioBase: 120000,
    duracion: 90,
    imagen: '/img/imag3.jpg',
    activo: true,
    popular: true,
    creadoEn: '2024-02-01',
  },
  {
    id: 4,
    nombre: 'Lavado de Alfombras',
    descripcion: 'Servicio completo de lavado de alfombras con secado rápido y tratamiento antiácaros.',
    precioBase: 150000,
    duracion: 150,
    imagen: '/img/imag4.jpg',
    activo: false,
    popular: false,
    creadoEn: '2024-02-10',
  },
  {
    id: 5,
    nombre: 'Limpieza de Colchones',
    descripcion: 'Desinfección y limpieza profunda de colchones para eliminar ácaros, hongos y bacterias.',
    precioBase: 200000,
    duracion: 180,
    imagen: '/img/imag5.jpg',
    activo: true,
    popular: false,
    creadoEn: '2024-03-05',
  },
];

const emptyForm = {
  nombre: '',
  descripcion: '',
  precioBase: '',
  duracion: '',
  imagen: '',
  activo: true,
  popular: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

/**
 * Formatea la duración.
 * Acepta:
 *   - string '60-90'  → '60-90 min'
 *   - string '2h'     → '2h'
 *   - number 90       → '1h 30min'
 *   - number -30      → '—'  (resultado de 60-90 sin comillas)
 */
const fmtDuracion = (min) => {
  if (min === null || min === undefined || min === '') return '—';
  if (typeof min === 'string') {
    if (!min.trim()) return '—';
    // Si ya tiene unidades de tiempo, lo retornamos tal cual
    if (min.includes('h') || min.includes('min')) return min;
    // Rango tipo "60-90"
    return `${min} min`;
  }
  // Número inválido (negativo o cero)
  if (min <= 0) return '—';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
};

// ─── Design tokens — mismos que AdminDashboard ────────────────────────────────
const T = {
  primary:       '#0066FF',
  primaryDark:   '#0052CC',
  primaryLight:  '#E6F2FF',
  success:       '#00C853',
  successLight:  '#E8F5E9',
  warning:       '#FF9800',
  warningLight:  '#FFF3E0',
  danger:        '#F44336',
  dangerLight:   '#FFEBEE',
  textPrimary:   '#1a1a1a',
  textSecondary: '#666666',
  bgPrimary:     '#FFFFFF',
  bgSecondary:   '#F8F9FA',
  border:        '#E0E0E0',
  shadowSm:      '0 2px 8px rgba(0,0,0,0.08)',
  shadowMd:      '0 4px 16px rgba(0,0,0,0.10)',
  shadowLg:      '0 8px 24px rgba(0,0,0,0.12)',
  radiusSm:      '8px',
  radiusMd:      '12px',
  radiusLg:      '16px',
  radiusXl:      '20px',
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, visible }) => {
  const bg = type === 'success' ? T.success : type === 'error' ? T.danger : T.primary;
  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '13px 20px', background: bg, color: '#fff',
      borderRadius: T.radiusMd, boxShadow: T.shadowLg,
      fontSize: '14px', fontWeight: 600,
      transform: visible ? 'translateY(0)' : 'translateY(80px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'none', maxWidth: '360px',
    }}>
      <span>{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      {message}
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, nombre, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <div style={{
        background: T.bgPrimary, borderRadius: T.radiusLg,
        padding: '36px 40px', width: '100%', maxWidth: '420px',
        boxShadow: T.shadowLg, border: `1px solid ${T.border}`,
        animation: 'swUp 0.3s ease',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: T.dangerLight, display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 18px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke={T.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </div>
        <h3 style={{ color: T.textPrimary, fontSize: '18px', fontWeight: 700, textAlign: 'center', margin: '0 0 10px' }}>
          Eliminar Servicio
        </h3>
        <p style={{ color: T.textSecondary, fontSize: '14px', textAlign: 'center', lineHeight: 1.6, margin: '0 0 26px' }}>
          ¿Estás seguro de eliminar <strong style={{ color: T.textPrimary }}>"{nombre}"</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', background: T.bgSecondary,
            border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
            color: T.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#bbb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '11px',
            background: `linear-gradient(135deg, ${T.danger}, #d32f2f)`,
            border: 'none', borderRadius: T.radiusSm,
            color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal Crear / Editar ─────────────────────────────────────────────────────
const ServicioModal = ({ open, editando, formData, onChange, onSave, onClose }) => {
  if (!open) return null;

  const inp = {
    width: '100%', padding: '10px 13px', boxSizing: 'border-box',
    background: T.bgSecondary, border: `1px solid ${T.border}`,
    borderRadius: T.radiusSm, color: T.textPrimary, fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', fontFamily: 'inherit',
  };
  const lbl = {
    display: 'block', fontSize: '12px', fontWeight: 700,
    color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px',
  };
  const focus = (e) => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = `0 0 0 3px ${T.primaryLight}`; };
  const blur  = (e) => { e.target.style.borderColor = T.border;  e.target.style.boxShadow = 'none'; };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 7000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: T.bgPrimary, borderRadius: T.radiusLg,
        width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto',
        boxShadow: T.shadowLg, border: `1px solid ${T.border}`,
        animation: 'swUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px 26px 18px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <h2 style={{ color: T.textPrimary, fontSize: '19px', fontWeight: 700, margin: 0 }}>
              {editando ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p style={{ color: T.textSecondary, fontSize: '13px', margin: '3px 0 0' }}>
              {editando ? 'Modifica los campos del servicio' : 'Completa los datos del nuevo servicio'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: T.bgSecondary, border: `1px solid ${T.border}`,
            borderRadius: T.radiusSm, padding: '7px', cursor: 'pointer',
            color: T.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#bbb'}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          <div>
            <label style={lbl}>Nombre del Servicio *</label>
            <input style={inp} type="text" name="nombre" value={formData.nombre}
              onChange={onChange} placeholder="Ej: Limpieza de muebles"
              onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={lbl}>Descripción *</label>
            <textarea style={{ ...inp, resize: 'vertical', minHeight: '85px', lineHeight: 1.55 }}
              name="descripcion" value={formData.descripcion}
              onChange={onChange} placeholder="Describe el servicio en detalle..."
              onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={lbl}>Precio Base (COP) *</label>
              <input style={inp} type="number" name="precioBase" value={formData.precioBase}
                onChange={onChange} placeholder="90000" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={lbl}>Duración *</label>
              {/* Texto libre para soportar rangos como "60-90" */}
              <input style={inp} type="text" name="duracion" value={formData.duracion}
                onChange={onChange} placeholder='Ej: 60-90 o 120 (minutos)'
                onFocus={focus} onBlur={blur} />
              <p style={{ fontSize: '11px', color: T.textSecondary, margin: '4px 0 0' }}>
                Escribe un número (min) o rango tipo "60-90"
              </p>
            </div>
          </div>

          <div>
            <label style={lbl}>URL de Imagen</label>
            <input style={inp} type="text" name="imagen" value={formData.imagen}
              onChange={onChange} placeholder="/img/imag1.jpg" onFocus={focus} onBlur={blur} />
            <p style={{ fontSize: '11px', color: T.textSecondary, margin: '4px 0 0' }}>
              La imagen debe estar en la carpeta <code>public/img/</code> de tu proyecto
            </p>
          </div>

          {/* Toggles */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
            padding: '16px', background: T.bgSecondary,
            borderRadius: T.radiusMd, border: `1px solid ${T.border}`,
          }}>
            {/* Activo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ color: T.textPrimary, fontSize: '14px', fontWeight: 600 }}>Estado</div>
                <div style={{ color: T.textSecondary, fontSize: '12px', marginTop: '1px' }}>
                  {formData.activo ? 'Visible para clientes' : 'Oculto'}
                </div>
              </div>
              <button
                onClick={() => onChange({ target: { name: 'activo', value: !formData.activo, type: 'toggle' } })}
                style={{
                  width: '46px', height: '25px', borderRadius: '13px',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: formData.activo ? T.success : '#ccc',
                  position: 'relative', transition: 'background 0.3s',
                  boxShadow: formData.activo ? '0 0 0 3px rgba(0,200,83,0.15)' : 'none',
                }}>
                <span style={{
                  position: 'absolute', top: '3px',
                  left: formData.activo ? '24px' : '3px',
                  width: '19px', height: '19px', background: '#fff',
                  borderRadius: '50%', transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* Popular */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ color: T.textPrimary, fontSize: '14px', fontWeight: 600 }}>Popular</div>
                <div style={{ color: T.textSecondary, fontSize: '12px', marginTop: '1px' }}>
                  {formData.popular ? 'Destacado' : 'Sin destacar'}
                </div>
              </div>
              <button
                onClick={() => onChange({ target: { name: 'popular', value: !formData.popular, type: 'toggle' } })}
                style={{
                  width: '46px', height: '25px', borderRadius: '13px',
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                  background: formData.popular ? T.warning : '#ccc',
                  position: 'relative', transition: 'background 0.3s',
                  boxShadow: formData.popular ? '0 0 0 3px rgba(255,152,0,0.15)' : 'none',
                }}>
                <span style={{
                  position: 'absolute', top: '3px',
                  left: formData.popular ? '24px' : '3px',
                  width: '19px', height: '19px', background: '#fff',
                  borderRadius: '50%', transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '2px' }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px', background: T.bgSecondary,
              border: `1px solid ${T.border}`, borderRadius: T.radiusSm,
              color: T.textSecondary, fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#bbb'}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              Cancelar
            </button>
            <button onClick={onSave} style={{
              flex: 2, padding: '12px',
              background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
              border: 'none', borderRadius: T.radiusSm,
              color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,102,255,0.3)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {editando ? '✓  Guardar Cambios' : '✓  Crear Servicio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Servicio Card ────────────────────────────────────────────────────────────
const ServicioCard = ({ servicio, onEditar, onEliminar, onToggleActivo }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bgPrimary,
        border: `1px solid ${hovered ? T.primary : T.border}`,
        borderRadius: T.radiusLg,
        overflow: 'hidden',
        boxShadow: hovered ? T.shadowMd : T.shadowSm,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        opacity: servicio.activo ? 1 : 0.7,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ── Imagen con overlays ── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: '100%', height: '190px', overflow: 'hidden', background: T.bgSecondary }}>
          {!imgError ? (
            <img
              src={servicio.imagen}
              alt={servicio.nombre}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s ease',
                filter: servicio.activo ? 'none' : 'grayscale(50%)',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#f0f4f8',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={T.border} strokeWidth="1.2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontSize: '11px', marginTop: '6px', color: T.textSecondary }}>Sin imagen</span>
            </div>
          )}
        </div>

        {/* Badge "Popular" — esquina superior derecha */}
        {servicio.popular && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: `linear-gradient(135deg, ${T.warning}, #f57c00)`,
            color: '#fff', fontSize: '11px', fontWeight: 800,
            padding: '4px 11px', borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(255,152,0,0.45)',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            ★ Popular
          </div>
        )}

        {/* Badge duración — esquina inferior izquierda */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: '12px', fontWeight: 600,
          padding: '4px 10px', borderRadius: '20px',
          display: 'flex', alignItems: 'center', gap: '5px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {fmtDuracion(servicio.duracion)}
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div style={{ padding: '18px 18px 0', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>

        {/* Título */}
        <h3 style={{ color: T.textPrimary, fontSize: '17px', fontWeight: 700, margin: 0, lineHeight: 1.25 }}>
          {servicio.nombre}
        </h3>

        {/* Descripción */}
        <p style={{
          color: T.textSecondary, fontSize: '13px', lineHeight: 1.6, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {servicio.descripcion}
        </p>

        {/* Badges: Garantizado + estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: T.successLight, color: '#2e7d32',
            fontSize: '11px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '20px',
            border: '1px solid rgba(0,200,83,0.25)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Garantizado
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: servicio.activo ? T.textSecondary : '#999' }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: servicio.activo ? T.success : '#9E9E9E',
              display: 'inline-block',
              animation: servicio.activo ? 'dotPulse 2s ease-in-out infinite' : 'none',
            }} />
            {servicio.activo ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: T.border, margin: '2px 0' }} />

        {/* Precio */}
        <div>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: T.textSecondary,
            textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px',
          }}>
            Desde
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: T.primary, lineHeight: 1.1 }}>
            {fmtPrecio(servicio.precioBase)}
          </div>
        </div>
      </div>

      {/* ── Acciones ── */}
      <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Editar — botón principal ancho completo */}
        <button onClick={() => onEditar(servicio)} style={{
          width: '100%', padding: '11px',
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
          border: 'none', borderRadius: T.radiusSm,
          color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          boxShadow: '0 3px 10px rgba(0,102,255,0.25)', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,102,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,102,255,0.25)'; }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar Servicio
        </button>

        {/* Fila: toggle + eliminar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onToggleActivo(servicio.id)}
            style={{
              flex: 1, padding: '9px 8px', borderRadius: T.radiusSm,
              cursor: 'pointer',
              border: `1px solid ${servicio.activo ? '#ffcc80' : 'rgba(0,200,83,0.35)'}`,
              background: servicio.activo ? T.warningLight : T.successLight,
              color: servicio.activo ? '#e65100' : '#2e7d32',
              fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {servicio.activo ? '⏸ Desactivar' : '▶ Activar'}
          </button>

          <button onClick={() => onEliminar(servicio)}
            style={{
              padding: '9px 14px', borderRadius: T.radiusSm, cursor: 'pointer',
              background: T.dangerLight, border: `1px solid rgba(244,67,54,0.25)`,
              color: T.danger, transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#ffcdd2'}
            onMouseLeave={e => e.currentTarget.style.background = T.dangerLight}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
const AdminServicios = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onGoServicios,
  onLogout,
  onServiciosUpdate,
}) => {
  const [servicios, setServicios] = useState(() => {
    try {
      const stored = localStorage.getItem('fw_servicios');
      return stored ? JSON.parse(stored) : defaultServicios;
    } catch { return defaultServicios; }
  });

  const [modalOpen, setModalOpen]     = useState(false);
  const [editando, setEditando]       = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [confirmando, setConfirmando] = useState(null);
  const [filtro, setFiltro]           = useState('todos');
  const [search, setSearch]           = useState('');
  const [toast, setToast]             = useState({ visible: false, message: '', type: 'success' });
  const toastTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem('fw_servicios', JSON.stringify(servicios));
    if (onServiciosUpdate) onServiciosUpdate(servicios);
  }, [servicios]);

  const showToast = (message, type = 'success') => {
    clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModal = (s = null) => {
    if (s) {
      setEditando(s);
      setFormData({
        nombre: s.nombre, descripcion: s.descripcion,
        precioBase: s.precioBase, duracion: s.duracion,
        imagen: s.imagen, activo: s.activo, popular: s.popular,
      });
    } else {
      setEditando(null);
      setFormData(emptyForm);
    }
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setEditando(null); setFormData(emptyForm); };

  const guardar = () => {
    if (!formData.nombre.trim() || !formData.descripcion.trim() || !formData.precioBase || !formData.duracion) {
      showToast('Completa todos los campos obligatorios.', 'error');
      return;
    }
    // duracion puede ser string ("60-90") o número
    const durVal = isNaN(Number(formData.duracion)) ? formData.duracion : Number(formData.duracion);

    if (editando) {
      setServicios(prev => prev.map(s =>
        s.id === editando.id
          ? { ...s, ...formData, precioBase: Number(formData.precioBase), duracion: durVal }
          : s
      ));
      showToast(`"${formData.nombre}" actualizado correctamente.`, 'success');
    } else {
      const id = servicios.length > 0 ? Math.max(...servicios.map(s => s.id)) + 1 : 1;
      setServicios(prev => [...prev, {
        id, ...formData,
        precioBase: Number(formData.precioBase),
        duracion: durVal,
        creadoEn: new Date().toISOString().split('T')[0],
      }]);
      showToast(`"${formData.nombre}" creado exitosamente.`, 'success');
    }
    cerrarModal();
  };

  const eliminar = () => {
    setServicios(prev => prev.filter(s => s.id !== confirmando.id));
    showToast(`"${confirmando.nombre}" eliminado.`, 'info');
    setConfirmando(null);
  };

  const toggleActivo = (id) => {
    setServicios(prev => prev.map(s => {
      if (s.id !== id) return s;
      const activo = !s.activo;
      showToast(activo ? `"${s.nombre}" activado.` : `"${s.nombre}" desactivado.`, activo ? 'success' : 'info');
      return { ...s, activo };
    }));
  };

  const lista = servicios.filter(s => {
    const okFiltro =
      filtro === 'todos' ||
      (filtro === 'activos' && s.activo) ||
      (filtro === 'inactivos' && !s.activo);
    const okSearch = !search || s.nombre.toLowerCase().includes(search.toLowerCase());
    return okFiltro && okSearch;
  });

  const nActivos   = servicios.filter(s => s.activo).length;
  const nInactivos = servicios.filter(s => !s.activo).length;

  return (
    <>
      <style>{`
        @keyframes swUp {
          from { opacity:0; transform:translateY(22px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes dotPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(0,200,83,0.5); }
          50%      { box-shadow:0 0 0 5px rgba(0,200,83,0); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .srv-card-enter { animation: cardIn 0.35s ease forwards; }
        .tab-pill:hover { background: ${T.primaryLight} !important; color: ${T.primary} !important; }
        input::placeholder, textarea::placeholder { color: #BDBDBD; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.5; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: T.bgSecondary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        padding: '2rem 1rem',
        paddingBottom: '60px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* ── Encabezado ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px', marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: T.radiusMd,
                background: T.primaryLight,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                  <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <div>
                <h1 style={{
                  fontSize: '2rem', fontWeight: 700, margin: 0,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Servicios
                </h1>
                <p style={{ color: T.textSecondary, fontSize: '14px', margin: 0 }}>
                  Gestión del catálogo de servicios
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', background: T.primaryLight,
                color: T.primaryDark, borderRadius: T.radiusXl,
                fontSize: '13px', fontWeight: 600,
              }}>
                <span style={{ color: T.success, fontWeight: 700 }}>{nActivos}</span>
                <span>activos</span>
                <span style={{ color: T.border }}>·</span>
                <span style={{ color: T.textSecondary, fontWeight: 700 }}>{nInactivos}</span>
                <span>inactivos</span>
              </div>

              <button onClick={() => abrirModal()} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px',
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                border: 'none', borderRadius: T.radiusMd,
                color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,102,255,0.3)', transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,102,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,102,255,0.3)'; }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nuevo Servicio
              </button>
            </div>
          </div>

          {/* ── Filtros + Búsqueda ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <div style={{
              display: 'flex', gap: '4px', background: T.bgPrimary,
              borderRadius: T.radiusMd, padding: '4px',
              border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
            }}>
              {[
                { key: 'todos',     label: `Todos (${servicios.length})` },
                { key: 'activos',   label: `Activos (${nActivos})` },
                { key: 'inactivos', label: `Inactivos (${nInactivos})` },
              ].map(tab => (
                <button key={tab.key} className="tab-pill" onClick={() => setFiltro(tab.key)}
                  style={{
                    padding: '8px 18px', borderRadius: T.radiusSm, border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                    background: filtro === tab.key ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` : 'transparent',
                    color: filtro === tab.key ? '#fff' : T.textSecondary,
                    boxShadow: filtro === tab.key ? '0 2px 8px rgba(0,102,255,0.25)' : 'none',
                  }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '300px' }}>
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={T.textSecondary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Buscar servicio..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  background: T.bgPrimary, border: `1px solid ${T.border}`,
                  borderRadius: T.radiusMd, color: T.textPrimary,
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                  boxShadow: T.shadowSm, transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = `0 0 0 3px ${T.primaryLight}`; }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = T.shadowSm; }} />
            </div>
          </div>

          {/* ── Grid / Empty state ── */}
          {lista.length === 0 ? (
            <div style={{
              background: T.bgPrimary, borderRadius: T.radiusLg,
              border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '70px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '14px', opacity: 0.25 }}>📦</div>
              <h3 style={{ color: T.textPrimary, fontSize: '19px', fontWeight: 700, margin: '0 0 8px' }}>
                {search ? 'Sin resultados' : 'No hay servicios aquí'}
              </h3>
              <p style={{ color: T.textSecondary, fontSize: '14px', margin: '0 0 22px', maxWidth: '300px', lineHeight: 1.6 }}>
                {search
                  ? `Ningún servicio coincide con "${search}".`
                  : filtro === 'activos'   ? 'No hay servicios activos.'
                  : filtro === 'inactivos' ? '¡Todos los servicios están activos!'
                  : 'Aún no has creado ningún servicio.'}
              </p>
              {!search && filtro === 'todos' && (
                <button onClick={() => abrirModal()} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '11px 22px',
                  background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                  border: 'none', borderRadius: T.radiusMd, color: '#fff',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,102,255,0.3)',
                }}>
                  + Crear primer servicio
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.25rem',
            }}>
              {lista.map((s, i) => (
                <div key={s.id} className="srv-card-enter" style={{ animationDelay: `${i * 55}ms` }}>
                  <ServicioCard
                    servicio={s}
                    onEditar={abrirModal}
                    onEliminar={setConfirmando}
                    onToggleActivo={toggleActivo}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FooterAdmin
        onGoDashboard={onGoDashboard}
        onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados}
        onGoServicios={onGoServicios}
        onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}
        kpiSnapshot={{ ordeneHoy: 6, ordensPendientes: 18, empleadosActivos: 3, ingresosMes: '$4.200.000' }}
      />

      <ServicioModal
        open={modalOpen} editando={editando}
        formData={formData} onChange={handleChange}
        onSave={guardar} onClose={cerrarModal}
      />

      <ConfirmDialog
        open={!!confirmando} nombre={confirmando?.nombre || ''}
        onConfirm={eliminar} onCancel={() => setConfirmando(null)}
      />

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
};

export default AdminServicios;