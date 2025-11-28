import React, { useState, useEffect, useMemo } from 'react';
import '../styles/estilos_cotizar_cliente.css'; 

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
// UTILIDADES Y LÓGICA DE ESTADO (Adaptadas del JS original)
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

// Simulación de usuario logueado
const getMockUser = (isLoggedIn) => ({
    isLoggedIn: isLoggedIn,
    email: "cliente.demo@foamwash.com",
    username: "DemoCliente",
    role: "cliente"
});


// =======================================================
// SUBCOMPONENTE: Modal de Autenticación (AuthPromptModal)
// =======================================================
const AuthPromptModal = ({ onClose, onLogin, onRegister }) => (
    <div className="fw-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px', boxSizing: 'border-box' }}>
      <div className="fw-modal" style={{ background: '#fff', padding: '20px', borderRadius: '12px', width: 'min(520px,96%)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
        <button type="button" onClick={onClose} style={{ position: 'absolute', right: '18px', top: '16px', border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#666' }}>✕</button>
        
        <div style={{ textAlign: 'center', padding: '6px 6px 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(#223BFF, #0b74ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '24px' }}>FW</div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: '0', fontSize: '18px' }}>Debes iniciar sesión primero</h3>
              <p style={{ margin: '6px 0 0', color: '#555' }}>Para cotizar un servicio crea una cuenta o inicia sesión.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '14px' }}>
            <button 
              className="fw-register-btn" 
              onClick={onRegister}
              style={{ flex: '1', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer' }}
            >
              Registrarse
            </button>
            <button 
              className="fw-login-btn" 
              onClick={onLogin}
              style={{ flex: '1', padding: '10px 12px', borderRadius: '10px', border: 'none', background: '#0b74ff', color: '#fff', cursor: 'pointer' }}
            >
              Iniciar sesión
            </button>
          </div>
          <div style={{ marginTop: '12px', color: '#888', fontSize: '13px' }}>No compartiremos tu información en este demo.</div>
        </div>
      </div>
    </div>
); 

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
                    <p className="carrito-item-precio">{formatearMoneda(item.precio)}</p>
                  </div>
                  <div className="carrito-item-actions">
                    <div className="cantidad-control">
                      <button onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)} disabled={item.cantidad <= 1}>-</button>
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
// SUBCOMPONENTE: Modal de Confirmación (Cotización/Agendamiento)
// =======================================================
const ConfirmationModal = ({ carrito, total, onCerrar, onActualizarDetalle, onConfirmarPedido, onSeguirCotizando, ultimaCotizacion, onStartAgendacion }) => {
    // 0: Detalles (Seleccionar Tamaño) | 1: Cotización Generada | 2: Formulario Agendamiento Final | 3: Pedido Confirmado
    const [modalStage, setModalStage] = useState(0); 
    const [formData, setFormData] = useState({});
    const [pedidoFinal, setPedidoFinal] = useState(null);

    useEffect(() => {
        // Al montar el modal, si ya tenemos una cotización guardada, pasamos al stage 1
        if (ultimaCotizacion && modalStage === 0) {
             setModalStage(1);
        }
    }, [ultimaCotizacion]);


    const handleGenerarCotizacion = () => {
        const sinDetalles = carrito.some(item => !item.tamano);
        if (sinDetalles) {
            alert('Por favor completa los detalles (Tamaño) de todos los servicios.');
            return;
        }

        const cotizacion = {
            id: `COT-${Date.now()}`,
            servicios: carrito.map(item => ({ ...item })), // Clonar carrito
            total: calcularTotal(carrito), // Calcular total con los detalles actualizados
            fechaCreacion: new Date().toISOString()
        };
        // Para que el padre se actualice y nos pase la nueva `ultimaCotizacion`
        localStorage.setItem('cotizacionesGuardadas', JSON.stringify([...getStoredItems('cotizacionesGuardadas'), cotizacion])); 
        setModalStage(1); // Muestra la cotización generada
    };

    // FUNCIÓN MODIFICADA: Llama a la función del padre para verificar autenticación
    const handleAgendacionClick = () => {
        // Si la verificación de autenticación falla, el padre muestra el AuthModal.
        // Si pasa, el padre llama a la función de callback `() => setModalStage(2)`.
        onStartAgendacion(() => {
            setModalStage(2); // Pasa al formulario de agendamiento
            setFormData({}); // Reiniciar el formulario de agendamiento
        });
    };

    const handleConfirmar = (e) => {
        e.preventDefault();
        // Simulación de validación
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
        setModalStage(3); // Muestra el éxito del pedido
        onConfirmarPedido(); // Limpia el carrito en el padre
    };

    const onCloseWrapper = () => {
        setModalStage(0); // Reinicia el estado interno al cerrar
        setPedidoFinal(null);
        onCerrar();
    };
    
    // --- Renderizado Condicional del Contenido del Modal ---
    let modalContent;
    let modalFooter;

    const itemsParaResumen = modalStage === 0 ? carrito : (ultimaCotizacion ? ultimaCotizacion.servicios : carrito);
    const totalActual = ultimaCotizacion && modalStage >= 1 ? ultimaCotizacion.total : total;
    
    
    // 1. STAGE 0: Detalles de Cotización
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
                                <select id={`tamano-${index}`} required value={item.tamano || ''} onChange={(e) => onActualizarDetalle(item.id, 'tamano', e.target.value)}>
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
    // 2. STAGE 1: Cotización Generada
    else if (modalStage === 1 && ultimaCotizacion) {
        modalContent = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">📋</div>
                <h3>¡Cotización Generada!</h3>
                <p>Código de cotización:</p>
                <p><strong>{ultimaCotizacion.id}</strong></p>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '10px' }}>Servicios cotizados:</h4>
                    {ultimaCotizacion.servicios.map((item, index) => (
                        <div key={item.id + index} style={{ padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                            <strong>{item.nombre}</strong><br/>
                            <small>📏 {item.tamano} | ✖️ {item.cantidad}</small><br/>
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatearMoneda(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: '20px 0' }}>
                    Total: {formatearMoneda(ultimaCotizacion.total)}
                </p>
            </div>
        );
        modalFooter = (
            <>
                <button type="button" className="btn-cancelar" onClick={() => { onSeguirCotizando(); onCloseWrapper(); }}>
                    🛒 Seguir Cotizando Servicios
                </button>
                <button type="button" className="btn-confirmar" onClick={handleAgendacionClick}>
                    📅 Realizar Agendación
                </button>
            </>
        );
    }

    // 3. STAGE 2: Formulario de Agendamiento
    else if (modalStage === 2) {
        modalContent = (
            <form onSubmit={handleConfirmar} className="form-confirmacion" id="formConfirmacion">
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 Agendar Servicio</h3>
                
                {/* Form fields */}
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
                        {itemsParaResumen.map((item, index) => (
                            <div key={item.id + index} className="resumen-item">
                                <span>{item.nombre} x{item.cantidad} ({item.tamano})</span>
                                <span>{formatearMoneda(item.precio * item.cantidad)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="resumen-total-final">
                        <strong>Total a pagar:</strong>
                        <span id="totalFinal">{formatearMoneda(totalActual)}</span>
                    </div>
                </div>
            </form>
        );
        modalFooter = (
            <>
                <button type="button" className="btn-cancelar" onClick={() => setModalStage(1)}>Volver a Cotización</button>
                <button type="submit" className="btn-confirmar" form="formConfirmacion">✅ Confirmar Pedido</button>
            </>
        );
    }
    // 4. STAGE 3: Pedido Confirmado
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
export default function CotizacionesCliente() {
    const [searchTerm, setSearchTerm] = useState('');
    const [carrito, setCarrito] = useState(getStoredItems('carrito') || []); // Cargar carrito de LS
    const [showCartModal, setShowCartModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAuthPromptModal, setShowAuthPromptModal] = useState(false);
    const [cotizacionesGuardadas, setCotizacionesGuardadas] = useState(getStoredItems('cotizacionesGuardadas') || []);

    // CAMBIA ESTA LÍNEA para simular el estado de autenticación
    // true = Logueado (pasa directo al formulario)
    // false = NO Logueado (muestra el AuthPromptModal)
    const [isLoggedIn, setIsLoggedIn] = useState(false); // <--- DEBES CAMBIAR ESTO
    const user = useMemo(() => getMockUser(isLoggedIn), [isLoggedIn]);


    // Usar useEffect para sincronizar el carrito y cotizaciones con localStorage
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        // Volver a cargar cotizaciones si el localStorage cambia (esto es un workaround para el manejo de localstorage)
        const storedCotizaciones = getStoredItems('cotizacionesGuardadas');
        if (JSON.stringify(storedCotizaciones) !== JSON.stringify(cotizacionesGuardadas)) {
            setCotizacionesGuardadas(storedCotizaciones);
        }
    }, [localStorage.getItem('cotizacionesGuardadas')]);
    
    // Calcular el total del carrito y el total de items
    const total = useMemo(() => calcularTotal(carrito), [carrito]);
    const totalItems = useMemo(() => carrito.reduce((sum, item) => sum + item.cantidad, 0), [carrito]);
    const ultimaCotizacion = useMemo(() => cotizacionesGuardadas[cotizacionesGuardadas.length - 1], [cotizacionesGuardadas]);

    // LOGICA: Filtro de servicios
    const filteredServices = SERVICIOS.filter(service => {
        const query = searchTerm.toLowerCase();
        return service.nombre.toLowerCase().includes(query) || service.desc.toLowerCase().includes(query);
    });

    // ... (otras funciones de manejo de carrito) ...

    // Actualizar el detalle (tamaño, tipo) del servicio en el carrito
    const handleActualizarDetalle = (servicioId, campo, valor) => {
        setCarrito(prevCarrito => prevCarrito.map(item => 
            item.id === servicioId ? { ...item, [campo]: valor } : item
        ));
    };

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
                return [...prevCarrito, { ...servicio, cantidad: 1, tamano: '' }];
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

    const handleFinalizarCompra = () => {
        if (carrito.length === 0) return;
        setShowCartModal(false);
        setShowConfirmModal(true);
    };

    const handleConfirmarPedido = () => {
        setCarrito([]);
    };
    
    // LÓGICA DE AUTENTICACIÓN PARA AGENDAMIENTO
    const handleStartAgendacion = (continueCallback) => {
        if (!user.isLoggedIn) {
            setShowAuthPromptModal(true);
        } else {
            // El usuario está logueado, permite continuar con el formulario (Stage 2)
            continueCallback(); 
        }
    };

    // Simulación de redirecciones de AuthModal
    const handleAuthLogin = () => {
        // En un entorno real, aquí harías login y luego: setIsLoggedIn(true);
        alert('Simulación: Redirigiendo a Iniciar Sesión. Luego se loguearía.');
        // Para probar el flujo completo: setIsLoggedIn(true);
        setShowAuthPromptModal(false);
    };
    
    const handleAuthRegister = () => {
        // En un entorno real, aquí harías registro y luego: setIsLoggedIn(true);
        alert('Simulación: Redirigiendo a Registro. Luego se loguearía.');
        // Para probar el flujo completo: setIsLoggedIn(true);
        setShowAuthPromptModal(false);
    };

    const handleCerrarSesionCliente = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            setIsLoggedIn(false);
            alert('Sesión cerrada (Simulación)');
        }
    };

    return (
        <>
            {/* ==================== HEADER CON BANNER ==================== */}
            <header className="header-banner">
                <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 className="logo-header">FoamWash</h1>
                <nav className="nav-bar">
                    <a href="#" className="nav-link">Hogar</a>
                    <a href="/cotizar_cliente.html" className="nav-link" style={{ color: 'rgb(133, 198, 255)' }}>Cotización</a>
                    <a href="/servicios_cliente.html" className="nav-link">Agendar</a>
                    
                    <a href="#" className="nav-link btn-salir" onClick={handleCerrarSesionCliente}> Iniciar Sesión</a>
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

            {/* ==================== MODALES (RENDERIZADO CONDICIONAL) ==================== */}
            
            {/* Modal del Carrito */}
            {showCartModal && (
                <CartModal 
                    carrito={carrito}
                    total={total}
                    onActualizarCantidad={handleActualizarCantidad}
                    onCerrar={() => setShowCartModal(false)}
                    onFinalizarCompra={handleFinalizarCompra}
                />
            )}
            
            {/* Modal de Confirmación / Cotización / Agendamiento */}
            {showConfirmModal && (
                <ConfirmationModal 
                    carrito={carrito}
                    total={total}
                    onCerrar={() => setShowConfirmModal(false)}
                    onActualizarDetalle={handleActualizarDetalle}
                    onConfirmarPedido={handleConfirmarPedido}
                    onSeguirCotizando={() => setCarrito([])}
                    ultimaCotizacion={ultimaCotizacion}
                    onStartAgendacion={handleStartAgendacion} 
                />
            )}

            {/* Modal de Autenticación (NUEVO) */}
            {showAuthPromptModal && (
                <AuthPromptModal 
                    onClose={() => setShowAuthPromptModal(false)}
                    onLogin={handleAuthLogin}
                    onRegister={handleAuthRegister}
                />
            )}
        </>
    );
}