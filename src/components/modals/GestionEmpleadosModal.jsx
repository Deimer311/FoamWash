import React from 'react';
import QuickActionModal from './QuickActionModal';


function GestionEmpleadosModal ({onClose, reportes}) {

return (
        <QuickActionModal titulo="📊 Ver Reportes" onClose={onClose} anchoGrande={true}>
            <div style={{ display: 'grid', gap: '16px' }}>
                {reportes.map(reporte => (
                    <div key={reporte.id} >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0, color: '#1565C0', fontSize: '20px' }}>{reporte.tipo}</h3>
                            <span >
                                {reporte.total}
                            </span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', color: '#555' }}>📅 Fecha: {reporte.fecha}</p>
                    </div>
                ))}
                
                {/* Mensaje de estado */}
                <div >
                    <p style={{ margin: 0, color: '#2E7D32', fontWeight: 'bold', fontSize: '16px' }}>✓ Sistema funcionando correctamente</p>
                    <p style={{ margin: '8px 0 0 0', color: '#388E3C' }}>Todos los módulos operativos</p>
                </div>
            </div>
        </QuickActionModal>
    );

}

export default GestionEmpleadosModal;