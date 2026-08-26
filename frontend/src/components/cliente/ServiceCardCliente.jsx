// =============================================================================
// ARCHIVO  : ServiceCardCliente.jsx  — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// =============================================================================

import React, { useState } from 'react';
import { useCarrito } from '../modales/CarritoContext';

/* ── SVG Icons (trazo consistente con HeaderCliente y ModalesCarrito) ── */
const IcLeaf = () => (
    <svg height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 22 16 8" /><path d="M22 2 8 16" />
        <path d="M17 2c0 6-4 10-10 10C5 8.4 7.5 4 12 2z" />
    </svg>
);
const IcShield = () => (
    <svg height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IcStar = () => (
    <svg height="13" viewBox="0 0 24 24" fill="#ffc107" stroke="#ffc107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const IcCart = () => (
    <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);
const IcCheck = () => (
    <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IcLoader = () => (
    <svg className="sc-spin" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-9-9" />
    </svg>
);
const IcTrending = () => (
    <svg height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);

const ServiceCardCliente = ({ servicio, onNotificacion }) => {
    const [isAdding, setIsAdding]         = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [added, setAdded]               = useState(false);
    const { agregarAlCarrito }            = useCarrito();

    const handleAgregar = async (e) => {
        e.stopPropagation();
        if (isAdding) return;
        setIsAdding(true);
        await new Promise(r => setTimeout(r, 280));
        const exito = agregarAlCarrito(servicio);
        if (exito) {
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
            onNotificacion?.(`${servicio.nombre} agregado al carrito`);
        } else {
            alert('Error al agregar el servicio');
        }
        setIsAdding(false);
    };

    const precioFormato = `$${(servicio.precio ?? 0).toLocaleString('es-CO')}`;

    return (
        <>
            <style>{`
                /* ===== SERVICE CARD ===== */
                .sc-card {
                    position: relative;
                    background: #fff;
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    display: flex;
                    flex-direction: column;
                    transition:
                        transform 0.32s cubic-bezier(.34,1.56,.64,1),
                        box-shadow 0.32s ease;
                    height: 100%;
                }
                .sc-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 40px rgba(26,86,255,0.13);
                    border-color: rgba(26,86,255,0.12);
                }

                /* Image zone */
                .sc-img-wrap {
                    position: relative;
                    width: 100%;
                    height: 220px;
                    overflow: hidden;
                    cursor: zoom-in;
                    flex-shrink: 0;
                }
                .sc-img-wrap img {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    transition: transform 0.55s ease;
                }
                .sc-card:hover .sc-img-wrap img { transform: scale(1.06); }

                .sc-img-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom,
                        transparent 55%,
                        rgba(0,0,0,0.35) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    display: flex;
                    align-items: flex-end;
                    justify-content: center;
                    padding-bottom: 14px;
                }
                .sc-card:hover .sc-img-overlay { opacity: 1; }

                .sc-zoom-hint {
                    font-size: 12px;
                    color: rgba(255,255,255,0.9);
                    font-family: 'Kanit', sans-serif;
                    font-weight: 500;
                    background: rgba(0,0,0,0.3);
                    backdrop-filter: blur(4px);
                    padding: 4px 12px;
                    border-radius: 20px;
                }

                /* Popular badge */
                .sc-badge-popular {
                    position: absolute;
                    top: 12px; right: 12px;
                    background: linear-gradient(135deg, #ff9800, #ff6d00);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                    box-shadow: 0 3px 10px rgba(255,109,0,0.35);
                    z-index: 2;
                }

                /* Eco/garantia badges */
                .sc-badges-row {
                    position: absolute;
                    top: 12px; left: 12px;
                    display: flex;
                    gap: 5px;
                    z-index: 2;
                }
                .sc-badge-mini {
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(6px);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                    border: 1px solid rgba(255,255,255,0.15);
                }

                /* Content */
                .sc-body {
                    padding: 20px 22px 0;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .sc-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #111;
                    line-height: 1.3;
                    margin-bottom: 8px;
                    font-family: 'Kanit', sans-serif;
                }

                .sc-desc {
                    font-size: 13.5px;
                    color: #666;
                    line-height: 1.6;
                    flex: 1;
                    margin-bottom: 14px;
                    font-family: 'Kanit', sans-serif;
                }

                /* Meta row: rating + eco */
                .sc-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                }

                .sc-tags {
                    display: flex;
                    gap: 5px;
                }
                .sc-tag {
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-tag-green {
                    background: #e8f5e9;
                    color: #2e7d32;
                }
                .sc-tag-blue {
                    background: #e3f2fd;
                    color: #1565c0;
                }

                /* Footer */
                .sc-footer {
                    padding: 16px 22px 20px;
                    border-top: 1px solid #f0f0f0;
                    margin-top: auto;
                }

                .sc-price-row {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                    margin-bottom: 14px;
                }
                .sc-price-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #999;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-price-value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #1e3a8a;
                    font-family: 'Kanit', sans-serif;
                    line-height: 1;
                }

                /* CTA Button */
                .sc-btn {
                    width: 100%;
                    position: relative;
                    padding: 13px 20px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #1e3a8a, #1a56ff);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                    box-shadow: 0 4px 16px rgba(30,58,138,0.3);
                }
                .sc-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%);
                    background-size: 200% 100%;
                    background-position: -100% 0;
                    transition: background-position 0.45s ease;
                }
                .sc-btn:hover::before { background-position: 200% 0; }
                .sc-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(30,58,138,0.4);
                    filter: brightness(1.1);
                }
                .sc-btn:active:not(:disabled) { transform: scale(0.97); }
                .sc-btn:disabled {
                    background: linear-gradient(135deg, #9ba8c0, #bcc0cc);
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .sc-btn.added {
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    box-shadow: 0 4px 16px rgba(22,163,74,0.28);
                }
                @keyframes sc-spin { to { transform: rotate(360deg); } }
                .sc-spin { animation: sc-spin 0.8s linear infinite; }

                .sc-btn-icon {
                    font-size: 16px;
                    position: relative;
                    z-index: 1;
                    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
                }
                .sc-btn:hover .sc-btn-icon { transform: scale(1.2); }
                .sc-btn-label { position: relative; z-index: 1; }

                /* Tamaños */
                .sc-sizes {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #f0f0f0;
                }
                .sc-sizes-label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #aaa;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 7px;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-sizes-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .sc-size-chip {
                    font-size: 11px;
                    font-weight: 500;
                    padding: 4px 11px;
                    background: #f4f4f6;
                    color: #555;
                    border-radius: 20px;
                    border: 1px solid #e8e8ec;
                    font-family: 'Kanit', sans-serif;
                    transition: all 0.18s ease;
                    cursor: pointer;
                }
                .sc-size-chip:hover {
                    background: #eef2ff;
                    color: #1a56ff;
                    border-color: #c7d2fe;
                }

                /* ===== LIGHTBOX ===== */
                .sc-lightbox {
                    position: fixed;
                    inset: 0;
                    z-index: 10001;
                    background: rgba(0,0,0,0.93);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: scFadeIn 0.25s ease;
                    cursor: pointer;
                }
                @keyframes scFadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .sc-lightbox img {
                    max-width: 88vw;
                    max-height: 80vh;
                    object-fit: contain;
                    border-radius: 16px;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
                    animation: scZoomIn 0.28s cubic-bezier(.34,1.56,.64,1);
                    cursor: default;
                }
                @keyframes scZoomIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .sc-lightbox-info {
                    position: absolute;
                    bottom: 36px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(255,255,255,0.93);
                    backdrop-filter: blur(12px);
                    padding: 16px 36px;
                    border-radius: 14px;
                    text-align: center;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                }
                .sc-lightbox-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #1a56ff;
                    font-family: 'Kanit', sans-serif;
                    margin-bottom: 4px;
                }
                .sc-lightbox-price {
                    font-size: 15px;
                    color: #555;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-lightbox-close {
                    position: absolute;
                    top: 20px; right: 24px;
                    color: rgba(255,255,255,0.7);
                    font-size: 13px;
                    font-family: 'Kanit', sans-serif;
                    user-select: none;
                }
            `}</style>

            {/* Lightbox */}
            {showFullImage && (
                <div className="sc-lightbox" onClick={() => setShowFullImage(false)}>
                    <span className="sc-lightbox-close">ESC / clic para cerrar</span>
                    <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        onClick={e => e.stopPropagation()}
                        onError={e => { e.target.src = '/img/imag1.jpg'; }}
                    />
                    <div className="sc-lightbox-info" onClick={e => e.stopPropagation()}>
                        <div className="sc-lightbox-title">{servicio.nombre}</div>
                        <div className="sc-lightbox-price">{precioFormato}</div>
                    </div>
                </div>
            )}

            {/* Card */}
            <article className="sc-card">
                {/* Image */}
                <div className="sc-img-wrap" onClick={() => setShowFullImage(true)}>
                    {/* Badges top-left */}
                    <div className="sc-badges-row">

                    </div>
                    {servicio.popular && <span className="sc-badge-popular"><IcTrending /> Popular</span>}

                    <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        onError={e => { e.target.src = '/img/imag1.jpg'; }}
                    />
                    <div className="sc-img-overlay">
                        <span className="sc-zoom-hint">Ver imagen completa</span>
                    </div>
                </div>

                {/* Body */}
                <div className="sc-body">
                    <h3 className="sc-title">{servicio.nombre}</h3>
                    <p className="sc-desc">{servicio.descripcion}</p>

                    <div className="sc-meta">
                        <div className="sc-tags">

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sc-footer">
                    <div className="sc-price-row">
                        <span className="sc-price-label">Desde&nbsp;</span>
                        <span className="sc-price-value">{precioFormato}</span>
                    </div>

                    <button
                        className={`sc-btn${added ? ' added' : ''}`}
                        onClick={handleAgregar}
                        disabled={isAdding}
                    >
                        <span className="sc-btn-icon">
                            {isAdding ? <IcLoader /> : added ? <IcCheck /> : <IcCart />}
                        </span>
                        <span className="sc-btn-label">
                            {isAdding ? 'Agregando...' : added ? '¡Agregado!' : 'Solicitar'}
                        </span>
                    </button>

                    {servicio.tamanos?.length > 0 && (
                        <div className="sc-sizes">
                            <div className="sc-sizes-label">Tamaños disponibles</div>
                            <div className="sc-sizes-list">
                                {servicio.tamanos.slice(0, 3).map((t, i) => (
                                    <span key={i} className="sc-size-chip">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </>
    );
};

export default ServiceCardCliente;