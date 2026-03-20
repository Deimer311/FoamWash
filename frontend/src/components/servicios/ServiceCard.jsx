// =============================================================================
// ARCHIVO  : ServiceCard.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/servicios/ServiceCard.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Tarjeta de servicio para la página pública con zoom de imagen y botón de cotización.
// =============================================================================

import React, { useState } from 'react';
import AuthModal from '../autenticacion/AuthModal';
import { checkActiveSession } from '../../utils/AuthUtils';

const ServiceCard = ({ servicio, onSolicitar, onGoToLogin }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    
    // Manejador del botón Solicitar
    const handleSolicitar = async () => {
        // Verificar si el usuario está logueado
        const session = checkActiveSession();
        
        if (!session.isActive) {
            // Si NO está logueado, mostrar el modal
            setShowAuthModal(true);
        } else {
            // Si SÍ está logueado, proceder con la solicitud
            setIsRequesting(true);
            
            // Simular delay de solicitud
            await new Promise(resolve => setTimeout(resolve, 300));
            
            if (onSolicitar) {
                onSolicitar(servicio);
            }
            
            setIsRequesting(false);
        }
    };
    
    // Cerrar el modal de autenticación
    const handleCloseModal = () => {
        setShowAuthModal(false);
    };
    
    // Ir a la página de login
    const handleGoToLogin = () => {
        setShowAuthModal(false);
        if (onGoToLogin) {
            onGoToLogin();
        }
    };
    
    // Ir a la página de registro (por ahora igual que login)
    const handleGoToRegister = () => {
        setShowAuthModal(false);
        if (onGoToLogin) {
            onGoToLogin(); // Por ahora redirige al login, que tiene toggle a registro
        }
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
                
                {/* Imagen - CON CLICK PARA AMPLIAR */}
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
                            transition: 'transform 0.5s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                            e.target.src = '/img/placeholder.jpg';
                        }}
                    />
                    
                    {/* Icono de zoom */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isHovered ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                        pointerEvents: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                        animation: isHovered ? 'pulseZoom 2s ease-in-out infinite' : 'none'
                    }}>
                        <span style={{ fontSize: '24px' }}>🔍</span>
                    </div>
                </div>
                
                {/* Título */}
                <div style={{
                    padding: '24px 24px 0 24px'
                }}>
                    <h3 style={{
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#1A1A1A',
                        marginBottom: '12px',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {servicio.nombre}
                    </h3>
                </div>
                
                {/* Descripción y badges */}
                <div style={{
                    padding: '0 24px'
                }}>
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
                        textOverflow: 'ellipsis',
                        minHeight: '63px'
                    }}>
                        {servicio.descripcion}
                    </p>
                    
                    {/* Badges de características */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '8px'
                    }}>
                        {servicio.duracion && (
                            <span style={{
                                fontSize: '11px',
                                padding: '6px 10px',
                                backgroundColor: '#E8F5E9',
                                color: '#2E7D32',
                                borderRadius: '8px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>⏱️</span>
                                {servicio.duracion}
                            </span>
                        )}
                        {servicio.garantia && (
                            <span style={{
                                fontSize: '11px',
                                padding: '6px 10px',
                                backgroundColor: '#E3F2FD',
                                color: '#1976D2',
                                borderRadius: '8px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>✓</span>
                                Garantía
                            </span>
                        )}
                        {servicio.ecologico && (
                            <span style={{
                                fontSize: '11px',
                                padding: '6px 10px',
                                backgroundColor: '#E8F5E9',
                                color: '#388E3C',
                                borderRadius: '8px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>🌿</span>
                                Eco
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
                    
                    {/* Botón Solicitar */}
                    <button
                        onClick={handleSolicitar}
                        disabled={isRequesting}
                        style={{
                            width: '100%',
                            background: isRequesting 
                                ? 'linear-gradient(135deg, #666, #999)'
                                : 'linear-gradient(135deg, #1976D2, #2196F3)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 24px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '700',
                            cursor: isRequesting ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!isRequesting) {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📋</span>
                        <span>{isRequesting ? 'Solicitando...' : 'Solicitar'}</span>
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

            {/* MODAL DE AUTENTICACIÓN */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={handleCloseModal}
                onLogin={handleGoToLogin}
                onRegister={handleGoToRegister}
                title="Debes iniciar sesión primero"
                message="Para solicitar un servicio crea una cuenta o inicia sesión."
            />
            
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

export default ServiceCard;