import React from 'react';

const modalBaseStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
};

const getModalContentStyle = (anchoGrande) => ({
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: anchoGrande ? '900px' : '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
});

const modalHeaderStyle = {
    background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const btnCerrarStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    fontSize: '32px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.3s',
};

function QuickActionModal({ titulo, onClose, anchoGrande = true, children }) {
    // Cerrar modal al hacer clic en el fondo
    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div style={modalBaseStyle} onClick={handleBackgroundClick}>
            <div style={getModalContentStyle(anchoGrande)}>
                {/* Header */}
                <div style={modalHeaderStyle}>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{titulo}</h2>
                    <button 
                        onClick={onClose} 
                        style={btnCerrarStyle}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        &times;
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: '24px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default QuickActionModal;