{/* Estadísticas del Sistema */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">📊</span>
                                    Estadísticas del Sistema
                                </h2>
                                <div className="stats-dashboard">
                                    <div className="stat-card">
                                        <div className="stat-icon">👥</div>
                                        <div className="stat-value">2,847</div>
                                        <div className="stat-label">Total Usuarios</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">👨‍💼</div>
                                        <div className="stat-value">45</div>
                                        <div className="stat-label">Empleados Activos</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">✅</div>
                                        <div className="stat-value">8,921</div>
                                        <div className="stat-label">Servicios Totales</div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">💰</div>
                                        <div className="stat-value">$48.5M</div>
                                        <div className="stat-label">Ingresos del Mes</div>
                                    </div>
                                </div>
                            </div>

      {/* Acciones Rápidas */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">⚡</span>
                                    Acciones Rápidas
                                </h2>
                                <div className="quick-actions">
                                    <button className="action-btn primary"
                                    onClick={() => setActiveModal('nuevoUsuario')}>
                                        <span>➕</span>
                                        <span>Nuevo Usuario</span>
                                    </button>
                                    
                                    
                                    
                                    <button className="action-btn"
                                     onClick={handleReportesAdmin}>
                                        <span>📅</span>
                                        <span>Gestion de Ordenes</span>
                                    </button>

                                    {/* ✅ NUEVO: Botón Ver Consultas en Acciones Rápidas */}
                                    <button className="action-btn"
                                    onClick={handleConsultas}>
                                        <span>📋</span>
                                        <span>Ver Consultas</span>
                                    </button>
                                    
                                    <button className="action-btn"
                                    onClick={() => setActiveModal('configuracion')}>
                                        <span>⚙️</span>
                                        <span>Configuración</span>
                                    </button>
                                    <button className="action-btn"
                                    onClick={() => setActiveModal('finanzas')}>
                                        <span>💵</span>
                                        <span>Finanzas</span>
                                    </button>
                                    <button className="action-btn"
                                    onClick={() => setActiveModal('notificaciones')}>
                                        <span>🔔</span>
                                        <span>Notificaciones</span>
                                    </button>
                                </div>
                            </div>

                            {/* Estado del Sistema */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">🖥️</span>
                                    Estado del Sistema
                                </h2>
                                <div className="system-status">
                                    <div className="status-item">
                                        <div className="status-left">
                                            <div className="status-icon">🌐</div>
                                            <div className="status-info">
                                                <h4>Servidor Principal</h4>
                                                <p>Funcionando correctamente</p>
                                            </div>
                                        </div>
                                        <div className="status-indicator status-ok">
                                            <span className="status-dot"></span>
                                            <span>En línea</span>
                                        </div>
                                    </div>
                                    <div className="status-item">
                                        <div className="status-left">
                                            <div className="status-icon">💾</div>
                                            <div className="status-info">
                                                <h4>Base de Datos</h4>
                                                <p>Respuesta óptima - 45ms</p>
                                            </div>
                                        </div>
                                        <div className="status-indicator status-ok">
                                            <span className="status-dot"></span>
                                            <span>En línea</span>
                                        </div>
                                    </div>
                                    <div className="status-item">
                                        <div className="status-left">
                                            <div className="status-icon">🔄</div>
                                            <div className="status-info">
                                                <h4>Backup Automático</h4>
                                                <p>Último backup: hace 2 horas</p>
                                            </div>
                                        </div>
                                        <div className="status-indicator status-ok">
                                            <span className="status-dot"></span>
                                            <span>Activo</span>
                                        </div>
                                    </div>
                                    <div className="status-item">
                                        <div className="status-left">
                                            <div className="status-icon">📈</div>
                                            <div className="status-info">
                                                <h4>Tráfico del Sitio</h4>
                                                <p>1,234 usuarios activos ahora</p>
                                            </div>
                                        </div>
                                        <div className="status-indicator status-warning">
                                            <span className="status-dot"></span>
                                            <span>Alto</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            


import React, { useState } from 'react';

export default function Dashboard() {
  const [employees] = useState([
    {
      id: 1,
      name: 'Ediliberto González Jiménez',
      phone: '3143368571',
      cc: '3012345678',
      email: 'edigoj12015.eg@gmail.com',
      service: 'Lavado de muebles',
      available: true,
      image: null
    },
    {
      id: 2,
      name: 'Juan Andres González',
      phone: '3143157533',
      cc: '1109876543',
      email: 'juan.andres.gonzalez@gmail.com',
      service: 'Limpieza sillas de comedor',
      available: true,
      image: null
    }
  ]);

  const [orders] = useState([
    { id: 1, service: 'Lavado de muebles', time: '08:00 - 09:00', employee: 0 },
    { id: 2, service: 'Limpieza sillas de comedor', time: '08:30 - 09:30', employee: 1 },
    { id: 3, service: 'Lavado de alfombras', time: '11:00 - 12:00', employee: 0 },
    { id: 4, service: 'Lavado de muebles', time: '11:00 - 12:00', employee: 1 },
    { id: 5, service: 'Lavado de cortinas', time: '11:30 - 12:30', employee: 0 },
    { id: 6, service: 'Lavado de colchones', time: '14:00 - 15:00', employee: 1 }
  ]);

  const stats = {
    ordenesHoy: 6,
    ordenesPendientes: 18,
    empleadosActivos: 3,
    ingresosMes: '$4.200.000'
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      padding: '40px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ width: '95vw', margin: '0 auto' }}>
        
        {/* Panel de Control */}
        <h1 style={{
          color: '#008CFF',
          fontSize: '32px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          Panel de control
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          <StatCard number={stats.ordenesHoy} label="Órdenes hoy" />
          <StatCard number={stats.ordenesPendientes} label="Órdenes pendientes" />
          <StatCard number={stats.empleadosActivos} label="Empleados activos" />
          <StatCard number={stats.ingresosMes} label="Ingresos del mes" color="#008CFF" />
        </div>

        {/* Órdenes hoy */}
        <h2 style={{
          color: '#008CFF',
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Órdenes hoy
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px',
          marginBottom: '60px'
        }}>
          {orders.map((order, idx) => (
            <OrderCard 
              key={order.id}
              service={order.service}
              time={order.time}
              employeeImage={employees[order.employee]?.image}
            />
          ))}
        </div>

        {/* Empleados en servicio */}
        <h2 style={{
          color: '#008CFF',
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Empleados en servicio
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          {employees.map(emp => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>

        {/* Accesos rápidos */}
        <h2 style={{
          color: '#008CFF',
          fontSize: '28px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Accesos rápidos
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          <QuickAccessButton text="Crear nueva orden" />
          <QuickAccessButton text="Ver agenda de hoy" />
          <QuickAccessButton text="Agregar empleado" />
          <QuickAccessButton text="Ver facturación del mes" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label, color = '#223BFF' }) {
  const isMoneyCard = label === "Ingresos del mes";
  
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '2px solid #E0E0E0',
      borderRadius: '20px',
      padding: '30px 20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        fontSize: isMoneyCard ? '36px' : '48px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '8px'
      }}>
        {number}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#000000'
      }}>
        {label}
      </div>
    </div>
  );
}

function OrderCard({ service, time, employeeImage }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '2px solid #E0E0E0',
      borderRadius: '20px',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      <div>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '5px'
        }}>
          {service}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666666'
        }}>
          {time}
        </div>
      </div>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#008CFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {employeeImage ? (
          <img src={employeeImage} alt="Employee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ color: '#FFFFFF', fontSize: '20px' }}>👤</div>
        )}
      </div>
    </div>
  );
}

function EmployeeCard({ employee }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '2px solid #E0E0E0',
      borderRadius: '20px',
      padding: '25px',
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: employee.available ? '#00FF37' : '#999999'
      }} />
      
      <div style={{
        width: '100px',
        height: '120px',
        borderRadius: '10px',
        backgroundColor: '#F0F0F0',
        overflow: 'hidden',
        flexShrink: 0,
        marginLeft: '10px'
      }}>
        {employee.image ? (
          <img src={employee.image} alt={employee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            color: '#CCCCCC'
          }}>👤</div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '8px'
        }}>
          {employee.name}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666666',
          marginBottom: '3px'
        }}>
          {employee.phone}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666666',
          marginBottom: '3px'
        }}>
          cc: {employee.cc}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#666666',
          marginBottom: '10px'
        }}>
          {employee.email}
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#000000'
        }}>
          {employee.service}
        </div>
      </div>
    </div>
  );
}

function QuickAccessButton({ text }) {
  return (
    <button style={{
      backgroundColor: '#FFFFFF',
      border: '2px solid #E0E0E0',
      borderRadius: '15px',
      padding: '18px 20px',
      fontSize: '15px',
      fontWeight: '500',
      color: '#000000',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#008CFF';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#E0E0E0';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{
        width: '8px',
        height: '30px',
        backgroundColor: '#008CFF',
        borderRadius: '4px'
      }} />
      <span>{text}</span>
    </button>
  );
}



import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './autenticacion/AuthContext';
import './cliente/estilos_cliente/estilos_cotizar_cliente.css';

// =======================================================
// DATOS DE SERVICIOS (Extraídos de cotizar_cliente.js)
// =======================================================
const SERVICIOS = [
    { id: 1, nombre: "Lavado de muebles", precio: 90000, imagen: "/img/imag1.jpg", desc: "Lavado profundo de sofás y sillas, eliminación de manchas y olores.", tamanos: ["Pequeño", "Mediano", "Grande"] },
    { id: 2, nombre: "Lavado de alfombras", precio: 50000, imagen: "/img/imag4.jpg",desc: "Limpieza profunda para alfombras pequeñas y medianas", tamanos: ["Pequeña", "Mediana", "Grande"] },
    { id: 3, nombre: "Tapicería de carros", precio: 140000, imagen: "/img/imag5.jpg",desc: "Limpieza interior del vehículo: asientos, alfombras y paneles.", tamanos: ["Sedan", "SUV", "Camioneta"] },
    { id: 4, nombre: "Lavado de cortinas", precio: 80000, imagen: "/img/imag7.jpg", desc: "Lavado y planchado ligero para cortinas y visillos.", tamanos: ["Por metro", "Juego completo"] },
    { id: 5, nombre: "Lavado de colchones", precio: 90000, imagen: "/img/imag6.jpg",desc:"Eliminación de ácaros y manchas, desodorización y secado rápido.", tamanos: ["Sencillo", "Semi-doble", "Doble", "Queen", "King"] },
    { id: 6, nombre: "Mantenimiento y pulido de pisos", precio: 100000, imagen: "/img/imag8.jpg",desc: "Recuperar brillo, proteger la superficie y mejorar su apariencia.", tamanos: ["Pequeño (hasta 50m²)", "Mediano (50-100m²)", "Grande (más de 100m²)"] },
    { id: 7, nombre: "Limpieza sillas de comedor", precio: 7000, imagen: "/img/imag2.jpg", desc: "Elimina manchas, suciedad y malos olores.", tamanos: ["7.000 por silla", "10.000 por silla"] },
    { id: 8, nombre: "Limpieza de tapetes decorativos", precio: 60000, imagen: "/img/imag3.jpg", desc: "Remueve suciedad, polvo y manchas, devolviendo frescura y color..", tamanos: ["Pequeño (hasta 50m²)", "Mediano (50-100m²)", "Grande (más de 100m²)"] },
];

// =======================================================
// UTILIDADES Y LÓGICA DE ESTADO
// =======================================================
const calcularTotal = (items) => items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
const formatearMoneda = (value) => `$${value.toLocaleString('es-CO')}`;
const formatearFecha = (fecha) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};
const getStoredItems = (key) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
};
const saveItem = (key, item) => {
    const arr = getStoredItems(key);
    arr.push(item);
    localStorage.setItem(key, JSON.stringify(arr));
};

// =======================================================
// SUBCOMPONENTE: Tarjeta de Servicio (ServiceCard)
// =======================================================
const ServiceCard = ({ service, onAgregar }) => (
<article className="service-card">
    <div className="service-image">
    <img src={service.imagen} alt={service.nombre} />
    </div>
    <div className="service-content">
    <h3 className="service-title">{service.nombre}</h3>
    <p className="service-desc">{service.desc}</p>
    <div className="service-meta">
        <span className="service-price">{formatearMoneda(service.precio)}</span>
        <button type="button" className="service-btn" onClick={() => onAgregar(service.id)}> 
        Agregar
        </button>
    </div>
    </div>
</article>
);

// =======================================================
// SUBCOMPONENTE: Modal Carrito (CartModal)
// =======================================================
const CartModal = ({ carrito, total, onActualizarCantidad, onCerrar, onFinalizarCompra }) => (
<div className="modal-overlay show" id="modalCarrito" onClick={(e) => e.target.classList.contains('modal-overlay') && onCerrar()}>
    <div className="modal-content">
    <div className="modal-header">
        <h2>🛒 Carrito de Servicios</h2>
        <button className="modal-close" onClick={onCerrar}>×</button>
    </div>
    <div className="modal-body">
        <div id="carritoItems">
        {carrito.length === 0 ? (
            <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
            carrito.map((item) => (
            <div key={item.id} className="carrito-item">
                <img src={item.imagen} alt={item.nombre} className="carrito-item-img" />
                <div className="carrito-item-info">
                <h4>{item.nombre}</h4>
                <p className="carrito-item-duracion">⏱️ {item.duracion}</p>
                <p className="carrito-item-precio">{formatearMoneda(item.precio)}</p>
                </div>
                <div className="carrito-item-actions">
                <div className="cantidad-control">
                    <button onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                </div>
                <button className="btn-eliminar" onClick={() => onActualizarCantidad(item.id, 0)}>🗑️</button>
                </div>
            </div>
            ))
        )}
        </div>
        <div className="carrito-total">
        <h3>Total: <span id="carritoTotal">{formatearMoneda(total)}</span></h3>
        </div>
    </div>
    <div className="modal-footer">
        <button className="btn-secondary" onClick={onCerrar}>Seguir Cotizando</button>
        <button className="btn-primary" onClick={onFinalizarCompra} disabled={carrito.length === 0}>Ver Cotizacion Final</button>
    </div>
    </div>
</div>
);

// =======================================================
// SUBCOMPONENTE: Modal de Confirmación
// =======================================================
const ConfirmationModal = ({ carrito, total, onCerrar, onActualizarDetalle, onConfirmarPedido, onSeguirCotizando, ultimaCotizacion }) => {
    const [modalStage, setModalStage] = useState(0); 
    const [formData, setFormData] = useState({});
    const [pedidoFinal, setPedidoFinal] = useState(null);
const [cotizacionActual, setCotizacionActual] = useState(null);  

const handleActualizarDetalleLocal = (servicioId, campo, valor) => {
    onActualizarDetalle(servicioId, campo, valor);
};

    const handleGenerarCotizacion = () => {
        const sinDetalles = carrito.some(item => !item.tamano);
        if (sinDetalles) {
            alert('Por favor completa los detalles (Tamaño) de todos los servicios.');
            return;
        }

        const cotizacion = {
            id: `COT-${Date.now()}`,
            servicios: carrito.map(item => ({ ...item })),
            total: calcularTotal(carrito),
            fechaCreacion: new Date().toISOString()
        };
         setCotizacionActual(cotizacion); 
        setModalStage(1);
    };

    const handleAgendacion = () => {
        setModalStage(2);
        setFormData({});
    };

    const handleConfirmar = (e) => {
        
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            alert('Por favor completa los campos requeridos.');
            return;
        }

        const pedido = {
            id: `PED-${Date.now()}`,
            cotizacionId: ultimaCotizacion ? ultimaCotizacion.id : null,
            servicios: ultimaCotizacion ? ultimaCotizacion.servicios : carrito.map(item => ({ ...item })),
            ...formData,
            total: ultimaCotizacion ? ultimaCotizacion.total : total,
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };

        saveItem('pedidos', pedido);
        setPedidoFinal(pedido);
        setModalStage(3);
        onConfirmarPedido();
    };

    const onCloseWrapper = () => {
        setModalStage(0);
        setPedidoFinal(null);
        setCotizacionActual(null);
        onCerrar();
    };
    
    let modalContent;
    let modalFooter;

    const itemsParaResumen = cotizacionActual ? cotizacionActual.servicios : carrito;  
const totalActual = cotizacionActual ? cotizacionActual.total : total;  

    if (modalStage === 0) {
        modalContent = (
            <>
                <div id="serviciosConfirmacion">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h3>📋 Generar Cotización</h3>
                        <p style={{ color: '#666' }}>Completa los detalles de cada servicio</p>
                    </div>


                    {carrito.map((item, index) => (
    <div key={item.id} className="servicio-detalle">
        <h4>{item.nombre} (x{item.cantidad})</h4>
        <div className="form-group">
            <label htmlFor={`tamano-${index}`}>Tamaño *</label>
            <select id={`tamano-${index}`} required onChange={(e) => onActualizarDetalle(item.id, 'tamano', e.target.value)}>
                <option value="">Seleccionar tamaño</option>
                {item.tamanos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>

                            
                            <div className="form-group">
                                <label htmlFor={`cantidad-${index}`}>Cantidad *</label>
                                <input type="number" id={`cantidad-${index}`} min="1" value={item.cantidad} 
                                    onChange={(e) => onActualizarDetalle(item.id, 'cantidad', parseInt(e.target.value))} required />
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
        modalFooter = (
            <>
                <button type="button" className="btn-cancelar" onClick={onCloseWrapper}>Cancelar</button>
                <button type="button" className="btn-confirmar" onClick={handleGenerarCotizacion}>📋 Generar Cotización</button>
            </>
        );
    } 
    else if (modalStage === 1 && cotizacionActual) {
        modalContent = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">📋</div>
                <h3>¡Cotización Generada!</h3>
                <p>Código de cotización:</p>
                <p><strong>{cotizacionActual.id}</strong></p>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '10px' }}>Servicios cotizados:</h4>
                    {cotizacionActual.servicios.map(item => (
                        <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                            <strong>{item.nombre}</strong><br/>
                            <small>📏 {item.tamano} | ✖️ {item.cantidad}</small><br/>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatearMoneda(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: '20px 0' }}>
                    Total: {formatearMoneda(cotizacionActual.total)}
                </p>
            </div>
        );
        modalFooter = (
            <>
                <button type="button" className="btn-cancelar" onClick={() => { onSeguirCotizando(); onCloseWrapper(); }}>
                    🛒 Seguir Cotizando Servicios
                </button>
                <button type="button" className="btn-confirmar" onClick={handleAgendacion}>
                    📅 Realizar Agendación
                </button>
            </>
        );
    }
    else if (modalStage === 2) {
        modalContent = (
            <div className="form-confirmacion">
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 Agendar Servicio</h3>
                
                <div className="form-group">
                    <label htmlFor="direccion">Dirección *</label>
                    <input type="text" id="direccion" name="direccion" onChange={(e) => setFormData({...formData, direccion: e.target.value})} required placeholder="Calle 123 #45-67" />
                </div>
                <div className="form-group">
                    <label htmlFor="ciudad">Ciudad *</label>
                    <input type="text" id="ciudad" name="ciudad" onChange={(e) => setFormData({...formData, ciudad: e.target.value})} required placeholder="Bogotá" />
                </div>
                <div className="form-group">
                    <label htmlFor="telefono">Teléfono/WhatsApp *</label>
                    <input type="tel" id="telefono" name="telefono" onChange={(e) => setFormData({...formData, telefono: e.target.value})} required placeholder="300 123 4567" />
                </div>
                <div className="form-group">
                    <label htmlFor="fecha">Fecha del servicio *</label>
                    <input type="date" id="fecha" name="fecha" onChange={(e) => setFormData({...formData, fecha: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label htmlFor="hora">Hora preferida *</label>
                    <select id="hora" name="hora" onChange={(e) => setFormData({...formData, hora: e.target.value})} required>
                        <option value="">Seleccionar hora</option>
                        {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"].map(h => <option key={h} value={h}>{h} {(parseInt(h) < 12 ? 'AM' : 'PM')}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="observaciones">Observaciones</label>
                    <textarea id="observaciones" name="observaciones" rows="3" onChange={(e) => setFormData({...formData, observaciones: e.target.value})} placeholder="Información adicional..."></textarea>
                </div>

                <div className="resumen-pedido">
                    <h3>Resumen de tu pedido</h3>
                    <div id="resumenPedido">
                        {itemsParaResumen.map(item => (
                            <div key={item.id} className="resumen-item">
                                <span>{item.nombre} x{item.cantidad} ({item.tamano})</span>
                                <span>{formatearMoneda(item.precio * item.cantidad)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="resumen-total-final">
                        <strong>Total a pagar:</strong>
                        <span id="totalFinal">{formatearMoneda(total)}</span>
                    </div>
                </div>
                 </div>
            
        );
        modalFooter = (
            <>
                <button type="button" className="btn-cancelar" onClick={() => setModalStage(1)}>Volver a Cotización</button>
        <button type="button" className="btn-confirmar" onClick={handleConfirmar}> Confirmar Pedido</button>  
            </>
        );
    }
    else if (modalStage === 3 && pedidoFinal) {
        modalContent = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">✓</div>
                <h3>¡Pedido confirmado!</h3>
                <p>Tu código de pedido es:</p>
                <p><strong>{pedidoFinal.id}</strong></p>
                <p>📅 Fecha: {formatearFecha(pedidoFinal.fecha)} a las {pedidoFinal.hora}</p>
                <p>📍 Dirección: {pedidoFinal.direccion}, {pedidoFinal.ciudad}</p>
                <p>💰 Total: <strong>{formatearMoneda(pedidoFinal.total)}</strong></p>
            </div>
        );
        modalFooter = (
            <button className="btn-primary" onClick={onCloseWrapper}>Aceptar</button>
        );
    }

    return (
        <div className="modal-overlay show" id="modalConfirmacion" onClick={(e) => e.target.classList.contains('modal-overlay') && onCloseWrapper()}>
            <div className="modal-content modal-confirmacion">
                <div className="modal-header">
                    <h2>{modalStage === 3 ? '🎉 Éxito' : '📋 Confirmar'}</h2>
                    <button className="modal-close" onClick={onCloseWrapper}>×</button>
                </div>
                <div className="modal-body">
                    {modalContent}
                </div>
                <div className="modal-footer" id="modalFooterConfirm">
                    {modalFooter}
                </div>
            </div>
        </div> 
    );
};

// =======================================================
// COMPONENTE PRINCIPAL: CotizacionesCliente
// =======================================================
export default function CotizacionesCliente({ onBackToHome, onGoToServicios, onPerfil }) {
    const { user, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [carrito, setCarrito] = useState(getStoredItems('carrito') || []);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);
    
    const total = useMemo(() => calcularTotal(carrito), [carrito]);
    const totalItems = useMemo(() => carrito.reduce((sum, item) => sum + item.cantidad, 0), [carrito]);

    const filteredServices = SERVICIOS.filter(service => {
        const query = searchTerm.toLowerCase();
        return service.nombre.toLowerCase().includes(query) || service.desc.toLowerCase().includes(query);
    });

    const handleAgregarAlCarrito = (servicioId) => {
        const servicio = SERVICIOS.find(s => s.id === servicioId);
        if (!servicio) return;
        
        setCarrito(prevCarrito => {
            const servicioExistente = prevCarrito.find(item => item.id === servicioId);
            
            if (servicioExistente) {
                return prevCarrito.map(item =>
                    item.id === servicioId ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            } else {
    return [...prevCarrito, { 
        ...servicio, 
        cantidad: 1, 
        tamano: '',
        tamanos: servicio.tamanos || []  // ✅ AGREGUÉ ESTA LÍNEA
    }];
}
        });
    };

    const handleActualizarCantidad = (servicioId, nuevaCantidad) => {
        setCarrito(prevCarrito => {
            if (nuevaCantidad <= 0) {
                return prevCarrito.filter(item => item.id !== servicioId);
            }
            return prevCarrito.map(item =>
                item.id === servicioId ? { ...item, cantidad: nuevaCantidad } : item
            );
        });
    };
    
    const handleActualizarDetalle = (servicioId, campo, valor) => {
        setCarrito(prevCarrito => prevCarrito.map(item => 
            item.id === servicioId ? { ...item, [campo]: valor } : item
        ));
    };

    const handleFinalizarCompra = () => {
        if (carrito.length === 0) return;
        setShowCartModal(false);
        setShowConfirmModal(true);
    };

    const handleConfirmarPedido = () => {
        setCarrito([]);
    };
    
    const handleCerrarSesion = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
            onBackToHome();
        }
    };

    return (
        <>
            {/* ==================== HEADER CON BANNER ==================== */}
            <header className="header-banner">
                <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 
                    className="logo-header"
                    onClick={onBackToHome}
                    style={{ cursor: 'pointer' }}
                >
                    FoamWash
                </h1>
                <nav className="nav-bar">
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onBackToHome();
                        }}
                    >
                        Hogar
                    </a>
                    <a 
                        href="#" 
                        className="nav-link" 
                        style={{ color: 'rgb(133, 198, 255)' }}
                        onClick={(e) => e.preventDefault()}
                    >
                        Cotización
                    </a>
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onGoToServicios();
                        }}
                    >
                        Agendar
                    </a>
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onPerfil();
                        }}
                    >
                        Perfil
                    </a>
                    <a 
                        href="#" 
                        className="nav-link btn-salir" 
                        onClick={handleCerrarSesion}
                    >
                        Cerrar Sesión
                    </a>
                </nav>
            </header>

            {/* ==================== BARRA DE BÚSQUEDA ==================== */}
            <section className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        id="searchInput"
                        placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                        aria-label="Buscar servicios"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="search-button" aria-label="buscar">🔍</button>
                </div>
            </section>
            
            {/* ==================== LISTADO DE SERVICIOS ==================== */}
            <section className="services-section">
                <h2 className="section-title">Nuestros Servicios</h2>
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <ServiceCard 
                            key={service.id}
                            service={service} 
                            onAgregar={handleAgregarAlCarrito}
                        />
                    ))}
                </div>
            </section>
            
            {/* ==================== BOTÓN FLOTANTE DEL CARRITO ==================== */}
            <button className="btn-carrito-flotante" onClick={() => setShowCartModal(true)} title="Ver carrito">
                <span className="carrito-icono">🛒</span>
                <span className="carrito-badge-flotante" style={{ display: totalItems > 0 ? 'flex' : 'none' }}>{totalItems}</span>
            </button>

            {/* ==================== MODALES ==================== */}
            {showCartModal && (
                <CartModal 
                    carrito={carrito}
                    total={total}
                    onActualizarCantidad={handleActualizarCantidad}
                    onCerrar={() => setShowCartModal(false)}
                    onFinalizarCompra={handleFinalizarCompra}
                />
            )}
            
            {showConfirmModal && (
                <ConfirmationModal 
                    carrito={carrito}
                    total={total}
                    onCerrar={() => setShowConfirmModal(false)}
                    onActualizarDetalle={handleActualizarDetalle}
                    onConfirmarPedido={handleConfirmarPedido}
                />
            )}
        </>
    );
}






