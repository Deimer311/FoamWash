// =============================================================================
// ARCHIVO  : CarritoModal.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/modales/CarritoModal.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Modal del carrito con lista de servicios seleccionados, cantidades y total.
// =============================================================================

import React from 'react';
import { useCarrito } from './CarritoContext';

const CarritoModal = ({ isOpen, onClose, onFinalizarCompra }) => {
    
    // Obtener datos y funciones del contexto del carrito
    const { 
        carrito,
        eliminarDelCarrito,
        actualizarCantidad,
        calcularTotal
    } = useCarrito();
    
    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;
    
    // Calcular el número total de items
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Manejador del clic en el overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    // Manejador de finalizar compra
    const handleFinalizarCompra = () => {
        if (carrito.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        onClose();
        onFinalizarCompra();
    };
    
    // =========================================================================
    // ESTILOS
    // =========================================================================
    
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.3s ease'
    };
    
    const modalStyle = {
        background: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'slideUp 0.3s ease'
    };
    
    const headerStyle = {
        padding: '25px',
        borderBottom: '2px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #0099ff, #0066cc)'
    };
    
    const titleStyle = {
        margin: 0,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '24px',
        fontWeight: 'bold'
    };
    
    const closeButtonStyle = {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'white',
        fontSize: '24px',
        transition: 'all 0.3s ease'
    };
    
    const bodyStyle = {
        flex: 1,
        overflow: 'auto',
        padding: '20px'
    };
    
    const footerStyle = {
        padding: '25px',
        borderTop: '2px solid #f0f0f0',
        background: '#fafafa'
    };
    
    return (
        <>
            {/* ANIMACIONES CSS */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
            
            {/* OVERLAY */}
            <div style={overlayStyle} onClick={handleOverlayClick}>
                
                {/* CONTENEDOR DEL MODAL */}
                <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                    
                    {/* HEADER */}
                    <div style={headerStyle}>
                        <h2 style={titleStyle}>
                            🛒 Carrito de Servicios
                        </h2>
                        <button
                            onClick={onClose}
                            style={closeButtonStyle}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'rotate(90deg)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'rotate(0deg)';
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    
                    {/* BODY */}
                    <div style={bodyStyle}>
                        {carrito.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#999'
                            }}>
                                <div style={{
                                    fontSize: '64px',
                                    opacity: 0.3,
                                    marginBottom: '20px'
                                }}>
                                    🛒
                                </div>
                                <p style={{ fontSize: '18px' }}>
                                    El carrito está vacío
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '15px'
                            }}>
                                {carrito.map(item => (
                                    <CarritoItem 
                                        key={item.id}
                                        item={item}
                                        onEliminar={() => eliminarDelCarrito(item.id)}
                                        onActualizarCantidad={(nuevaCantidad) => 
                                            actualizarCantidad(item.id, nuevaCantidad)
                                        }
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* FOOTER */}
                    {carrito.length > 0 && (
                        <div style={footerStyle}>
                            {/* TOTAL */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '20px',
                                fontSize: '24px',
                                fontWeight: 'bold'
                            }}>
                                <span>Total:</span>
                                <span style={{ color: '#0099ff' }}>
                                    ${calcularTotal().toLocaleString('es-CO')}
                                </span>
                            </div>
                            
                            {/* BOTONES */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={onClose}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        border: '2px solid #ddd',
                                        background: 'white',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f5f5f5';
                                        e.target.style.borderColor = '#999';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#ddd';
                                    }}
                                >
                                    Seguir comprando
                                </button>
                                
                                <button
                                    onClick={handleFinalizarCompra}
                                    style={{
                                        flex: 1,
                                        padding: '15px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #0099ff, #00cc88)',
                                        color: 'white',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 15px rgba(0, 153, 255, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(0, 153, 255, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(0, 153, 255, 0.3)';
                                    }}
                                >
                                    Finalizar compra
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// =============================================================================
// COMPONENTE HIJO: CarritoItem
// =============================================================================
const CarritoItem = ({ item, onEliminar, onActualizarCantidad }) => {
    
    const itemStyle = {
        display: 'flex',
        gap: '15px',
        padding: '15px',
        background: '#f9f9f9',
        borderRadius: '12px',
        alignItems: 'center',
        transition: 'all 0.3s ease'
    };
    
    return (
        <div 
            style={itemStyle}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
                e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f9f9f9';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            {/* IMAGEN */}
            <img
                src={item.imagen}
                alt={item.nombre}
                style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    flexShrink: 0
                }}
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Sin+imagen';
                }}
            />
            
            {/* INFORMACIÓN - ✅ SIN LA LÍNEA DE DURACIÓN */}
            <div style={{ flex: 1 }}>
                <h4 style={{
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    color: '#333'
                }}>
                    {item.nombre}
                </h4>
                <p style={{
                    margin: 0,
                    color: '#0099ff',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ${item.precio.toLocaleString('es-CO')}
                </p>
            </div>
            
            {/* CONTROLES */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {/* CONTROL DE CANTIDAD */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '25px',
                    border: '2px solid #0099ff'
                }}>
                    <button
                        onClick={() => onActualizarCantidad(item.cantidad - 1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#0099ff',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        −
                    </button>
                    
                    <span style={{
                        fontWeight: 'bold',
                        minWidth: '20px',
                        textAlign: 'center',
                        fontSize: '16px'
                    }}>
                        {item.cantidad}
                    </span>
                    
                    <button
                        onClick={() => onActualizarCantidad(item.cantidad + 1)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#0099ff',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        +
                    </button>
                </div>
                
                {/* BOTÓN ELIMINAR */}
                <button
                    onClick={onEliminar}
                    style={{
                        background: '#ff4444',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '18px',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1) rotate(90deg)';
                        e.target.style.background = '#cc0000';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1) rotate(0deg)';
                        e.target.style.background = '#ff4444';
                    }}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default CarritoModal;