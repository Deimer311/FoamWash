// =============================================================================
// ARCHIVO  : ReportesAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/ReportesAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Panel de reportes con estadísticas y gráficas del negocio.
// =============================================================================

import React, { useState, useEffect } from 'react';
import FooterAdmin from './FooterAdmin';
import api from '../../services/api';

const ReportesAdmin = ({
  onGoDashboard,
  onGoAgenda,
  onGoEmpleados,
  onGoReportes,
  onGoPerfil,
  onLogout,
  onOpenReportes
}) => {
  const [periodoActivo, setPeriodoActivo] = useState('mensual');
  const [estadisticas, setEstadisticas] = useState({
    serviciosRealizados: 0,
    ingresosTotal: 0,
    clientesAtendidos: 0,
    satisfaccion: 0
  });
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [serviciosPorTipo, setServiciosPorTipo] = useState([]);
  const [rendimientoEmpleados, setRendimientoEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) KPIs principales
        const estadisticasRes = await api.get(`/estadisticas?periodo=${periodoActivo}`);
        const kpis = estadisticasRes.data?.data || estadisticasRes.data || {};

        setEstadisticas({
          serviciosRealizados: kpis.Reservas_Completadas ?? kpis.precio_total ?? 0,
          ingresosTotal: kpis.Ingresos_Totales ?? (kpis.ingresos || 0),
          clientesAtendidos: kpis.Total_Clientes ?? 0,
          satisfaccion: kpis.satisfaccion ?? 95
        });

        // 2) Productividad empleados
        const empleadosRes = await api.get('/empleados/productividad/general');
        const empleados = empleadosRes.data?.data || empleadosRes.data || [];
        setRendimientoEmpleados(empleados.map((emp) => ({
          nombre: emp.Nombre || `Empleado ${emp.Id_Usuario}`,
          servicios: emp._count?.reservasComoEmpleado ?? 0,
          satisfaccion: 90 + (emp._count?.reservasComoEmpleado ?? 0) * 0.1
        })));

        // 3) Servicios más solicitados
        const serviciosRes = await api.get('/servicios/analytics/mas-solicitados');
        const servicios = serviciosRes.data?.data || serviciosRes.data || [];
        setServiciosPorTipo(servicios.map((serv, idx) => ({
          nombre: serv.Nombre_Servicio || serv.nombre || 'Servicio',
          cantidad: serv._count?.reserva?.length ?? serv._count?.reserva ?? 0,
          color: ['#0066FF', '#00C853', '#FF9800', '#F44336', '#9C27B0'][idx % 5]
        })));

        // 4) /cotizaciones para ingresos por período
        const cotizacionesRes = await api.get('/cotizaciones');
        const cotizaciones = cotizacionesRes.data?.data || cotizacionesRes.data || [];

        // 5) /reservas para contar por período (opcional)
        const reservasRes = await api.get('/reservas');
        const reservas = reservasRes.data?.data || reservasRes.data || [];

        // Agrupa cotizaciones por periodo
        const now = new Date();
        let startDate = new Date();
        let groupBy = 'month';

        if (periodoActivo === 'semanal') {
          startDate.setDate(now.getDate() - 7);
          groupBy = 'day';
        } else if (periodoActivo === 'mensual') {
          startDate.setMonth(now.getMonth() - 1);
          groupBy = 'week';
        } else if (periodoActivo === 'trimestral') {
          startDate.setMonth(now.getMonth() - 3);
          groupBy = 'month';
        } else if (periodoActivo === 'anual') {
          startDate.setFullYear(now.getFullYear() - 1);
          groupBy = 'month';
        }

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
              const firstDayOfWeek = new Date(d);
              firstDayOfWeek.setDate(d.getDate() - d.getDay());
              key = firstDayOfWeek.toISOString().slice(0, 10);
            } else {
              key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            }
            ingresosPorPeriodo[key] = (ingresosPorPeriodo[key] || 0) + Number(cot.Precio_cotizado ?? cot.Precio ?? 0);
          });

        setVentasPorMes(Object.entries(ingresosPorPeriodo).map(([periodo, valor]) => ({ periodo, valor })).sort((a, b) => a.periodo.localeCompare(b.periodo)));
      } catch (error) {
        console.error('Error fetching report data:', error);
        setEstadisticas({ serviciosRealizados: 0, ingresosTotal: 0, clientesAtendidos: 0, satisfaccion: 0 });
        setVentasPorMes([]);
        setServiciosPorTipo([]);
        setRendimientoEmpleados([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [periodoActivo]);

  const maxVenta = ventasPorMes.length > 0 ? Math.max(...ventasPorMes.map(v => v.valor)) : 1;
  const maxServicio = serviciosPorTipo.length > 0 ? Math.max(...serviciosPorTipo.map(s => s.cantidad)) : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Contenido principal */}
      <div style={{ flex: 1, background: '#F8F9FA', padding: '40px 20px' }}>
        <div style={{maxWidth: '1400px', margin: '0 auto'}}>
          
          {/* Header */}
          <div style={{marginBottom: '40px'}}>
            <h1 style={{fontSize: '36px', fontWeight: '700', margin: '0 0 8px 0', color: '#1a1a1a'}}>
              Reportes y Análisis
            </h1>
            <p style={{color: '#666', fontSize: '16px', margin: 0}}>
              Visualiza el rendimiento de tu empresa
            </p>
          </div>

          {/* Filtros de Período */}
          <div style={{display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center'}}>
            {['semanal', 'mensual', 'trimestral', 'anual'].map((periodo) => (
              <button
                key={periodo}
                onClick={() => setPeriodoActivo(periodo)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: periodoActivo === periodo ? 'none' : '2px solid #E0E0E0',
                  background: periodoActivo === periodo ? 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)' : 'white',
                  color: periodoActivo === periodo ? 'white' : '#1a1a1a',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize'
                }}
              >
                {periodo}
              </button>
            ))}
          </div>

          {loading && <p>Cargando datos...</p>}

          {/* Cards de Estadísticas Principales */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px'}}>
            <div style={{background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <div style={{width: '48px', height: '48px', background: '#E6F2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '24px'}}>📊</span>
                </div>
                <span style={{background: '#E8F5E9', color: '#388e3c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                  +12%
                </span>
              </div>
              <h3 style={{fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a'}}>
                {estadisticas.serviciosRealizados}
              </h3>
              <p style={{color: '#666', fontSize: '14px', margin: 0}}>Servicios Realizados</p>
            </div>

            <div style={{background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <div style={{width: '48px', height: '48px', background: '#E8F5E9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '24px'}}>💰</span>
                </div>
                <span style={{background: '#E8F5E9', color: '#388e3c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                  +18%
                </span>
              </div>
              <h3 style={{fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a'}}>
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(estadisticas.ingresosTotal)}
              </h3>
              <p style={{color: '#666', fontSize: '14px', margin: 0}}>Ingresos Totales</p>
            </div>

            <div style={{background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <div style={{width: '48px', height: '48px', background: '#FFF3E0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '24px'}}>👥</span>
                </div>
                <span style={{background: '#E8F5E9', color: '#388e3c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                  +8%
                </span>
              </div>
              <h3 style={{fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a'}}>
                {estadisticas.clientesAtendidos}
              </h3>
              <p style={{color: '#666', fontSize: '14px', margin: 0}}>Clientes Atendidos</p>
            </div>

            <div style={{background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <div style={{width: '48px', height: '48px', background: '#F3E5F5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span style={{fontSize: '24px'}}>⭐</span>
                </div>
                <span style={{background: '#E8F5E9', color: '#388e3c', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                  +2%
                </span>
              </div>
              <h3 style={{fontSize: '32px', fontWeight: '700', margin: '0 0 4px 0', color: '#1a1a1a'}}>
                {estadisticas.satisfaccion}%
              </h3>
              <p style={{color: '#666', fontSize: '14px', margin: 0}}>Satisfacción del Cliente</p>
            </div>
          </div>

          {/* Gráficos Principales */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '40px'}}>
            
            {/* Gráfico de Ventas por Mes */}
            <div style={{background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <h3 style={{fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0', color: '#1a1a1a'}}>
                Ingresos {periodoActivo === 'semanal' ? 'Semanales' : periodoActivo === 'mensual' ? 'Mensuales' : periodoActivo === 'trimestral' ? 'Trimestrales' : 'Anuales'}
              </h3>
              <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '300px', gap: '12px', paddingTop: '20px'}}>
                {ventasPorMes.map((item, index) => {
                  const altura = maxVenta > 0 ? (item.valor / maxVenta) * 280 : 0;
                  return (
                    <div key={index} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end'}}>
                      <span style={{fontSize: '12px', fontWeight: '600', color: '#0066FF', marginBottom: '4px'}}>
                        ${(item.valor / 1000).toFixed(0)}k
                      </span>
                      <div 
                        style={{
                          width: '100%',
                          height: `${altura}px`,
                          background: 'linear-gradient(180deg, #0066FF 0%, #00C853 100%)',
                          borderRadius: '8px 8px 0 0',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          minHeight: '20px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      />
                      <span style={{fontSize: '12px', fontWeight: '600', color: '#666', marginTop: '8px'}}>
                        {item.periodo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico de Servicios por Tipo */}
            <div style={{background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0'}}>
              <h3 style={{fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0', color: '#1a1a1a'}}>
                Servicios por Tipo
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {serviciosPorTipo.map((servicio, index) => {
                  const porcentaje = maxServicio > 0 ? (servicio.cantidad / maxServicio) * 100 : 0;
                  return (
                    <div key={index}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <span style={{fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>
                          {servicio.nombre}
                        </span>
                        <span style={{fontSize: '14px', fontWeight: '700', color: servicio.color}}>
                          {servicio.cantidad}
                        </span>
                      </div>
                      <div style={{width: '100%', height: '12px', background: '#F8F9FA', borderRadius: '6px', overflow: 'hidden'}}>
                        <div 
                          style={{
                            width: `${porcentaje}%`,
                            height: '100%',
                            background: servicio.color,
                            borderRadius: '6px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rendimiento de Empleados */}
          <div style={{background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0', marginBottom: '40px'}}>
            <h3 style={{fontSize: '20px', fontWeight: '700', margin: '0 0 24px 0', color: '#1a1a1a'}}>
              Rendimiento de Empleados
            </h3>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{borderBottom: '2px solid #E0E0E0'}}>
                    <th style={{padding: '16px', textAlign: 'left', fontWeight: '600', color: '#666', fontSize: '14px'}}>
                      Empleado
                    </th>
                    <th style={{padding: '16px', textAlign: 'left', fontWeight: '600', color: '#666', fontSize: '14px'}}>
                      Servicios Realizados
                    </th>
                    <th style={{padding: '16px', textAlign: 'left', fontWeight: '600', color: '#666', fontSize: '14px'}}>
                      Satisfacción (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rendimientoEmpleados.map((empleado, index) => (
                    <tr key={index} style={{borderBottom: '1px solid #E0E0E0'}}>
                      <td style={{padding: '16px', fontWeight: '600', color: '#1a1a1a'}}>
                        {empleado.nombre}
                      </td>
                      <td style={{padding: '16px', color: '#666'}}>
                        {empleado.servicios}
                      </td>
                      <td style={{padding: '16px', color: '#666'}}>
                        {empleado.satisfaccion.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <FooterAdmin
        onGoDashboard={onGoDashboard}
        onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados}
        onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}
        onLogout={onLogout}
      />
    </div>
  );
};

export default ReportesAdmin;