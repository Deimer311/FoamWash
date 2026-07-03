// =============================================================================
// ARCHIVO  : ModalesCarrito.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/ModalesCarrito.jsx
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Modal de Carrito + Modal de Confirmación (cotización → agendamiento)
//   compartidos entre CotizacionesCliente.jsx y ServiciosClientePage.jsx.
//   Un solo componente = diseño idéntico garantizado en ambos flujos.
//   Sin emojis — solo iconos SVG (mismo lenguaje visual que el Header y
//   Mis Cotizaciones). Paleta oscura/sobria, coherente con HeaderCliente.
// =============================================================================

import React, { useState } from 'react';
import api from '../../services/api';

/* ════════════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════════════ */
export const calcularTotal = (items) => items.reduce((t, i) => t + i.precio * i.cantidad, 0);
export const formatMoneda = (v) => `$${Number(v || 0).toLocaleString('es-CO')}`;
export const formatFecha = (f) => new Date(f + 'T00:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

/* ════════════════════════════════════════════════════════════════════════
   ICONOS SVG (mismo estilo trazo que HeaderCliente / MisCotizacionesCliente)
   ════════════════════════════════════════════════════════════════════════ */
const IcCart = (p) => (
    <svg width={p?.size || 18} height={p?.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);
const IcX = (p) => (
    <svg width={p?.size || 16} height={p?.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const IcMinus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IcTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);
const IcCheckCircle = (p) => (
    <svg width={p?.size || 26} height={p?.size || 26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const IcDoc = (p) => (
    <svg width={p?.size || 26} height={p?.size || 26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);
const IcCalendar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IcClock = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IcMapPin = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const IcUser = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IcRuler = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z" />
        <path d="M14.5 7.5 17 5" /><path d="M11.5 10.5 14 8" /><path d="M8.5 13.5 11 11" />
    </svg>
);
const IcAlertTriangle = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const IcSave = (p) => (
    <svg width={p?.size || 15} height={p?.size || 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
);
export const IcSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);
export const IcLoader = () => (
    <svg className="fwm-spin" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
);

/* ════════════════════════════════════════════════════════════════════════
   ESTILOS COMPARTIDOS (namespace "fwm-" para no chocar con CSS externo)
   ════════════════════════════════════════════════════════════════════════ */
const SharedStyles = () => (
    <style>{`
        .fwm-overlay {
            position: fixed; inset: 0; background: rgba(8,12,30,0.72);
            backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            padding: 20px; z-index: 10000; animation: fwmFade 0.2s ease;
        }
        @keyframes fwmFade { from { opacity: 0; } to { opacity: 1; } }

        .fwm-modal {
            background: #fff; border-radius: 22px; width: 100%;
            box-shadow: 0 25px 60px -12px rgba(0,0,0,0.4);
            overflow: hidden; max-height: 90vh; display: flex; flex-direction: column;
            animation: fwmSlideUp 0.25s cubic-bezier(0.34, 1.2, 0.64, 1);
            font-family: 'Kanit', 'Segoe UI', sans-serif;
        }
        @keyframes fwmSlideUp { from { opacity: 0; transform: translateY(22px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .fwm-header {
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            color: #fff; padding: 18px 22px; display: flex;
            align-items: center; justify-content: space-between; flex-shrink: 0;
        }
        .fwm-header-title { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
        .fwm-header-icon {
            width: 32px; height: 32px; border-radius: 9px;
            background: rgba(255,255,255,0.12); color: #60a5fa;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .fwm-close {
            width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.12);
            border: none; color: #fff; display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
        }
        .fwm-close:hover { background: rgba(255,255,255,0.22); transform: rotate(90deg); }

        .fwm-body { padding: 22px; overflow-y: auto; flex: 1; }
        .fwm-footer {
            padding: 16px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0;
            display: flex; gap: 10px; flex-shrink: 0;
        }

        .fwm-btn {
            flex: 1; padding: 11px 14px; border-radius: 12px; font-size: 13.5px;
            font-weight: 700; cursor: pointer; border: none; transition: all 0.2s ease;
            font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .fwm-btn-secondary { background: #e2e8f0; color: #475569; }
        .fwm-btn-secondary:hover { background: #cbd5e1; }
        .fwm-btn-primary { background: linear-gradient(135deg, #1e3a8a, #1a56ff); color: #fff; box-shadow: 0 4px 14px rgba(30,58,138,0.3); }
        .fwm-btn-primary:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
        .fwm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .fwm-btn-success { background: #16a34a; color: #fff; }
        .fwm-btn-success:hover:not(:disabled) { background: #15803d; }
        .fwm-btn-success:disabled { opacity: 0.6; cursor: not-allowed; }
        .fwm-btn-ghost { background: #fff; border: 1.5px solid #1e3a8a; color: #1e3a8a; }
        .fwm-btn-ghost:hover:not(:disabled) { background: #eff6ff; }
        .fwm-btn-ghost.is-saved { border-color: #16a34a; color: #16a34a; cursor: default; background: #ecfdf5; }
        .fwm-btn-ghost:disabled:not(.is-saved) { opacity: 0.5; cursor: not-allowed; }

        /* Carrito */
        .fwm-cart-item { display: flex; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .fwm-cart-item:last-child { border-bottom: none; }
        .fwm-cart-img { width: 54px; height: 54px; border-radius: 12px; object-fit: cover; flex-shrink: 0; background: #f1f5f9; }
        .fwm-cart-info { flex: 1; min-width: 0; }
        .fwm-cart-info h4 { font-size: 13.5px; font-weight: 700; color: #0f172a; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .fwm-cart-price { font-size: 12.5px; color: #1e3a8a; font-weight: 700; margin: 0; }
        .fwm-qty { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
        .fwm-qty-btn {
            width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #cbd5e1;
            background: #fff; display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #475569; transition: all 0.2s ease;
        }
        .fwm-qty-btn:hover { border-color: #1a56ff; color: #1a56ff; }
        .fwm-qty-num { font-size: 13.5px; font-weight: 700; color: #0f172a; min-width: 14px; text-align: center; }
        .fwm-trash-btn {
            width: 28px; height: 28px; border-radius: 8px; border: none; background: #fff5f5;
            color: #ef4444; display: flex; align-items: center; justify-content: center;
            cursor: pointer; flex-shrink: 0; transition: background 0.2s ease;
        }
        .fwm-trash-btn:hover { background: #fee2e2; }

        .fwm-empty { text-align: center; padding: 48px 10px; color: #94a3b8; }
        .fwm-empty-icon {
            width: 60px; height: 60px; border-radius: 50%; background: #f1f5f9;
            display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: #94a3b8;
        }
        .fwm-empty p { font-size: 14px; font-weight: 500; }

        .fwm-total { display: flex; justify-content: space-between; align-items: center; background: #eff6ff; padding: 13px 16px; border-radius: 12px; margin-top: 14px; }
        .fwm-total span { font-size: 12.5px; color: #1e3a8a; font-weight: 600; }
        .fwm-total strong { font-size: 18px; color: #1e3a8a; font-weight: 800; }

        /* Selección de tamaño / formulario */
        .fwm-servicio-detalle { padding: 14px; background: #f8fafc; border-radius: 14px; border: 1px solid #eef0f5; margin-bottom: 12px; }
        .fwm-servicio-detalle h4 { font-size: 13.5px; font-weight: 700; color: #0f172a; margin: 0 0 10px; }
        .fwm-form-group { margin-bottom: 14px; }
        .fwm-form-group label {
            display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 5px;
        }
        .fwm-form-group input, .fwm-form-group select, .fwm-form-group textarea {
            width: 100%; padding: 10px 13px; border-radius: 10px; border: 1.5px solid #cbd5e1;
            font-family: inherit; font-size: 13.5px; outline: none; background: #f8fafc;
            color: #0f172a; transition: border-color 0.2s ease, background 0.2s ease; box-sizing: border-box;
        }
        .fwm-form-group input:focus, .fwm-form-group select:focus, .fwm-form-group textarea:focus {
            border-color: #1a56ff; background: #fff;
        }
        .fwm-form-group textarea { resize: vertical; min-height: 70px; }
        .fwm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .fwm-alert {
            display: flex; gap: 8px; align-items: flex-start; background: #fff5f5;
            border-left: 4px solid #ef4444; color: #b91c1c; padding: 10px 14px;
            border-radius: 8px; font-size: 12.5px; margin-bottom: 14px;
        }

        .fwm-saved-badge {
            display: flex; align-items: center; gap: 6px; justify-content: center;
            color: #16a34a; font-size: 12px; font-weight: 700; background: #ecfdf5;
            border-radius: 50px; padding: 6px 14px; margin: 0 auto 16px; width: fit-content;
        }

        .fwm-resumen { background: #f8fafc; border-radius: 14px; border: 1px solid #eef0f5; padding: 4px 16px; }
        .fwm-resumen-item { display: flex; flex-direction: column; gap: 2px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .fwm-resumen-item:last-of-type { border-bottom: none; }
        .fwm-resumen-item strong { font-size: 13.5px; color: #0f172a; }
        .fwm-resumen-item small { display: flex; align-items: center; gap: 4px; color: #64748b; font-size: 11.5px; }
        .fwm-precio-item { font-size: 13.5px; font-weight: 700; color: #1e3a8a; margin-top: 2px; }

        .fwm-success { text-align: center; padding: 4px 0; }
        .fwm-success-icon {
            width: 56px; height: 56px; border-radius: 50%; background: #eff6ff; color: #1e3a8a;
            display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;
        }
        .fwm-success-icon.is-confirmed { background: #ecfdf5; color: #059669; }
        .fwm-success h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
        .fwm-success > p { color: #64748b; font-size: 13px; margin: 0 0 14px; }
        .fwm-detail-box { text-align: left; background: #f8fafc; border: 1px solid #eef0f5; border-radius: 12px; padding: 12px 16px; margin: 14px 0; font-size: 13px; }
        .fwm-drow { display: flex; align-items: center; gap: 9px; padding: 6px 0; color: #334155; }
        .fwm-drow svg { color: #64748b; flex-shrink: 0; }

        .fwm-spin { animation: fwmSpin 0.8s linear infinite; }
        @keyframes fwmSpin { to { transform: rotate(360deg); } }

        @media (max-width: 480px) {
            .fwm-form-row { grid-template-columns: 1fr; }
            .fwm-footer { flex-direction: column; }
        }
    `}</style>
);

/* ════════════════════════════════════════════════════════════════════════
   MODAL: CARRITO
   ════════════════════════════════════════════════════════════════════════ */
const IMAGEN_FALLBACK = '/img/imag1.jpg';

export const CartModal = ({ carrito, onActualizarCantidad, onCerrar, onFinalizarCompra }) => {
    const total = calcularTotal(carrito);
    return (
        <div className="fwm-overlay" onClick={(e) => e.target.classList.contains('fwm-overlay') && onCerrar()}>
            <SharedStyles />
            <div className="fwm-modal" style={{ maxWidth: 460 }}>
                <div className="fwm-header">
                    <div className="fwm-header-title">
                        <span className="fwm-header-icon"><IcCart /></span>
                        Carrito de Servicios
                    </div>
                    <button className="fwm-close" onClick={onCerrar}><IcX /></button>
                </div>

                <div className="fwm-body">
                    {carrito.length === 0 ? (
                        <div className="fwm-empty">
                            <div className="fwm-empty-icon"><IcCart size={26} /></div>
                            <p>El carrito está vacío</p>
                        </div>
                    ) : (
                        <div>
                            {carrito.map((item) => (
                                <div key={item.id} className="fwm-cart-item">
                                    <img src={item.imagen || IMAGEN_FALLBACK} alt={item.nombre} className="fwm-cart-img" />
                                    <div className="fwm-cart-info">
                                        <h4>{item.nombre}</h4>
                                        <p className="fwm-cart-price">{formatMoneda(item.precio)}</p>
                                    </div>
                                    <div className="fwm-qty">
                                        <button className="fwm-qty-btn" onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}><IcMinus /></button>
                                        <span className="fwm-qty-num">{item.cantidad}</span>
                                        <button className="fwm-qty-btn" onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}><IcPlus /></button>
                                    </div>
                                    <button className="fwm-trash-btn" onClick={() => onActualizarCantidad(item.id, 0)}><IcTrash /></button>
                                </div>
                            ))}
                            <div className="fwm-total">
                                <span>Total</span>
                                <strong>{formatMoneda(total)}</strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fwm-footer">
                    <button className="fwm-btn fwm-btn-secondary" onClick={onCerrar}>Seguir cotizando</button>
                    <button className="fwm-btn fwm-btn-primary" onClick={onFinalizarCompra} disabled={carrito.length === 0}>
                        Ver cotización →
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   MODAL: CONFIRMACIÓN (cotización → guardar → agendar → confirmado)
   ════════════════════════════════════════════════════════════════════════ */
export const ConfirmationModal = ({ carrito, user, onCerrar, onActualizarDetalle, onPedidoConfirmado, soloCotizacion = false, onRequerirLogin }) => {
    const [stage, setStage] = useState(0);
    const [formData, setFormData] = useState({});
    const [cotizacion, setCotizacion] = useState(null);
    const [pedidoFinal, setPedidoFinal] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [guardandoCot, setGuardandoCot] = useState(false);
    const [cotizacionGuardada, setCotizacionGuardada] = useState(false);
    const [errorGuardar, setErrorGuardar] = useState('');

    const handleGenerarCotizacion = () => {
        if (carrito.some(i => !i.tamano)) {
            setErrorGuardar('Por favor completa el Tamaño de todos los servicios.');
            return;
        }
        setErrorGuardar('');
        setCotizacion({
            id: `COT-${Date.now()}`,
            servicios: carrito.map(i => ({ ...i })),
            total: calcularTotal(carrito),
            fechaCreacion: new Date().toISOString()
        });
        setStage(1);
    };

    // Guarda la cotización en BD (Mis Cotizaciones) SIN crear un agendamiento
    const handleGuardarCotizacion = async () => {
        const userId = user?.id || user?.Id_Usuario;
        if (!userId) {
            if (onRequerirLogin) {
                onRequerirLogin();
            } else {
                setErrorGuardar('Debes iniciar sesión para guardar tu cotización.');
            }
            return;
        }
        setGuardandoCot(true); setErrorGuardar('');
        try {
            for (const item of cotizacion.servicios) {
                await api.post('/cotizaciones', {
                    Id_usuario: userId,
                    Id_servicio: item.id,
                    Precio_cotizado: item.precio * item.cantidad,
                    Cantidad: item.cantidad,
                    'Tamaño': item.tamano || 'Estándar'
                });
            }
            setCotizacionGuardada(true);
        } catch (err) {
            console.error('Error al guardar cotización:', err);
            setErrorGuardar('No se pudo guardar la cotización. Intenta nuevamente.');
        } finally {
            setGuardandoCot(false);
        }
    };

    const handleConfirmar = async () => {
        if (!formData.direccion || !formData.fecha || !formData.hora) {
            setErrorGuardar('Por favor completa los campos requeridos.');
            return;
        }
        const userId = user?.id || user?.Id_Usuario;
        if (!userId) { setErrorGuardar('Debes iniciar sesión para confirmar.'); return; }

        setGuardando(true); setErrorGuardar('');
        try {
            const itemsBase = cotizacion?.servicios || carrito;
            const serviciosList = itemsBase.map(i => ({
                Id_Servicio: i.id, cantidad: i.cantidad, tamano: i.tamano
            }));
            const resReserva = await api.post('/reservas', {
                Id_Usuario: userId,
                fecha: formData.fecha,
                Hora: formData.hora,
                Informacion_adicional: `Dirección: ${formData.direccion}${formData.ciudad ? ', ' + formData.ciudad : ''}. Tel: ${formData.telefono || ''}`,
                observaciones: formData.observaciones || null,
                servicios: serviciosList
            });
            if (!resReserva.data.success) throw new Error(resReserva.data.message);
            const reservaData = resReserva.data.data;

            // Solo crea cotizaciones si el usuario no las guardó ya manualmente (evita duplicados)
            if (!cotizacionGuardada) {
                for (const item of itemsBase) {
                    await api.post('/cotizaciones', {
                        Id_usuario: userId,
                        Id_servicio: item.id,
                        Precio_cotizado: item.precio * item.cantidad,
                        Cantidad: item.cantidad,
                        'Tamaño': item.tamano || 'Estándar'
                    });
                }
            }
            setPedidoFinal({
                id: `PED-${reservaData.ID_Reserva}`,
                fecha: formData.fecha,
                hora: formData.hora,
                direccion: formData.direccion,
                ciudad: formData.ciudad,
                empleado: reservaData.empleado_asignado,
                total: cotizacion?.total || calcularTotal(carrito)
            });
            setStage(3);
            onPedidoConfirmado?.();
        } catch (err) {
            console.error('Error al confirmar pedido:', err);
            setErrorGuardar('Hubo un error al guardar tu pedido. Por favor intenta nuevamente.');
        } finally { setGuardando(false); }
    };

    const onClose = () => {
        setStage(0); setCotizacion(null); setPedidoFinal(null);
        setErrorGuardar(''); setCotizacionGuardada(false);
        onCerrar();
    };

    const itemsResumen = cotizacion ? cotizacion.servicios : carrito;
    const totalActual = cotizacion ? cotizacion.total : calcularTotal(carrito);

    const headerTexto = stage === 3 ? 'Pedido confirmado'
        : stage === 1 ? 'Cotización'
            : stage === 2 ? 'Agendar servicio'
                : 'Confirmar pedido';

    const headerIcono = stage === 3 ? <IcCheckCircle size={18} />
        : stage === 2 ? <IcCalendar />
            : <IcDoc size={18} />;

    return (
        <div className="fwm-overlay" onClick={(e) => e.target.classList.contains('fwm-overlay') && onClose()}>
            <SharedStyles />
            <div className="fwm-modal" style={{ maxWidth: 500 }}>
                <div className="fwm-header">
                    <div className="fwm-header-title">
                        <span className="fwm-header-icon">{headerIcono}</span>
                        {headerTexto}
                    </div>
                    <button className="fwm-close" onClick={onClose}><IcX /></button>
                </div>

                <div className="fwm-body">
                    {/* Stage 0: tamaños */}
                    {stage === 0 && (
                        <div>
                            <h3 style={{ fontWeight: 700, marginBottom: 4, color: '#0f172a', textAlign: 'center', fontSize: 17 }}>
                                Selecciona los detalles
                            </h3>
                            <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 18, fontSize: 13 }}>
                                Completa el tamaño de cada servicio para generar la cotización
                            </p>
                            {errorGuardar && (
                                <div className="fwm-alert"><IcAlertTriangle /><span>{errorGuardar}</span></div>
                            )}
                            {carrito.map((item, i) => (
                                <div key={item.id} className="fwm-servicio-detalle">
                                    <h4>{item.nombre} (×{item.cantidad})</h4>
                                    <div className="fwm-form-group">
                                        <label><IcRuler /> Tamaño *</label>
                                        <select
                                            value={item.tamano || ''}
                                            onChange={(e) => onActualizarDetalle(item.id, 'tamano', e.target.value)}
                                        >
                                            <option value="">Seleccionar tamaño</option>
                                            {(item.tamanos || ['Estándar']).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="fwm-form-group" style={{ marginBottom: 0 }}>
                                        <label>Cantidad *</label>
                                        <input type="number" min="1" value={item.cantidad}
                                            onChange={(e) => onActualizarDetalle(item.id, 'cantidad', parseInt(e.target.value) || 1)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stage 1: cotización generada + guardar */}
                    {stage === 1 && cotizacion && (
                        <div className="fwm-success">
                            {errorGuardar && (
                                <div className="fwm-alert" style={{ textAlign: 'left' }}><IcAlertTriangle /><span>{errorGuardar}</span></div>
                            )}
                            <div className="fwm-success-icon"><IcDoc size={26} /></div>
                            <h3>Cotización lista</h3>
                            <p>Código: <strong>{cotizacion.id}</strong></p>

                            {cotizacionGuardada && (
                                <div className="fwm-saved-badge"><IcCheckCircle size={14} /> Guardada en Mis Cotizaciones</div>
                            )}

                            <div className="fwm-resumen">
                                {cotizacion.servicios.map(item => (
                                    <div key={item.id} className="fwm-resumen-item">
                                        <strong>{item.nombre}</strong>
                                        <small><IcRuler /> {item.tamano} · ×{item.cantidad}</small>
                                        <span className="fwm-precio-item">{formatMoneda(item.precio * item.cantidad)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="fwm-total">
                                <span>Total estimado</span>
                                <strong>{formatMoneda(cotizacion.total)}</strong>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: datos del servicio */}
                    {stage === 2 && (
                        <div>
                            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#0f172a', fontSize: 16 }}>Datos del servicio</h3>
                            {errorGuardar && (
                                <div className="fwm-alert"><IcAlertTriangle /><span>{errorGuardar}</span></div>
                            )}
                            <div className="fwm-form-group">
                                <label><IcMapPin /> Dirección *</label>
                                <input type="text" placeholder="Calle 123 #45-67"
                                    value={formData.direccion || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, direccion: e.target.value }))} />
                            </div>
                            <div className="fwm-form-row">
                                <div className="fwm-form-group">
                                    <label>Ciudad</label>
                                    <input type="text" placeholder="Bogotá"
                                        value={formData.ciudad || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, ciudad: e.target.value }))} />
                                </div>
                                <div className="fwm-form-group">
                                    <label>Teléfono</label>
                                    <input type="tel" placeholder="300 123 4567"
                                        value={formData.telefono || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, telefono: e.target.value }))} />
                                </div>
                            </div>
                            <div className="fwm-form-row">
                                <div className="fwm-form-group">
                                    <label><IcCalendar /> Fecha *</label>
                                    <input type="date" min={new Date().toISOString().split('T')[0]}
                                        value={formData.fecha || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, fecha: e.target.value }))} />
                                </div>
                                <div className="fwm-form-group">
                                    <label><IcClock /> Hora *</label>
                                    <input type="time"
                                        value={formData.hora || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, hora: e.target.value }))} />
                                </div>
                            </div>
                            <div className="fwm-form-group">
                                <label>Observaciones (opcional)</label>
                                <textarea rows="3" placeholder="Mascotas, instrucciones especiales, acceso..."
                                    value={formData.observaciones || ''}
                                    onChange={(e) => setFormData(p => ({ ...p, observaciones: e.target.value }))} />
                            </div>
                            <div className="fwm-total">
                                <span>Total</span>
                                <strong>{formatMoneda(totalActual)}</strong>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: pedido confirmado */}
                    {stage === 3 && pedidoFinal && (
                        <div className="fwm-success">
                            <div className="fwm-success-icon is-confirmed"><IcCheckCircle size={28} /></div>
                            <h3>Pedido confirmado</h3>
                            <p>ID: <strong>{pedidoFinal.id}</strong></p>
                            <div className="fwm-detail-box">
                                <div className="fwm-drow"><IcCalendar /> <strong>Fecha:</strong>&nbsp;{formatFecha(pedidoFinal.fecha)}</div>
                                <div className="fwm-drow"><IcClock /> <strong>Hora:</strong>&nbsp;{pedidoFinal.hora}</div>
                                <div className="fwm-drow"><IcMapPin /> <strong>Dirección:</strong>&nbsp;{pedidoFinal.direccion}{pedidoFinal.ciudad ? `, ${pedidoFinal.ciudad}` : ''}</div>
                                {pedidoFinal.empleado && (
                                    <div className="fwm-drow"><IcUser /> <strong>Técnico:</strong>&nbsp;{pedidoFinal.empleado}</div>
                                )}
                            </div>
                            <div className="fwm-total">
                                <span>Total</span>
                                <strong>{formatMoneda(pedidoFinal.total)}</strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="fwm-footer">
                    {stage === 0 && <>
                        <button className="fwm-btn fwm-btn-secondary" onClick={onClose}>Cancelar</button>
                        <button className="fwm-btn fwm-btn-primary" onClick={handleGenerarCotizacion}>Generar cotización →</button>
                    </>}
                    {stage === 1 && <>
                        <button
                            className={`fwm-btn fwm-btn-ghost${cotizacionGuardada ? ' is-saved' : ''}`}
                            onClick={handleGuardarCotizacion}
                            disabled={guardandoCot || cotizacionGuardada}
                        >
                            <IcSave size={14} />
                            {cotizacionGuardada ? 'Guardada' : guardandoCot ? 'Guardando...' : 'Guardar cotización'}
                        </button>
                        {soloCotizacion ? (
                            <button className="fwm-btn fwm-btn-primary" onClick={onClose}>Listo</button>
                        ) : (
                            <button className="fwm-btn fwm-btn-primary" onClick={() => {
                                const userId = user?.id || user?.Id_Usuario;
                                if (!userId && onRequerirLogin) {
                                    onRequerirLogin();
                                } else {
                                    setStage(2);
                                }
                            }}>Agendar servicio →</button>
                        )}
                    </>}
                    {stage === 2 && <>
                        <button className="fwm-btn fwm-btn-secondary" onClick={() => setStage(1)}>← Volver</button>
                        <button className="fwm-btn fwm-btn-success" onClick={handleConfirmar} disabled={guardando}>
                            {guardando ? 'Guardando...' : 'Confirmar pedido'}
                        </button>
                    </>}
                    {stage === 3 && (
                        <button className="fwm-btn fwm-btn-primary" style={{ flex: 1 }} onClick={onClose}>
                            Listo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════════════════
   MODAL: PEDIR LOGIN (Para usuarios no autenticados)
   ════════════════════════════════════════════════════════════════════════ */
export const AuthPromptModal = ({ onClose, onLogin }) => {
    return (
        <div className="fwm-overlay" onClick={(e) => e.target.classList.contains('fwm-overlay') && onClose()}>
            <SharedStyles />
            <div className="fwm-modal" style={{ maxWidth: 440 }}>
                <div className="fwm-header">
                    <div className="fwm-header-title">
                        <span className="fwm-header-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                        Iniciar sesión
                    </div>
                    <button className="fwm-close" onClick={onClose}><IcX /></button>
                </div>

                <div className="fwm-body" style={{ textAlign: 'center', padding: '30px 22px' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '16px',
                        background: 'linear-gradient(135deg, #1e3a8a, #1a56ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '18px', fontWeight: '800', margin: '0 auto 20px',
                        boxShadow: '0 8px 20px rgba(30,58,138,0.25)'
                    }}>
                        FW
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        Inicia sesión para agendar
                    </h3>
                    <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.5, marginBottom: 0 }}>
                        Tu cotización se guardará automáticamente en tu cuenta cuando ingreses.
                    </p>
                </div>

                <div className="fwm-footer">
                    <button className="fwm-btn fwm-btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="fwm-btn fwm-btn-primary" style={{ flex: 1 }} onClick={onLogin}>
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};