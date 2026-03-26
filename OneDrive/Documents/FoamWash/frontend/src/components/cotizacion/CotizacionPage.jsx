// =============================================================================
// ARCHIVO  : CotizacionPage.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cotizacion/CotizacionPage.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Página de cotización pública (sin login requerido). Permite agregar servicios al carrito y guardar la cotización.
// =============================================================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useCarrito }        from '../modales/CarritoContext';
import { useAuth }           from '../autenticacion/AuthContext';
import CotizacionServiceCard from './CotizacionServiceCard';
import FooterPublic          from '../comun/FooterPublic';
import api                   from '../../services/api';
import {
    leerCotizacionLocal,
    guardarCotizacionLocal,
    limpiarCotizacionLocal,
    sincronizarCotizacionConBD,
    tiempoRestanteCotizacion
} from '../../services/cotizacionStorage';
import './estilos_cotizar.css';

const IMAGEN_FALLBACK = '/img/imag1.jpg';

// Fallback estático solo si la BD falla completamente
const SERVICIOS_FALLBACK = [
    { id: 1, nombre: "Lavado de muebles",              precio: 90000,  imagen_url: "/img/imag1.jpg", descripcion: "Lavado profundo de sofás y sillas, eliminación de manchas y olores.",     tamanos: ["Pequeño","Mediano","Grande"],           duracion: "60-90 min",    rating: 4.8, garantia: true,  ecologico: true,  popular: true  },
    { id: 2, nombre: "Lavado de alfombras",             precio: 50000,  imagen_url: "/img/imag4.jpg", descripcion: "Limpieza profunda para alfombras pequeñas y medianas.",                   tamanos: ["Pequeña","Mediana","Grande"],           duracion: "45-60 min",    rating: 4.9, garantia: true,  ecologico: false, popular: false },
    { id: 3, nombre: "Tapicería de carros",             precio: 140000, imagen_url: "/img/imag5.jpg", descripcion: "Limpieza interior del vehículo: asientos, alfombras y paneles.",          tamanos: ["Sedan","SUV","Camioneta"],              duracion: "120-150 min",  rating: 5.0, garantia: true,  ecologico: true,  popular: false },
    { id: 4, nombre: "Lavado de cortinas",              precio: 80000,  imagen_url: "/img/imag7.jpg", descripcion: "Lavado y planchado ligero para cortinas y visillos.",                     tamanos: ["Por metro","Juego completo"],           duracion: "30-45 min",    rating: 4.7, garantia: false, ecologico: true,  popular: false },
    { id: 5, nombre: "Lavado de colchones",             precio: 90000,  imagen_url: "/img/imag6.jpg", descripcion: "Eliminación de ácaros y manchas, desodorización y secado rápido.",        tamanos: ["Sencillo","Semi-doble","Doble","Queen","King"], duracion: "90-120 min", rating: 4.8, garantia: true, ecologico: true, popular: true },
    { id: 6, nombre: "Mantenimiento y pulido de pisos", precio: 100000, imagen_url: "/img/imag8.jpg", descripcion: "Recuperar brillo, proteger la superficie y mejorar su apariencia.",       tamanos: ["Pequeño (hasta 50m²)","Mediano (50-100m²)","Grande (más de 100m²)"], duracion: "120-180 min", rating: 4.6, garantia: true, ecologico: false, popular: false },
    { id: 7, nombre: "Limpieza sillas de comedor",      precio: 7000,   imagen_url: "/img/imag2.jpg", descripcion: "Elimina manchas, suciedad y malos olores.",                               tamanos: ["7.000 por silla","10.000 por silla"],   duracion: "15-20 min",    rating: 4.9, garantia: false, ecologico: true,  popular: true  },
    { id: 8, nombre: "Limpieza de tapetes decorativos", precio: 60000,  imagen_url: "/img/imag3.jpg", descripcion: "Remueve suciedad, polvo y manchas, devolviendo frescura y color.",        tamanos: ["Pequeño (hasta 50m²)","Mediano (50-100m²)","Grande (más de 100m²)"], duracion: "40-60 min", rating: 4.7, garantia: true, ecologico: true, popular: false },
];

// ── Utilidades ────────────────────────────────────────────────────────────────
const calcularTotal   = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);
const formatearMoneda = (v)     => `$${v.toLocaleString('es-CO')}`;
const formatearFecha  = (f)     => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Modal: pedir login ────────────────────────────────────────────────────────
const AuthPromptModal = ({ onClose, onLogin }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
        <div style={{ background: '#fff', padding: 28, borderRadius: 14, width: 'min(480px,96%)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', right: 16, top: 14, border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#666' }}>✕</button>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(#223BFF, #0b74ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24, margin: '0 auto 16px' }}>FW</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>Inicia sesión para agendar</h3>
                <p style={{ color: '#666', margin: '0 0 20px' }}>Tu cotización se guardará automáticamente cuando ingreses.</p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={onClose} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                    <button onClick={onLogin} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', background: '#0b74ff', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Iniciar Sesión</button>
                </div>
            </div>
        </div>
    </div>
);

// ── Modal: Carrito ────────────────────────────────────────────────────────────
const CartModal = ({ carrito, total, onActualizarCantidad, onCerrar, onFinalizarCompra }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, width: 'min(550px,96%)', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>🛒 Mi Cotización</h2>
                <button onClick={onCerrar} style={{ border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {carrito.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                        <p>No hay servicios en tu cotización</p>
                    </div>
                ) : carrito.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <img
                            src={item.imagen}
                            alt={item.nombre}
                            style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }}
                            onError={e => { e.target.src = IMAGEN_FALLBACK; }}
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15 }}>{item.nombre}</p>
                            <p style={{ margin: 0, color: '#0b74ff', fontWeight: 700 }}>{formatearMoneda(item.precio)} c/u</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                            <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.cantidad}</span>
                            <button onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: '#0b74ff', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
                        </div>
                        <p style={{ margin: 0, minWidth: 80, textAlign: 'right', fontWeight: 700 }}>{formatearMoneda(item.precio * item.cantidad)}</p>
                    </div>
                ))}
            </div>

            {carrito.length > 0 && (
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 18, fontWeight: 700 }}>
                        <span>Total</span>
                        <span style={{ color: '#0b74ff' }}>{formatearMoneda(total)}</span>
                    </div>
                    <button onClick={onFinalizarCompra} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #223BFF, #0b74ff)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                        Continuar con el agendamiento →
                    </button>
                </div>
            )}
        </div>
    </div>
);

// ── Modal: Confirmación y Agendamiento ────────────────────────────────────────
const ConfirmationModal = ({ carrito, total, onCerrar, onConfirmarPedido, onStartAgendacion }) => {
    const [modalStage, setModalStage] = useState(0);
    const [formData, setFormData]     = useState({ fecha: '', horario: '' });

    const horarios = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

    const handleContinuar = () => {
        if (modalStage === 0) {
            onStartAgendacion(() => setModalStage(1));
        } else {
            setModalStage(s => s + 1);
        }
    };

    const handleConfirmar = () => {
        if (!formData.fecha || !formData.horario) {
            alert('Por favor selecciona fecha y horario');
            return;
        }
        onConfirmarPedido();
        setModalStage(3);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, width: 'min(560px,96%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 20 }}>
                        {modalStage === 0 && '📋 Resumen de Cotización'}
                        {modalStage === 1 && '📅 Selecciona Fecha y Hora'}
                        {modalStage === 2 && '✅ Confirmar Pedido'}
                        {modalStage === 3 && '🎉 ¡Pedido Confirmado!'}
                    </h2>
                    {modalStage < 3 && <button onClick={onCerrar} style={{ border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#666' }}>✕</button>}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {modalStage === 0 && (
                        <div>
                            {carrito.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <span>{item.nombre} × {item.cantidad}</span>
                                    <span style={{ fontWeight: 700, color: '#0b74ff' }}>{formatearMoneda(item.precio * item.cantidad)}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, fontSize: 18, fontWeight: 700 }}>
                                <span>Total</span><span style={{ color: '#0b74ff' }}>{formatearMoneda(total)}</span>
                            </div>
                        </div>
                    )}

                    {modalStage === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Fecha del servicio *</label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={formData.fecha}
                                    onChange={e => setFormData(p => ({ ...p, fecha: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Horario *</label>
                                <select
                                    value={formData.horario}
                                    onChange={e => setFormData(p => ({ ...p, horario: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: 10, fontSize: 15, boxSizing: 'border-box' }}
                                >
                                    <option value="">Seleccionar horario</option>
                                    {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {modalStage === 2 && (
                        <div style={{ background: '#f8f9ff', borderRadius: 12, padding: 20 }}>
                            <h3 style={{ margin: '0 0 16px', color: '#223BFF' }}>Detalles del pedido</h3>
                            {carrito.map(item => (
                                <p key={item.id} style={{ margin: '0 0 8px' }}>• {item.nombre} × {item.cantidad} — {formatearMoneda(item.precio * item.cantidad)}</p>
                            ))}
                            <p style={{ margin: '12px 0 4px' }}><strong>Fecha:</strong> {formData.fecha ? formatearFecha(formData.fecha) : '—'}</p>
                            <p style={{ margin: 0 }}><strong>Horario:</strong> {formData.horario}</p>
                            <p style={{ margin: '12px 0 0', fontSize: 18, fontWeight: 700, color: '#0b74ff' }}>Total: {formatearMoneda(total)}</p>
                        </div>
                    )}

                    {modalStage === 3 && (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                            <h3 style={{ color: '#223BFF', margin: '0 0 12px' }}>¡Cotización guardada!</h3>
                            <p style={{ color: '#666' }}>Te contactaremos pronto para confirmar los detalles del servicio.</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    {modalStage < 3 && modalStage > 0 && (
                        <button onClick={() => setModalStage(s => s - 1)} style={{ padding: '12px 24px', border: '1px solid #ddd', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>← Volver</button>
                    )}
                    {modalStage < 2 && (
                        <button onClick={handleContinuar} style={{ padding: '12px 24px', border: 'none', borderRadius: 10, background: '#0b74ff', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Continuar →</button>
                    )}
                    {modalStage === 2 && (
                        <button onClick={handleConfirmar} style={{ padding: '12px 24px', border: 'none', borderRadius: 10, background: '#223BFF', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>✅ Confirmar Pedido</button>
                    )}
                    {modalStage === 3 && (
                        <button onClick={onCerrar} style={{ padding: '12px 24px', border: 'none', borderRadius: 10, background: '#0b74ff', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Cerrar</button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function CotizacionPage({ onBackToHome, onGoToServicios, onGoToLogin }) {
    const { carrito, agregarAlCarrito, actualizarCantidad, limpiarCarrito } = useCarrito();
    const { user } = useAuth();

    const [servicios,        setServicios]        = useState([]);
    const [isLoading,        setIsLoading]        = useState(true);
    const [searchTerm,       setSearchTerm]       = useState('');
    const [showCartModal,    setShowCartModal]    = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAuthPrompt,   setShowAuthPrompt]   = useState(false);
    const [syncMsg,          setSyncMsg]          = useState('');
    const [tiempoExpira,     setTiempoExpira]     = useState('');

    const total      = useMemo(() => calcularTotal(carrito), [carrito]);
    const totalItems = useMemo(() => carrito.reduce((s, i) => s + i.cantidad, 0), [carrito]);

    // ── 1. Cargar servicios desde BD ─────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    const serviciosBD = res.data.data.map(s => ({
                        ...s,
                        // Normalizar campos del backend (mayúsculas → minúsculas)
                        id:      s.Id_Servicio        || s.id,
                        nombre:  s.Nombre_Servicio    || s.nombre       || 'Sin nombre',
                        precio:  Number(s.Precio      || s.precio       || 0),
                        imagen:  s.imagen_url         || IMAGEN_FALLBACK,
                        desc:    s.Descripcion        || s.descripcion  || '',
                        tamanos: ['Estándar'],
                    }));
                    setServicios(serviciosBD);
                } else {
                    // Normalizar fallback: imagen_url → imagen
                    setServicios(SERVICIOS_FALLBACK.map(s => ({ ...s, imagen: s.imagen_url })));
                }
            } catch {
                setServicios(SERVICIOS_FALLBACK.map(s => ({ ...s, imagen: s.imagen_url })));
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, []);

    // ── 2. Guardar carrito en localStorage con TTL 22h ────────────────────────
    useEffect(() => {
        if (carrito.length > 0) {
            guardarCotizacionLocal(carrito);
            const t = tiempoRestanteCotizacion();
            if (t) setTiempoExpira(t);
        }
    }, [carrito]);

    // ── 3. Sincronizar con BD cuando el usuario inicia sesión ─────────────────
    useEffect(() => {
        if (user?.id) {
            const datos = leerCotizacionLocal();
            if (datos && datos.items && datos.items.length > 0) {
                setSyncMsg('⏳ Guardando tu cotización previa...');
                sincronizarCotizacionConBD(user.id).then(res => {
                    if (res.success) {
                        setSyncMsg(`✅ ${res.sincronizados} servicio(s) guardados en tu cuenta.`);
                    } else {
                        setSyncMsg('⚠️ No se pudo sincronizar la cotización.');
                    }
                    setTimeout(() => setSyncMsg(''), 5000);
                });
            }
        }
    }, [user?.id]);

    // ── 4. Actualizar tiempo restante cada minuto ─────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            const t = tiempoRestanteCotizacion();
            setTiempoExpira(t || '');
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const filteredServices = servicios.filter(s => {
        const q = searchTerm.toLowerCase();
        return (s.nombre || '').toLowerCase().includes(q) || (s.desc || '').toLowerCase().includes(q);
    });

    const handleAgregarAlCarrito = useCallback((servicioId) => {
        const s = servicios.find(sv => sv.id === servicioId);
        if (s) agregarAlCarrito(s);
    }, [servicios, agregarAlCarrito]);

    const handleFinalizarCompra = () => {
        if (carrito.length === 0) return;
        setShowCartModal(false);
        setShowConfirmModal(true);
    };

    const handleConfirmarPedido = async () => {
        if (user?.id) {
            await sincronizarCotizacionConBD(user.id);
        }
        limpiarCarrito();
        limpiarCotizacionLocal();
    };

    const handleStartAgendacion = (continueCallback) => {
        if (!user?.id) {
            setShowAuthPrompt(true);
        } else {
            continueCallback();
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#666' }}>
                ⏳ Cargando servicios...
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Banner sincronización */}
            {syncMsg && (
                <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#223BFF', color: '#fff', padding: '10px 24px', borderRadius: 50, fontWeight: 600, zIndex: 10001, boxShadow: '0 4px 16px rgba(34,59,255,0.3)' }}>
                    {syncMsg}
                </div>
            )}

            {/* Header */}
            <header className="header-banner">
                <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 className="logo-header" onClick={onBackToHome} style={{ cursor: 'pointer' }}>FoamWash</h1>
                <nav className="nav-bar">
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onBackToHome(); }}>Hogar</a>
                    <a href="#" className="nav-link" style={{ color: 'rgb(133,198,255)' }} onClick={e => e.preventDefault()}>Cotización</a>
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onGoToServicios(); }}>Agendar</a>
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onGoToLogin(); }}>Iniciar Sesión</a>
                </nav>
            </header>

            {/* Aviso TTL */}
            {tiempoExpira && !user?.id && (
                <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '8px 24px', textAlign: 'center', fontSize: 13, color: '#795548' }}>
                    ⏰ Tu cotización está guardada temporalmente — expira en <strong>{tiempoExpira}</strong>. Inicia sesión para guardarla permanentemente.
                </div>
            )}

            {/* Buscador */}
            <section className="search-section">
                <div className="search-container">
                    <input type="text" className="search-input" placeholder="Buscar servicios..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <button className="search-button">🔍</button>
                </div>
            </section>

            {/* Grid */}
            <section className="services-section" style={{ flex: 1 }}>
                <h2 className="section-title">Nuestros Servicios</h2>
                <div className="services-grid">
                    {filteredServices.map(service => (
                        <CotizacionServiceCard
                            key={service.id}
                            service={service}
                            onAgregar={handleAgregarAlCarrito}
                        />
                    ))}
                </div>
            </section>

            {/* Botón flotante carrito */}
            <button className="btn-carrito-flotante" onClick={() => setShowCartModal(true)} title="Ver carrito">
                <span className="carrito-icono">🛒</span>
                <span className="carrito-badge-flotante" style={{ display: totalItems > 0 ? 'flex' : 'none' }}>{totalItems}</span>
            </button>

            {/* Modales */}
            {showCartModal && (
                <CartModal
                    carrito={carrito}
                    total={total}
                    onActualizarCantidad={actualizarCantidad}
                    onCerrar={() => setShowCartModal(false)}
                    onFinalizarCompra={handleFinalizarCompra}
                />
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    carrito={carrito}
                    total={total}
                    onCerrar={() => setShowConfirmModal(false)}
                    onConfirmarPedido={handleConfirmarPedido}
                    onStartAgendacion={handleStartAgendacion}
                />
            )}

            {showAuthPrompt && (
                <AuthPromptModal
                    onClose={() => setShowAuthPrompt(false)}
                    onLogin={() => { setShowAuthPrompt(false); onGoToLogin(); }}
                />
            )}

            <FooterPublic />
        </div>
    );
}