// =============================================================================
// ARCHIVO  : ServiceCard.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Solo diseño actualizado al estándar de ServiceCardCliente.
// =============================================================================

import React, { useState } from 'react';
import AuthModal from '../autenticacion/AuthModal';
import { useAuth } from '../autenticacion/AuthContext';

const ServiceCard = ({ servicio, onSolicitar, onGoToLogin }) => {
    const { isAuthenticated } = useAuth();
    const [isHovered,     setIsHovered]     = useState(false);
    const [isRequesting,  setIsRequesting]  = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleSolicitar = async () => {
        if (!isAuthenticated) {
            setShowAuthModal(true);
        } else {
            setIsRequesting(true);
            await new Promise(resolve => setTimeout(resolve, 300));
            if (onSolicitar) onSolicitar(servicio);
            setIsRequesting(false);
        }
    };

    const handleCloseModal   = () => setShowAuthModal(false);
    const handleGoToLogin    = () => { setShowAuthModal(false); if (onGoToLogin) onGoToLogin(); };
    const handleGoToRegister = () => { setShowAuthModal(false); if (onGoToLogin) onGoToLogin(); };
    const handleImageClick   = (e) => { e.stopPropagation(); setShowFullImage(true); };

    const precioFormato = `$${(servicio.precio ?? 0).toLocaleString('es-CO')}`;

    return (
        <>
            <style>{`
                .sc-card {
                    position: relative;
                    background: #fff;
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.06);
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.32s cubic-bezier(.34,1.56,.64,1), box-shadow 0.32s ease;
                    height: 100%;
                }
                .sc-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 16px 40px rgba(26,86,255,0.13);
                    border-color: rgba(26,86,255,0.12);
                }

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
                    background: linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.35) 100%);
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
                .sc-badges-row {
                    position: absolute;
                    top: 12px; left: 12px;
                    display: flex; gap: 5px; z-index: 2;
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
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .sc-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                }
                .sc-rating {
                    display: flex; align-items: center; gap: 4px;
                    font-size: 12px; color: #555;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-star { color: #ffc107; font-size: 13px; }
                .sc-tags { display: flex; gap: 5px; }
                .sc-tag {
                    font-size: 10px; font-weight: 600;
                    padding: 2px 8px; border-radius: 20px;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-tag-green { background: #e8f5e9; color: #2e7d32; }
                .sc-tag-blue  { background: #e3f2fd; color: #1565c0; }

                .sc-footer {
                    padding: 16px 22px 20px;
                    border-top: 1px solid #f0f0f0;
                    margin-top: auto;
                }
                .sc-price-row {
                    display: flex; align-items: baseline; gap: 4px;
                    margin-bottom: 14px;
                }
                .sc-price-label {
                    font-size: 10px; font-weight: 700; color: #999;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    font-family: 'Kanit', sans-serif;
                }
                .sc-price-value {
                    font-size: 26px; font-weight: 800;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    font-family: 'Kanit', sans-serif; line-height: 1;
                }

                .sc-btn {
                    width: 100%;
                    position: relative;
                    padding: 13px 20px;
                    border: none; border-radius: 12px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    overflow: hidden;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                    box-shadow: 0 4px 16px rgba(26,86,255,0.28);
                }
                .sc-btn::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.15) 50%, transparent 65%);
                    background-size: 200% 100%;
                    background-position: -100% 0;
                    transition: background-position 0.45s ease;
                    border-radius: inherit;
                }
                .sc-btn:hover::before { background-position: 200% 0; }
                .sc-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(26,86,255,0.36);
                    filter: brightness(1.06);
                }
                .sc-btn:disabled {
                    background: linear-gradient(135deg, #9ba8c0, #bcc0cc);
                    cursor: not-allowed; box-shadow: none;
                }
                .sc-btn-icon { position: relative; z-index: 1; }
                .sc-btn-label { position: relative; z-index: 1; }

                .sc-sizes { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
                .sc-sizes-label {
                    font-size: 10px; font-weight: 700; color: #aaa;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    margin-bottom: 7px; font-family: 'Kanit', sans-serif;
                }
                .sc-sizes-list { display: flex; flex-wrap: wrap; gap: 6px; }
                .sc-size-chip {
                    font-size: 11px; font-weight: 500;
                    padding: 4px 11px;
                    background: #f4f4f6; color: #555;
                    border-radius: 20px; border: 1px solid #e8e8ec;
                    font-family: 'Kanit', sans-serif;
                    transition: all 0.18s ease; cursor: pointer;
                }
                .sc-size-chip:hover { background: #eef2ff; color: #1a56ff; border-color: #c7d2fe; }

                /* Lightbox */
                .sc-lightbox {
                    position: fixed; inset: 0; z-index: 10001;
                    background: rgba(0,0,0,0.93);
                    display: flex; align-items: center; justify-content: center;
                    animation: scFadeIn 0.25s ease; cursor: pointer;
                }
                @keyframes scFadeIn { from { opacity: 0; } to { opacity: 1; } }
                .sc-lightbox img {
                    max-width: 88vw; max-height: 80vh;
                    object-fit: contain; border-radius: 16px;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.6);
                    animation: scZoomIn 0.28s cubic-bezier(.34,1.56,.64,1);
                    cursor: default;
                }
                @keyframes scZoomIn {
                    from { opacity: 0; transform: scale(0.85); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .sc-lightbox-info {
                    position: absolute; bottom: 36px;
                    left: 50%; transform: translateX(-50%);
                    background: rgba(255,255,255,0.93);
                    backdrop-filter: blur(12px);
                    padding: 16px 36px; border-radius: 14px;
                    text-align: center;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                }
                .sc-lightbox-title {
                    font-size: 20px; font-weight: 700;
                    color: #1a56ff; font-family: 'Kanit', sans-serif; margin-bottom: 4px;
                }
                .sc-lightbox-price { font-size: 15px; color: #555; font-family: 'Kanit', sans-serif; }
                .sc-lightbox-close {
                    position: absolute; top: 20px; right: 24px;
                    color: rgba(255,255,255,0.7); font-size: 13px;
                    font-family: 'Kanit', sans-serif; user-select: none;
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
            <article
                className="sc-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image */}
                <div className="sc-img-wrap" onClick={handleImageClick}>
                    <div className="sc-badges-row">
                        {servicio.ecologico && <span className="sc-badge-mini">🌿 Eco</span>}
                        {servicio.garantia  && <span className="sc-badge-mini">✓ Garantía</span>}
                    </div>
                    {servicio.popular && <span className="sc-badge-popular">✨ Popular</span>}
                    <img
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        onError={e => { e.target.src = '/img/placeholder.jpg'; }}
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
                        {servicio.rating && (
                            <div className="sc-rating">
                                <span className="sc-star">★</span>
                                <strong>{servicio.rating}</strong>
                                <span style={{ color: '#bbb' }}>(4.8k)</span>
                            </div>
                        )}
                        <div className="sc-tags">
                            {servicio.ecologico && <span className="sc-tag sc-tag-green">Eco</span>}
                            {servicio.garantia  && <span className="sc-tag sc-tag-blue">Garantía</span>}
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
                        className="sc-btn"
                        onClick={handleSolicitar}
                        disabled={isRequesting}
                    >
                        <span className="sc-btn-icon">
                            <svg height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                        </span>
                        <span className="sc-btn-label">
                            {isRequesting ? 'Solicitando...' : 'Solicitar'}
                        </span>
                    </button>

                    {servicio.tamanos && servicio.tamanos.length > 0 && (
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

            {/* Modal de autenticación */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={handleCloseModal}
                onLogin={handleGoToLogin}
                onRegister={handleGoToRegister}
                title="Debes iniciar sesión primero"
                message="Para solicitar un servicio crea una cuenta o inicia sesión."
            />
        </>
    );
};

export default ServiceCard;