// =============================================================================
// ARCHIVO  : CotizacionPage.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. CotizacionHeader actualizado al estándar premium.
//            Nav centrado (grid 3 cols) + logo FW + distintivo sin rol (página pública).
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

const calcularTotal   = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);
const formatearMoneda = (v)     => `$${v.toLocaleString('es-CO')}`;
const formatearFecha  = (f)     => {
    const d = new Date(f + 'T00:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcHome    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcDoc     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcService = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
const IcLogin   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;

// ── Header Premium — 3 columnas: logo | nav centrado | login ──────────────────
const CotizacionHeader = ({ onBackToHome, onGoToLogin, onGoToServicios }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <style>{`
                .ch-header {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 1000;
                    height: 64px;
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 0 40px;
                    background: rgba(8,12,30,0.92);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .ch-header.scrolled {
                    background: rgba(8,12,30,0.97);
                    border-color: rgba(255,255,255,0.09);
                    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
                }

                .ch-logo {
                    display: flex; align-items: center; gap: 10px;
                    cursor: pointer; user-select: none;
                    justify-self: start;
                }
                .ch-logo-mark {
                    width: 32px; height: 32px;
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px; font-weight: 800; color: #fff;
                    box-shadow: 0 2px 10px rgba(0,102,255,0.35);
                }
                .ch-logo-text { font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }

                .ch-nav {
                    display: flex; align-items: center; gap: 2px;
                    justify-self: center;
                }
                .ch-nav-btn {
                    position: relative;
                    padding: 7px 14px; border-radius: 7px; border: none;
                    background: transparent; color: rgba(255,255,255,0.55);
                    font-size: 13.5px; font-weight: 500; font-family: inherit;
                    cursor: pointer; transition: color 0.18s, background 0.18s;
                    display: flex; align-items: center; gap: 6px;
                    white-space: nowrap;
                }
                .ch-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .ch-nav-btn.active { color: #fff; background: rgba(0,102,255,0.18); }
                .ch-nav-btn.active::after {
                    content: ''; position: absolute;
                    bottom: -1px; left: 50%; transform: translateX(-50%);
                    width: 18px; height: 2px; background: #0099ff; border-radius: 2px;
                }

                .ch-right {
                    display: flex; align-items: center;
                    justify-self: end;
                }
                .ch-login-btn {
                    display: flex; align-items: center; gap: 7px;
                    padding: 8px 18px; border-radius: 8px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff; font-size: 13.5px; font-weight: 600;
                    font-family: inherit; border: none; cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                    box-shadow: 0 4px 14px rgba(26,86,255,0.35);
                    white-space: nowrap;
                }
                .ch-login-btn:hover { opacity: 0.9; transform: translateY(-1px); }

                @media (max-width: 800px) {
                    .ch-header { padding: 0 20px; grid-template-columns: auto 1fr auto; }
                    .ch-nav { justify-self: end; gap: 0; }
                    .ch-nav-btn span { display: none; }
                    .ch-right { display: none; }
                }
            `}</style>

            <header className={`ch-header${scrolled ? ' scrolled' : ''}`}>

                {/* Columna 1: Logo */}
                <div className="ch-logo" onClick={onBackToHome}>
                    <div className="ch-logo-mark">FW</div>
                    <span className="ch-logo-text">FoamWash</span>
                </div>

                {/* Columna 2: Nav centrado */}
                <nav className="ch-nav">
                    <button className="ch-nav-btn" onClick={onBackToHome}>
                        <IcHome /><span>Hogar</span>
                    </button>
                    <button className="ch-nav-btn active">
                        <IcDoc /><span>Cotización</span>
                    </button>
                    <button className="ch-nav-btn" onClick={onGoToServicios}>
                        <IcService /><span>Agendar</span>
                    </button>
                </nav>

                {/* Columna 3: Botón login */}
                <div className="ch-right">
                    <button className="ch-login-btn" onClick={onGoToLogin}>
                        <IcLogin /><span>Iniciar Sesión</span>
                    </button>
                </div>

            </header>
        </>
    );
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

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    const serviciosBD = res.data.data.map(s => ({
                        ...s,
                        id:      s.Id_Servicio        || s.id,
                        nombre:  s.Nombre_Servicio    || s.nombre       || 'Sin nombre',
                        precio:  Number(s.Precio      || s.precio       || 0),
                        imagen:  s.imagen_url         || IMAGEN_FALLBACK,
                        desc:    s.Descripcion        || s.descripcion  || '',
                        tamanos: ['Estándar'],
                    }));
                    setServicios(serviciosBD);
                } else {
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

    useEffect(() => {
        if (carrito.length > 0) {
            guardarCotizacionLocal(carrito);
            const t = tiempoRestanteCotizacion();
            if (t) setTiempoExpira(t);
        }
    }, [carrito]);

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

    useEffect(() => {
        const interval = setInterval(() => {
            const t = tiempoRestanteCotizacion();
            setTiempoExpira(t || '');
        }, 60_000);
        return () => clearInterval(interval);
    }, []);

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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#1a56ff' }}>
                Cargando servicios...
            </div>
        );
    }

    return (
        <div className="cotizacion-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>

            <style>{`
                .cotizacion-page .services-section {
                    background: #f6f7fb !important;
                    padding: 52px 40px 80px !important;
                    flex: 1;
                }
                .cotizacion-page .section-title {
                    font-size: 34px !important;
                    font-weight: 800 !important;
                    color: #0a1435 !important;
                    text-shadow: none !important;
                    -webkit-text-fill-color: unset !important;
                    background: none !important;
                    -webkit-background-clip: unset !important;
                    background-clip: unset !important;
                    margin-bottom: 10px !important;
                    letter-spacing: -0.5px !important;
                }
                .cotizacion-page .services-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)) !important;
                    gap: 28px !important;
                    max-width: 1320px !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                }
                .btn-carrito-flotante {
                    position: fixed;
                    bottom: 32px; right: 32px;
                    width: 60px; height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 8px 24px rgba(26,86,255,0.40);
                    z-index: 999;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .btn-carrito-flotante:hover {
                    transform: translateY(-3px) scale(1.06);
                    box-shadow: 0 12px 30px rgba(26,86,255,0.50);
                }
                .carrito-icono { font-size: 24px; }
                .carrito-badge-flotante {
                    position: absolute; top: -4px; right: -4px;
                    background: #ff3d71; color: #fff;
                    font-size: 11px; font-weight: 700;
                    width: 20px; height: 20px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid #fff;
                }
                @media (max-width: 768px) {
                    .cotizacion-page .services-section { padding: 36px 20px 60px !important; }
                    .cotizacion-page .services-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
                }
                @media (max-width: 480px) {
                    .cotizacion-page .services-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            {/* Banner sincronización */}
            {syncMsg && (
                <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#223BFF', color: '#fff', padding: '10px 24px', borderRadius: 50, fontWeight: 600, zIndex: 10001, boxShadow: '0 4px 16px rgba(34,59,255,0.3)' }}>
                    {syncMsg}
                </div>
            )}

            {/* ── Header Premium ── */}
            <CotizacionHeader
                onBackToHome={onBackToHome}
                onGoToLogin={onGoToLogin}
                onGoToServicios={onGoToServicios}
            />

            <div style={{ paddingTop: 64, flex: 1, display: 'flex', flexDirection: 'column' }}>

                {tiempoExpira && !user?.id && (
                    <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '8px 24px', textAlign: 'center', fontSize: 13, color: '#795548' }}>
                        ⏰ Tu cotización está guardada temporalmente — expira en <strong>{tiempoExpira}</strong>. Inicia sesión para guardarla permanentemente.
                    </div>
                )}

                {/* Buscador */}
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" aria-label="Buscar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                    </div>
                </section>

                {/* Grid de servicios */}
                <section className="services-section" style={{ flex: 1 }}>
                    <h2 className="section-title" style={{ textAlign: 'center' }}>
                        Nuestros Servicios
                    </h2>
                    <p style={{ textAlign: 'center', fontSize: 14, color: '#8890aa', marginBottom: 44, fontWeight: 400, letterSpacing: '0.3px' }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    <div className="services-grid">
                        {filteredServices.map(service => (
                            <CotizacionServiceCard
                                key={service.id}
                                service={service}
                                onAgregar={handleAgregarAlCarrito}
                            />
                        ))}
                    </div>

                    {filteredServices.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                            <p>No se encontraron servicios que coincidan con "{searchTerm}"</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{ marginTop: 12, padding: '10px 28px', background: 'linear-gradient(135deg, #1a56ff, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                            >
                                Limpiar búsqueda
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Botón flotante carrito */}
            <button className="btn-carrito-flotante" onClick={() => setShowCartModal(true)} title="Ver carrito">
                <span className="carrito-icono">🛒</span>
                <span className="carrito-badge-flotante" style={{ display: totalItems > 0 ? 'flex' : 'none' }}>{totalItems}</span>
            </button>

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