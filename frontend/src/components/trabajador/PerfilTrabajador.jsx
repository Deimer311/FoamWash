// =============================================================================
// ARCHIVO  : PerfilTrabajador.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Layout y estilos actualizados al estándar
//            del PerfilCliente (sidebar gradiente, cards, info-grid).
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import './estilos_trabajador/PerfilTrabajador.css';

// ── SVG Icons para Perfil Trabajador ──────────────────────────────────────────
const IcUser      = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcCalendar  = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcStats     = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const IcClock     = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcAward     = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>;
const IcStar      = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IcCheck     = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcMessage   = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IcFileText  = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IcBriefcase = ({size=16}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;


const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilTrabajador = ({ onBackToHome, onEditarPerfil, onLogout }) => {
    const { user } = useAuth();
    const [perfil, setPerfil]           = useState(null);
    const [desempeno, setDesempeno]     = useState(null);
    const [reservasHoy, setReservasHoy] = useState([]);
    const [isLoading, setIsLoading]     = useState(true);
    const [error, setError]             = useState('');

    // ── Animación de entrada de cards ────────────────────────────────────────
    useEffect(() => {
        const cards = document.querySelectorAll('.pt-card');
        cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 100);
        });
    }, [perfil]);

    // ── Cargar datos del perfil ──────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        fetchDatos();
    }, [user]);

    const fetchDatos = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [listaRes, reservasRes] = await Promise.all([
                api.get('/empleados'),
                api.get(`/empleados/${user.id}/servicios-hoy`)
            ]);

            const lista = listaRes.data?.data || [];
            const miPerfil = lista.find(e => e.Id_Usuario === user.id);
            if (miPerfil) {
                setPerfil(miPerfil);
            } else {
                setPerfil({ Nombre: user.nombre, Correo: user.email });
            }

            setDesempeno(null);

            if (reservasRes.data?.success) {
                setReservasHoy(reservasRes.data.data || []);
            }
        } catch (err) {
            console.error('❌ Error al cargar perfil:', err);
            setPerfil({ Nombre: user.nombre, Correo: user.email });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditProfile = () => { if (onEditarPerfil) onEditarPerfil(); };

    const handleCerrarSesion = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) onLogout();
            else if (onBackToHome) onBackToHome();
        }
    };

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

    const parseEspecialidades = (raw) => {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch {}
        return raw.split(',').map(e => e.trim());
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'No especificada';
        return new Date(fecha).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const getFotoUrl = (fotoPerfil) => {
        if (!fotoPerfil) return null;
        if (fotoPerfil.startsWith('http')) return fotoPerfil;
        return `${API_BASE_URL}${fotoPerfil}`;
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

    const certificaciones = parseCertificaciones(perfil?.certificaciones);
    const especialidades  = parseEspecialidades(perfil?.especialidades);
    const fotoUrl         = getFotoUrl(perfil?.foto_perfil);

    return (
        <div style={{ background: '#f6f7fb', minHeight: '100vh' }}>
            <div className="pt-main">
                <div className="pt-container">

                    {/* ══════════════════════════════
                        SIDEBAR
                    ══════════════════════════════ */}
                    <div className="pt-sidebar">

                        {/* Foto */}
                        <div className="pt-photo">
                            {fotoUrl
                                ? <img
                                    src={fotoUrl}
                                    alt="Foto perfil"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                : null
                            }
                            <span style={{ fontSize: '3rem', display: fotoUrl ? 'none' : 'block' }}><IcUser size={48} /></span>
                        </div>

                        <div className="pt-name">{perfil?.Nombre || 'Sin nombre'}</div>
                        <div className="pt-role">{perfil?.cargo || 'Empleado'}</div>

                        {/* Badge disponibilidad */}
                        <div className="pt-availability">
                            <span className="pt-status-dot"></span>
                            <span>Disponible</span>
                        </div>

                        {/* Stats */}
                        <div className="pt-stats">
                            <div className="pt-stat">
                                <div className="pt-stat-num">{desempeno?.servicios_completados ?? '—'}</div>
                                <div className="pt-stat-lbl">Este Mes</div>
                            </div>
                            <div className="pt-stat">
                                <div className="pt-stat-num">{desempeno?.calificacion_promedio ?? '—'}</div>
                                <div className="pt-stat-lbl">Calificación</div>
                            </div>
                            <div className="pt-stat">
                                <div className="pt-stat-num">{desempeno?.puntualidad ?? '—'}</div>
                                <div className="pt-stat-lbl">Puntualidad</div>
                            </div>
                            <div className="pt-stat">
                                <div className="pt-stat-num">{desempeno?.comentarios_positivos ?? '—'}</div>
                                <div className="pt-stat-lbl">Comentarios</div>
                            </div>
                        </div>

                        <button className="pt-edit-btn" onClick={handleEditProfile}>
                            Editar Perfil
                        </button>
                    </div>

                    {/* ══════════════════════════════
                        PANEL DERECHO
                    ══════════════════════════════ */}
                    <div className="pt-right">

                        {/* ── Información Personal ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcUser size={18} /></span>
                                Información Personal
                            </h2>
                            <div className="pt-info-grid">
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Nombre Completo</span>
                                    <div className="pt-info-value">{perfil?.Nombre || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Tipo de Documento</span>
                                    <div className="pt-info-value">{perfil?.tipo_de_documento?.nombre_del_documento || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Número de Documento</span>
                                    <div className="pt-info-value">{perfil?.N_Documento || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Fecha de Nacimiento</span>
                                    <div className="pt-info-value">{formatFecha(perfil?.fecha_nacimiento)}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Cargo</span>
                                    <div className="pt-info-value">{perfil?.cargo || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Correo</span>
                                    <div className="pt-info-value">{perfil?.Correo || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Teléfono</span>
                                    <div className="pt-info-value">{perfil?.Telefono || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Dirección</span>
                                    <div className="pt-info-value">{perfil?.Direccion || '—'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Fecha de Ingreso</span>
                                    <div className="pt-info-value">{formatFecha(perfil?.fecha_ingreso)}</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Horario de Hoy ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcCalendar size={18} /></span>
                                Horario de Hoy
                            </h2>
                            {reservasHoy.length > 0 ? (
                                <div className="pt-schedule-list">
                                    {reservasHoy.map((r) => (
                                        <div key={r.ID_Reserva} className="pt-schedule-item">
                                            <div className="pt-schedule-icon"><IcBriefcase size={14} color="#0066ff" /></div>
                                            <div className="pt-schedule-content">
                                                <h4>{r.Hora} — {r.servicios?.[0]?.Nombre_Servicio || 'Servicio'}</h4>
                                                <p>{r.cliente?.Direccion} · Cliente: {r.cliente?.Nombre}</p>
                                            </div>
                                            <span className={`pt-schedule-status ${r.Estado === 'En Proceso' ? 'pt-status-inprogress' : 'pt-status-upcoming'}`}>
                                                {r.Estado}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#bbb', textAlign: 'center', padding: '28px', fontSize: 14, fontFamily: 'Kanit' }}>
                                    No hay servicios programados para hoy.
                                </p>
                            )}
                        </div>

                        {/* ── Desempeño del Mes ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcStats size={18} /></span>
                                Desempeño del Mes
                            </h2>
                            <div className="pt-perf-grid">
                                <div className="pt-perf-card">
                                    <div className="pt-perf-icon">⭐</div>
                                    <div className="pt-perf-value">{desempeno?.calificacion_promedio || '—'}</div>
                                    <div className="pt-perf-label">Calificación Promedio</div>
                                </div>
                                <div className="pt-perf-card">
                                    <div className="pt-perf-icon">✅</div>
                                    <div className="pt-perf-value">{desempeno?.servicios_completados || 0}</div>
                                    <div className="pt-perf-label">Servicios Completados</div>
                                </div>
                                <div className="pt-perf-card">
                                    <div className="pt-perf-icon">⏱️</div>
                                    <div className="pt-perf-value">{desempeno?.puntualidad || '—'}</div>
                                    <div className="pt-perf-label">Puntualidad</div>
                                </div>
                                <div className="pt-perf-card">
                                    <div className="pt-perf-icon">💬</div>
                                    <div className="pt-perf-value">{desempeno?.comentarios_positivos || 0}</div>
                                    <div className="pt-perf-label">Comentarios Positivos</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Horario Laboral ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcClock size={18} /></span>
                                Horario Laboral
                            </h2>
                            <div className="pt-info-grid">
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Días Laborales</span>
                                    <div className="pt-info-value">{perfil?.dias_laborales || 'No especificado'}</div>
                                </div>
                                <div className="pt-info-item">
                                    <span className="pt-info-label">Horario</span>
                                    <div className="pt-info-value">{perfil?.horario || 'No especificado'}</div>
                                </div>
                            </div>
                        </div>

                        {/* ── Especialidades ── */}
                        {especialidades.length > 0 && (
                            <div className="pt-card">
                                <h2 className="pt-card-title">
                                    <span className="pt-card-icon"><IcStar size={18} /></span>
                                    Especialidades
                                </h2>
                                <div className="pt-cert-list">
                                    {especialidades.map((esp, i) => (
                                        <div key={i} className="pt-cert-item">
                                            <span className="pt-cert-icon"><IcBriefcase size={14} color="#0066ff" /></span>
                                            <div className="pt-cert-info">
                                                <h4>{esp}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Certificaciones ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcAward size={18} /></span>
                                Certificaciones y Capacitaciones
                            </h2>
                            {certificaciones.length > 0 ? (
                                <div className="pt-cert-list">
                                    {certificaciones.map((cert, i) => (
                                        <div key={i} className="pt-cert-item">
                                            <span className="pt-cert-icon"><IcFileText size={14} color="#0066ff" /></span>
                                            <div className="pt-cert-info">
                                                <h4>{cert.nombre || cert}</h4>
                                                {cert.vence && <p>Vence: {cert.vence}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ color: '#bbb', textAlign: 'center', padding: '28px', fontSize: 14, fontFamily: 'Kanit' }}>
                                    No hay certificaciones registradas. Edita tu perfil para agregar.
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilTrabajador;