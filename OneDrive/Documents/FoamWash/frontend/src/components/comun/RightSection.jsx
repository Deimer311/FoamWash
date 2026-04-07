// =============================================================================
// ARCHIVO  : RightSection.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/RightSection.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Sección derecha del contenido principal del home.
// =============================================================================

import React, { useState, useEffect } from 'react';

const RightSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    
    const slides = [
        {
            image: '/img/imag1.jpg',
            title: 'Lavado de muebles',
            subtitle: 'Eliminamos suciedad, manchas y malos olores con productos profesionales.'
        },
        {
            image: '/img/imag6.jpg',
            title: 'Lavado de colchones',
            subtitle: 'Limpieza profunda, desodorización efectiva y secado rápido garantizado.'
        },
        {
            image: '/img/imag2.jpg',
            title: 'Limpieza sillas de comedor',
            subtitle: 'Renovamos tus sillas con productos especializados para un acabado fresco y limpio.'
        }   
    ];

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isHovered, slides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginTop: '80px'  // ← AGREGADO: Para bajar la galería y alinearla con "Misión"
        }}>
            {/* Título - Centrado */}
            <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#ffffff',
                margin: 0,
                padding: '0',
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                width: '100%'
            }}>
                Galería
            </h2>

            {/* Contenedor del Carrusel - Centrado */}
            <div 
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px',
                    height: '240px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer'
                    // ← ELIMINADO: marginLeft: 'auto', marginRight: '0', alignSelf: 'flex-end'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Slides */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: currentSlide === index ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            pointerEvents: currentSlide === index ? 'auto' : 'none'
                        }}
                    >
                        {/* Imagen de fondo */}
                        <img
                            src={slide.image}
                            alt={slide.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                transform: isHovered && currentSlide === index ? 'scale(1.05)' : 'scale(1)',
                                transition: 'transform 6s ease-out',
                                imageRendering: '-webkit-optimize-contrast'
                            }}
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x280?text=Imagen+no+disponible';
                            }}
                        />

                        {/* Overlay degradado */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                            zIndex: 1
                        }} />

                        {/* Contenido de texto */}
                        <div style={{
                            position: 'absolute',
                            bottom: '30px',
                            left: '30px',
                            right: '30px',
                            zIndex: 2,
                            color: 'white',
                            animation: currentSlide === index ? 'slideUp 0.8s ease-out' : 'none'
                        }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                marginBottom: '6px',
                                lineHeight: '1.2',
                                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                color: 'white'
                            }}>
                                {slide.title}
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: '400',
                                margin: 0,
                                opacity: 0.95,
                                textShadow: '0 1px 5px rgba(0,0,0,0.5)',
                                color: 'white'
                            }}>
                                {slide.subtitle}
                            </p>
                        </div>
                    </div>
                ))}

                {/* Botones de navegación - solo visible al hacer hover */}
                {isHovered && (
                    <>
                        <button
                            onClick={prevSlide}
                            style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 3,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: '2px solid white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                animation: 'fadeInLeft 0.3s ease-out'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'translateY(-50%) scale(1)';
                            }}
                        >
                            ‹
                        </button>

                        <button
                            onClick={nextSlide}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 3,
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                border: '2px solid white',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontSize: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                animation: 'fadeInRight 0.3s ease-out'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'translateY(-50%) scale(1)';
                            }}
                        >
                            ›
                        </button>
                    </>
                )}

                {/* Indicadores de puntos */}
                <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 3,
                    display: 'flex',
                    gap: '10px',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    backdropFilter: 'none',
                    borderRadius: '20px'
                }}>
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            style={{
                                width: currentSlide === index ? '28px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                padding: 0
                            }}
                            onMouseEnter={(e) => {
                                if (currentSlide !== index) {
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentSlide !== index) {
                                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                                }
                            }}
                        />
                    ))}
                </div>

                {/* Contador de slides */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    zIndex: 3,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 14px',
                    borderRadius: '15px',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '600'
                }}>
                    {currentSlide + 1} / {slides.length}
                </div>
            </div>

            {/* Miniaturas - Centradas */}
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',  // ← CAMBIO: De 'flex-end' a 'center'
                padding: '0',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: '#1976D2 rgba(255, 255, 255, 0.2)',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '400px',
                width: '100%'  // ← AGREGADO: Para que ocupe el ancho máximo
                // ← ELIMINADO: marginLeft: 'auto'
            }}>
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        onClick={() => goToSlide(index)}
                        style={{
                            minWidth: '100px',
                            width: '100px',
                            height: '60px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: currentSlide === index ? '3px solid #1976D2' : '3px solid transparent',
                            opacity: currentSlide === index ? 1 : 0.6,
                            transition: 'all 0.3s ease',
                            transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: currentSlide === index ? '0 8px 20px rgba(25, 118, 210, 0.3)' : '0 4px 10px rgba(0, 0, 0, 0.15)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            if (currentSlide !== index) {
                                e.currentTarget.style.opacity = '0.6';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                imageRendering: '-webkit-optimize-contrast'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Animaciones CSS */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInLeft {
                    from {
                        opacity: 0;
                        transform: translateY(-50%) translateX(-15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(-50%) translateX(0);
                    }
                }

                @keyframes fadeInRight {
                    from {
                        opacity: 0;
                        transform: translateY(-50%) translateX(15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(-50%) translateX(0);
                    }
                }

                /* Estilos para scrollbar en miniaturas */
                div::-webkit-scrollbar {
                    height: 6px;
                }

                div::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb {
                    background: #1976D2;
                    border-radius: 10px;
                }

                div::-webkit-scrollbar-thumb:hover {
                    background: #1565C0;
                }
            `}</style>
        </div>
    );
};

export default RightSection;