// =============================================================================
// ARCHIVO  : CotizacionesCliente.jsx
// PROYECTO : FoamWash
// REDISEÑO : Buscador con SVG, título oscuro, fondo suave — lógica intacta
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

const calcularTotal = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);
const formatMoneda  = (v)     => `$${v.toLocaleString('es-CO')}`;
const formatFecha   = (f)     => new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

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
                {carrito.length === 0 ? (
                    <div className="carrito-vacio">
                        <div className="carrito-vacio-icono">🛒</div>
                        <p>El carrito está vacío</p>
                    </div>
                ) : (
                    <div className="carrito-lista">
                        {carrito.map((item) => (
                            <div key={item.id} className="carrito-item">
                                <img src={item.imagen || IMAGEN_FALLBACK} alt={item.nombre} className="carrito-item-img" />
                                <div className="carrito-item-info">
                                    <h4>{item.nombre}</h4>
                                    <p className="carrito-item-precio">{formatMoneda(item.precio)}</p>
                                </div>
                                <div className="carrito-cantidad">
                                    <button className="btn-cantidad" onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}>−</button>
                                    <span className="cantidad-num">{item.cantidad}</span>
                                    <button className="btn-cantidad" onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                                </div>
                                <button className="btn-eliminar-item" onClick={() => onActualizarCantidad(item.id, 0)}>✕</button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="carrito-total">
                    <h3>Total</h3>
                    <span className="carrito-total-precio">{formatMoneda(total)}</span>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn-secondary" onClick={onCerrar}>Seguir cotizando</button>
                <button className="btn-primary" onClick={onFinalizarCompra} disabled={carrito.length === 0}>
                    Ver cotización →
                </button>
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUBCOMPONENTE: Modal de Confirmación + Agendación
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmationModal = ({ carrito, total, onCerrar, onActualizarDetalle, onConfirmarPedido, onSeguirCotizando, user }) => {
    const [stage,        setStage]        = useState(0);
    const [formData,     setFormData]     = useState({});
    const [cotizacion,   setCotizacion]   = useState(null);
    const [pedidoFinal,  setPedidoFinal]  = useState(null);
    const [guardando,    setGuardando]    = useState(false);
    const [errorGuardar, setErrorGuardar] = useState('');

    const handleGenerarCotizacion = () => {
        if (carrito.some(i => !i.tamano)) {
            alert('Por favor completa el Tamaño de todos los servicios.');
            return;
        }
        setCotizacion({
            id:        `COT-${Date.now()}`,
            servicios: carrito.map(i => ({ ...i })),
            total:     calcularTotal(carrito),
            fechaCreacion: new Date().toISOString()
        });
        setStage(1);
    };

    const handleConfirmar = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            alert('Por favor completa los campos requeridos.');
            return;
        }
        setGuardando(true); setErrorGuardar('');
        try {
            const serviciosList = (cotizacion?.servicios || carrito).map(i => ({
                Id_Servicio: i.id, cantidad: i.cantidad, tamano: i.tamano
            }));
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
                id:       `PED-${reservaData.ID_Reserva}`,
                fecha:    formData.fecha,
                hora:     formData.hora,
                direccion: formData.direccion,
                ciudad:   formData.ciudad,
                empleado: reservaData.empleado_asignado,
                total:    cotizacion?.total || total
            });
            setStage(3);
            onConfirmarPedido();
        } catch (err) {
            console.error('Error al confirmar pedido:', err);
            setErrorGuardar('Hubo un error al guardar tu pedido. Por favor intenta nuevamente.');
        } finally { setGuardando(false); }
    };

    const onClose      = () => { setStage(0); setCotizacion(null); setPedidoFinal(null); setErrorGuardar(''); onCerrar(); };
    const itemsResumen = cotizacion ? cotizacion.servicios : carrito;
    const totalActual  = cotizacion ? cotizacion.total     : total;

    let content, footer;

    if (stage === 0) {
        content = (
            <>
                <h3 style={{ fontFamily: 'Kanit', fontWeight: 700, marginBottom: 6, color: '#111', textAlign: 'center' }}>
                    Selecciona los detalles
                </h3>
                <p style={{ color: '#999', textAlign: 'center', marginBottom: 20, fontSize: 14, fontFamily: 'Kanit' }}>
                    Completa el tamaño de cada servicio para generar la cotización
                </p>
                {carrito.map((item, i) => (
                    <div key={item.id} className="servicio-detalle">
                        <h4>{item.nombre} (×{item.cantidad})</h4>
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
                <button className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn-primary" onClick={handleGenerarCotizacion}>Generar cotización →</button>
            </>
        );
    } else if (stage === 1 && cotizacion) {
        content = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">📋</div>
                <h3>¡Cotización lista!</h3>
                <p>Código: <strong>{cotizacion.id}</strong></p>
                <div className="resumen-cotizacion">
                    {cotizacion.servicios.map(item => (
                        <div key={item.id} className="resumen-item">
                            <strong>{item.nombre}</strong>
                            <small>📏 {item.tamano} · ×{item.cantidad}</small>
                            <span className="precio-item">{formatMoneda(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                    <div className="total-cotizacion">
                        <span>Total estimado</span>
                        <strong>{formatMoneda(cotizacion.total)}</strong>
                    </div>
                </div>
            </div>
        );
        footer = (
            <>
                <button className="btn-secondary" onClick={() => { onSeguirCotizando(); onClose(); }}>
                    Seguir cotizando
                </button>
                <button className="btn-primary" onClick={() => setStage(2)}>
                    Agendar servicio →
                </button>
            </>
        );
    } else if (stage === 2) {
        content = (
            <div className="form-confirmacion">
                <h3>Datos del servicio</h3>
                {errorGuardar && <div className="error-msg">⚠️ {errorGuardar}</div>}
                <div className="form-group">
                    <label>Dirección *</label>
                    <input type="text" placeholder="Calle 123 #45-67"
                        onChange={(e) => setFormData(p => ({ ...p, direccion: e.target.value }))} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Ciudad</label>
                        <input type="text" placeholder="Bogotá"
                            onChange={(e) => setFormData(p => ({ ...p, ciudad: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input type="tel" placeholder="300 123 4567"
                            onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha *</label>
                        <input type="date" min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData(p => ({ ...p, fecha: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label>Hora preferida *</label>
                        <select onChange={(e) => setFormData(p => ({ ...p, hora: e.target.value }))}>
                            <option value="">Seleccionar</option>
                            {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => (
                                <option key={h} value={h}>{h} {parseInt(h) < 12 ? 'AM' : 'PM'}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Observaciones (opcional)</label>
                    <textarea rows="3" placeholder="Mascotas, instrucciones especiales, acceso..."
                        onChange={(e) => setFormData(p => ({ ...p, observaciones: e.target.value }))} />
                </div>
                <div className="total-cotizacion" style={{ marginTop: 8 }}>
                    <span>Total</span>
                    <strong>{formatMoneda(totalActual)}</strong>
                </div>
            </div>
        );
        footer = (
            <>
                <button className="btn-secondary" onClick={() => setStage(1)}>← Volver</button>
                <button className="btn-confirmar" onClick={handleConfirmar} disabled={guardando}>
                    {guardando ? 'Guardando...' : '✓ Confirmar pedido'}
                </button>
            </>
        );
    } else if (stage === 3 && pedidoFinal) {
        content = (
            <div className="confirmacion-exitosa">
                <div className="icono-exito">🎉</div>
                <h3>¡Pedido confirmado!</h3>
                <p>ID: <strong>{pedidoFinal.id}</strong></p>
                <div className="pedido-confirmado">
                    <p>📅 <strong>Fecha:</strong> {formatFecha(pedidoFinal.fecha)}</p>
                    <p>⏰ <strong>Hora:</strong> {pedidoFinal.hora}</p>
                    <p>📍 <strong>Dirección:</strong> {pedidoFinal.direccion}{pedidoFinal.ciudad ? `, ${pedidoFinal.ciudad}` : ''}</p>
                    {pedidoFinal.empleado && <p>👷 <strong>Técnico:</strong> {pedidoFinal.empleado}</p>}
                </div>
                <div className="total-cotizacion">
                    <span>Total</span>
                    <strong>{formatMoneda(pedidoFinal.total)}</strong>
                </div>
            </div>
        );
        footer = <button className="btn-primary" style={{ width: '100%' }} onClick={onClose}>¡Listo!</button>;
    }

    return (
        <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
            <div className="modal-content modal-confirmacion">
                <div className="modal-header">
                    <h2>{stage === 3 ? '🎉 Pedido confirmado' : stage === 1 ? '📋 Cotización' : stage === 2 ? '📅 Agendar' : '📋 Confirmar pedido'}</h2>
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
    const { user }   = useAuth();
    const { carrito, agregarAlCarrito, actualizarCantidad, actualizarDetalle } = useCarrito();

    const [servicios,        setServicios]        = useState([]);
    const [isLoading,        setIsLoading]        = useState(true);
    const [searchTerm,       setSearchTerm]       = useState('');
    const [showCartModal,    setShowCartModal]    = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const total      = useMemo(() => calcularTotal(carrito), [carrito]);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    setServicios(res.data.data.map(s => ({
                        ...s,
                        id:          s.Id_Servicio     || s.id,
                        nombre:      s.Nombre_Servicio || s.nombre      || 'Sin nombre',
                        descripcion: s.Descripcion     || s.descripcion || '',
                        precio:      Number(s.Precio   || s.precio      || 0),
                        imagen:      s.imagen_url      || IMAGEN_FALLBACK,
                        tamanos:     ['Estándar'],
                        rating:      4.8,
                        garantia:    true,
                        ecologico:   true,
                        popular:     false
                    })));
                } else { setServicios([]); }
            } catch { setServicios([]); }
            finally  { setIsLoading(false); }
        };
        cargar();
    }, []);

    useEffect(() => {
        if (!user && carrito.length > 0) guardarCotizacionLocal(carrito);
    }, [carrito, user]);

    const filtered = servicios.filter(s => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleActualizarCantidad = (id, n) => actualizarCantidad?.(id, n);
    const handleActualizarDetalle  = (id, campo, valor) => actualizarDetalle?.(id, campo, valor);
    const handleFinalizarCompra    = () => { if (!carrito.length) return; setShowCartModal(false); setShowConfirmModal(true); };
    const handleConfirmarPedido    = () => { if (typeof window !== 'undefined') localStorage.removeItem('foamwash_carrito_local'); };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>

            {/* ── Estilos que fuerzan el nuevo diseño sobre el CSS viejo ── */}
            <style>{`
                .search-section {
                    background: #fff !important;
                    padding: 28px 20px !important;
                    display: flex !important;
                    justify-content: center !important;
                    border-bottom: 1px solid #eef0f5 !important;
                }
                .search-container {
                    position: relative !important;
                    width: 100% !important;
                    max-width: 640px !important;
                }
                .search-input {
                    width: 100% !important;
                    padding: 14px 52px 14px 22px !important;
                    font-size: 15px !important;
                    font-family: 'Kanit', sans-serif !important;
                    border: 1.5px solid #e0e4ef !important;
                    border-radius: 50px !important;
                    outline: none !important;
                    background: #f8f9ff !important;
                    color: #111 !important;
                    box-shadow: none !important;
                    transition: border-color 0.22s ease, box-shadow 0.22s ease !important;
                }
                .search-input:focus {
                    border-color: #1a56ff !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 3px rgba(26,86,255,0.10) !important;
                }
                .search-button {
                    position: absolute !important;
                    right: 16px !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    background: none !important;
                    border: none !important;
                    color: #8890aa !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    padding: 4px !important;
                    font-size: 0 !important;
                    transition: color 0.2s !important;
                }
                .search-button:hover { color: #1a56ff !important; }
                .section-title {
                    font-size: 34px !important;
                    font-weight: 800 !important;
                    color: #0a1435 !important;
                    text-shadow: none !important;
                    margin-bottom: 10px !important;
                    letter-spacing: -0.5px !important;
                }
                .services-section {
                    background: #f6f7fb !important;
                    padding: 52px 40px 80px !important;
                }
            `}</style>

            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={() => {}}
                onPerfil={onPerfil}
                onServicios={onGoToServicios || onServicios}
                activeLink="cotizacion"
            />

            <main style={{ flex: 1, paddingTop: 72 }}>
                {/* ── Búsqueda ── */}
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios: muebles, colchones, tapicería, carros..."
                            aria-label="Buscar servicios"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" aria-label="Buscar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                    </div>
                </section>

                {/* ── Servicios ── */}
                <section className="services-section">
                    <h2 className="section-title">Nuestros Servicios</h2>
                    <p style={{
                        textAlign: 'center', fontSize: 14, color: '#8890aa',
                        marginBottom: 44, fontFamily: 'Kanit', fontWeight: 400, letterSpacing: '0.3px'
                    }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    {isLoading ? (
                        <div className="state-loading">⏳ Cargando servicios...</div>
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
                                <div className="state-empty">
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                    <p>No se encontraron servicios para "<strong>{searchTerm}</strong>"</p>
                                    <p style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>
                                        Intenta con: muebles, colchones, tapicería, alfombras…
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
    );
}