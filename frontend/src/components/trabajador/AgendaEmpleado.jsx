// =============================================================================
// ARCHIVO  : AgendaEmpleado.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/AgendaEmpleado.jsx
// NOTA     : Lógica de API 100% intacta. Diseño renovado con header fijo (64px).
//            Header overlap corregido. Sin scroll interno.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import FooterEmpleado from './FooterEmpleado';

const AgendaEmpleado = ({ onGoPanelEmpleado, onGoAgendaEmpleado, onGoPerfil }) => {
  const { user } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('hoy');
  const [busqueda, setBusqueda] = useState('');
  const [ordenes, setOrdenes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchReservas(filtroActivo);
  }, [filtroActivo, user]);

  // ── Lógica original intacta ───────────────────────────────────────────────
  const fetchReservas = async (filtro) => {
    setIsLoading(true);
    setError('');
    try {
      let endpoint;
      if (filtro === 'hoy') {
        endpoint = `/empleados/${user.id}/servicios-hoy`;
      } else if (filtro === 'semana') {
        endpoint = `/empleados/${user.id}/agenda-semanal`;
      } else if (filtro === 'completadas') {
        endpoint = `/empleados/${user.id}/completados`;
      } else if (filtro === 'pendientes') {
        endpoint = `/empleados/${user.id}/pendientes`;
      }
      const response = await api.get(endpoint);
      if (response.data.success) {
        const data = response.data.data || [];
        const normalized = data.map(r => ({
          id: r.ID_Reserva,
          cliente: r.cliente?.Nombre || 'Sin nombre',
          servicio: r.servicios?.[0]?.Nombre_Servicio || 'Sin servicio',
          servicios: r.servicios || [],
          fecha: r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' }) : '—',
          direccion: r.cliente?.Direccion || 'Sin dirección',
          telefono: r.cliente?.Telefono || 'Sin teléfono',
          estado: r.Estado,
          hora: r.Hora ? new Date(r.Hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A',
          precio: r.servicios?.reduce((s, sv) => s + Number(sv.Precio || 0), 0) || null,
          observaciones: r.observacion?.Observaciones || r.Informacion_adicional || '',
        }));
        setOrdenes(normalized);
      }
    } catch (err) {
      console.error('Error al obtener reservas:', err);
      setError('No se pudieron cargar las reservas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCambiarEstado = async (reservaId, nuevoEstado) => {

    try {
      await api.patch(`/reservas/${reservaId}/estado`, { estado: nuevoEstado });
      fetchReservas(filtroActivo);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('No se pudo actualizar el estado. Intenta de nuevo.');
    }
  };

  const kpiSnapshot = {
    serviciosHoy: filtroActivo === 'hoy' ? ordenes.length : 0,
    serviciosSemana: filtroActivo === 'semana' ? ordenes.length : 0,
    completados: filtroActivo === 'completadas' ? ordenes.length : 0,
    pendientes: filtroActivo === 'pendientes' ? ordenes.length : 0,
  };

  const ordenesFiltradas = ordenes.filter(orden => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return (
      orden.cliente.toLowerCase().includes(q) ||
      orden.servicio.toLowerCase().includes(q) ||
      orden.direccion.toLowerCase().includes(q)
    );
  });

  // ── Helpers visuales ─────────────────────────────────────────────────────
  const ESTADO_META = {
    'Completado': { bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981', label: 'Completado' },
    'Pendiente': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b', label: 'Pendiente' },
    'En Proceso': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', dot: '#3b82f6', label: 'En Proceso' },
    'Cancelado': { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444', label: 'Cancelado' },
  };

  const FILTROS = [
    {
      key: 'hoy', label: 'Hoy',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ),
    },
    {
      key: 'semana', label: 'Esta semana',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      key: 'completadas', label: 'Completados',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      key: 'pendientes', label: 'Pendientes',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  const getTituloFiltro = () => {
    const map = {
      hoy: 'Servicios de hoy',
      semana: 'Servicios esta semana',
      completadas: 'Servicios completados',
      pendientes: 'Servicios pendientes',
    };
    return map[filtroActivo] || 'Servicios';
  };

  return (
    <>
      <style>{`
        /* ═══════════════════════════════════════════
           AGENDA EMPLEADO — Premium Redesign
           Paleta: fondo claro #f0f2f7, cards blancas,
           acentos azul #0066ff + verde esmeralda
        ═══════════════════════════════════════════ */
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700;800&display=swap');

        .ag-page {
          font-family: 'Kanit', sans-serif;
          background: #f0f2f7;
          min-height: 100vh;
          /* Compensar header fijo 64px + respiro 28px */
          padding-top: 92px;
          padding-bottom: 80px;
        }

        /* ── Top strip decorativo ── */
        .ag-top-strip {
          position: fixed;
          top: 64px; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0066ff 0%, #7c3aed 50%, #10b981 100%);
          z-index: 999;
        }

        /* ── Container ── */
        .ag-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* ── Hero header ── */
        .ag-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          padding-top: 12px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ag-hero-left {}

        .ag-greeting {
          font-size: 12px;
          font-weight: 600;
          color: #0066ff;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
        }

        .ag-title {
          font-size: 30px;
          font-weight: 800;
          color: #0a1128;
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin: 0;
        }

        .ag-date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e0e6f0;
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          color: #4a5a80;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        /* ── Search bar ── */
        .ag-search-wrap {
          position: relative;
          margin-bottom: 24px;
        }

        .ag-search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #8898b3;
          pointer-events: none;
        }

        .ag-search {
          width: 100%;
          padding: 14px 18px 14px 50px;
          font-family: 'Kanit', sans-serif;
          font-size: 14px;
          color: #0a1128;
          background: #fff;
          border: 1.5px solid #e0e6f0;
          border-radius: 14px;
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .ag-search:focus {
          border-color: #0066ff;
          box-shadow: 0 0 0 4px rgba(0,102,255,0.09);
        }

        .ag-search::placeholder { color: #aab4c8; }

        /* ── Filter tabs ── */
        .ag-filters {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 28px;
        }

        .ag-filter {
          background: #fff;
          border: 1.5px solid #e0e6f0;
          border-radius: 16px;
          padding: 18px 16px;
          cursor: pointer;
          transition: all 0.22s ease;
          text-align: left;
          font-family: 'Kanit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .ag-filter::before {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0066ff, #7c3aed);
          transform: scaleX(0);
          transition: transform 0.22s ease;
          border-radius: 0 0 16px 16px;
        }

        .ag-filter:hover {
          border-color: rgba(0,102,255,0.25);
          box-shadow: 0 4px 16px rgba(0,102,255,0.09);
          transform: translateY(-2px);
        }

        .ag-filter.active {
          border-color: #0066ff;
          background: linear-gradient(135deg, rgba(0,102,255,0.05), rgba(124,58,237,0.05));
          box-shadow: 0 4px 20px rgba(0,102,255,0.14);
          transform: translateY(-2px);
        }

        .ag-filter.active::before { transform: scaleX(1); }

        .ag-filter-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .ag-filter-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(0,102,255,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }

        .ag-filter.active .ag-filter-icon {
          background: rgba(0,102,255,0.16);
        }

        .ag-filter-num {
          font-size: 28px;
          font-weight: 800;
          color: #0a1128;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .ag-filter.active .ag-filter-num { color: #0066ff; }

        .ag-filter-label {
          font-size: 12px;
          font-weight: 600;
          color: #8898b3;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ag-filter.active .ag-filter-label { color: #0066ff; }

        /* ── Section header ── */
        .ag-section-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .ag-section-line {
          flex: 1;
          height: 1px;
          background: #e0e6f0;
        }

        .ag-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #8898b3;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .ag-section-count {
          background: #0066ff;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: 20px;
        }

        /* ── Cards grid ── */
        .ag-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        /* ── Service card ── */
        .ag-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e8edf5;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          animation: agCardIn 0.35s ease both;
        }

        @keyframes agCardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ag-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,102,255,0.12);
          border-color: rgba(0,102,255,0.2);
        }

        /* Card top color strip */
        .ag-card-strip {
          height: 4px;
          border-radius: 18px 18px 0 0;
        }

        .ag-card-body { padding: 20px 22px; }

        /* Card header row */
        .ag-card-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .ag-client-name {
          font-size: 16px;
          font-weight: 700;
          color: #0a1128;
          line-height: 1.2;
        }

        .ag-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .ag-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
        }

        /* Service name */
        .ag-service-name {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(0,102,255,0.06);
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          color: #0052cc;
          margin-bottom: 16px;
        }

        /* Info grid */
        .ag-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        .ag-info-item { display: flex; flex-direction: column; gap: 3px; }

        .ag-info-label {
          font-size: 10px;
          font-weight: 700;
          color: #aab4c8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ag-info-value {
          font-size: 13px;
          font-weight: 600;
          color: #1a2540;
        }

        /* Address full width */
        .ag-address {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: #f6f8fc;
          border-radius: 9px;
          font-size: 12.5px;
          color: #4a5a80;
          font-weight: 500;
          margin-bottom: 14px;
          border: 1px solid #eaeff7;
        }

        .ag-address-icon { flex-shrink: 0; margin-top: 1px; }

        /* Observations */
        .ag-obs {
          padding: 10px 13px;
          background: #fffbf0;
          border-radius: 9px;
          border-left: 3px solid #f59e0b;
          font-size: 12px;
          color: #78640a;
          margin-bottom: 14px;
          font-weight: 500;
        }

        .ag-obs-label {
          font-size: 10px;
          font-weight: 700;
          color: #c4921c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        /* Precio badge */
        .ag-precio {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(16,185,129,0.09);
          color: #059669;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 14px;
          border: 1px solid rgba(16,185,129,0.18);
        }

        /* Estado selector */
        .ag-estado-select {
          width: 100%;
          padding: 10px 14px;
          font-family: 'Kanit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #0a1128;
          background: #f6f8fc;
          border: 1.5px solid #e0e6f0;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238898b3' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .ag-estado-select:focus {
          border-color: #0066ff;
          box-shadow: 0 0 0 3px rgba(0,102,255,0.09);
        }

        /* ── Empty / Loading / Error ── */
        .ag-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e8edf5;
          text-align: center;
          animation: agCardIn 0.3s ease;
        }

        .ag-state-icon {
          width: 64px; height: 64px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
        }

        @keyframes agSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .ag-state-title {
          font-size: 16px;
          font-weight: 700;
          color: #4a5a80;
          margin-bottom: 6px;
        }

        .ag-state-sub { font-size: 13px; color: #aab4c8; font-weight: 500; }

        .ag-error-box {
          padding: 18px 22px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #b91c1c;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .ag-filters { grid-template-columns: repeat(2, 1fr); }
          .ag-container { padding: 0 20px; }
        }

        @media (max-width: 600px) {
          .ag-filters { grid-template-columns: repeat(2, 1fr); }
          .ag-grid { grid-template-columns: 1fr; }
          .ag-container { padding: 0 14px; }
          .ag-title { font-size: 24px; }
          .ag-page { padding-top: 80px; }
        }
      `}</style>

      {/* Strip decorativo bajo el header */}
      <div className="ag-top-strip" />

      <div className="ag-page">
        <div className="ag-container">

          {/* ── Hero ── */}
          <div className="ag-hero">
            <div className="ag-hero-left">
              <div className="ag-greeting">Panel de trabajo</div>
              <h1 className="ag-title">Mis Órdenes</h1>
            </div>
            <div className="ag-date-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* ── Search ── */}
          <div className="ag-search-wrap">
            <svg className="ag-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="ag-search"
              type="text"
              placeholder="Buscar por cliente, servicio o dirección..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {/* ── Filter tabs ── */}
          <div className="ag-filters">
            {FILTROS.map(({ key, label, icon }, idx) => (
              <div
                key={key}
                className={`ag-filter${filtroActivo === key ? ' active' : ''}`}
                onClick={() => setFiltroActivo(key)}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="ag-filter-top">
                  <div className="ag-filter-icon">{icon}</div>
                </div>
                <div className="ag-filter-num">
                  {filtroActivo === key
                    ? (isLoading ? '…' : ordenes.length)
                    : '—'
                  }
                </div>
                <div className="ag-filter-label">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Section header ── */}
          <div className="ag-section-head">
            <div className="ag-section-line" />
            <span className="ag-section-title">{getTituloFiltro()}</span>
            {!isLoading && !error && (
              <span className="ag-section-count">{ordenesFiltradas.length}</span>
            )}
            <div className="ag-section-line" />
          </div>

          {/* ── Content ── */}
          {isLoading ? (
            <div className="ag-state">
              <div className="ag-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'agSpin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                </svg>
              </div>
              <div className="ag-state-title">Cargando reservas...</div>
              <div className="ag-state-sub">Obteniendo tu agenda del día</div>
            </div>
          ) : error ? (
            <div className="ag-error-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="ag-state">
              <div className="ag-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8898b3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.38 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </div>
              <div className="ag-state-title">Sin servicios aquí</div>
              <div className="ag-state-sub">No hay {getTituloFiltro().toLowerCase()} registrados</div>
            </div>
          ) : (
            <div className="ag-grid">
              {ordenesFiltradas.map((orden, i) => {
                const meta = ESTADO_META[orden.estado] || ESTADO_META['Pendiente'];
                return (
                  <div
                    key={orden.id}
                    className="ag-card"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    {/* Color strip por estado */}
                    <div
                      className="ag-card-strip"
                      style={{ background: meta.dot }}
                    />

                    <div className="ag-card-body">
                      {/* Header */}
                      <div className="ag-card-head">
                        <div className="ag-client-name">{orden.cliente}</div>
                        <div
                          className="ag-status-pill"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          <div className="ag-status-dot" style={{ background: meta.dot }} />
                          {meta.label}
                        </div>
                      </div>

                      {/* Servicio */}
                      <div className="ag-service-name">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        {orden.servicio}
                      </div>

                      {/* Info grid */}
                      <div className="ag-info-grid">
                        <div className="ag-info-item">
                          <span className="ag-info-label">Fecha</span>
                          <span className="ag-info-value">{orden.fecha}</span>
                        </div>
                        <div className="ag-info-item">
                          <span className="ag-info-label">Hora</span>
                          <span className="ag-info-value">{orden.hora || 'N/A'}</span>
                        </div>
                        <div className="ag-info-item">
                          <span className="ag-info-label">Teléfono</span>
                          <span className="ag-info-value">{orden.telefono}</span>
                        </div>
                        {orden.precio && (
                          <div className="ag-info-item">
                            <span className="ag-info-label">Precio</span>
                            <span className="ag-info-value">${Number(orden.precio).toLocaleString('es-CO')}</span>
                          </div>
                        )}
                      </div>

                      {/* Dirección */}
                      <div className="ag-address">
                        <svg className="ag-address-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        {orden.direccion}
                      </div>

                      {/* Observaciones */}
                      {orden.observaciones && (
                        <div className="ag-obs">
                          <div className="ag-obs-label">Observaciones</div>
                          {orden.observaciones}
                        </div>
                      )}

                      {/* Selector de estado */}
                      {orden.estado !== 'Completado' && orden.estado !== 'Cancelado' && (
                        <select
                          className="ag-estado-select"
                          value={orden.estado}
                          onChange={e => handleCambiarEstado(orden.id, e.target.value)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Completado">Completado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <FooterEmpleado
        onGoPanelEmpleado={onGoPanelEmpleado}
        onGoAgendaEmpleado={onGoAgendaEmpleado}
        onGoPerfil={onGoPerfil}
        kpiSnapshot={kpiSnapshot}
      />
    </>
  );
};

export default AgendaEmpleado;