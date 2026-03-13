import React, { useState } from 'react';

// Importar los componentes modales
import NuevoUsuarioModal from '../modals/NuevoUsuarioModal';
import ReportesModal from '../modals/ReportesModal';
import ConfiguracionModal from '../modals/ConfiguracionModal';
import GestionEmpleadosModal from '../modals/GestionEmpleadosModal';
import FinanzasModal from '../modals/FinanzasModal';
import NotificacionesModal from '../modals/NotificacionesModal';

// =====================================================
// DATOS INICIALES (Simulando la base de datos/backend)
// =====================================================
const initialUsuarios = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', tipo: 'cliente_natural', estado: 'activo' },
    { id: 2, nombre: 'María López', email: 'maria@empresa.com', tipo: 'cliente_empresarial', estado: 'activo' },
    { id: 3, nombre: 'Carlos Gómez', email: 'carlos@email.com', tipo: 'empleado', estado: 'activo' }
];

const initialEmpleados = [
    { id: 1, nombre: 'Pedro Sánchez', cargo: 'Limpiador Senior', telefono: '300-111-2222', estado: 'activo' },
    { id: 2, nombre: 'Ana Torres', cargo: 'Supervisora', telefono: '300-333-4444', estado: 'activo' }
];

const initialReportes = [
    { id: 1, tipo: 'Ventas Mensuales', fecha: '2024-12-01', total: '$2,500,000' },
    { id: 2, tipo: 'Servicios Completados', fecha: '2024-12-01', total: '45 servicios' },
    { id: 3, tipo: 'Nuevos Clientes', fecha: '2024-12-01', total: '12 clientes' }
];

const initialNotificaciones = [
    { id: 1, mensaje: 'Nueva cotización pendiente de revisión', fecha: '2024-12-11 10:30', leida: false },
    { id: 2, mensaje: 'Reserva confirmada para mañana', fecha: '2024-12-11 09:15', leida: false },
    { id: 3, mensaje: 'Inventario bajo en artículos de limpieza', fecha: '2024-12-10 16:45', leida: true }
];

const initialConfiguracion = {
    siteName: 'FoamWash',
    email: 'admin@foamwash.com',
    phone: '+57 300 123 4567',
    timeoutMinutes: 30
};

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
function QuickActionsApp({ activeModal, setActiveModal }) {
    
    const [usuarios, setUsuarios] = useState(initialUsuarios);
    const [empleados] = useState(initialEmpleados);
    const [reportes] = useState(initialReportes);
    const [notificaciones, setNotificaciones] = useState(initialNotificaciones);
    const [configuracion, setConfiguracion] = useState(initialConfiguracion);

    // Funciones de lógica
    const guardarNuevoUsuario = (nuevoUsuario) => {
        setUsuarios(prev => [...prev, { ...nuevoUsuario, id: prev.length + 1, estado: 'activo' }]);
        alert('✓ Usuario creado exitosamente');
        setActiveModal(null); // Cerrar al terminar
    };

    const eliminarUsuario = (id) => {
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
            alert('✓ Usuario eliminado');
        }
    };

    const marcarLeida = (id) => {
        setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    };

    const guardarConfiguracion = (nuevaConfig) => {
        setConfiguracion(nuevaConfig);
        alert('✓ Configuración guardada');
        setActiveModal(null);
    };

    // ✅ IMPORTANTE: Este componente ya no renderiza botones, 
    // solo renderiza el MODAL que esté activo según la prop recibida.
    return (
        <>
            {activeModal === 'nuevoUsuario' && (
                <NuevoUsuarioModal
                    usuarios={usuarios}
                    onClose={() => setActiveModal(null)}
                    onSave={guardarNuevoUsuario}
                    onDelete={eliminarUsuario}
                />
            )}
            
            {activeModal === 'reportes' && (
                <ReportesModal
                    reportes={reportes}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {activeModal === 'configuracion' && (
                <ConfiguracionModal
                    configuracion={configuracion}
                    onClose={() => setActiveModal(null)}
                    onSave={guardarConfiguracion}
                />
            )}
            
            {activeModal === 'empleados' && (
                <GestionEmpleadosModal
                    empleados={empleados}
                    onClose={() => setActiveModal(null)}
                />
            )}

            {activeModal === 'finanzas' && (
                <FinanzasModal
                    onClose={() => setActiveModal(null)}
                />
            )}
            
            {activeModal === 'notificaciones' && (
                <NotificacionesModal
                    notificaciones={notificaciones}
                    onClose={() => setActiveModal(null)}
                    onMarkRead={marcarLeida}
                />
            )}
        </>
    );
}



export default QuickActionsApp;