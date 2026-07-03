// =============================================================================
// ARCHIVO  : PerfilAdmin.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Layout y estilos actualizados al estándar
//            del PerfilCliente (sidebar gradiente, cards, info-grid).
// =============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import './estilos_admin/PerfilAdmin.css';
import QuickActionsApp from './acciones-rapidas';
import ConsultasAdmin  from './ConsultasAdmin';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

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
    const { user } = useAuth();
    const [activeModal, setActiveModal] = useState(null);
    const [perfil, setPerfil]           = useState(null);
    const [isLoading, setIsLoading]     = useState(true);

    // ── Cargar datos del admin ────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        const cargar = async () => {
            try {
                const res = await api.get(`/usuarios/${user.id}`);
                if (res.data.success) setPerfil(res.data.data);
            } catch (err) {
                console.error('❌ Error al cargar perfil admin:', err);
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, [user?.id]);

    // ── Animación de entrada de cards ────────────────────────────────────────
    useEffect(() => {
        if (!isLoading) {
            const cards = document.querySelectorAll('.pa-card');
            cards.forEach((card, i) => {
                setTimeout(() => card.classList.add('visible'), i * 100);
            });
        }
    }, [isLoading]);

    const getFotoUrl = (foto) => {
        if (!foto) return null;
        if (foto.startsWith('http')) return foto;
        return `${API_BASE_URL}${foto}`;
    };
    const fotoUrl = getFotoUrl(perfil?.foto_perfil || user?.foto_perfil);

    // ── Handlers (lógica original intacta) ───────────────────────────────────
    const handleEditProfile  = ()  => { if (onEditarPerfil) onEditarPerfil(); };
    const handleCrudUsuarios = ()  => { if (onCrudUsuarios) onCrudUsuarios(); };
    const handleCrudServicios = (e) => { e.preventDefault(); if (onCrudServicios) onCrudServicios(); };
    const handleCerrarSesion = ()  => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) onLogout();
            else { localStorage.removeItem('foamwash_active_session'); if (onBackToHome) onBackToHome(); }
        }
    };
    const handleReportesAdmin = () => { if (onReportesAdmin) onReportesAdmin(); };
    const handleServicios     = (e) => { e.preventDefault(); if (onServicios) onServicios(); };
    const handleCrudEmpleados = (e) => { e.preventDefault(); if (onCrudEmpleados) onCrudEmpleados(); };
    const handleConsultas     = (e) => { e.preventDefault(); if (onConsultas) onConsultas(); };
    const handleGoToDashboard = ()  => { if (onDashboard) onDashboard(); };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
                <p style={{ fontSize: 16, color: '#1a56ff', fontFamily: 'Kanit' }}>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div style={{ background: '#f6f7fb', minHeight: '100vh' }}>

            {/* ── Contenido principal ── */}
            <div className="pa-main">
                <div className="pa-container">

                    {/* ══════════════════════════════
                        SIDEBAR
                    ══════════════════════════════ */}
                    <div className="pa-sidebar">

                        {/* Foto */}
                        <div className="pa-photo">
                            {fotoUrl
                                ? <img
                                    src={fotoUrl}
                                    alt="Foto perfil"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                : <span>👤</span>
                            }
                        </div>

                        <div className="pa-name">{perfil?.Nombre || 'Administrador'}</div>
                        <div className="pa-role">Administrador</div>

                        {/* Badge acceso total */}
                        <div
                            className="pa-badge"
                            onClick={handleGoToDashboard}
                            title="Ir al Panel de Control"
                        >
                            🔑 <span>Acceso Total</span>
                        </div>

                        <button className="pa-edit-btn" onClick={handleEditProfile}>
                            Editar Perfil
                        </button>
                    </div>

                    {/* ══════════════════════════════
                        PANEL DERECHO
                    ══════════════════════════════ */}
                    <div className="pa-right">

                        {/* ── Información del Administrador ── */}
                        <div className="pa-card">
                            <h2 className="pa-card-title">
                                <span className="pa-card-icon">👤</span>
                                Información del Administrador
                            </h2>
                            <div className="pa-info-grid">
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Nombre Completo</span>
                                    <div className="pa-info-value">{perfil?.Nombre || '—'}</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Cargo</span>
                                    <div className="pa-info-value">Administrador General</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Tipo de Documento</span>
                                    <div className="pa-info-value">{perfil?.tipo_de_documento?.nombre_del_documento || '—'}</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Número de Documento</span>
                                    <div className="pa-info-value">{perfil?.N_Documento || '—'}</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Email Corporativo</span>
                                    <div className="pa-info-value">{perfil?.Correo || '—'}</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Teléfono</span>
                                    <div className="pa-info-value">{perfil?.Telefono || '—'}</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Departamento</span>
                                    <div className="pa-info-value">Administración</div>
                                </div>
                                <div className="pa-info-item">
                                    <span className="pa-info-label">Fecha de Ingreso</span>
                                    <div className="pa-info-value">1 de Enero, 2022</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Permisos y Accesos ── */}
                        <div className="pa-card">
                            <h2 className="pa-card-title">
                                <span className="pa-card-icon">🔑</span>
                                Permisos y Accesos
                            </h2>
                            <div className="pa-perms-grid">
                                {[
                                    { icon: '👥', title: 'Gestión de Usuarios',    desc: 'Crear, editar y eliminar usuarios'    },
                                    { icon: '👨‍💼', title: 'Gestión de Empleados',   desc: 'Administrar personal y horarios'      },
                                    { icon: '💰', title: 'Acceso Financiero',       desc: 'Ver y gestionar finanzas'             },
                                    { icon: '📊', title: 'Reportes Avanzados',      desc: 'Generar y exportar reportes'          },
                                    { icon: '⚙️', title: 'Configuración Sistema',   desc: 'Modificar parámetros del sistema'     },
                                    { icon: '🔒', title: 'Seguridad y Auditoría',   desc: 'Acceso a logs y auditorías'           },
                                ].map((p, i) => (
                                    <div key={i} className="pa-perm-item">
                                        <div className="pa-perm-icon">{p.icon}</div>
                                        <div className="pa-perm-text">
                                            <h4>{p.title}</h4>
                                            <p>{p.desc}</p>
                                        </div>
                                        <span className="pa-perm-check">✓</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Modales de acciones rápidas (lógica original intacta) */}
            <QuickActionsApp activeModal={activeModal} setActiveModal={setActiveModal} />
        </div>
    );
};

export default PerfilAdmin;