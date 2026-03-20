// =============================================================================
// ARCHIVO  : AdminDashboard.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/AdminDashboard.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Panel principal del administrador. Muestra KPIs, últimas reservas y empleados activos.
// =============================================================================

import React, { useState, useEffect } from "react";
import HeaderAdmin from './HeaderAdmin';
import FooterAdmin from './FooterAdmin';
import api from '../../services/api';

const AdminDashboard = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onGoUsuarios,
  onGoServicios,
  onLogout,
}) => {
  const [kpiData,         setKpiData]         = useState([
    { number: "...", label: "Total clientes",    icon: "👥" },
    { number: "...", label: "Total reservas",    icon: "📋" },
    { number: "...", label: "Pendientes",        icon: "⏳" },
    { number: "...", label: "Ingresos totales",  icon: "💰" },
  ]);
  const [ordersToday,     setOrdersToday]     = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [isLoading,       setIsLoading]       = useState(true);

  const formatCOP = (valor) => {
    if (!valor || valor === 0) return '$0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(valor);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // FIX: /reservas/analytics/ingresos no existe → usar /estadisticas
        const [resStats, resReservas, resEmpleados] = await Promise.all([
          api.get('/estadisticas'),
          api.get('/reservas'),
          api.get('/empleados'),
        ]);

        const stats    = resStats.data           || {};
        // FIX: reservas vienen en resReservas.data.data (respuesta con wrapper)
        const reservas = resReservas.data?.data  || resReservas.data || [];
        const empleados = resEmpleados.data?.data || [];

        setKpiData([
          { number: String(stats.Total_Clientes    ?? '—'), label: "Total clientes",   icon: "👥" },
          { number: String(stats.Total_Reservas    ?? '—'), label: "Total reservas",   icon: "📋" },
          { number: String(stats.Reservas_Pendientes ?? '—'), label: "Pendientes",     icon: "⏳" },
          { number: formatCOP(stats.Ingresos_Totales),        label: "Ingresos totales", icon: "💰" },
        ]);

        // Últimas 6 reservas para la tabla
        const lista = Array.isArray(reservas) ? reservas : [];
        setOrdersToday(lista.slice(0, 6).map(r => ({
          service:        r.servicios?.[0]?.Nombre_Servicio || r.Informacion_adicional || 'Servicio',
          time:           r.Hora?.slice(0, 5) || '--:--',
          status:         r.Estado,
          clientInitials: (r.cliente?.Nombre || 'CL').slice(0, 2).toUpperCase(),
          clientName:     r.cliente?.Nombre || 'Cliente',
        })));

        // Empleados activos
        const empActivos = empleados.filter(e => e.estado === 'activo');
        setActiveEmployees(empActivos.slice(0, 4).map(e => ({
          name:     e.Nombre   || 'Empleado',
          phone:    e.Telefono || '—',
          initials: (e.Nombre  || 'EM').slice(0, 2).toUpperCase(),
        })));

      } catch (err) {
        console.error('Error cargando dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const quickActions = [
    { label: "Ver agenda",   icon: "📅", action: () => onGoAgenda?.()    },
    { label: "Empleados",    icon: "👥", action: () => onGoEmpleados?.() },
    { label: "Ver reportes", icon: "📊", action: () => onGoReportes?.()  },
    { label: "Mi perfil",    icon: "👤", action: () => onGoPerfil?.()    },
  ];

  const getStatusColor = (status) => {
    const map = {
      'En proceso': '#10B981', 'En Proceso': '#10B981',
      'Programada': '#F59E0B', 'Pendiente':  '#F59E0B',
      'Completado': '#3B82F6', 'Completada': '#3B82F6',
      'Cancelado':  '#EF4444',
    };
    return map[status] || '#6B7280';
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <HeaderAdmin
        onGoDashboard={onGoDashboard} onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados} onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil} onGoUsuarios={onGoUsuarios}
        onGoServicios={onGoServicios} onLogout={onLogout}
        activeTab="panel"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16, marginBottom: 28 }}>
          {kpiData.map((kpi, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 32 }}>{kpi.icon}</span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>{isLoading ? '...' : kpi.number}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Últimas reservas */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>📋 Últimas reservas</h2>
            {isLoading ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Cargando...</p>
            ) : ordersToday.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No hay reservas</p>
            ) : ordersToday.map((order, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < ordersToday.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#223BFF', flexShrink: 0 }}>
                  {order.clientInitials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{order.service}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{order.clientName} · {order.time}</div>
                </div>
                <span style={{ background: getStatusColor(order.status) + '20', color: getStatusColor(order.status), padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>

          {/* Empleados activos */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>👥 Empleados activos</h2>
            {isLoading ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>Cargando...</p>
            ) : activeEmployees.length === 0 ? (
              <p style={{ color: '#9CA3AF', textAlign: 'center', padding: 20 }}>No hay empleados</p>
            ) : activeEmployees.map((emp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < activeEmployees.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#223BFF', flexShrink: 0 }}>
                  {emp.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{emp.name}</div>
                </div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{emp.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a2e' }}>⚡ Acciones Rápidas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12 }}>
            {quickActions.map((action, i) => (
              <button key={i} onClick={action.action}
                style={{ padding: '14px', background: '#f8f9ff', border: '2px solid #e8eeff', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8eeff'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8f9ff'}
              >
                <span style={{ fontSize: 20 }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <FooterAdmin />
    </div>
  );
};

export default AdminDashboard;
