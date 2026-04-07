// =============================================================================
// ARCHIVO  : PerfilCliente.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/PerfilCliente.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Perfil del cliente con información personal, estadísticas y actividad reciente.
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import HeaderCliente from './HeaderCliente';
import './estilos_cliente/PerfilCliente.css';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilCliente = ({ onBackToHome, onCotizacion, onServicios, onEditarPerfil, onLogout }) => {
    const { user } = useAuth();
    const [perfil,   setPerfil]   = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,    setError]    = useState('');
    // ── Cargar datos reales del usuario ───────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const cargar = async () => {
            try {
                const res = await api.get(`/clientes/${user.id}/perfil`);
                if (res.data.success) {
                    setPerfil(res.data.data);
                } else {
                    setError('No se pudo cargar el perfil.');
                }
            } catch (err) {
                console.error('❌ Error al cargar perfil:', err);
                setError('Error de conexión al cargar el perfil.');
            } finally {
                setIsLoading(false);
            }
        };
        

        cargar();
}, [user?.id, user?.foto_perfil]); //

    // ── Animación de tarjetas ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isLoading) {
            const cards = document.querySelectorAll('.detail-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    }, [isLoading]);

    const handleCerrarSesion = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) onLogout();
            else if (onBackToHome) onBackToHome();
        }
    };

    const getFotoUrl = (fotoPerfil) => {
        if (!fotoPerfil) return null;
        if (fotoPerfil.startsWith('http')) return fotoPerfil;
        return `${API_BASE_URL}${fotoPerfil}`;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p style={{ fontSize: 18, color: '#666' }}>⏳ Cargando perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p style={{ fontSize: 18, color: '#f44' }}>❌ {error}</p>
            </div>
        );
    }

    const stats = perfil?.stats || {};
    const fotoUrl = getFotoUrl(user?.foto_perfil);

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            {/* ── HEADER ── */}
            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={onCotizacion}
                onPerfil={onEditarPerfil}
                onServicios={onServicios}
                activeLink="perfil"
            />

            {/* ── CONTENIDO ── */}
            <div className="main-content">
                <div className="profile-container">

                    {/* ── SIDEBAR ── */}
                    <div className="profile-sidebar">
                        {/* Foto de perfil */}
                        <div className="profile-photo">
                            {fotoUrl
                                ? <img
                                    src={fotoUrl}
                                    alt="Foto perfil"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                : null
                            }
                            <span style={{ fontSize: '3rem', display: fotoUrl ? 'none' : 'block' }}>👤</span>
                        </div>

                        <div className="profile-name">{perfil?.Nombre || 'Sin nombre'}</div>
                        <div className="profile-role">Cliente</div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <div className="stat-number">{stats.total_reservas || 0}</div>
                                <div className="stat-label">Servicios</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{stats.completadas || 0}</div>
                                <div className="stat-label">Completados</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{stats.pendientes || 0}</div>
                                <div className="stat-label">Pendientes</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{stats.calificacion_promedio || '—'}</div>
                                <div className="stat-label">Calificación</div>
                            </div>
                        </div>

                        <button className="edit-profile-btn" onClick={onEditarPerfil}>
                            Editar Perfil
                        </button>
                    </div>

                    {/* ── PANEL DERECHO ── */}
                    <div className="right-panel">
                        <div className="profile-details">

                            {/* Información Personal */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title"><span className="card-icon">👤</span> Información Personal</h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Nombre Completo</span>
                                        <div className="info-value">{perfil?.Nombre || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tipo de Documento</span>
                                        <div className="info-value">{perfil?.tipo_de_documento?.nombre_del_documento || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Número de Documento</span>
                                        <div className="info-value">{perfil?.N_Documento || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Miembro desde</span>
                                        <div className="info-value">{formatearFecha(perfil?.fecha_registro)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Información de Contacto */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title"><span className="card-icon">📧</span> Información de Contacto</h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Correo Electrónico</span>
                                        <div className="info-value">{perfil?.Correo || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Teléfono</span>
                                        <div className="info-value">{perfil?.Telefono || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Dirección</span>
                                        <div className="info-value">{perfil?.Direccion || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Último acceso</span>
                                        <div className="info-value">{formatearFecha(perfil?.last_login)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Actividad Reciente */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title"><span className="card-icon">📋</span> Actividad Reciente</h2>
                                <div className="activity-list">
                                    {perfil?.reservasComoCliente?.length > 0 ? (
                                        perfil.reservasComoCliente.map((item, i) => (
                                            <div key={i} className="activity-item">
                                                <div className="activity-icon">🧹</div>
                                                <div className="activity-content">
                                                    <div className="activity-title">{item.servicios?.[0]?.Nombre_Servicio || 'Servicio'}</div>
                                                    <div className="activity-date">{formatearFecha(item.fecha)} — {item.Hora}</div>
                                                </div>
                                                <span className={`activity-status ${
                                                    item.Estado === 'Completado'  ? 'status-completed' :
                                                    item.Estado === 'Cancelado'   ? 'status-cancelled' :
                                                    'status-pending'
                                                }`}>
                                                    {item.Estado}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
                                            No hay actividad reciente
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilCliente;