import React, { useEffect } from 'react';

const Notificacion = ({ mensaje, onClose, tipo = 'exito', duracion = 2500 }) => {
    
    useEffect(() => {
        const timer = setTimeout(() => onClose(), duracion);
        return () => clearTimeout(timer);
    }, [onClose, duracion]);
    
    const getTipoConfig = () => {
        switch (tipo) {
            case 'exito':
                return {
                    icono: '✓',
                    color: '#0099ff',
                    bg: 'rgba(0, 153, 255, 0.95)'
                };
            case 'error':
                return {
                    icono: '✕',
                    color: '#ff4444',
                    bg: 'rgba(255, 68, 68, 0.95)'
                };
            case 'info':
                return {
                    icono: 'ℹ',
                    color: '#5BC0DE',
                    bg: 'rgba(91, 192, 222, 0.95)'
                };
            case 'advertencia':
                return {
                    icono: '⚠',
                    color: '#f39c12',
                    bg: 'rgba(243, 156, 18, 0.95)'
                };
            default:
                return {
                    icono: '✓',
                    color: '#0099ff',
                    bg: 'rgba(0, 153, 255, 0.95)'
                };
        }
    };
    
    const config = getTipoConfig();
    
    return (
        <>
            <style>{`
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `}</style>
            
            <div 
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: config.bg,
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    boxShadow: `0 4px 12px ${config.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 10000,
                    minWidth: '180px',
                    maxWidth: '280px',
                    animation: `slideInRight 0.3s ease, fadeOutRight 0.3s ease ${duracion - 300}ms`,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                }}
                onClick={onClose}
            >
                <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    {config.icono}
                </div>
                
                <span style={{ flex: 1, lineHeight: '1.3' }}>
                    {mensaje}
                </span>
                
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '12px',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    ✕
                </button>
            </div>
        </>
    );
};

export default Notificacion;

export const NotificacionContainer = ({ notificaciones, onRemove }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '6px',
            zIndex: 10000
        }}>
            {notificaciones.map((notif) => (
                <Notificacion
                    key={notif.id}
                    mensaje={notif.mensaje}
                    tipo={notif.tipo}
                    duracion={notif.duracion}
                    onClose={() => onRemove(notif.id)}
                />
            ))}
        </div>
    );
};

export const useNotificaciones = () => {
    const [notificaciones, setNotificaciones] = React.useState([]);
    
    const agregarNotificacion = (mensaje, tipo = 'exito', duracion = 2500) => {
        const id = Date.now();
        const nuevaNotificacion = { id, mensaje, tipo, duracion };
        setNotificaciones(prev => [...prev, nuevaNotificacion]);
    };
    
    const removerNotificacion = (id) => {
        setNotificaciones(prev => prev.filter(n => n.id !== id));
    };
    
    return { notificaciones, agregarNotificacion, removerNotificacion };
};