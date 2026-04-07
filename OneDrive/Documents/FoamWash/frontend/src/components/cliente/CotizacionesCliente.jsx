// =============================================================================
// ARCHIVO  : CotizacionesCliente.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/CotizacionesCliente.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Página de cotizaciones del cliente autenticado con carrito y flujo de agendamiento.
// =============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth }    from '../autenticacion/AuthContext';
import { useCarrito } from '../modales/CarritoContext';
import ServiceCardCliente   from './ServiceCardCliente';
import Footer               from '../comun/Footer1';
import BotonCarritoFlotante from '../modales/BotonCarritoFlotante';
import HeaderCliente        from './HeaderCliente';
import api                  from '../../services/api';
import { guardarCotizacionLocal } from '../../services/cotizacionStorage';
import './estilos_cliente/estilos_cotizar_cliente.css';

const IMAGEN_FALLBACK = '/img/imag1.jpg';

// ─── Utilidades ───────────────────────────────────────────────────────────────
const calcularTotal   = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);
const formatMoneda    = (v)     => `$${v.toLocaleString('es-CO')}`;
const formatFecha     = (f)     => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Modal Carrito
// ─────────────────────────────────────────────────────────────────────────────
const CartModal = ({ carrito, total, onActualizarCantidad, onCerrar, onFinalizarCompra }) => (
    <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && onCerrar()}>
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
                                <img src={item.imagen || IMAGEN_FALLBACK} alt={item.nombre} className="carrito-item-img" />
                                <div className="carrito-item-info">
                                    <h4>{item.nombre}</h4>
                                    {item.duracion && <p className="carrito-item-duracion">⏱️ {item.duracion}</p>}
                                    <p className="carrito-item-precio">{formatMoneda(item.precio)}</p>
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
                    <h3>Total: <span id="carritoTotal">{formatMoneda(total)}</span></h3>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn-secondary" onClick={onCerrar}>Seguir Cotizando</button>
                <button className="btn-primary" onClick={onFinalizarCompra} disabled={carrito.length === 0}>
                    Ver Cotización Final
                </button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Modal de Confirmación + Agendación
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmationModal = ({ carrito, total, onCerrar, onActualizarDetalle, onConfirmarPedido, onSeguirCotizando, user }) => {
    const [stage,          setStage]          = useState(0);
    const [formData,       setFormData]       = useState({});
    const [cotizacion,     setCotizacion]     = useState(null);
    const [pedidoFinal,    setPedidoFinal]    = useState(null);
    const [guardando,      setGuardando]      = useState(false);
    const [errorGuardar,   setErrorGuardar]   = useState('');

    const handleGenerarCotizacion = () => {
        if (carrito.some(i => !i.tamano)) {
            alert('Por favor completa el Tamaño de todos los servicios.');
            return;
        }
        setCotizacion({
            id:          `COT-${Date.now()}`,
            servicios:   carrito.map(i => ({ ...i })),
            total:       calcularTotal(carrito),
            fechaCreacion: new Date().toISOString()
        });
        setStage(1);
    };

    const handleConfirmar = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            alert('Por favor completa los campos requeridos.');
            return;
        }

        setGuardando(true);
        setErrorGuardar('');

        try {
            const serviciosList = (cotizacion?.servicios || carrito).map(i => ({
                Id_Servicio: i.id,
                cantidad:    i.cantidad,
                tamano:      i.tamano
            }));

            // 1. Crear reserva → el backend asigna empleado automáticamente
            const resReserva = await api.post('/reservas', {
                Id_Usuario:            user?.id,
                fecha:                 formData.fecha,
                Hora:                  formData.hora,
                Informacion_adicional: `Dirección: ${formData.direccion}${formData.ciudad ? ', ' + formData.ciudad : ''}. Tel: ${formData.telefono || ''}`,
                observaciones:         formData.observaciones || null,
                servicios:             serviciosList
            });

            if (!resReserva.data.success) throw new Error(resReserva.data.message);

            const reservaData = resReserva.data.data;

            // 2. Guardar cotizaciones en BD (sin duplicados, maneja el backend)
            if (user?.id) {
                for (const item of cotizacion?.servicios || carrito) {
                    await api.post('/cotizaciones', {
                        Id_usuario:      user.id,
                        Id_servicio:     item.id,
                        Precio_cotizado: item.precio * item.cantidad,
                        Cantidad:        item.cantidad,
                        Tamaño:          item.tamano || 'Estándar'
                    });
                }
            }

            setPedidoFinal({
                id:               `PED-${reservaData.ID_Reserva}`,
                reservaId:        reservaData.ID_Reserva,
                fecha:            formData.fecha,
                hora:             formData.hora,
                direccion:        formData.direccion,
                ciudad:           formData.ciudad,
                empleado:         reservaData.empleado_asignado,
                total:            cotizacion?.total || total
            });
            setStage(3);
            onConfirmarPedido();

        } catch (err) {
            console.error('❌ Error al confirmar pedido:', err);
            setErrorGuardar('Hubo un error al guardar tu pedido. Por favor intenta nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    const onClose = () => { setStage(0); setCotizacion(null); setPedidoFinal(null); setErrorGuardar(''); onCerrar(); };
    const itemsResumen = cotizacion ? cotizacion.servicios : carrito;
    const totalActual  = cotizacion ? cotizacion.total     : total;

    let content, footer;

    if (stage === 0) {
        content = (
            <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3>📋 Generar Cotización</h3>
                    <p style={{ color: '#666' }}>Completa los detalles de cada servicio</p>
                </div>
                {carrito.map((item, i) => (
                    <div key={item.id} className="servicio-detalle">
                        <h4>{item.nombre} (x{item.cantidad})</h4>
                        <div className="form-group">
                            <label htmlFor={`tamano-${i}`}>Tamaño *</label>
                            <select id={`tamano-${i}`} required onChange={(e) => onActualizarDetalle(item.id, 'tamano', e.target.value)}>
                                <option value="">Seleccionar tamaño</option>
                                {(item.tamanos || ['Estándar']).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`cant-${i}`}>Cantidad *</label>
                            <input type="number" id={`cant-${i}`} min="1" value={item.cantidad}
                                onChange={(e) => onActualizarDetalle(item.id, 'cantidad', parseInt(e.target.value) || 1)} />
                        </div>
                    </div>
                ))}
            </>
        );
        footer = (
            <>
                <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
                <button className="btn-confirmar" onClick={handleGenerarCotizacion}>📋 Generar Cotización</button>
            </>
        );
    } else if (stage === 1 && cotizacion) {
        content = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">📋</div>
                <h3>¡Cotización Generada!</h3>
                <p>Código: <strong>{cotizacion.id}</strong></p>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'left' }}>
                    <h4 style={{ marginBottom: '10px' }}>Servicios cotizados:</h4>
                    {cotizacion.servicios.map(item => (
                        <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                            <strong>{item.nombre}</strong><br />
                            <small>📏 {item.tamano} | ✖️ {item.cantidad}</small><br />
                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatMoneda(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff', margin: '20px 0' }}>
                    Total: {formatMoneda(cotizacion.total)}
                </p>
            </div>
        );
        footer = (
            <>
                <button className="btn-cancelar" onClick={() => { onSeguirCotizando(); onClose(); }}>
                    🛒 Seguir Cotizando
                </button>
                <button className="btn-confirmar" onClick={() => setStage(2)}>
                    📅 Realizar Agendación
                </button>
            </>
        );
    } else if (stage === 2) {
        content = (
            <div className="form-confirmacion">
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 Agendar Servicio</h3>

                {errorGuardar && (
                    <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#c00' }}>
                        ⚠️ {errorGuardar}
                    </div>
                )}

                <div className="form-group">
                    <label>Dirección *</label>
                    <input type="text" placeholder="Calle 123 #45-67" onChange={(e) => setFormData(p => ({ ...p, direccion: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Ciudad *</label>
                    <input type="text" placeholder="Bogotá" onChange={(e) => setFormData(p => ({ ...p, ciudad: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Teléfono/WhatsApp *</label>
                    <input type="tel" placeholder="300 123 4567" onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Fecha del servicio *</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData(p => ({ ...p, fecha: e.target.value }))} />
                </div>
                <div className="form-group">
                    <label>Hora preferida *</label>
                    <select onChange={(e) => setFormData(p => ({ ...p, hora: e.target.value }))}>
                        <option value="">Seleccionar hora</option>
                        {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => (
                            <option key={h} value={h}>{h} {parseInt(h) < 12 ? 'AM' : 'PM'}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Observaciones</label>
                    <textarea rows="3" placeholder="Información adicional..."
                        onChange={(e) => setFormData(p => ({ ...p, observaciones: e.target.value }))} />
                </div>

                <div className="resumen-pedido">
                    <h3>Resumen de tu pedido</h3>
                    {itemsResumen.map(item => (
                        <div key={item.id} className="resumen-item">
                            <span>{item.nombre} x{item.cantidad} {item.tamano ? `(${item.tamano})` : ''}</span>
                            <span>{formatMoneda(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                    <div className="resumen-total-final">
                        <strong>Total a pagar:</strong>
                        <span>{formatMoneda(totalActual)}</span>
                    </div>
                </div>
            </div>
        );
        footer = (
            <>
                <button className="btn-cancelar" onClick={() => setStage(1)}>Volver</button>
                <button className="btn-confirmar" onClick={handleConfirmar} disabled={guardando}>
                    {guardando ? '⏳ Guardando...' : 'Confirmar Pedido'}
                </button>
            </>
        );
    } else if (stage === 3 && pedidoFinal) {
        content = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">✓</div>
                <h3>¡Pedido confirmado!</h3>
                <p>Código: <strong>{pedidoFinal.id}</strong></p>
                <p>📅 {formatFecha(pedidoFinal.fecha)} a las {pedidoFinal.hora}</p>
                <p>📍 {pedidoFinal.direccion}{pedidoFinal.ciudad ? `, ${pedidoFinal.ciudad}` : ''}</p>
                <p>👷 Empleado asignado: <strong>{pedidoFinal.empleado}</strong></p>
                <p>💰 Total: <strong>{formatMoneda(pedidoFinal.total)}</strong></p>
            </div>
        );
        footer = <button className="btn-primary" onClick={onClose}>Aceptar</button>;
    }

    return (
        <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
            <div className="modal-content modal-confirmacion">
                <div className="modal-header">
                    <h2>{stage === 3 ? '🎉 Éxito' : '📋 Confirmar'}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">{content}</div>
                <div className="modal-footer">{footer}</div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function CotizacionesCliente({ onBackToHome, onGoToServicios, onPerfil, onServicios }) {
    const { user, logout }   = useAuth();
    const { carrito, agregarAlCarrito, actualizarCantidad, actualizarDetalle } = useCarrito();

    const [servicios,        setServicios]        = useState([]);
    const [isLoading,        setIsLoading]        = useState(true);
    const [searchTerm,       setSearchTerm]       = useState('');
    const [showCartModal,    setShowCartModal]    = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const total      = useMemo(() => calcularTotal(carrito), [carrito]);
    const totalItems = useMemo(() => carrito.reduce((s, i) => s + i.cantidad, 0), [carrito]);

    // ── Cargar servicios desde BD ──────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    setServicios(res.data.data.map(s => ({
                        ...s,
                        id:          s.Id_Servicio        || s.id,
                        nombre:      s.Nombre_Servicio    || s.nombre       || 'Sin nombre',
                        descripcion: s.Descripcion        || s.descripcion  || '',
                        precio:      Number(s.Precio      || s.precio       || 0),
                        imagen:      s.imagen_url         || IMAGEN_FALLBACK,
                        tamanos:     ['Estándar'],
                        rating:      4.8,
                        garantia:    true,
                        ecologico:   true,
                        popular:     false
                    })));
                } else {
                    setServicios([]);
                }
            } catch {
                console.warn('No se pudieron cargar servicios desde BD');
                setServicios([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, []);

    // ── Guardar carrito en localStorage si el usuario NO está logueado ─────
    useEffect(() => {
        if (!user && carrito.length > 0) {
            guardarCotizacionLocal(carrito);
        }
    }, [carrito, user]);

    const filtered = servicios.filter(s => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleActualizarCantidad = (id, nuevaCantidad) => {
        if (typeof actualizarCantidad === 'function') {
            actualizarCantidad(id, nuevaCantidad);
        }
    };

    const handleActualizarDetalle = (id, campo, valor) => {
        if (typeof actualizarDetalle === 'function') {
            actualizarDetalle(id, campo, valor);
        }
    };

    const handleFinalizarCompra = () => {
        if (carrito.length === 0) return;
        setShowCartModal(false);
        setShowConfirmModal(true);
    };

    const handleConfirmarPedido = () => {
        // El carrito se limpia desde CarritoContext
        if (typeof window !== 'undefined') {
            localStorage.removeItem('foamwash_carrito_local');
        }
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
        <style>{`
            @keyframes gradientShift {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `}</style>
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 50%, #f0f0ff 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite'
        }}>

            {/* ==================== HEADER ==================== */}
            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={() => {}}
                onPerfil={onPerfil}
                onServicios={onGoToServicios}
                activeLink="cotizacion"
            />

            {/* ==================== CONTENIDO PRINCIPAL ==================== */}
            <main style={{ flex: 1 }}>
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                            aria-label="Buscar servicios"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" aria-label="buscar">🔍</button>
                    </div>
                </section>

                <section className="services-section">
                    <h2 className="section-title">Nuestros Servicios</h2>

                    {isLoading ? (
                        <p style={{ textAlign: 'center', padding: 40, color: '#999' }}>⏳ Cargando servicios...</p>
                    ) : (
                        <div className="services-grid">
                            {filtered.length > 0 ? (
                                filtered.map(s => (
                                    <ServiceCardCliente
                                        key={s.id}
                                        servicio={s}
                                        onNotificacion={(msg) => console.log(msg)}
                                    />
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                    <p style={{ fontSize: '18px' }}>
                                        No se encontraron servicios que coincidan con "{searchTerm}"
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            <BotonCarritoFlotante onClick={() => setShowCartModal(true)} />

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
                    onSeguirCotizando={() => setShowConfirmModal(false)}
                    user={user}
                />
            )}
        </div>
        </>
    );
}