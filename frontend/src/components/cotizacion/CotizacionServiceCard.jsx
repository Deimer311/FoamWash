// =============================================================================
// ARCHIVO  : CotizacionServiceCard.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Diseño actualizado al estándar premium.
// =============================================================================

import React, { useState } from 'react';

const CotizacionServiceCard = ({ service, onAgregar }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const handleAgregar = async () => {
        setIsAdding(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        if (onAgregar) onAgregar(service.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        setIsAdding(false);
    };

    const precioFormato = `$${(service.precio ?? 0).toLocaleString('es-CO')}`;

    return (
        <>
            <style>{`
                .csc-card {
                    position: relative;
                    background: #fff;
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    display: flex; flex-direction: column;
                    transition: transform 0.32s cubic-bezier(.34,1.56,.64,1), box-shadow 0.32s ease;
                    height: 100%;
                }
                .csc-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 40px rgba(26,86,255,0.13);
                    border-color: rgba(26,86,255,0.12);
                }

                .csc-img-wrap {
                    position: relative; width: 100%; height: 220px;
                    overflow: hidden; cursor: zoom-in; flex-shrink: 0;
                }
                .csc-img-wrap img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.55s ease;
                }
                .csc-card:hover .csc-img-wrap img { transform: scale(1.06); }
                .csc-img-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.35) 100%);
                    opacity: 0; transition: opacity 0.3s ease;
                    display: flex; align-items: flex-end; justify-content: center;
                    padding-bottom: 14px;
                }
                .csc-card:hover .csc-img-overlay { opacity: 1; }
                .csc-zoom-hint {
                    font-size: 12px; color: rgba(255,255,255,0.9);
                    font-family: 'Kanit', sans-serif; font-weight: 500;
                    background: rgba(0,0,0,0.3); backdrop-filter: blur(4px);
                    padding: 4px 12px; border-radius: 20px;
                }

                .csc-badge-popular {
                    position: absolute; top: 12px; right: 12px;
                    background: linear-gradient(135deg, #ff9800, #ff6d00);
                    color: #fff; font-size: 10px; font-weight: 700;
                    letter-spacing: 0.5px; text-transform: uppercase;
                    padding: 4px 10px; border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                    box-shadow: 0 3px 10px rgba(255,109,0,0.35); z-index: 2;
                }
                .csc-badges-row {
                    position: absolute; top: 12px; left: 12px;
                    display: flex; gap: 5px; z-index: 2;
                }
                .csc-badge-mini {
                    background: rgba(0,0,0,0.4); backdrop-filter: blur(6px);
                    color: #fff; font-size: 10px; font-weight: 600;
                    padding: 3px 8px; border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                    border: 1px solid rgba(255,255,255,0.15);
                }

                .csc-body { padding: 20px 22px 0; flex: 1; display: flex; flex-direction: column; }
                .csc-title {
                    font-size: 17px; font-weight: 700; color: #111;
                    line-height: 1.3; margin-bottom: 8px;
                    font-family: 'Kanit', sans-serif;
                }
                .csc-desc {
                    font-size: 13.5px; color: #666; line-height: 1.6;
                    flex: 1; margin-bottom: 14px;
                    font-family: 'Kanit', sans-serif;
                    display: -webkit-box; -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical; overflow: hidden;
                }

                .csc-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }

                .csc-tags { display: flex; gap: 5px; }
                .csc-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; font-family: 'Kanit', sans-serif; }
                .csc-tag-green { background: #e8f5e9; color: #2e7d32; }
                .csc-tag-blue  { background: #e3f2fd; color: #1565c0; }

                .csc-footer { padding: 16px 22px 20px; border-top: 1px solid #f0f0f0; margin-top: auto; }
                .csc-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 14px; }
                .csc-price-label { font-size: 10px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Kanit', sans-serif; }
                .csc-price-value {
                    font-size: 26px; font-weight: 800;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    font-family: 'Kanit', sans-serif; line-height: 1;
                }

                .csc-btn {
                    width: 100%; position: relative;
                    padding: 13px 20px; border: none; border-radius: 12px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: 'Kanit', sans-serif; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                    box-shadow: 0 4px 16px rgba(26,86,255,0.28);
                }
                .csc-btn::before {
                    content: ''; position: absolute; inset: 0; border-radius: inherit;
                    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%);
                    background-size: 200% 100%; background-position: -100% 0;
                    transition: background-position 0.45s ease;
                }
                .csc-btn:hover::before { background-position: 200% 0; }
                .csc-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(26,86,255,0.36);
                    filter: brightness(1.06);
                }
                .csc-btn:disabled { background: linear-gradient(135deg, #9ba8c0, #bcc0cc); cursor: not-allowed; box-shadow: none; }
                .csc-btn.added { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 4px 16px rgba(22,163,74,0.28); }

                .csc-sizes { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
                .csc-sizes-label { font-size: 10px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 7px; font-family: 'Kanit', sans-serif; }
                .csc-sizes-list { display: flex; flex-wrap: wrap; gap: 6px; }
                .csc-size-chip {
                    font-size: 11px; font-weight: 500; padding: 4px 11px;
                    background: #f4f4f6; color: #555; border-radius: 20px;
                    border: 1px solid #e8e8ec; font-family: 'Kanit', sans-serif;
                    transition: all 0.18s ease; cursor: pointer;
                }
                .csc-size-chip:hover { background: #eef2ff; color: #1a56ff; border-color: #c7d2fe; }

                .csc-lightbox {
                    position: fixed; inset: 0; z-index: 10001;
                    background: rgba(0,0,0,0.93);
                    display: flex; align-items: center; justify-content: center;
                    animation: cscFadeIn 0.25s ease; cursor: pointer;
                }
                @keyframes cscFadeIn { from { opacity: 0; } to { opacity: 1; } }
                .csc-lightbox img {
                    max-width: 88vw; max-height: 80vh; object-fit: contain;
                    border-radius: 16px; box-shadow: 0 24px 64px rgba(0,0,0,0.6);
                    animation: cscZoomIn 0.28s cubic-bezier(.34,1.56,.64,1); cursor: default;
                }
                @keyframes cscZoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
                .csc-lightbox-info {
                    position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
                    background: rgba(255,255,255,0.93); backdrop-filter: blur(12px);
                    padding: 16px 36px; border-radius: 14px; text-align: center;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                }
                .csc-lightbox-title { font-size: 20px; font-weight: 700; color: #1a56ff; font-family: 'Kanit', sans-serif; margin-bottom: 4px; }
                .csc-lightbox-price { font-size: 15px; color: #555; font-family: 'Kanit', sans-serif; }
                .csc-lightbox-close { position: absolute; top: 20px; right: 24px; color: rgba(255,255,255,0.7); font-size: 13px; font-family: 'Kanit', sans-serif; }
            `}</style>

            {showFullImage && (
                <div className="csc-lightbox" onClick={() => setShowFullImage(false)}>
                    <span className="csc-lightbox-close">ESC / clic para cerrar</span>
                    <img
                        src={service.imagen}
                        alt={service.nombre}
                        onClick={e => e.stopPropagation()}
                        onError={e => { e.target.src = '/img/imag1.jpg'; }}
                    />
                    <div className="csc-lightbox-info" onClick={e => e.stopPropagation()}>
                        <div className="csc-lightbox-title">{service.nombre}</div>
                        <div className="csc-lightbox-price">{precioFormato}</div>
                    </div>
                </div>
            )}

            <article className="csc-card">
                <div className="csc-img-wrap" onClick={() => setShowFullImage(true)}>
                    <div className="csc-badges-row">

                    </div>
                    {service.popular && <span className="csc-badge-popular">✨ Popular</span>}
                    <img
                        src={service.imagen}
                        alt={service.nombre}
                        onError={e => { e.target.src = '/img/imag1.jpg'; }}
                    />
                    <div className="csc-img-overlay">
                        <span className="csc-zoom-hint">Ver imagen completa</span>
                    </div>
                </div>

                <div className="csc-body">
                    <h3 className="csc-title">{service.nombre}</h3>
                    <p className="csc-desc">{service.descripcion}</p>
                    <div className="csc-meta">

                        <div className="csc-tags">

                        </div>
                    </div>
                </div>

                <div className="csc-footer">
                    <div className="csc-price-row">
                        <span className="csc-price-label">Desde&nbsp;</span>
                        <span className="csc-price-value">{precioFormato}</span>
                    </div>
                    <button
                        className={`csc-btn${added ? ' added' : ''}`}
                        onClick={handleAgregar}
                        disabled={isAdding}
                    >
                        <svg height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                            {added
                                ? <polyline points="20 6 9 17 4 12" />
                                : <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>
                            }
                        </svg>
                        <span style={{ position: 'relative', zIndex: 1 }}>
                            {isAdding ? 'Agregando...' : added ? '¡Agregado!' : 'Agregar'}
                        </span>
                    </button>

                    {service.tamanos && service.tamanos.length > 0 && (
                        <div className="csc-sizes">
                            <div className="csc-sizes-label">Tamaños disponibles</div>
                            <div className="csc-sizes-list">
                                {service.tamanos.slice(0, 3).map((t, i) => (
                                    <span key={i} className="csc-size-chip">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
        </>
    );
};

export default CotizacionServiceCard;