// =============================================================================
// ARCHIVO  : ServiciosClientePage.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/ServiciosClientePage.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Página principal de servicios para el cliente autenticado. Muestra el catálogo y permite agendar.
// =============================================================================

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
const formatFecha  = (f) => new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// ── Modal de confirmacion + agendacion ───────────────────────────────────────
function ModalConfirmar({ isOpen, onClose, carritoItems, user, onPedidoConfirmado }) {
    const [stage,       setStage]      = useState(0);
    const [formData,    setFormData]   = useState({});
    const [cotizacion,  setCotizacion] = useState(null);
    const [pedidoFinal, setPFinal]     = useState(null);
    const [guardando,   setGuardando]  = useState(false);
    const [errorMsg,    setErrorMsg]   = useState('');

    if (!isOpen) return null;

    const calcTotal = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);

    const handleGenerar = () => {
        if (carritoItems.some(i => !i.tamano)) {
            alert('Por favor selecciona el Tamaño de todos los servicios.');
            return;
        }
        setCotizacion({ id: 'COT-' + Date.now(), servicios: [...carritoItems], total: calcTotal(carritoItems) });
        setStage(1);
    };

    const handleConfirmar = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            alert('Completa los campos requeridos.');
            return;
        }
        setGuardando(true);
        setErrorMsg('');
        try {
            const serviciosList = (cotizacion ? cotizacion.servicios : carritoItems).map(i => ({
                Id_Servicio: i.id,
                cantidad:    i.cantidad,
                tamano:      i.tamano
            }));

            // 1. Crear reserva -> el backend asigna empleado automaticamente
            // Verificar que el usuario esté autenticado antes de crear reserva
            const userId = user?.id || user?.Id_Usuario;
            if (!userId) {
                setErrorMsg('Debes iniciar sesión para confirmar el pedido.');
                setGuardando(false);
                return;
            }

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

            // 2. Guardar cotizaciones en BD (backend hace anti-duplicado)
            if (userId) {
                for (const item of (cotizacion ? cotizacion.servicios : carritoItems)) {
                    await api.post('/cotizaciones', {
                        Id_usuario:      userId,
                        Id_servicio:     item.id,
                        Precio_cotizado: item.precio * item.cantidad,
                        Cantidad:        item.cantidad,
                        Tamano:          item.tamano || 'Estandar'
                    });
                }
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
        } finally {
            setGuardando(false);
        }
    };

    const cerrar = () => { setStage(0); setCotizacion(null); setPFinal(null); setErrorMsg(''); onClose(); };
    const items  = cotizacion ? cotizacion.servicios : carritoItems;
    const total  = cotizacion ? cotizacion.total     : calcTotal(carritoItems);

    return (
        <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && cerrar()}>
            <div className="modal-content modal-confirmacion">
                <div className="modal-header">
                    <h2>{stage === 3 ? '🎉 Éxito' : '📋 Confirmar'}</h2>
                    <button className="modal-close" onClick={cerrar}>×</button>
                </div>
                <div className="modal-body">
                    {stage === 0 && (
                        <div>
                            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>📋 Generar Cotización</h3>
                            {carritoItems.map((item, i) => (
                                <div key={item.id} className="servicio-detalle">
                                    <h4>{item.nombre} (x{item.cantidad})</h4>
                                    <div className="form-group">
                                        <label>Tamaño *</label>
                                        <select onChange={(e) => item._setTamano && item._setTamano(e.target.value)
                                            || (item.tamano = e.target.value)}>
                                            <option value="">Seleccionar</option>
                                            {(item.tamanos || ['Estandar']).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {stage === 1 && cotizacion && (
                        <div className="confirmacion-exitosa">
                            <div className="icono-exito">📋</div>
                            <h3>¡Cotización Generada!</h3>
                            <p>Código: <strong>{cotizacion.id}</strong></p>
                            <div style={{ background: '#f8f9fa', padding: 15, borderRadius: 8, margin: '20px 0', textAlign: 'left' }}>
                                {cotizacion.servicios.map(item => (
                                    <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #dee2e6' }}>
                                        <strong>{item.nombre}</strong><br />
                                        <small>📏 {item.tamano} | ✖️ {item.cantidad}</small><br />
                                        <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatMoneda(item.precio * item.cantidad)}</span>
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff', margin: '20px 0' }}>
                                Total: {formatMoneda(cotizacion.total)}
                            </p>
                        </div>
                    )}
                    {stage === 2 && (
                        <div className="form-confirmacion">
                            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>📅 Agendar Servicio</h3>
                            {errorMsg && <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', padding: 12, borderRadius: 8, marginBottom: 16, color: '#c00' }}>⚠️ {errorMsg}</div>}
                            <div className="form-group"><label>Dirección *</label><input type="text" placeholder="Calle 123 #45-67" onChange={(e) => setFormData(p => ({ ...p, direccion: e.target.value }))} /></div>
                            <div className="form-group"><label>Ciudad</label><input type="text" placeholder="Bogotá" onChange={(e) => setFormData(p => ({ ...p, ciudad: e.target.value }))} /></div>
                            <div className="form-group"><label>Teléfono</label><input type="tel" placeholder="300 123 4567" onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))} /></div>
                            <div className="form-group"><label>Fecha *</label><input type="date" min={new Date().toISOString().split('T')[0]} onChange={(e) => setFormData(p => ({ ...p, fecha: e.target.value }))} /></div>
                            <div className="form-group">
                                <label>Hora preferida *</label>
                                <select onChange={(e) => setFormData(p => ({ ...p, hora: e.target.value }))}>
                                    <option value="">Seleccionar</option>
                                    {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => (
                                        <option key={h} value={h}>{h} {parseInt(h) < 12 ? 'AM' : 'PM'}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group"><label>Observaciones</label><textarea rows="3" placeholder="Información adicional..." onChange={(e) => setFormData(p => ({ ...p, observaciones: e.target.value }))} /></div>
                            <div className="resumen-pedido">
                                <h3>Resumen</h3>
                                {items.map(i => (
                                    <div key={i.id} className="resumen-item">
                                        <span>{i.nombre} x{i.cantidad}</span>
                                        <span>{formatMoneda(i.precio * i.cantidad)}</span>
                                    </div>
                                ))}
                                <div className="resumen-total-final"><strong>Total:</strong><span>{formatMoneda(total)}</span></div>
                            </div>
                        </div>
                    )}
                    {stage === 3 && pedidoFinal && (
                        <div className="confirmacion-exitosa">
                            <div className="icono-exito">✓</div>
                            <h3>¡Pedido confirmado!</h3>
                            <p>Código: <strong>{pedidoFinal.id}</strong></p>
                            <p>📅 {formatFecha(pedidoFinal.fecha)} a las {pedidoFinal.hora}</p>
                            <p>📍 {pedidoFinal.direccion}{pedidoFinal.ciudad ? ', ' + pedidoFinal.ciudad : ''}</p>
                            <p>👷 Empleado asignado: <strong>{pedidoFinal.empleado}</strong></p>
                            <p>💰 Total: <strong>{formatMoneda(pedidoFinal.total)}</strong></p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    {stage === 0 && <><button className="btn-cancelar" onClick={cerrar}>Cancelar</button><button className="btn-confirmar" onClick={handleGenerar}>📋 Generar Cotización</button></>}
                    {stage === 1 && <><button className="btn-cancelar" onClick={cerrar}>Seguir Cotizando</button><button className="btn-confirmar" onClick={() => setStage(2)}>📅 Agendar</button></>}
                    {stage === 2 && <><button className="btn-cancelar" onClick={() => setStage(1)}>Volver</button><button className="btn-confirmar" onClick={handleConfirmar} disabled={guardando}>{guardando ? '⏳ Guardando...' : 'Confirmar Pedido'}</button></>}
                    {stage === 3 && <button className="btn-primary" onClick={cerrar}>Aceptar</button>}
                </div>
            </div>
        </div>
    );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
const ServiciosClientePage = ({ onBackToHome, onCotizacion, onPerfil }) => {
    const { user, logout }   = useAuth();
    const { carrito, agregarAlCarrito } = useCarrito();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();

    const [servicios,            setServicios]            = useState([]);
    const [isLoading,            setIsLoading]            = useState(true);
    const [searchQuery,          setSearchQuery]          = useState('');
    const [mostrarCarritoModal,  setMostrarCarritoModal]  = useState(false);
    const [mostrarConfirmacion,  setMostrarConfirmacion]  = useState(false);
    const [carritoSnapshot,      setCarritoSnapshot]      = useState([]);
    const [syncMsg,              setSyncMsg]              = useState('');

    // ── 1. Cargar servicios desde BD ─────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    setServicios(res.data.data.map(s => ({
                        ...s,
                        // Normalizar campos del backend a los que usa ServiceCardCliente
                        id:          s.Id_Servicio        || s.id,
                        nombre:      s.Nombre_Servicio    || s.nombre       || 'Sin nombre',
                        descripcion: s.Descripcion        || s.descripcion  || '',
                        precio:      Number(s.Precio      || s.precio       || 0),
                        imagen:      s.imagen_url         || IMAGEN_FALLBACK,
                        tamanos:     ['Estandar'],
                        rating:      4.8,
                        garantia:    true,
                        ecologico:   true,
                        popular:     false
                    })));
                } else {
                    setServicios([]);
                }
            } catch {
                console.warn('No se pudieron cargar servicios');
                setServicios([]);
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, []);

    // ── 2. Sincronizar cotizacion local -> BD al iniciar sesion ──────────────
    useEffect(() => {
        if (!user?.id) return;
        const datos = leerCotizacionLocal();
        if (!datos || !datos.items || datos.items.length === 0) return;

        setSyncMsg('⏳ Sincronizando tu cotización previa...');
        sincronizarCotizacionConBD(user.id).then(res => {
            setSyncMsg(res.success
                ? '✅ ' + (res.sincronizados + res.actualizados) + ' servicio(s) guardados en tu cuenta.'
                : '⚠️ No se pudo sincronizar la cotización.');
            setTimeout(() => setSyncMsg(''), 5000);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const serviciosFiltrados = servicios.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleCerrarSesion = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            agregarNotificacion('Cerrando sesión...', 'info');
            setTimeout(() => { logout(); onBackToHome(); }, 800);
        }
    };

    const handleAgregarAlCarrito = (servicio) => {
        agregarAlCarrito(servicio);
        agregarNotificacion(servicio.nombre + ' agregado al carrito', 'exito');
    };

    const handleFinalizarCompra = () => {
        if (!carrito || carrito.length === 0) {
            agregarNotificacion('El carrito está vacío', 'error');
            return;
        }
        setCarritoSnapshot([...carrito]);
        setMostrarCarritoModal(false);
        setMostrarConfirmacion(true);
    };

    const handlePedidoConfirmado = () => {
        // El carrito se limplia desde CarritoContext / ConfirmacionModal
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {syncMsg && (
                <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#223BFF', color: '#fff', padding: '10px 24px', borderRadius: 50, fontWeight: 600, zIndex: 10001, boxShadow: '0 4px 16px rgba(34,59,255,0.3)' }}>
                    {syncMsg}
                </div>
            )}

            <header className="header-banner">
                <img src="img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 className="logo-header" onClick={onBackToHome} style={{ cursor: 'pointer' }}>FoamWash</h1>
                <nav className="nav-bar">
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onBackToHome(); }}>Hogar</a>
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onCotizacion?.(); }}>Cotización</a>
                    <a href="#" className="nav-link" style={{ color: 'rgb(133, 198, 255)' }}
                        onClick={e => { e.preventDefault(); document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                        Agendar
                    </a>
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onPerfil?.(); }}>Perfil</a>
                    <a href="#" className="nav-link btn-salir" onClick={handleCerrarSesion}>Cerrar Sesión</a>
                </nav>
            </header>

            <main style={{ flex: 1 }}>
                <section className="search-section">
                    <div className="search-container">
                        <input type="text" className="search-input"
                            placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                            aria-label="Buscar servicios"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
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
                            {serviciosFiltrados.length > 0 ? (
                                serviciosFiltrados.map(s => (
                                    <ServiceCardCliente
                                        key={s.id}
                                        servicio={s}
                                        onNotificacion={(msg) => agregarNotificacion(msg, 'exito')}
                                    />
                                ))
                            ) : (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                    <p style={{ fontSize: 18 }}>No se encontraron servicios que coincidan con "{searchQuery}"</p>
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
                onPedidoConfirmado={handlePedidoConfirmado}
            />

            <NotificacionContainer notificaciones={notificaciones} onRemove={removerNotificacion} />
        </div>
    );
};

export default ServiciosClientePage;