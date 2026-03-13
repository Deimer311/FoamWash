import React from 'react';
import QuickActionModal from './QuickActionModal';

function FinanzasModal({ onClose }) {
    // Datos de ejemplo
    const datosFinancieros = [
        { label: 'Ingresos del Mes', value: '$2,500,000', color: '#00C851', gradient: '#00A041' },
        { label: 'Gastos del Mes', value: '$1,200,000', color: '#0066FF', gradient: '#0052CC' },
        { label: 'Balance', value: '$1,300,000', color: '#9C27B0', gradient: '#7B1FA2' },
    ];

    return (
        <QuickActionModal titulo="💰 Finanzas" onClose={onClose} anchoGrande={true}>
            <div style={{ display: 'grid', gap: '16px' }}>
                <div style={gridStyle}>
                    {datosFinancieros.map((item, index) => (
                        <div key={index} style={cardStyle(item.color, item.gradient)}>
                            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', fontWeight: '600' }}>{item.label}</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '36px', fontWeight: 'bold' }}>{item.value}</p>
                        </div>
                    ))}
                </div>
                
                {/* Mensaje de Crecimiento */}
                <div style={growthCardStyle}>
                    <p style={{ margin: 0, color: '#1565C0', fontWeight: 'bold', fontSize: '16px' }}>📈 Crecimiento: +15% vs mes anterior</p>
                </div>
            </div>
        </QuickActionModal>
    );
}

// Estilos
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' };
const cardStyle = (color, gradient) => ({ 
    background: `linear-gradient(135deg, ${color} 0%, ${gradient} 100%)`, 
    color: 'white', 
    padding: '24px', 
    borderRadius: '12px' 
});
const growthCardStyle = { background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #2196F3' };

export default FinanzasModal;