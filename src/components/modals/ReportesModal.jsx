import React from 'react';
import QuickActionModal from './QuickActionModal';

function ReportesModal({ reportes, onClose }) {
    return (
        <QuickActionModal titulo="📊 Ver Reportes" onClose={onClose} anchoGrande={true}>
            <div style={{ display: 'grid', gap: '16px' }}>
                {reportes.map(reporte => (
                    <div key={reporte.id} style={reporteCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, color: '#1565C0', fontSize: '20px' }}>{reporte.tipo}</h3>
                            <span style={reporteTotalStyle}>
                                {reporte.total}
                            </span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', color: '#555' }}>📅 Fecha: {reporte.fecha}</p>
                    </div>
                ))}
                
                {/* Mensaje de estado */}
                <div style={statusCardStyle}>
                    <p style={{ margin: 0, color: '#2E7D32', fontWeight: 'bold', fontSize: '16px' }}>✓ Sistema funcionando correctamente</p>
                    <p style={{ margin: '8px 0 0 0', color: '#388E3C' }}>Todos los módulos operativos</p>
                </div>
            </div>
        </QuickActionModal>
    );
}

// Estilos
const reporteCardStyle = { background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)', padding: '24px', borderRadius: '12px', border: '2px solid #2196F3' };
const reporteTotalStyle = { background: '#0066FF', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' };
const statusCardStyle = { background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', padding: '20px', borderRadius: '12px', border: '2px solid #4CAF50', marginTop: '8px' };

export default ReportesModal;