// =============================================================================
// ARCHIVO  : ServiciosClientePage.jsx  — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// NOTA     : Solo se modificó la capa de presentación. La lógica de negocio
//            (API calls, carrito, modales) permanece 100% intacta.
// =============================================================================

import HeaderCliente from './HeaderCliente';
import React, { useState, useEffect } from 'react';
import { useAuth }    from '../autenticacion/AuthContext';
import { useCarrito } from '../modales/CarritoContext';
import { useNotificaciones, NotificacionContainer } from '../comun/Notificacion';
import CarritoModal         from '../modales/CarritoModal';
import BotonCarritoFlotante from '../modales/BotonCarritoFlotante';
import ServiceCardCliente   from './ServiceCardCliente';
import Footer               from '../comun/Footer1';
import api                  from '../../services/api';
import { leerCotizacionLocal, sincronizarCotizacionConBD } from '../../services/cotizacionStorage';
import './estilos_cliente/estilos_cotizar_cliente.css';

const IMAGEN_FALLBACK = '/img/imag1.jpg';
const formatMoneda = (v) => `$${v.toLocaleString('es-CO')}`;
const formatFecha  = (f) => new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// ── Modal cotización / agendamiento (lógica original intacta) ─────────────────
function ModalConfirmar({ isOpen, onClose, carritoItems, user, onPedidoConfirmado }) {
    const [stage,      setStage]    = useState(0);
    const [formData,   setFormData] = useState({});
    const [cotizacion, setCot]      = useState(null);
    const [pedidoFinal,setPFinal]   = useState(null);
    const [guardando,  setGuardando]= useState(false);
    const [errorMsg,   setErrorMsg] = useState('');

    if (!isOpen) return null;

    const calcTotal = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);

    const handleGenerar = () => {
        if (carritoItems.some(i => !i.tamano)) {
            alert('Por favor selecciona el Tamaño de todos los servicios.');
            return;
        }
        setCot({ id: 'COT-' + Date.now(), servicios: [...carritoItems], total: calcTotal(carritoItems) });
        setStage(1);
    };

    const handleConfirmar = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            alert('Completa los campos requeridos.');
            return;
        }
        setGuardando(true); setErrorMsg('');
        try {
            const serviciosList = (cotizacion ? cotizacion.servicios : carritoItems).map(i => ({
                Id_Servicio: i.id, cantidad: i.cantidad, tamano: i.tamano
            }));
            const userId = user?.id || user?.Id_Usuario;
            if (!userId) { setErrorMsg('Debes iniciar sesión para confirmar.'); setGuardando(false); return; }

            const rRes = await api.post('/reservas', {
                Id_Usuario:            userId,
                fecha:                 formData.fecha ? formData.fecha + 'T00:00:00.000Z' : undefined,
                Hora:                  formData.hora,
                Informacion_adicional: 'Dir: ' + formData.direccion + (formData.ciudad ? ', ' + formData.ciudad : '') + '. Tel: ' + (formData.telefono || ''),
                observaciones:         formData.observaciones || null,
                servicios:             serviciosList
            });
            if (!rRes.data.success) throw new Error(rRes.data.message);
            const rData = rRes.data.data;

            for (const item of (cotizacion ? cotizacion.servicios : carritoItems)) {
                await api.post('/cotizaciones', {
                    Id_usuario:      userId,
                    Id_servicio:     item.id,
                    Precio_cotizado: item.precio * item.cantidad,
                    Cantidad:         item.cantidad,
                    Tamano:           item.tamano || 'Estandar'
                });
            }
            setPFinal({
                id:        'PED-' + rData.ID_Reserva,
                fecha:     formData.fecha,
                hora:      formData.hora,
                direccion: formData.direccion,
                ciudad:    formData.ciudad,
                empleado:  rData.empleado_asignado,
                total:     cotizacion ? cotizacion.total : calcTotal(carritoItems)
            });
            setStage(3);
            onPedidoConfirmado();
        } catch (err) {
            console.error(err);
            setErrorMsg('Hubo un error al guardar tu pedido. Intenta nuevamente.');
        } finally { setGuardando(false); }
    };

    const cerrar = () => { setStage(0); setCot(null); setPFinal(null); setErrorMsg(''); onClose(); };
    const items  = cotizacion ? cotizacion.servicios : carritoItems;
    const total  = cotizacion ? cotizacion.total     : calcTotal(carritoItems);

    return (
        <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && cerrar()}>
            <div className="modal-content modal-confirmacion">
                <div className="modal-header">
                    <h2>{stage === 3 ? '🎉 Pedido confirmado' : stage === 1 ? '📋 Cotización' : stage === 2 ? '📅 Agendar' : '📋 Confirmar pedido'}</h2>
                    <button className="modal-close" onClick={cerrar}>×</button>
                </div>

                <div className="modal-body">
                    {/* Stage 0: seleccionar tamaños */}
                    {stage === 0 && (
                        <div>
                            <h3 style={{ fontFamily: 'Kanit', fontWeight: 700, marginBottom: 16, color: '#111' }}>
                                Selecciona los tamaños
                            </h3>
                            {carritoItems.map((item) => (
                                <div key={item.id} className="servicio-detalle">
                                    <h4>{item.nombre} (×{item.cantidad})</h4>
                                    <div className="form-group">
                                        <label>Tamaño *</label>
                                        <select onChange={(e) => { item._setTamano?.( e.target.value) || (item.tamano = e.target.value); }}>
                                            <option value="">Seleccionar tamaño</option>
                                            {(item.tamanos || ['Estandar']).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stage 1: cotización generada */}
                    {stage === 1 && cotizacion && (
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
                    )}

                    {/* Stage 2: formulario agendamiento */}
                    {stage === 2 && (
                        <div className="form-confirmacion">
                            <h3>📅 Datos del servicio</h3>
                            {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}
                            <div className="form-group">
                                <label>Dirección *</label>
                                <input type="text" placeholder="Ej: Calle 80 #25-10, Bogotá"
                                    value={formData.direccion || ''}
                                    onChange={e => setFormData(p => ({ ...p, direccion: e.target.value }))} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input type="text" placeholder="Bogotá"
                                        value={formData.ciudad || ''}
                                        onChange={e => setFormData(p => ({ ...p, ciudad: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono de contacto</label>
                                    <input type="tel" placeholder="310 000 0000"
                                        value={formData.telefono || ''}
                                        onChange={e => setFormData(p => ({ ...p, telefono: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha *</label>
                                    <input type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.fecha || ''}
                                        onChange={e => setFormData(p => ({ ...p, fecha: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label>Hora *</label>
                                    <input type="time"
                                        value={formData.hora || ''}
                                        onChange={e => setFormData(p => ({ ...p, hora: e.target.value }))} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Observaciones (opcional)</label>
                                <textarea placeholder="Mascotas, instrucciones especiales..."
                                    value={formData.observaciones || ''}
                                    onChange={e => setFormData(p => ({ ...p, observaciones: e.target.value }))} />
                            </div>
                            {/* Resumen compacto */}
                            <div className="total-cotizacion" style={{ marginTop: 8 }}>
                                <span>Total</span>
                                <strong>{formatMoneda(total)}</strong>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: pedido confirmado */}
                    {stage === 3 && pedidoFinal && (
                        <div className="confirmacion-exitosa">
                            <div className="icono-exito">🎉</div>
                            <h3>¡Pedido confirmado!</h3>
                            <p>ID: <strong>{pedidoFinal.id}</strong></p>
                            <div className="pedido-confirmado">
                                <p>📅 <strong>Fecha:</strong> {formatFecha(pedidoFinal.fecha)}</p>
                                <p>⏰ <strong>Hora:</strong> {pedidoFinal.hora}</p>
                                <p>📍 <strong>Dirección:</strong> {pedidoFinal.direccion}{pedidoFinal.ciudad ? ', ' + pedidoFinal.ciudad : ''}</p>
                                {pedidoFinal.empleado && <p>👷 <strong>Técnico asignado:</strong> {pedidoFinal.empleado}</p>}
                            </div>
                            <div className="total-cotizacion">
                                <span>Total</span>
                                <strong>{formatMoneda(pedidoFinal.total)}</strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {stage === 0 && <>
                        <button className="btn-secondary" onClick={cerrar}>Cancelar</button>
                        <button className="btn-primary" onClick={handleGenerar}>Generar cotización →</button>
                    </>}
                    {stage === 1 && <>
                        <button className="btn-secondary" onClick={cerrar}>Cancelar</button>
                        <button className="btn-primary" onClick={() => setStage(2)}>Continuar y agendar →</button>
                    </>}
                    {stage === 2 && <>
                        <button className="btn-cancelar" onClick={() => setStage(1)}>← Volver</button>
                        <button className="btn-confirmar" onClick={handleConfirmar} disabled={guardando}>
                            {guardando ? 'Guardando...' : '✓ Confirmar pedido'}
                        </button>
                    </>}
                    {stage === 3 && (
                        <button className="btn-primary" style={{ width: '100%' }} onClick={cerrar}>
                            ¡Listo!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const ServiciosClientePage = ({ onBackToHome, onCotizacion, onPerfil }) => {
    const { user }                   = useAuth();
    const { carrito, agregarAlCarrito } = useCarrito();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();

    const [servicios,           setServicios]          = useState([]);
    const [isLoading,           setIsLoading]          = useState(true);
    const [searchQuery,         setSearchQuery]        = useState('');
    const [mostrarCarritoModal, setMostrarCarritoModal]= useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion]= useState(false);
    const [carritoSnapshot,     setCarritoSnapshot]    = useState([]);
    const [syncMsg,             setSyncMsg]            = useState('');
    const [searchFocused,       setSearchFocused]      = useState(false);

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
                        tamanos:     ['Estandar'],
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
        if (!user?.id) return;
        const datos = leerCotizacionLocal();
        if (!datos?.items?.length) return;
        setSyncMsg('⏳ Sincronizando cotización previa...');
        sincronizarCotizacionConBD(user.id).then(res => {
            setSyncMsg(res.success
                ? `✅ ${res.sincronizados + res.actualizados} servicio(s) guardados.`
                : '⚠️ No se pudo sincronizar la cotización.');
            setTimeout(() => setSyncMsg(''), 5000);
        });
    }, [user?.id]);

    const serviciosFiltrados = servicios.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleFinalizarCompra = () => {
        if (!carrito?.length) { agregarNotificacion('El carrito está vacío', 'error'); return; }
        setCarritoSnapshot([...carrito]);
        setMostrarCarritoModal(false);
        setMostrarConfirmacion(true);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>

            {/* Sync toast */}
            {syncMsg && (
                <div style={{
                    position: 'fixed', top: 84, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg,#1a56ff,#7c3aed)', color: '#fff',
                    padding: '10px 24px', borderRadius: 50, fontWeight: 600, zIndex: 10001,
                    boxShadow: '0 4px 20px rgba(26,86,255,0.35)', fontSize: 14,
                    fontFamily: 'Kanit', whiteSpace: 'nowrap'
                }}>
                    {syncMsg}
                </div>
            )}

            <HeaderCliente
                onBackToHome={onBackToHome}
                onPerfil={onPerfil}
                onCotizacion={onCotizacion}
                activeLink="agendar"
            />

            <main style={{ flex: 1, paddingTop: 72 }}>

                {/* ── Estilos que sobreescriben el CSS viejo ── */}
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

                {/* ── Búsqueda ── */}
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios: muebles, colchones, tapicería, carros..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            aria-label="Buscar servicios"
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
                        textAlign: 'center',
                        fontSize: 14,
                        color: '#8890aa',
                        marginBottom: 44,
                        fontFamily: 'Kanit',
                        fontWeight: 400,
                        letterSpacing: '0.3px'
                    }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    {isLoading ? (
                        <div className="state-loading">⏳ Cargando servicios...</div>
                    ) : (
                        <div className="services-grid">
                            {serviciosFiltrados.length > 0 ? (
                                serviciosFiltrados.map(s => (
                                    <ServiceCardCliente
                                        key={s.id}
                                        servicio={s}
                                        onNotificacion={(msg) => agregarNotificacion(msg, 'exito')}
                                    />
                                ))
                            ) : (
                                <div className="state-empty">
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                                    <p>No se encontraron servicios para "<strong>{searchQuery}</strong>"</p>
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

            <BotonCarritoFlotante onClick={() => setMostrarCarritoModal(true)} />

            <CarritoModal
                isOpen={mostrarCarritoModal}
                onClose={() => setMostrarCarritoModal(false)}
                onFinalizarCompra={handleFinalizarCompra}
            />

            <ModalConfirmar
                isOpen={mostrarConfirmacion}
                onClose={() => { setMostrarConfirmacion(false); setCarritoSnapshot([]); }}
                carritoItems={carritoSnapshot}
                user={user}
                onPedidoConfirmado={() => {}}
            />

            <NotificacionContainer notificaciones={notificaciones} onRemove={removerNotificacion} />
        </div>
    );
};

export default ServiciosClientePage;