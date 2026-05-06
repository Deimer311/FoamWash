// =============================================================================
// ARCHIVO  : ReportesAdmin.jsx — PREMIUM FIX
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Fix: padding-top header fijo + todos emojis → SVG.
// =============================================================================

import React, { useState, useEffect } from 'react';
import FooterAdmin from './FooterAdmin';
import api from '../../services/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcBar    = ({ s=22, c='#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcMoney  = ({ s=22, c='#00c853' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IcUsers  = ({ s=22, c='#f59e0b' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcStar   = ({ s=22, c='#7c3aed' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcTrend  = ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IcTrendD = ({ s=14, c='currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>;

const ReportesAdmin = ({
  onGoDashboard, onGoAgenda, onGoEmpleados,
  onGoReportes,  onGoPerfil, onLogout, onOpenReportes
}) => {
  const [periodoActivo,       setPeriodoActivo]       = useState('mensual');
  const [estadisticas,        setEstadisticas]        = useState({ serviciosRealizados: 0, ingresosTotal: 0, clientesAtendidos: 0, satisfaccion: 0 });
  const [ventasPorMes,        setVentasPorMes]        = useState([]);
  const [serviciosPorTipo,    setServiciosPorTipo]    = useState([]);
  const [rendimientoEmpleados,setRendimientoEmpleados]= useState([]);
  const [loading,             setLoading]             = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const estadisticasRes = await api.get(`/estadisticas?periodo=${periodoActivo}`);
        const kpis = estadisticasRes.data?.data || estadisticasRes.data || {};

        setEstadisticas({
          serviciosRealizados: kpis.Reservas_Completadas ?? kpis.precio_total ?? 0,
          ingresosTotal:       kpis.Ingresos_Totales     ?? (kpis.ingresos || 0),
          clientesAtendidos:   kpis.Total_Clientes       ?? 0,
          satisfaccion:        kpis.satisfaccion         ?? 95,
        });

        const empleadosRes = await api.get('/empleados/productividad/general');
        const empleados = empleadosRes.data?.data || empleadosRes.data || [];
        setRendimientoEmpleados(empleados.map((emp) => ({
          nombre:      emp.Nombre || `Empleado ${emp.Id_Usuario}`,
          servicios:   emp._count?.reservasComoEmpleado ?? 0,
          satisfaccion: 90 + (emp._count?.reservasComoEmpleado ?? 0) * 0.1,
        })));

        const serviciosRes = await api.get('/servicios/analytics/mas-solicitados');
        const servicios = serviciosRes.data?.data || serviciosRes.data || [];
        const colors = ['#0066FF','#00C853','#FF9800','#EF4444','#7C3AED'];
        setServiciosPorTipo(servicios.map((serv, idx) => ({
          nombre:   serv.Nombre_Servicio || serv.nombre || 'Servicio',
          cantidad: serv._count?.reserva?.length ?? serv._count?.reserva ?? 0,
          color:    colors[idx % colors.length],
        })));

        const cotizacionesRes = await api.get('/cotizaciones');
        const cotizaciones = cotizacionesRes.data?.data || cotizacionesRes.data || [];

        const now = new Date();
        let startDate = new Date();
        let groupBy = 'month';

        if (periodoActivo === 'semanal')     { startDate.setDate(now.getDate() - 7);          groupBy = 'day'; }
        else if (periodoActivo === 'mensual'){ startDate.setMonth(now.getMonth() - 1);         groupBy = 'week'; }
        else if (periodoActivo === 'trimestral') { startDate.setMonth(now.getMonth() - 3);    groupBy = 'month'; }
        else if (periodoActivo === 'anual')  { startDate.setFullYear(now.getFullYear() - 1);  groupBy = 'month'; }

        const ingresosPorPeriodo = {};
        cotizaciones
          .filter(cot => {
            const d = new Date(cot.fecha_cotizacion || cot.fecha || cot.createdAt);
            return d >= startDate;
          })
          .forEach(cot => {
            const d = new Date(cot.fecha_cotizacion || cot.fecha || cot.createdAt);
            let key;
            if (groupBy === 'day') {
              key = d.toISOString().slice(0, 10);
            } else if (groupBy === 'week') {
              const first = new Date(d); first.setDate(d.getDate() - d.getDay());
              key = first.toISOString().slice(0, 10);
            } else {
              key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
            ingresosPorPeriodo[key] = (ingresosPorPeriodo[key] || 0) + Number(cot.Precio_cotizado ?? cot.Precio ?? 0);
          });

        setVentasPorMes(Object.entries(ingresosPorPeriodo).map(([periodo, valor]) => ({ periodo, valor })).sort((a, b) => a.periodo.localeCompare(b.periodo)));
      } catch (error) {
        console.error('Error fetching report data:', error);
        setEstadisticas({ serviciosRealizados: 0, ingresosTotal: 0, clientesAtendidos: 0, satisfaccion: 0 });
        setVentasPorMes([]); setServiciosPorTipo([]); setRendimientoEmpleados([]);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [periodoActivo]);

  const maxVenta    = ventasPorMes.length > 0 ? Math.max(...ventasPorMes.map(v => v.valor)) : 1;
  const maxServicio = serviciosPorTipo.length > 0 ? Math.max(...serviciosPorTipo.map(s => s.cantidad)) : 1;

  const kpis = [
    {
      icon: <IcBar   s={22} c="#0066ff" />,
      bg:   'rgba(0,102,255,0.10)',
      trend: 12, trendUp: true,
      value: estadisticas.serviciosRealizados,
      label: 'Servicios Realizados',
    },
    {
      icon: <IcMoney s={22} c="#00c853" />,
      bg:   'rgba(0,200,83,0.10)',
      trend: 18, trendUp: true,
      value: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(estadisticas.ingresosTotal),
      label: 'Ingresos Totales',
    },
    {
      icon: <IcUsers s={22} c="#f59e0b" />,
      bg:   'rgba(245,158,11,0.10)',
      trend: 8, trendUp: true,
      value: estadisticas.clientesAtendidos,
      label: 'Clientes Atendidos',
    },
    {
      icon: <IcStar  s={22} c="#7c3aed" />,
      bg:   'rgba(124,58,237,0.10)',
      trend: 2, trendUp: true,
      value: `${estadisticas.satisfaccion}%`,
      label: 'Satisfacción del Cliente',
    },
  ];

  return (
    <>
      <style>{`
        /* ── Variables ── */
        :root {
          --rp-primary:    #0066ff;
          --rp-primary-dk: #0052cc;
          --rp-primary-lt: #e6f2ff;
          --rp-bg:         #f0f4f8;
          --rp-surface:    #ffffff;
          --rp-text:       #1a2540;
          --rp-muted:      #8898b3;
          --rp-border:     #e0e8f5;
          --rp-shadow-sm:  0 2px 10px rgba(10,30,80,0.07);
          --rp-shadow-md:  0 6px 22px rgba(10,30,80,0.11);
          --rp-header-h:   64px;
          --rp-r-sm:       8px;
          --rp-r-md:       12px;
          --rp-r-lg:       18px;
          --rp-r-xl:       22px;
        }

        /* ── Page wrapper ── */
        .rp-page {
          min-height: 100vh;
          background: var(--rp-bg);
          padding-top: calc(var(--rp-header-h) + 36px);
          padding-bottom: 64px;
          font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .rp-wrap { max-width: 1320px; margin: 0 auto; padding: 0 28px; }

        /* ── Page header ── */
        .rp-page-head { margin-bottom: 32px; }
        .rp-page-title-row { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
        .rp-page-icon {
          width: 46px; height: 46px; background: var(--rp-primary-lt);
          border-radius: var(--rp-r-md);
          display: flex; align-items: center; justify-content: center;
          color: var(--rp-primary); flex-shrink: 0;
        }
        .rp-page-title {
          font-size: 28px; font-weight: 800;
          background: linear-gradient(135deg, var(--rp-primary), var(--rp-primary-dk));
          -webkit-background-clip: text; -webkit-text-fill-color: #0a1435;
          letter-spacing: -0.5px; margin: 0;
        }
        .rp-page-sub { font-size: 13px; color: var(--rp-muted); margin: 0; }

        /* ── Period filter ── */
        .rp-periods {
          display: flex; gap: 5px;
          background: var(--rp-surface); border: 1px solid var(--rp-border);
          border-radius: var(--rp-r-lg); padding: 5px;
          box-shadow: var(--rp-shadow-sm);
          margin-bottom: 32px;
          width: fit-content;
        }
        .rp-period-btn {
          padding: 9px 22px; border-radius: var(--rp-r-md); border: none;
          background: transparent; color: var(--rp-muted);
          font-weight: 600; font-size: 13.5px; font-family: inherit;
          cursor: pointer; transition: all 0.2s ease; text-transform: capitalize;
        }
        .rp-period-btn:hover { color: var(--rp-text); background: var(--rp-bg); }
        .rp-period-btn.active {
          background: linear-gradient(135deg, var(--rp-primary), var(--rp-primary-dk));
          color: #fff; box-shadow: 0 2px 10px rgba(0,102,255,0.28);
        }

        /* ── KPI grid ── */
        .rp-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
          margin-bottom: 26px;
        }

        .rp-kpi {
          background: var(--rp-surface);
          border: 1px solid var(--rp-border);
          border-radius: var(--rp-r-lg);
          padding: 22px;
          box-shadow: var(--rp-shadow-sm);
          display: flex; flex-direction: column; gap: 14px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: rpSlideUp 0.4s ease both;
        }
        @keyframes rpSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rp-kpi:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(0,102,255,0.12); }

        .rp-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .rp-kpi-icon-wrap {
          width: 48px; height: 48px; border-radius: var(--rp-r-md);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rp-kpi-trend {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .rp-kpi-trend.up   { background: #dcfce7; color: #15803d; }
        .rp-kpi-trend.down { background: #fee2e2; color: #b91c1c; }

        .rp-kpi-value {
          font-size: 2rem; font-weight: 800; color: var(--rp-text);
          letter-spacing: -0.5px; line-height: 1;
        }
        .rp-kpi-label { font-size: 12px; color: var(--rp-muted); font-weight: 500; }

        /* ── Charts row ── */
        .rp-charts-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .rp-card {
          background: var(--rp-surface);
          border: 1px solid var(--rp-border);
          border-radius: var(--rp-r-lg);
          box-shadow: var(--rp-shadow-sm);
          overflow: hidden;
        }

        .rp-card-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--rp-border);
          background: linear-gradient(135deg, rgba(0,102,255,0.03), rgba(0,184,255,0.03));
        }
        .rp-card-title {
          font-size: 16px; font-weight: 700; color: var(--rp-text); margin: 0;
        }
        .rp-card-body { padding: 22px 24px; }

        /* ── Bar chart ── */
        .rp-bar-chart {
          display: flex; align-items: flex-end; justify-content: space-around;
          height: 220px; gap: 10px; padding-top: 16px;
        }
        .rp-bar-col {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
          height: 100%; justify-content: flex-end;
        }
        .rp-bar-value {
          font-size: 10px; font-weight: 700; color: var(--rp-primary);
          text-align: center; margin-bottom: 2px;
        }
        .rp-bar {
          width: 100%; border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, rgba(0,184,255,0.85), rgba(0,102,255,0.85));
          transition: opacity 0.2s, filter 0.2s; cursor: pointer;
          min-height: 4px; box-shadow: 0 -2px 8px rgba(0,102,255,0.2);
        }
        .rp-bar:hover { opacity: 0.82; filter: brightness(1.1); }
        .rp-bar-label {
          font-size: 10px; font-weight: 600; color: var(--rp-muted);
          margin-top: 4px; text-align: center; width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── Service bars ── */
        .rp-service-rows { display: flex; flex-direction: column; gap: 18px; }
        .rp-service-row  {}
        .rp-service-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .rp-service-name { font-size: 13.5px; font-weight: 600; color: var(--rp-text); }
        .rp-service-count { font-size: 13.5px; font-weight: 800; }
        .rp-service-track {
          width: 100%; height: 10px; background: var(--rp-bg);
          border-radius: 6px; overflow: hidden;
        }
        .rp-service-fill {
          height: 100%; border-radius: 6px;
          transition: width 0.6s cubic-bezier(.34,1.56,.64,1);
        }

        /* ── Employee table ── */
        .rp-table-wrap {
          background: var(--rp-surface);
          border: 1px solid var(--rp-border);
          border-radius: var(--rp-r-lg);
          box-shadow: var(--rp-shadow-sm);
          overflow: hidden;
        }
        .rp-table-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--rp-border);
          background: linear-gradient(135deg, rgba(0,102,255,0.03), rgba(0,184,255,0.03));
        }
        .rp-table-title { font-size: 16px; font-weight: 700; color: var(--rp-text); margin: 0; }
        .rp-table {
          width: 100%; border-collapse: collapse;
        }
        .rp-table th {
          padding: 12px 24px;
          text-align: left; font-size: 11px; font-weight: 700;
          color: var(--rp-muted); text-transform: uppercase; letter-spacing: 0.6px;
          background: var(--rp-bg); border-bottom: 1px solid var(--rp-border);
        }
        .rp-table td {
          padding: 14px 24px;
          font-size: 14px; color: var(--rp-text);
          border-bottom: 1px solid var(--rp-border);
        }
        .rp-table tr:last-child td { border-bottom: none; }
        .rp-table tbody tr:hover td { background: rgba(0,102,255,0.03); }
        .rp-emp-name { font-weight: 700; }
        .rp-emp-badge {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
          background: rgba(0,102,255,0.10); color: var(--rp-primary);
        }

        .rp-loading {
          display: flex; align-items: center; justify-content: center;
          padding: 64px 20px; color: var(--rp-muted); font-size: 14px;
          font-family: inherit;
        }

        @media (max-width: 1024px) { .rp-charts-row { grid-template-columns: 1fr; } }
        @media (max-width: 768px)  {
          .rp-wrap { padding: 0 16px; }
          .rp-kpi-grid { grid-template-columns: 1fr 1fr; }
          .rp-page-title { font-size: 22px; }
        }
        @media (max-width: 480px) { .rp-kpi-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="rp-page">
        <div className="rp-wrap">

          {/* Page header */}
          <div className="rp-page-head">
            <div className="rp-page-title-row">
              <div className="rp-page-icon"><IcBar s={22} c="#0066ff" /></div>
              <div>
                <h1 className="rp-page-title">Reportes y Análisis</h1>
                <p className="rp-page-sub">Visualiza el rendimiento de tu empresa</p>
              </div>
            </div>
          </div>

          {/* Period filter */}
          <div className="rp-periods">
            {['semanal','mensual','trimestral','anual'].map((p) => (
              <button key={p} className={`rp-period-btn${periodoActivo === p ? ' active' : ''}`} onClick={() => setPeriodoActivo(p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {loading && <div className="rp-loading">Cargando datos...</div>}

          {!loading && (
            <>
              {/* KPIs */}
              <div className="rp-kpi-grid">
                {kpis.map((k, i) => (
                  <div className="rp-kpi" key={i} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="rp-kpi-top">
                      <div className="rp-kpi-icon-wrap" style={{ background: k.bg }}>{k.icon}</div>
                      <span className={`rp-kpi-trend${k.trendUp ? ' up' : ' down'}`}>
                        {k.trendUp ? <IcTrend s={12} c="#15803d" /> : <IcTrendD s={12} c="#b91c1c" />}
                        +{k.trend}%
                      </span>
                    </div>
                    <div>
                      <div className="rp-kpi-value">{k.value}</div>
                      <div className="rp-kpi-label">{k.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="rp-charts-row">

                {/* Ingresos por período */}
                <div className="rp-card">
                  <div className="rp-card-head">
                    <h3 className="rp-card-title">
                      Ingresos {periodoActivo === 'semanal' ? 'Semanales' : periodoActivo === 'mensual' ? 'Mensuales' : periodoActivo === 'trimestral' ? 'Trimestrales' : 'Anuales'}
                    </h3>
                  </div>
                  <div className="rp-card-body">
                    {ventasPorMes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--rp-muted)', fontSize: 13 }}>
                        Sin datos para este período
                      </div>
                    ) : (
                      <div className="rp-bar-chart">
                        {ventasPorMes.map((item, idx) => {
                          const h = maxVenta > 0 ? Math.max((item.valor / maxVenta) * 200, 4) : 4;
                          return (
                            <div key={idx} className="rp-bar-col">
                              <div className="rp-bar-value">${(item.valor / 1000).toFixed(0)}k</div>
                              <div className="rp-bar" style={{ height: `${h}px` }} title={`${item.periodo}: $${item.valor.toLocaleString('es-CO')}`} />
                              <div className="rp-bar-label">{item.periodo}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Servicios por tipo */}
                <div className="rp-card">
                  <div className="rp-card-head">
                    <h3 className="rp-card-title">Servicios por Tipo</h3>
                  </div>
                  <div className="rp-card-body">
                    {serviciosPorTipo.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--rp-muted)', fontSize: 13 }}>
                        Sin datos disponibles
                      </div>
                    ) : (
                      <div className="rp-service-rows">
                        {serviciosPorTipo.map((s, i) => {
                          const pct = maxServicio > 0 ? Math.max((s.cantidad / maxServicio) * 100, 2) : 2;
                          return (
                            <div key={i} className="rp-service-row">
                              <div className="rp-service-meta">
                                <span className="rp-service-name">{s.nombre}</span>
                                <span className="rp-service-count" style={{ color: s.color }}>{s.cantidad}</span>
                              </div>
                              <div className="rp-service-track">
                                <div className="rp-service-fill" style={{ width: `${pct}%`, background: s.color }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee table */}
              <div className="rp-table-wrap">
                <div className="rp-table-head">
                  <h3 className="rp-table-title">Rendimiento de Empleados</h3>
                </div>
                {rendimientoEmpleados.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--rp-muted)', fontSize: 13 }}>
                    Sin datos de empleados
                  </div>
                ) : (
                  <table className="rp-table">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Servicios Realizados</th>
                        <th>Satisfacción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rendimientoEmpleados.map((emp, i) => (
                        <tr key={i}>
                          <td><span className="rp-emp-name">{emp.nombre}</span></td>
                          <td><span className="rp-emp-badge">{emp.servicios}</span></td>
                          <td style={{ color: 'var(--rp-muted)' }}>{emp.satisfaccion.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      <FooterAdmin
        onGoDashboard={onGoDashboard} onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados} onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}       onLogout={onLogout}
      />
    </>
  );
};

export default ReportesAdmin;