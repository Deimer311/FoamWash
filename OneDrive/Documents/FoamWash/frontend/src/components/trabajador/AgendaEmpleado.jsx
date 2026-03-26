// =============================================================================
// ARCHIVO  : AgendaEmpleado.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/AgendaEmpleado.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Agenda del trabajador con sus servicios del día, semana, completados y pendientes.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import FooterEmpleado from './FooterEmpleado';

const AgendaEmpleado = ({ onGoPanelEmpleado, onGoAgendaEmpleado, onGoPerfil }) => {
  const { user } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState('hoy');
  const [busqueda, setBusqueda]         = useState('');
  const [ordenes, setOrdenes]           = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetchReservas(filtroActivo);
  }, [filtroActivo, user]);

  const fetchReservas = async (filtro) => {
    setIsLoading(true);
    setError('');
    try {
      // FIX: /empleados/:id/reservas/:filtro no existe en el backend.
      // Endpoints reales disponibles:
      //   GET /empleados/:id/servicios-hoy
      //   GET /empleados/:id/agenda-semanal   (cubre semana, completadas, pendientes)
      let endpoint;
      if (filtro === 'hoy') {
        endpoint = `/empleados/${user.id}/servicios-hoy`;
      } else {
        // semana / completadas / pendientes → traer semana y filtrar localmente
        endpoint = `/empleados/${user.id}/agenda-semanal`;
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        let data = response.data.data || [];

        // Filtrar localmente según el tipo seleccionado
        if (filtro === 'completadas') {
          data = data.filter(r => r.Estado === 'Completado');
        } else if (filtro === 'pendientes') {
          data = data.filter(r => r.Estado === 'Pendiente' || r.Estado === 'En Proceso');
        }

        const normalized = data.map(r => ({
          id:            r.ID_Reserva,
          cliente:       r.cliente?.Nombre              || 'Sin nombre',
          servicio:      r.servicios?.[0]?.Nombre_Servicio || 'Sin servicio',
          fecha:         r.fecha ? new Date(r.fecha).toLocaleDateString('es-CO') : '—',
          direccion:     r.cliente?.Direccion            || 'Sin dirección',
          telefono:      r.cliente?.Telefono             || 'Sin teléfono',
          estado:        r.Estado,
          hora:          r.Hora,
          precio:        r.servicios?.[0]?.Precio        || null,
          observaciones: r.Informacion_adicional         || '',
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

  // FIX: usar PATCH /reservas/:id/estado (endpoint real del backend)
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
    serviciosHoy:    filtroActivo === 'hoy'         ? ordenes.length : 0,
    serviciosSemana: filtroActivo === 'semana'       ? ordenes.length : 0,
    completados:     filtroActivo === 'completadas'  ? ordenes.length : 0,
    pendientes:      filtroActivo === 'pendientes'   ? ordenes.length : 0,
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

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado': return '#10B981';
      case 'Pendiente':  return '#F59E0B';
      case 'En Proceso': return '#3B82F6';
      case 'Cancelado':  return '#EF4444';
      default:           return '#6B7280';
    }
  };

  const getTituloFiltro = () => {
    const map = { hoy: 'Servicios de hoy', semana: 'Servicios esta semana', completadas: 'Servicios completados', pendientes: 'Servicios pendientes' };
    return map[filtroActivo] || 'Servicios';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)' }}>
      <style>{`
        .empleado-agenda-wrapper { flex: 1; padding: 2rem 1.5rem; max-width: 1400px; margin: 0 auto; width: 100%; }
        .search-bar { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 2rem; border: 1px solid #E5E8EB; }
        .search-input { width: 100%; padding: 0.875rem 1rem; border: 2px solid #E5E8EB; border-radius: 12px; font-size: 0.95rem; outline: none; transition: border-color 0.3s; }
        .search-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        .section-title { font-size: 2rem; font-weight: 800; color: #1a1a1a; margin-bottom: 1.75rem; text-align: center; background: linear-gradient(135deg, #3B82F6 0%, #0052CC 50%, #10B981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .filters-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem; }
        .filter-card { background: white; padding: 1.5rem; border-radius: 14px; cursor: pointer; transition: all 0.3s; border: 2px solid #E5E8EB; text-align: center; }
        .filter-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .filter-card.active { border-color: #3B82F6; background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(0,200,83,0.06)); }
        .filter-number { font-size: 2rem; font-weight: 800; color: #3B82F6; margin-bottom: 0.5rem; }
        .filter-label { font-size: 0.95rem; color: #666; font-weight: 600; }
        .services-section { margin-bottom: 2rem; }
        .services-section h3 { font-size: 1.5rem; font-weight: 700; color: #1a1a1a; margin-bottom: 1.5rem; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
        .service-card { background: white; border-radius: 14px; padding: 1.75rem; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #E5E8EB; transition: all 0.3s; }
        .service-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .service-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 1rem; }
        .client-name { font-size: 1.15rem; font-weight: 700; color: #1a1a1a; }
        .status-badge { padding: 0.375rem 0.875rem; border-radius: 20px; font-size: 0.8rem; font-weight: 700; white-space: nowrap; }
        .service-name { font-size: 0.95rem; color: #3B82F6; font-weight: 600; margin-bottom: 1rem; }
        .contact-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
        .contact-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .contact-item strong { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        .contact-item span { font-size: 0.9rem; color: #1a1a1a; font-weight: 600; }
        .observations { margin-top: 1rem; padding: 0.875rem; background: #F0F2F5; border-radius: 8px; border-left: 3px solid #10B981; }
        .observations-title { font-size: 0.75rem; color: #666; text-transform: uppercase; font-weight: 700; margin-bottom: 0.375rem; }
        .estado-select { margin-top: 1rem; width: 100%; padding: 0.5rem; border: 1.5px solid #E5E8EB; border-radius: 8px; font-size: 0.9rem; cursor: pointer; }
        .empty-state { text-align: center; padding: 5rem 2rem; background: white; border-radius: 18px; border: 1px solid #E5E8EB; }
        .loading-state { text-align: center; padding: 5rem 2rem; color: #666; font-size: 1.1rem; font-weight: 600; }
        .error-state { text-align: center; padding: 3rem 2rem; color: #EF4444; font-weight: 600; background: #FEF2F2; border-radius: 12px; border: 1px solid #FECACA; }
      `}</style>

      <div className="empleado-agenda-wrapper">
        <div className="search-bar">
          <input type="text" className="search-input"
            placeholder="🔍 Buscar por cliente, servicio o dirección..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>

        <h2 className="section-title">Órdenes</h2>

        <div className="filters-grid">
          {[
            { key: 'hoy',         label: 'Servicios de hoy' },
            { key: 'semana',      label: 'Esta semana' },
            { key: 'completadas', label: 'Completados' },
            { key: 'pendientes',  label: 'Pendientes' },
          ].map(({ key, label }) => (
            <div key={key} className={`filter-card ${filtroActivo === key ? 'active' : ''}`} onClick={() => setFiltroActivo(key)}>
              <div className="filter-number">{filtroActivo === key ? ordenes.length : '—'}</div>
              <div className="filter-label">{label}</div>
            </div>
          ))}
        </div>

        <div className="services-section">
          <h3>{getTituloFiltro()}</h3>

          {isLoading ? (
            <div className="loading-state">⏳ Cargando reservas...</div>
          ) : error ? (
            <div className="error-state">❌ {error}</div>
          ) : ordenesFiltradas.length > 0 ? (
            <div className="services-grid">
              {ordenesFiltradas.map((orden) => (
                <div key={orden.id} className="service-card">
                  <div className="service-header">
                    <div className="client-name">{orden.cliente}</div>
                    <div className="status-badge" style={{ background: getEstadoColor(orden.estado) + '20', color: getEstadoColor(orden.estado) }}>
                      {orden.estado}
                    </div>
                  </div>
                  <div className="service-name">🧹 {orden.servicio}</div>
                  <div className="contact-info">
                    <div className="contact-item"><strong>Fecha:</strong><span>{orden.fecha}</span></div>
                    <div className="contact-item"><strong>Hora:</strong><span>{orden.hora || 'N/A'}</span></div>
                    <div className="contact-item"><strong>Dirección:</strong><span>{orden.direccion}</span></div>
                    <div className="contact-item"><strong>Tel:</strong><span>{orden.telefono}</span></div>
                    {orden.precio && <div className="contact-item"><strong>Precio:</strong><span>${Number(orden.precio).toLocaleString()}</span></div>}
                  </div>
                  {orden.observaciones && (
                    <div className="observations">
                      <div className="observations-title">Observaciones</div>
                      <div>{orden.observaciones}</div>
                    </div>
                  )}
                  {orden.estado !== 'Completado' && orden.estado !== 'Cancelado' && (
                    <select className="estado-select" value={orden.estado}
                      onChange={(e) => handleCambiarEstado(orden.id, e.target.value)}>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '4.5rem', opacity: 0.7, marginBottom: '1.5rem' }}>📭</div>
              <div style={{ fontSize: '1.15rem', color: '#666', fontWeight: 600 }}>No hay {getTituloFiltro().toLowerCase()}</div>
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
    </div>
  );
};

export default AgendaEmpleado;
