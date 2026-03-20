// =============================================================================
// ARCHIVO  : PerfilAdmin.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/PerfilAdmin.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Perfil del administrador con acceso a herramientas de gestión.
// =============================================================================

import { useState, useEffect } from 'react';
import './estilos_admin/PerfilAdmin.css';
import QuickActionsApp from './acciones-rapidas';
import ConsultasAdmin  from './ConsultasAdmin';

// ✅ AGREGADO: onConsultas en los parámetros
const PerfilAdmin = ({ 
    onBackToHome, 
    onCrudUsuarios, 
    onCrudServicios,    
    onEditarPerfil, 
    onLogout, 
    onReportesAdmin,
    onCotizacion, 
    onServicios,
    onCrudEmpleados,
    onConsultas,
    onDashboard
}) => {
    const [activeModal, setActiveModal] = useState(null);

    useEffect(() => {
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, []);

    const handleEditProfile = () => {
        if (onEditarPerfil) {
            onEditarPerfil();
        } else {
            console.log('Editar perfil - función no definida');
        }
    };

    const handleCrudUsuarios = () => {
        if (onCrudUsuarios) {
            onCrudUsuarios();
        }
    };

    const handleCrudServicios = (e) => {
        e.preventDefault();
        if (onCrudServicios) {
            onCrudServicios();
        }
    };

    const handleCerrarSesion = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) {
                onLogout();
            } else {
                localStorage.removeItem('foamwash_active_session');
                if (onBackToHome) {
                    onBackToHome();
                }
            }
        }
    };
 
    const handleReportesAdmin = () => {
        if (onReportesAdmin) {
            onReportesAdmin();
        }
    };

    const handleServicios = (e) => {
        e.preventDefault();
        if (onServicios) onServicios();
    };
    
    const handleCrudEmpleados = (e) => {
        e.preventDefault();
        if (onCrudEmpleados) onCrudEmpleados();
    };

    // ✅ NUEVO: Handler para Consultas
    const handleConsultas = (e) => {
        e.preventDefault();
        if (onConsultas) {
            onConsultas();
        } else {
            console.log('Función onConsultas no definida');
        }
    };

    const handleGoToDashboard = () => {
        if (onDashboard) onDashboard();
    };
 
    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', minWidth: '100vw' }}>
            {/* ==================== HEADER ==================== */}
            <header>
                
            </header>

            {/* ==================== CONTENIDO PRINCIPAL ==================== */}
            <div className="main-content">
                <div className="profile-container">
                    {/* ==================== SIDEBAR ==================== */}
                    <div className="profile-sidebar">
                        <div className="profile-photo"></div>
                        <div className="profile-name">Administrador</div>
                        <div className="profile-role">Administrador</div>
                        
                        <div className="admin-badges">
    <div
        className="badge-item"
        onClick={handleGoToDashboard}
        style={{ cursor: 'pointer' }}
        title="Ir al Panel de Control"
    >
        <span>🔑</span>
        <span>Acceso Total</span>
    </div>
</div>

                        <button className="edit-profile-btn" onClick={handleEditProfile}>
                            Editar Perfil
                        </button>
                    </div>

                    {/* ==================== PANEL DERECHO CON SCROLL ==================== */}
                    <div className="right-panel">
                        <div className="profile-details">
                            {/* Información del Administrador */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">👤</span>
                                    Información del Administrador
                                </h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Nombre Completo</span>
                                        <div className="info-value">Juan Pablo Rodríguez</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Cargo</span>
                                        <div className="info-value">Administrador General</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Email Corporativo</span>
                                        <div className="info-value">admin@foamwash.com</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Teléfono</span>
                                        <div className="info-value">+57 300 123 4567</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Departamento</span>
                                        <div className="info-value">Administración</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Fecha de Ingreso</span>
                                        <div className="info-value">1 de Enero, 2022</div>
                                    </div>
                                </div>
                            </div>

                            
                      

                            

                            {/* Permisos y Accesos */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">🔑</span>
                                    Permisos y Accesos
                                </h2>
                                <div className="permissions-grid">
                                    <div className="permission-item">
                                        <span className="permission-icon">👥</span>
                                        <div className="permission-text">
                                            <h4>Gestión de Usuarios</h4>
                                            <p>Crear, editar y eliminar usuarios</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                    <div className="permission-item">
                                        <span className="permission-icon">👨‍💼</span>
                                        <div className="permission-text">
                                            <h4>Gestión de Empleados</h4>
                                            <p>Administrar personal y horarios</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                    <div className="permission-item">
                                        <span className="permission-icon">💰</span>
                                        <div className="permission-text">
                                            <h4>Acceso Financiero</h4>
                                            <p>Ver y gestionar finanzas</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                    <div className="permission-item">
                                        <span className="permission-icon">📊</span>
                                        <div className="permission-text">
                                            <h4>Reportes Avanzados</h4>
                                            <p>Generar y exportar reportes</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                    <div className="permission-item">
                                        <span className="permission-icon">⚙️</span>
                                        <div className="permission-text">
                                            <h4>Configuración Sistema</h4>
                                            <p>Modificar parámetros del sistema</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                    <div className="permission-item">
                                        <span className="permission-icon">🔒</span>
                                        <div className="permission-text">
                                            <h4>Seguridad y Auditoría</h4>
                                            <p>Acceso a logs y auditorías</p>
                                        </div>
                                        <span className="permission-check">✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <QuickActionsApp activeModal={activeModal} setActiveModal={setActiveModal} />
        </div>
    );
};

export default PerfilAdmin;