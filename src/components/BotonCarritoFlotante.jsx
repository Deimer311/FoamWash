import React, { useEffect, useState } from 'react';
import { useCarrito } from './CarritoContext';

const BotonCarritoFlotante = ({ onClick }) => {
    
    const { carrito } = useCarrito();
    const cantidad = carrito.reduce((total, item) => total + item.cantidad, 0);
    const [pulsando, setPulsando] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    
    useEffect(() => {
        if (cantidad > 0) {
            setPulsando(true);
            const timer = setTimeout(() => setPulsando(false), 600);
            return () => clearTimeout(timer);
        }
    }, [cantidad]);
    
    return (
        <>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                
                @keyframes popIn {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `}</style>
            
            <button
                onClick={onClick}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0099ff, #0066cc)',
                    border: 'none',
                    color: 'white',
                    fontSize: '26px',
                    cursor: 'pointer',
                    boxShadow: isHovered 
                        ? '0 8px 24px rgba(0, 102, 204, 0.4)'
                        : '0 4px 16px rgba(0, 102, 204, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    transform: isHovered 
                        ? 'scale(1.1) rotate(10deg)'
                        : pulsando 
                            ? 'scale(1.15)'
                            : 'scale(1)',
                    animation: pulsando ? 'pulse 0.6s ease' : 'none'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title={`Ver carrito (${cantidad} ${cantidad === 1 ? 'item' : 'items'})`}
                aria-label={`Carrito de compras con ${cantidad} items`}
            >
                <span style={{ fontSize: '26px' }}>🛒</span>
                
                {cantidad > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#0066cc',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0, 102, 204, 0.4)',
                        animation: pulsando ? 'popIn 0.3s ease' : 'none'
                    }}>
                        {cantidad > 99 ? '99+' : cantidad}
                    </span>
                )}
            </button>
        </>
    );
};

export default BotonCarritoFlotante;