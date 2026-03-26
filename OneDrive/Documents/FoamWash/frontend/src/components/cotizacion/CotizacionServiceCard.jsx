// =============================================================================
// ARCHIVO  : CotizacionServiceCard.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cotizacion/CotizacionServiceCard.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Tarjeta de servicio exclusiva para la página de cotización pública.
// =============================================================================

import React, { useState } from 'react';

const CotizacionServiceCard = ({ service, onAgregar }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    
    // Manejador del botón Agregar con animación
    const handleAgregar = async () => {
        setIsAdding(true);
        
        // Simular delay de agregado
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (onAgregar) {
            onAgregar(service.id);
        }
        
        setIsAdding(false);
    };
    
    // Función para manejar el click en la imagen
    const handleImageClick = (e) => {
        e.stopPropagation();
        setShowFullImage(true);
    };
    
    // Función para cerrar la imagen completa
    const handleCloseImage = () => {
        setShowFullImage(false);
    };
    
    return (
        <>
            {/* ===== OVERLAY DE IMAGEN COMPLETA ===== */}
            {showFullImage && (
                <div 
                    onClick={handleCloseImage}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease-out',
                        cursor: 'pointer'
                    }}
                >
                    <img 
                        src={service.imagen}
                        alt={service.nombre}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            borderRadius: '20px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                            animation: 'zoomIn 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    
                    {/* Información sobre la imagen */}
                    <div style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: '20px 40px',
                        borderRadius: '15px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1976D2',
                            marginBottom: '8px'
                        }}>
                            {service.nombre}
                        </h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#666',
                            margin: 0
                        }}>
                            ${service.precio.toLocaleString('es-CO')}
                        </p>
                    </div>
                    
                    {/* Texto de instrucción */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontSize: '14px',
                        opacity: 0.8,
                        textAlign: 'center'
                    }}>
                        Click en cualquier lugar para cerrar
                    </div>
                </div>
            )}
            
            {/* ===== TARJETA PRINCIPAL ===== */}
            <article 
                style={{
                    position: 'relative',
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    overflow: 'visible',
                    boxShadow: isHovered ? '0 20px 50px rgba(0, 153, 255, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.08)',
                    transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'all 0.5s ease',
                    cursor: 'pointer',
                    display: 'grid',
                    gridTemplateRows: 'auto auto 1fr auto',
                    height: '100%'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Imagen - CON CLICK PARA AMPLIAR */}
                <div 
                    onClick={handleImageClick}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        overflow: 'hidden',
                        borderRadius: '20px 20px 0 0',
                        cursor: 'zoom-in'
                    }}
                >
                    <img 
                        src={service.imagen}
                        alt={service.nombre}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                            transition: 'transform 0.6s ease'
                        }}
                    />
                    
                    {/* Overlay gradient */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
                        opacity: isHovered ? 1 : 0.7,
                        transition: 'opacity 0.3s ease'
                    }} />
                    
                    {/* Ícono de zoom */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '50%',
                        width: '56px',
                        height: '56px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                        animation: isHovered ? 'pulseZoom 2s ease-in-out infinite' : 'none'
                    }}>
                        <span style={{ fontSize: '24px' }}>🔍</span>
                    </div>
                </div>
                
                {/* Contenido */}
                <div style={{
                    padding: '24px 24px 0 24px'
                }}>
                    {/* Título */}
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1A1A1A',
                        marginBottom: '12px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {service.nombre}
                    </h3>
                    
                    {/* Descripción */}
                    <p style={{
                        fontSize: '14px',
                        color: '#666',
                        lineHeight: '1.6',
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '63px'
                    }}>
                        {service.desc}
                    </p>
                </div>
                
                {/* Espacio Flexible */}
                <div style={{ minHeight: '16px' }} />
                
                {/* Precio y Botón */}
                <div style={{
                    padding: '0 24px 24px 24px'
                }}>
                    <div style={{
                        borderTop: '1px solid #E0E0E0',
                        marginBottom: '16px'
                    }} />
                    
                    {/* Precio */}
                    <div style={{
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: '#999',
                            textTransform: 'uppercase',
                            fontWeight: '600',
                            marginBottom: '4px'
                        }}>
                            Desde
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1976D2, #42A5F5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            ${service.precio.toLocaleString('es-CO')}
                        </div>
                    </div>
                    
                    {/* Botón Agregar */}
                    <button
                        onClick={handleAgregar}
                        disabled={isAdding}
                        style={{
                            width: '100%',
                            background: isAdding 
                                ? 'linear-gradient(135deg, #666, #999)'
                                : 'linear-gradient(135deg, #1976D2, #2196F3)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 24px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: isAdding ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isAdding) {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>🛒</span>
                        <span>{isAdding ? 'Agregando...' : 'Agregar'}</span>
                    </button>
                    
                    {/* Tamaños */}
                    {service.tamanos && service.tamanos.length > 0 && (
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid #E0E0E0'
                        }}>
                            <div style={{
                                fontSize: '11px',
                                color: '#999',
                                marginBottom: '8px',
                                fontWeight: '600',
                                textTransform: 'uppercase'
                            }}>
                                Tamaños disponibles:
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px'
                            }}>
                                {service.tamanos.slice(0, 3).map((tamano, index) => (
                                    <span 
                                        key={index}
                                        style={{
                                            fontSize: '11px',
                                            padding: '6px 12px',
                                            backgroundColor: '#F5F5F5',
                                            color: '#666',
                                            borderRadius: '8px',
                                            border: '1px solid #E0E0E0',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#E3F2FD';
                                            e.target.style.color = '#1976D2';
                                            e.target.style.borderColor = '#90CAF9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#F5F5F5';
                                            e.target.style.color = '#666';
                                            e.target.style.borderColor = '#E0E0E0';
                                        }}
                                    >
                                        {tamano}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </article>
            
            {/* Estilos CSS inline para animaciones */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes zoomIn {
                    from { 
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to { 
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes pulseZoom {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.9;
                    }
                    50% {
                        transform: translate(-50%, -50%) scale(1.1);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
};

export default CotizacionServiceCard;