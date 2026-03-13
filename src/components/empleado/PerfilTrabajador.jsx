import React, { useEffect, useState } from 'react';
import { useAuth } from '../modals/AuthContext';
import api from '../../services/api';
import '../css/PerfilTrabajador.css';

// ✅ FIX: URL base del backend para construir rutas de imágenes
const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilTrabajador = ({ onBackToHome, onEditarPerfil, onLogout }) => {
    const { user } = useAuth();
    const [perfil, setPerfil]       = useState(null);
    const [desempeno, setDesempeno] = useState(null);
    const [reservasHoy, setReservasHoy] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError]         = useState('');

    // ── Animación de cards al montar ─────────────────────────────────────────
    useEffect(() => {
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, [perfil]); // Re-ejecutar cuando carguen los datos

    // ── Cargar datos del perfil y desempeño ──────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        fetchDatos();
    }, [user]);

    const fetchDatos = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [perfilRes, desempenoRes, reservasRes] = await Promise.all([
                api.get(`/empleados/${user.id}/perfil`),
                api.get(`/empleados/${user.id}/desempeno`),
                api.get(`/empleados/${user.id}/reservas/hoy`)
            ]);

            if (perfilRes.data.success)    setPerfil(perfilRes.data.data);
            if (desempenoRes.data.success) setDesempeno(desempenoRes.data.data);
            if (reservasRes.data.success)  setReservasHoy(reservasRes.data.data);

        } catch (err) {
            console.error('❌ Error al cargar perfil:', err);
            setError('No se pudo cargar la información del perfil.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProfile = () => {
        if (onEditarPerfil) onEditarPerfil();
    };

    const handleCerrarSesion = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) onLogout();
            else if (onBackToHome) onBackToHome();
        }
    };

    // ── Parsear certificaciones guardadas como JSON o texto ──────────────────
    const parseCertificaciones = (raw) => {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
            return [{ nombre: raw }];
        } catch {
            return raw.split(',').map(c => ({ nombre: c.trim() }));
        }
    };

    // ── Parsear especialidades guardadas como texto separado por comas ────────
    const parseEspecialidades = (raw) => {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch {}
        return raw.split(',').map(e => e.trim());
    };

    // ── Formatear fecha legible ───────────────────────────────────────────────
    const formatFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // ✅ FIX: Construir URL completa de la foto usando la base del backend
    const getFotoUrl = (fotoPerfil) => {
        if (!fotoPerfil) return null;
        // Si ya es una URL completa (http/https), usarla directamente
        if (fotoPerfil.startsWith('http')) return fotoPerfil;
        // Si es una ruta relativa (/uploads/fotos/...), agregar la base del backend
        return `${API_BASE_URL}${fotoPerfil}`;
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '1.2rem', color: '#666' }}>
                ⏳ Cargando perfil...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#EF4444', background: '#FEF2F2', borderRadius: '12px', margin: '2rem' }}>
                ❌ {error}
            </div>
        );
    }

    const certificaciones = parseCertificaciones(perfil?.certificaciones);
    const especialidades  = parseEspecialidades(perfil?.especialidades);

    // ✅ FIX: URL completa de la foto
    const fotoUrl = getFotoUrl(perfil?.foto_perfil);

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            <div className="main-content">
                <div className="profile-container">
                    {/* ── SIDEBAR ─────────────────────────────────────────── */}
                    <div className="profile-sidebar">
                        {/* ✅ FIX: Foto de perfil con URL completa del backend */}
                        <div className="profile-photo">
                            {fotoUrl
                                ? <img
                                    src={fotoUrl}
                                    alt="Foto perfil"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        // Si la imagen falla, mostrar emoji por defecto
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                : null
                            }
                            <span style={{ fontSize: '3rem', display: fotoUrl ? 'none' : 'block' }}>👤</span>
                        </div>

                        <div className="profile-name">{perfil?.Nombre || 'Sin nombre'}</div>
                        <div className="profile-role">{perfil?.cargo || 'Empleado'}</div>

                        <div className="availability-badge">
                            <span className="status-dot"></span>
                            <span>Disponible</span>
                        </div>

                        {/* Estadísticas del mes desde el backend */}
                        <div className="profile-stats">
                            <div className="stat-item">
                                <div className="stat-number">{desempeno?.servicios_completados ?? '—'}</div>
                                <div className="stat-label">Este Mes</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{desempeno?.calificacion_promedio ?? '—'}</div>
                                <div className="stat-label">Calificación</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{desempeno?.puntualidad ?? '—'}</div>
                                <div className="stat-label">Puntualidad</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{desempeno?.comentarios_positivos ?? '—'}</div>
                                <div className="stat-label">Comentarios</div>
                            </div>
                        </div>

                        <button className="edit-profile-btn" onClick={handleEditProfile} style={{ cursor: 'pointer' }}>
                            ✏️ Editar Perfil
                        </button>
                    </div>

                    {/* ── PANEL DERECHO ────────────────────────────────────── */}
                    <div className="right-panel">
                        <div className="profile-details">

                            {/* Información Personal */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">👤</span>
                                    Información Personal
                                </h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Nombre Completo</span>
                                        <div className="info-value">{perfil?.Nombre || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Cédula</span>
                                        <div className="info-value">{perfil?.N_Documento || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Fecha de Nacimiento</span>
                                        <div className="info-value">{formatFecha(perfil?.fecha_nacimiento)}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Cargo</span>
                                        <div className="info-value">{perfil?.cargo || '—'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Correo</span>
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
                                        <span className="info-label">Fecha de Ingreso</span>
                                        <div className="info-value">{formatFecha(perfil?.fecha_ingreso)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Horario de Hoy — desde BD */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">📅</span>
                                    Horario de Hoy
                                </h2>
                                {reservasHoy.length > 0 ? (
                                    <div className="schedule-grid">
                                        {reservasHoy.map((r) => (
                                            <div key={r.ID_Reserva} className="schedule-item">
                                                <div className="schedule-time">
                                                    <div className="time-icon">🧹</div>
                                                    <div className="time-details">
                                                        <h4>{r.Hora} — {r.Nombre_Servicio || 'Servicio'}</h4>
                                                        <p>{r.direccion_cliente} · Cliente: {r.nombre_cliente}</p>
                                                    </div>
                                                </div>
                                                <span className={`schedule-status ${r.Estado === 'En Proceso' ? 'status-inprogress' : 'status-upcoming'}`}>
                                                    {r.Estado}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                                        No hay servicios programados para hoy.
                                    </p>
                                )}
                            </div>

                            {/* Desempeño del mes — desde BD */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">📊</span>
                                    Desempeño del Mes
                                </h2>
                                <div className="performance-grid">
                                    <div className="performance-card">
                                        <div className="performance-icon">⭐</div>
                                        <div className="performance-value">{desempeno?.calificacion_promedio || '—'}</div>
                                        <div className="performance-label">Calificación Promedio</div>
                                    </div>
                                    <div className="performance-card">
                                        <div className="performance-icon">✅</div>
                                        <div className="performance-value">{desempeno?.servicios_completados || 0}</div>
                                        <div className="performance-label">Servicios Completados</div>
                                    </div>
                                    <div className="performance-card">
                                        <div className="performance-icon">⏱️</div>
                                        <div className="performance-value">{desempeno?.puntualidad || '—'}</div>
                                        <div className="performance-label">Puntualidad</div>
                                    </div>
                                    <div className="performance-card">
                                        <div className="performance-icon">💬</div>
                                        <div className="performance-value">{desempeno?.comentarios_positivos || 0}</div>
                                        <div className="performance-label">Comentarios Positivos</div>
                                    </div>
                                </div>
                            </div>

                            {/* Horario laboral */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">🕐</span>
                                    Horario Laboral
                                </h2>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Días Laborales</span>
                                        <div className="info-value">{perfil?.dias_laborales || 'No especificado'}</div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Horario</span>
                                        <div className="info-value">{perfil?.horario || 'No especificado'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Especialidades */}
                            {especialidades.length > 0 && (
                                <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                    <h2 className="card-title">
                                        <span className="card-icon">⭐</span>
                                        Especialidades
                                    </h2>
                                    <div className="certification-list">
                                        {especialidades.map((esp, i) => (
                                            <div key={i} className="certification-item">
                                                <span className="cert-icon">🧹</span>
                                                <div className="cert-info">
                                                    <h4>{esp}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Certificaciones */}
                            <div className="detail-card" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                                <h2 className="card-title">
                                    <span className="card-icon">🏆</span>
                                    Certificaciones y Capacitaciones
                                </h2>
                                {certificaciones.length > 0 ? (
                                    <div className="certification-list">
                                        {certificaciones.map((cert, i) => (
                                            <div key={i} className="certification-item">
                                                <span className="cert-icon">📜</span>
                                                <div className="cert-info">
                                                    <h4>{cert.nombre || cert}</h4>
                                                    {cert.vence && <p>Vence: {cert.vence}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                                        No hay certificaciones registradas. Edita tu perfil para agregar.
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

export default PerfilTrabajador;