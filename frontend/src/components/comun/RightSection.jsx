// =============================================================================
// ARCHIVO  : RightSection.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/RightSection.jsx
// REDISEÑO : Usa clases CSS, label "Galería" sutil, animaciones conservadas
// =============================================================================

import React, { useState, useEffect } from 'react';

const slides = [
    {
        image: '/img/imag1.jpg',
        title: 'Lavado de muebles',
        
    },
    {
        image: '/img/imag6.jpg',
        title: 'Lavado de colchones',
        
    },
    {
        image: '/img/imag2.jpg',
        title: 'Limpieza sillas de comedor',
        
    }
];

const RightSection = () => {
    const [current, setCurrent] = useState(0);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        if (hovered) return;
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [hovered]);

    const prev = () => setCurrent(p => (p - 1 + slides.length) % slides.length);
    const next = () => setCurrent(p => (p + 1) % slides.length);

    return (
        <div className="right-section-inner">
            {/* Label sutil */}
            <span className="gallery-label">Galería</span>

            {/* Carrusel principal */}
            <div
                className="carousel-wrapper"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className="carousel-slide"
                        style={{
                            opacity: current === i ? 1 : 0,
                            pointerEvents: current === i ? 'auto' : 'none'
                        }}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="carousel-img"
                            style={{
                                transform: hovered && current === i ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 6s ease-out'
                            }}
                            onError={e => { e.target.src = 'https://placehold.co/400x230?text=Imagen'; }}
                        />
                        <div className="carousel-overlay" />
                        <div className="carousel-text" style={{ animation: current === i ? 'slideUp 0.7s ease-out' : 'none' }}>
                            <p className="carousel-title">{slide.title}</p>
                            <p className="carousel-subtitle">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}

                {/* Contador */}
                <div className="carousel-counter">{current + 1} / {slides.length}</div>

                {/* Botones nav (solo en hover) */}
                {hovered && (
                    <>
                        <button className="carousel-nav prev" onClick={prev}>‹</button>
                        <button className="carousel-nav next" onClick={next}>›</button>
                    </>
                )}

                {/* Dots */}
                <div className="carousel-dots">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            className={`carousel-dot${current === i ? ' active' : ''}`}
                            onClick={() => setCurrent(i)}
                            aria-label={`Ir a slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Miniaturas */}
            <div className="thumbnails">
                {slides.map((slide, i) => (
                    <div
                        key={i}
                        className={`thumb${current === i ? ' active' : ''}`}
                        onClick={() => setCurrent(i)}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            onError={e => { e.target.src = 'https://placehold.co/96x58?text=...'; }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RightSection;