// =============================================================================
// ARCHIVO  : ServiceCardCliente.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/ServiceCardCliente.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Tarjeta de servicio para la vista del cliente con zoom de imagen y botón de agregar al carrito.
// =============================================================================

import React, { useState } from 'react';
import { useCarrito } from '../modales/CarritoContext';

const ServiceCardCliente = ({ servicio, onNotificacion }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    
    // ✅ OBTENER LA FUNCIÓN DE AGREGAR AL CARRITO DEL CONTEXTO
    const { agregarAlCarrito } = useCarrito();
    
    const handleAgregar = async () => {
        setIsAdding(true);
        
        // Simular delay de agregar
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // ✅ AGREGAR AL CARRITO USANDO EL CONTEXTO
        console.log('🛒 Agregando servicio al carrito:', servicio);
        const exito = agregarAlCarrito(servicio);
        
        if (exito) {
            console.log('✅ Servicio agregado exitosamente');
            
            // Mostrar notificación si existe la función
            if (onNotificacion) {
                onNotificacion(`${servicio.nombre} agregado al carrito`);
            } else {
                // Si no hay sistema de notificaciones, mostrar alert simple
                alert(`✅ ${servicio.nombre} agregado al carrito`);
            }
        } else {
            console.error('❌ Error al agregar servicio');
            alert('❌ Error al agregar el servicio');
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
                        src={servicio.imagen}
                        alt={servicio.nombre}
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
                            {servicio.nombre}
                        </h3>
                        <p style={{
                            fontSize: '16px',
                            color: '#666',
                            margin: 0
                        }}>
                            ${(servicio.precio ?? 0).toLocaleString('es-CO')}
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
                {/* Badge Popular */}
                {servicio.popular && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 10,
                        background: 'linear-gradient(135deg, #FFA726, #FF9800)',
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)'
                    }}>
                        <span>✨</span>
                        Popular
                    </div>
                )}
                
                {/* Imagen - AHORA CON CLICK */}
                <div 
                    onClick={handleImageClick}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
                        borderRadius: '20px 20px 0 0',
                        cursor: 'zoom-in'
                    }}
                >
                    <img 
                        src={servicio.imagen}
                        alt={servicio.nombre}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.7s ease',
                            transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                        }}
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x300?text=Imagen+no+disponible';
                        }}
                    />
                    
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.3) 50%, transparent)',
                        opacity: isHovered ? 1 : 0.4,
                        transition: 'opacity 0.3s ease'
                    }} />
                    
                    {/* Icono de zoom al hacer hover */}
                    {isHovered && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'transparent',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            animation: 'pulseZoom 1.5s ease-in-out infinite',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                        }}>
                            
                        </div>
                    )}
                    
                    {servicio.duracion && (
                        <div style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span>🕒</span>
                            <span>{servicio.duracion}</span>
                        </div>
                    )}
                </div>
                
                {/* Contenido Superior */}
                <div style={{
                    padding: '24px 24px 0 24px'
                }}>
                    {/* Título */}
                    <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: isHovered ? '#1976D2' : '#333',
                        marginBottom: '12px',
                        lineHeight: '1.3',
                        height: '52px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.3s ease'
                    }}>
                        {servicio.nombre}
                    </h3>
                    
                    {/* Descripción con Tooltip */}
                    <div 
                        style={{
                            position: 'relative',
                            marginBottom: '16px'
                        }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <p style={{
                            fontSize: '14px',
                            color: '#666',
                            lineHeight: '1.6',
                            height: '44px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            cursor: 'help'
                        }}>
                            {servicio.descripcion}
                        </p>
                        
                        {/* Tooltip con descripción completa */}
                        {showTooltip && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginTop: '8px',
                                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                                color: 'white',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                maxWidth: '280px',
                                width: 'max-content',
                                zIndex: 1000,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                                animation: 'tooltipFadeIn 0.2s ease-out',
                                pointerEvents: 'none'
                            }}>
                                {servicio.descripcion}
                                
                                {/* Flecha del tooltip */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderBottom: '6px solid rgba(0, 0, 0, 0.95)'
                                }} />
                            </div>
                        )}
                    </div>
                    
                    {/* Badges */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        minHeight: '32px'
                    }}>
                        {servicio.garantia && (
                            <span style={{
                                backgroundColor: '#E8F5E9',
                                color: '#388E3C',
                                padding: '5px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: '1px solid #81C784',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>✓</span>
                                Garantizado
                            </span>
                        )}
                        {servicio.rating && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span style={{ color: '#FFC107', fontSize: '14px' }}>★</span>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
                                    {servicio.rating}
                                </span>
                            </div>
                        )}
                    </div>
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
                            ${(servicio.precio ?? 0).toLocaleString('es-CO')}
                        </div>
                    </div>
                    
                    {/* Botón */}
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
                    {servicio.tamanos && servicio.tamanos.length > 0 && (
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
                                {servicio.tamanos.slice(0, 3).map((tamano, index) => (
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
                
                @keyframes tooltipFadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
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

export default ServiceCardCliente;