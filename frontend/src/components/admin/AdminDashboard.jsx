// =============================================================================
// ARCHIVO  : AdminDashboard.jsx — PREMIUM FINAL
// PROYECTO : FoamWash
// NOTA     : Todos los emojis → SVG. Lógica API 100% intacta.
// =============================================================================

import React, { useState, useEffect } from "react";
import HeaderAdmin from './HeaderAdmin';
import FooterAdmin from './FooterAdmin';
import api from '../../services/api';
import "./estilos_admin/AdminGlobal.css";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcUsers   = ({ s = 22, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcClip    = ({ s = 22, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IcClock   = ({ s = 22, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcDollar  = ({ s = 22, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcCal     = ({ s = 14, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcUser    = ({ s = 14, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcBar     = ({ s = 14, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcPhone   = ({ s = 12, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.11 12 19.79 19.79 0 0 1 2 3.18 2 2 0 0 1 4 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcZap     = ({ s = 14, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcGrid    = ({ s = 20, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;

// KPI icon map
const KPI_SVG = {
    'Total clientes':   <IcUsers  s={22} c="#0066ff" />,
    'Total reservas':   <IcClip   s={22} c="#0066ff" />,
    'Pendientes':       <IcClock  s={22} c="#0066ff" />,
    'Ingresos totales': <IcDollar s={22} c="#0066ff" />,
};

// Quick action icon map
const QA_SVG = {
    'Ver agenda':   <IcCal  s={18} c="currentColor" />,
    'Empleados':    <IcUsers s={18} c="currentColor" />,
    'Ver reportes': <IcBar  s={18} c="currentColor" />,
    'Mi perfil':    <IcUser s={18} c="currentColor" />,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (nombre = '') => {
    const p = nombre.trim().split(' ').filter(Boolean);
    if (!p.length) return '?';
    return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const statusBadge = (s = '') => {
    const map = {
        'En proceso': 'ad-badge-blue',  'En Proceso': 'ad-badge-blue',
        'Programada': 'ad-badge-amber', 'Pendiente':  'ad-badge-amber',
        'Completado': 'ad-badge-green', 'Completada': 'ad-badge-green',
        'Cancelado':  'ad-badge-red',   'Cancelada':  'ad-badge-red',
    };
    return map[s] || 'ad-badge-gray';
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, number, loading, trend }) => (
    <div className="ad-kpi" style={{ animation: 'adSlideUp 0.4s ease both' }}>
        <div className="ad-kpi-icon">{KPI_SVG[label] || icon}</div>
        <div style={{ flex: 1 }}>
            <div className="ad-kpi-num">{loading ? '—' : number}</div>
            <div className="ad-kpi-label">{label}</div>
        </div>
        {trend && (
            <div style={{
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                color: trend > 0 ? '#007a33' : '#b91c1c',
                background: trend > 0 ? 'rgba(0,200,83,0.10)' : 'rgba(239,68,68,0.10)',
                padding: '3px 8px', borderRadius: 20,
            }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </div>
        )}
    </div>
);

// ── Employee Avatar ───────────────────────────────────────────────────────────
const EmpAvatar = ({ foto, nombre, size = 42 }) => {
    const [err, setErr] = useState(false);
    if (foto && !err) return (
        <img src={foto} alt={nombre} onError={() => setErr(true)}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
                     border: '2px solid rgba(0,102,255,0.15)', flexShrink: 0 }} />
    );
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #00b8ff, #0066ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.32,
            border: '2px solid rgba(0,102,255,0.15)',
        }}>
            {initials(nombre)}
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const AdminDashboard = ({
    onGoDashboard, onGoAgenda, onGoEmpleados,
    onGoReportes,  onGoPerfil, onGoUsuarios,
    onGoServicios, onLogout,
}) => {
    const [kpiData,         setKpiData]         = useState([]);
    const [ordersToday,     setOrdersToday]     = useState([]);
    const [activeEmployees, setActiveEmployees] = useState([]);
    const [isLoading,       setIsLoading]       = useState(true);

    const formatCOP = (v) =>
        (!v || v === 0) ? '$0' :
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [resStats, resReservas, resEmpleados] = await Promise.all([
                    api.get('/estadisticas'),
                    api.get('/reservas'),
                    api.get('/empleados'),
                ]);

                const stats     = resStats.data           || {};
                const reservas  = resReservas.data?.data  || resReservas.data || [];
                const empleados = resEmpleados.data?.data || [];

                setKpiData([
                    { label: 'Total clientes',  number: String(stats.Total_Clientes      ?? '—'), trend: 12 },
                    { label: 'Total reservas',  number: String(stats.Total_Reservas      ?? '—'), trend: 8  },
                    { label: 'Pendientes',      number: String(stats.Reservas_Pendientes ?? '—'), trend: -3 },
                    { label: 'Ingresos totales',number: formatCOP(stats.Ingresos_Totales),        trend: 18 },
                ]);

                const lista = Array.isArray(reservas) ? reservas : [];
                setOrdersToday(lista.slice(0, 8).map(r => ({
                    service:        r.servicios?.[0]?.Nombre_Servicio || r.Informacion_adicional || 'Servicio',
                    time:           r.Hora?.slice(0, 5) || '--:--',
                    status:         r.Estado,
                    clientInitials: initials(r.cliente?.Nombre || 'CL'),
                    clientName:     r.cliente?.Nombre || 'Cliente',
                })));

                const API_BASE = import.meta.env.VITE_API_URL
                    ? import.meta.env.VITE_API_URL.replace('/api', '')
                    : 'http://localhost:5000';

                setActiveEmployees(
                    empleados.filter(e => e.estado === 'activo').slice(0, 5).map(e => ({
                        name:  e.Nombre   || 'Empleado',
                        phone: e.Telefono || '—',
                        foto:  e.foto_perfil
                            ? (e.foto_perfil.startsWith('http') ? e.foto_perfil : `${API_BASE}${e.foto_perfil}`)
                            : null,
                    }))
                );
            } catch (err) {
                console.error('Error cargando dashboard:', err);
            } finally {
                setIsLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const quickActions = [
        { label: 'Ver agenda',   action: onGoAgenda    },
        { label: 'Empleados',    action: onGoEmpleados },
        { label: 'Ver reportes', action: onGoReportes  },
        { label: 'Mi perfil',    action: onGoPerfil    },
    ];

    return (
        <div className="ad-page">
            <HeaderAdmin
                onGoDashboard={onGoDashboard} onGoAgenda={onGoAgenda}
                onGoEmpleados={onGoEmpleados} onGoReportes={onGoReportes}
                onGoPerfil={onGoPerfil}       onGoUsuarios={onGoUsuarios}
                onGoServicios={onGoServicios} onLogout={onLogout}
                activeTab="panel"
            />

            <div className="ad-container">

                {/* ── Page header ── */}
                <div className="ad-page-header">
                    <div className="ad-page-title-wrap">
                        <div className="ad-page-icon">
                            <IcGrid s={20} c="#0066ff" />
                        </div>
                        <div>
                            <h2 className="ad-page-title">Panel de Control</h2>
                            <p className="ad-page-subtitle">Visión general del negocio en tiempo real</p>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ad-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00c853', display: 'inline-block', animation: 'adPulse 2s infinite' }} />
                        Sistema activo
                    </div>
                </div>

                {/* ── KPIs ── */}
                <div className="ad-kpi-grid" style={{ marginBottom: 24 }}>
                    {kpiData.map((k, i) => (
                        <KpiCard key={i} {...k} loading={isLoading} />
                    ))}
                </div>

                {/* ── Reservas + Empleados ── */}
                <div className="ad-grid-2" style={{ marginBottom: 18 }}>

                    {/* Últimas reservas */}
                    <div className="ad-card">
                        <div className="ad-card-head">
                            <span className="ad-card-title">
                                <IcCal s={14} c="#0066ff" />
                                Últimas reservas
                            </span>
                            <button className="ad-btn ad-btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={onGoAgenda}>
                                Ver todas →
                            </button>
                        </div>
                        <div className="ad-card-body" style={{ padding: '0 22px' }}>
                            {isLoading ? (
                                <p style={{ padding: '28px 0', textAlign: 'center', color: 'var(--ad-text-muted)', fontSize: 13 }}>Cargando...</p>
                            ) : ordersToday.length === 0 ? (
                                <p style={{ padding: '28px 0', textAlign: 'center', color: 'var(--ad-text-muted)', fontSize: 13 }}>No hay reservas</p>
                            ) : ordersToday.map((o, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '13px 0',
                                    borderBottom: i < ordersToday.length - 1 ? '1px solid var(--ad-border)' : 'none',
                                }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(0,184,255,0.18), rgba(0,102,255,0.18))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 12, color: '#0052cc', flexShrink: 0,
                                    }}>
                                        {o.clientInitials}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ad-text)',
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {o.service}
                                        </div>
                                        <div style={{ fontSize: 11.5, color: 'var(--ad-text-muted)', marginTop: 2 }}>
                                            {o.clientName} · {o.time}
                                        </div>
                                    </div>
                                    <span className={`ad-badge ${statusBadge(o.status)}`} style={{ flexShrink: 0 }}>
                                        {o.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Empleados activos */}
                    <div className="ad-card">
                        <div className="ad-card-head">
                            <span className="ad-card-title">
                                <IcUsers s={14} c="#0066ff" />
                                Empleados activos
                            </span>
                            <button className="ad-btn ad-btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={onGoEmpleados}>
                                Gestionar →
                            </button>
                        </div>
                        <div className="ad-card-body" style={{ padding: '0 22px' }}>
                            {isLoading ? (
                                <p style={{ padding: '28px 0', textAlign: 'center', color: 'var(--ad-text-muted)', fontSize: 13 }}>Cargando...</p>
                            ) : activeEmployees.length === 0 ? (
                                <p style={{ padding: '28px 0', textAlign: 'center', color: 'var(--ad-text-muted)', fontSize: 13 }}>No hay empleados activos</p>
                            ) : activeEmployees.map((emp, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '13px 0',
                                    borderBottom: i < activeEmployees.length - 1 ? '1px solid var(--ad-border)' : 'none',
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: -22, top: 10, bottom: 10,
                                        width: 3, borderRadius: 3,
                                        background: 'linear-gradient(135deg, #00b8ff, #0066ff)',
                                    }} />
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <EmpAvatar foto={emp.foto} nombre={emp.name} size={44} />
                                        <div style={{
                                            position: 'absolute', bottom: 1, right: 1,
                                            width: 10, height: 10, borderRadius: '50%',
                                            background: '#00c853', border: '2px solid white',
                                            animation: 'adPulse 2s infinite',
                                        }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ad-text)' }}>{emp.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--ad-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <IcPhone s={12} c="var(--ad-text-muted)" />
                                            {emp.phone}
                                        </div>
                                    </div>
                                    <span className="ad-badge ad-badge-green" style={{ fontSize: 10 }}>Activo</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Acciones rápidas ── */}
                <div className="ad-card">
                    <div className="ad-card-head">
                        <span className="ad-card-title">
                            <IcZap s={14} c="#0066ff" />
                            Acciones rápidas
                        </span>
                    </div>
                    <div className="ad-card-body">
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: 10,
                        }}>
                            {quickActions.map((a, i) => (
                                <button key={i} onClick={a.action}
                                    className="ad-btn ad-btn-secondary"
                                    style={{
                                        justifyContent: 'flex-start',
                                        padding: '12px 16px',
                                        borderRadius: 'var(--ad-r-md)',
                                        fontSize: 13.5,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #0066ff, #0052cc)';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = '';
                                        e.currentTarget.style.color = '';
                                        e.currentTarget.style.borderColor = '';
                                    }}
                                >
                                    {QA_SVG[a.label]}
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <FooterAdmin
                onGoDashboard={onGoDashboard} onGoAgenda={onGoAgenda}
                onGoEmpleados={onGoEmpleados} onGoReportes={onGoReportes}
                onGoPerfil={onGoPerfil}       onGoUsuarios={onGoUsuarios}
                onGoServicios={onGoServicios} onLogout={onLogout}
            />
        </div>
    );
};

export default AdminDashboard;