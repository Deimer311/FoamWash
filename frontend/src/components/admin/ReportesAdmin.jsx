import React, { useState } from 'react';
import FooterAdmin from './FooterAdmin';

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

  // Datos por período
  const datosPorPeriodo = {
    semanal: {
      estadisticas: {
        serviciosRealizados: 38,
        ingresosTotal: '$1,150,000',
        clientesAtendidos: 22,
        satisfaccion: 95
      },
      ventas: [
        { periodo: 'Lun', valor: 150000 },
        { periodo: 'Mar', valor: 180000 },
        { periodo: 'Mié', valor: 220000 },
        { periodo: 'Jue', valor: 190000 },
        { periodo: 'Vie', valor: 240000 },
        { periodo: 'Sáb', valor: 170000 }
      ]
    },
    mensual: {
      estadisticas: {
        serviciosRealizados: 156,
        ingresosTotal: '$4,850,000',
        clientesAtendidos: 89,
        satisfaccion: 94
      },
      ventas: [
        { periodo: 'Ene', valor: 350000 },
        { periodo: 'Feb', valor: 420000 },
        { periodo: 'Mar', valor: 580000 },
        { periodo: 'Abr', valor: 650000 },
        { periodo: 'May', valor: 720000 },
        { periodo: 'Jun', valor: 850000 }
      ]
    },
    trimestral: {
      estadisticas: {
        serviciosRealizados: 468,
        ingresosTotal: '$14,550,000',
        clientesAtendidos: 267,
        satisfaccion: 93
      },
      ventas: [
        { periodo: 'Q1', valor: 1350000 },
        { periodo: 'Q2', valor: 2220000 },
        { periodo: 'Q3', valor: 2650000 },
        { periodo: 'Q4', valor: 3330000 }
      ]
    },
    anual: {
      estadisticas: {
        serviciosRealizados: 1872,
        ingresosTotal: '$58,200,000',
        clientesAtendidos: 1068,
        satisfaccion: 92
      },
      ventas: [
        { periodo: '2020', valor: 8500000 },
        { periodo: '2021', valor: 11200000 },
        { periodo: '2022', valor: 14800000 },
        { periodo: '2023', valor: 16900000 },
        { periodo: '2024', valor: 18600000 }
      ]
    }
  };

  const estadisticas = datosPorPeriodo[periodoActivo].estadisticas;
  const ventasPorMes = datosPorPeriodo[periodoActivo].ventas;

  const serviciosPorTipo = [
    { nombre: 'Lavado de Muebles', cantidad: 45, color: '#0066FF' },
    { nombre: 'Limpieza de Alfombras', cantidad: 38, color: '#00C853' },
    { nombre: 'Lavado de Cortinas', cantidad: 32, color: '#FF9800' },
    { nombre: 'Limpieza de Vidrios', cantidad: 25, color: '#F44336' },
    { nombre: 'Otros Servicios', cantidad: 16, color: '#9C27B0' }
  ];

  const rendimientoEmpleados = [
    { nombre: 'Edilberto González', servicios: 52, satisfaccion: 96 },
    { nombre: 'Juan Andrés', servicios: 48, satisfaccion: 94 },
    { nombre: 'Pedro Martínez', servicios: 56, satisfaccion: 92 }
  ];

  const maxVenta = Math.max(...ventasPorMes.map(v => v.valor));
  const maxServicio = Math.max(...serviciosPorTipo.map(s => s.cantidad));

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
              {estadisticas.ingresosTotal}
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
                const altura = (item.valor / maxVenta) * 280;
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
                const porcentaje = (servicio.cantidad / maxServicio) * 100;
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
                    Satisfacción del Cliente
                  </th>
                  <th style={{padding: '16px', textAlign: 'left', fontWeight: '600', color: '#666', fontSize: '14px'}}>
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody>
                {rendimientoEmpleados.map((empleado, index) => (
                  <tr key={index} style={{borderBottom: '1px solid #F0F0F0'}}>
                    <td style={{padding: '20px 16px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600'}}>
                          {empleado.nombre.charAt(0)}
                        </div>
                        <span style={{fontWeight: '600', color: '#1a1a1a'}}>
                          {empleado.nombre}
                        </span>
                      </div>
                    </td>
                    <td style={{padding: '20px 16px'}}>
                      <span style={{fontSize: '18px', fontWeight: '700', color: '#0066FF'}}>
                        {empleado.servicios}
                      </span>
                    </td>
                    <td style={{padding: '20px 16px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <div style={{flex: 1, height: '8px', background: '#F8F9FA', borderRadius: '4px', overflow: 'hidden'}}>
                          <div 
                            style={{
                              width: `${empleado.satisfaccion}%`,
                              height: '100%',
                              background: empleado.satisfaccion >= 95 ? '#00C853' : empleado.satisfaccion >= 90 ? '#FF9800' : '#F44336',
                              borderRadius: '4px'
                            }}
                          />
                        </div>
                        <span style={{fontSize: '14px', fontWeight: '700', color: '#1a1a1a', minWidth: '40px'}}>
                          {empleado.satisfaccion}%
                        </span>
                      </div>
                    </td>
                    <td style={{padding: '20px 16px'}}>
                      <span style={{
                        background: empleado.satisfaccion >= 95 ? '#E8F5E9' : '#FFF3E0',
                        color: empleado.satisfaccion >= 95 ? '#388e3c' : '#F57C00',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {empleado.satisfaccion >= 95 ? 'Excelente' : 'Bueno'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas de Satisfacción Estilo Circular */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'}}>
          {[
            { titulo: 'Tasa de Entrega', valor: 90, color: '#FF9800' },
            { titulo: 'Calidad del Servicio', valor: 94, color: '#0066FF' },
            { titulo: 'Puntualidad', valor: 88, color: '#00C853' },
            { titulo: 'Recomendación', valor: 92, color: '#9C27B0' }
          ].map((metrica, index) => {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (metrica.valor / 100) * circumference;
            
            return (
              <div key={index} style={{background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <svg width="120" height="120" style={{transform: 'rotate(-90deg)', marginBottom: '16px'}}>
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke="#F8F9FA"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="45"
                    fill="none"
                    stroke={metrica.color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{transition: 'stroke-dashoffset 1s ease'}}
                  />
                  <text
                    x="60"
                    y="60"
                    textAnchor="middle"
                    dy="7"
                    fontSize="24"
                    fontWeight="700"
                    fill={metrica.color}
                    transform="rotate(90 60 60)"
                  >
                    {metrica.valor}%
                  </text>
                </svg>
                <h4 style={{fontSize: '16px', fontWeight: '600', color: '#1a1a1a', textAlign: 'center', margin: 0}}>
                  {metrica.titulo}
                </h4>
              </div>
            );
          })}
        </div>

      </div>
      </div>

      {/* Footer Admin */}
      <FooterAdmin
        onGoDashboard={onGoDashboard}
        onGoAgenda={onGoAgenda}
        onGoEmpleados={onGoEmpleados}
        onGoReportes={onGoReportes}
        onGoPerfil={onGoPerfil}
        onOpenReportes={onOpenReportes}
        kpiSnapshot={{
          ordeneHoy: estadisticas.serviciosRealizados,
          ordensPendientes: estadisticas.clientesAtendidos,
          empleadosActivos: 3,
          ingresosMes: estadisticas.ingresosTotal
        }}
      />
    </div>
  );
};

export default ReportesAdmin;