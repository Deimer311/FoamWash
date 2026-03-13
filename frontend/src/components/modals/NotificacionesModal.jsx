import React from 'react';
import QuickActionModal from './QuickActionModal';

function NotificacionesModal({ notificaciones, onClose, onMarkRead }) {
    return (
        <QuickActionModal titulo="🔔 Notificaciones" onClose={onClose} anchoGrande={false}>
            <div>
                {notificaciones.map(notif => (
                    <div key={notif.id} style={notificationItemStyle(notif.leida)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <p style={notificationMessageStyle(notif.leida)}>{notif.mensaje}</p>
                                <p style={{ margin: '8px 0 0 0', color: '#888', fontSize: '13px' }}>{notif.fecha}</p>
                            </div>
                            {!notif.leida && (
                                <button 
                                    onClick={() => onMarkRead(notif.id)} 
                                    style={markReadButtonStyle}
                                >
                                    Marcar leída
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </QuickActionModal>
    );
}

// Estilos
const notificationItemStyle = (leida) => ({
    background: leida ? 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    border: `2px solid ${leida ? '#ccc' : '#2196F3'}`
});

const notificationMessageStyle = (leida) => ({
    margin: 0, 
    fontWeight: leida ? '500' : 'bold', 
    color: leida ? '#666' : '#1565C0', 
    fontSize: '15px'
});

const markReadButtonStyle = {
    background: '#0066FF', 
    color: 'white', 
    padding: '8px 16px', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600', 
    marginLeft: '12px'
};

export default NotificacionesModal;