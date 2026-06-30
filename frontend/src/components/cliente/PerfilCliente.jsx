// =============================================================================
// ARCHIVO  : PerfilCliente.jsx — Fix header respiro + lógica intacta
// PROYECTO : FoamWash
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import HeaderCliente from './HeaderCliente';
import './estilos_cliente/PerfilCliente.css';

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilCliente = ({ onBackToHome, onCotizacion, onServicios, onEditarPerfil, onLogout, onMisAgendamientos, onMisCotizaciones }) => {
    const { user } = useAuth();
    const [perfil,    setPerfil]    = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error,     setError]     = useState('');

    useEffect(() => {
        if (!user?.id) return;
        const cargar = async () => {
            try {
                const res = await api.get(`/usuarios/${user.id}`);
                if (res.data.success) setPerfil(res.data.data);
                else setError('No se pudo cargar el perfil.');
            } catch (err) {
                console.error('Error al cargar perfil:', err);
                setError('Error de conexión al cargar el perfil.');
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, [user?.id, user?.foto_perfil]);

    useEffect(() => {
        if (!isLoading) {
            const cards = document.querySelectorAll('.detail-card');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, i * 100);
            });
        }
    }, [isLoading]);

    const getFotoUrl = (foto) => {
        if (!foto) return null;
        if (foto.startsWith('http')) return foto;
        return `${API_BASE_URL}${foto}`;
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return 'No disponible';
        return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
                <p style={{ fontSize: 16, color: '#1a56ff', fontFamily: 'Kanit' }}>⏳ Cargando perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
                <p style={{ fontSize: 16, color: '#e53935', fontFamily: 'Kanit' }}>❌ {error}</p>
            </div>
        );
    }

    const stats   = perfil?.stats || {};
    const fotoUrl = getFotoUrl(user?.foto_perfil);

    return (
        <div style={{ background: '#f6f7fb', minHeight: '100vh' }}>
            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={onCotizacion}
                onPerfil={onEditarPerfil}
                onServicios={onServicios}
                onMisAgendamientos={onMisAgendamientos}
                onMisCotizaciones={onMisCotizaciones}
                activeLink="perfil"
            />

            {/* ── Mismo padding que PerfilClienteEdi para respiro consistente ── */}
            <div
                className="main-content"
                style={{
                    maxWidth: '1300px',
                    margin: '0 auto',
                    padding: '136px 40px 80px',
                }}
            >
                <div className="profile-container">

                    {/* ── SIDEBAR ── */}
                    <div className="profile-sidebar">
                        <div className="profile-photo">
                            {fotoUrl
                                ? <img src={fotoUrl} alt="Foto perfil"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                : null
                            }
                            <svg
                                style={{ width: '60px', height: '60px', display: fotoUrl ? 'none' : 'block', color: 'white' }}
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
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

                        {/* Información Personal */}
                        <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                            <h2 className="card-title">
                                <span className="card-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </span>
                                Información Personal
                            </h2>
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
                            <h2 className="card-title">
                                <span className="card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                </span>
                                Información de Contacto
                            </h2>
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
                            <h2 className="card-title">
                                <span className="card-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                    </svg>
                                </span>
                                Actividad Reciente
                            </h2>
                            <div className="activity-list">
                                {perfil?.reservasComoCliente?.length > 0 ? (
                                    perfil.reservasComoCliente.map((item, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-icon">🧹</div>
                                            <div className="activity-content">
                                                <div className="activity-title">
                                                    {item.servicios?.[0]?.Nombre_Servicio || 'Servicio'}
                                                </div>
                                                <div className="activity-date">
                                                    {formatearFecha(item.fecha)} — {item.Hora}
                                                </div>
                                            </div>
                                            <span className={`activity-status ${
                                                item.Estado === 'Completado' ? 'status-completed' :
                                                item.Estado === 'Cancelado'  ? 'status-cancelled' :
                                                'status-pending'
                                            }`}>
                                                {item.Estado}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#bbb', textAlign: 'center', padding: '28px', fontSize: 14, fontFamily: 'Kanit' }}>
                                        No hay actividad reciente
                                    </p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilCliente;