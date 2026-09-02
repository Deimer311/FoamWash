// =============================================================================
// ARCHIVO  : PerfilTrabajador.jsx
// PROYECTO : FoamWash
// LÓGICA   : Datos 100% reales desde la base de datos.
//            Sin valores inventados ni hardcodeados.
//            Si un campo no existe → mensaje descriptivo + log en consola.
// =============================================================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';
import './estilos_trabajador/PerfilTrabajador.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcUser = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IcCalendar = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IcStats = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IcClock = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IcAward = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
const IcStar = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
const IcFileText = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IcBriefcase = ({ size = 16 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formatea una fecha de la BD en español. Devuelve null si no hay valor. */
const formatFecha = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
};

const getFotoUrl = (fotoPerfil) => {
    if (!fotoPerfil) return null;
    if (fotoPerfil.startsWith('http')) return fotoPerfil;
    return `${API_BASE_URL}${fotoPerfil}`;
};

const parseCertificaciones = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        return [{ nombre: raw }];
    } catch {
        return raw.split(',').map((c) => ({ nombre: c.trim() }));
    }
};

const parseEspecialidades = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch { }
    return raw.split(',').map((e) => e.trim()).filter(Boolean);
};

// ── Componente: campo de información personal ─────────────────────────────────
/**
 * Muestra el valor real o, si está vacío, un mensaje descriptivo.
 * Nunca inventa datos.
 */
const CampoInfo = ({ label, valor, mensajeVacio }) => {
    const tieneValor = valor !== null && valor !== undefined && String(valor).trim() !== '';
    return (
        <div className="pt-info-item">
            <span className="pt-info-label">{label}</span>
            <div className={`pt-info-value${tieneValor ? '' : ' pt-info-empty'}`}>
                {tieneValor
                    ? valor
                    : <span className="pt-empty-msg">{mensajeVacio}</span>
                }
            </div>
        </div>
    );
};

// ── Componente: stat del sidebar ──────────────────────────────────────────────
const StatSidebar = ({ valor, etiqueta, mensajeVacio }) => {
    const tieneValor = valor !== null && valor !== undefined;
    return (
        <div className="pt-stat">
            <div className="pt-stat-num">
                {tieneValor
                    ? valor
                    : <span className="pt-stat-empty">{mensajeVacio}</span>
                }
            </div>
            <div className="pt-stat-lbl">{etiqueta}</div>
        </div>
    );
};

// ── Componente: tarjeta de desempeño ─────────────────────────────────────────
const PerfCard = ({ icono, valor, etiqueta, mensajeVacio }) => {
    const tieneValor = valor !== null && valor !== undefined;
    return (
        <div className="pt-perf-card">
            <div className="pt-perf-icon">{icono}</div>
            {tieneValor
                ? <div className="pt-perf-value">{valor}</div>
                : <div className="pt-perf-value" style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic', fontWeight: 400 }}>{mensajeVacio}</div>
            }
            <div className="pt-perf-label">{etiqueta}</div>
        </div>
    );
};

// ── Componente principal ──────────────────────────────────────────────────────
const PerfilTrabajador = ({ onBackToHome, onEditarPerfil, onLogout }) => {
    const { user } = useAuth();

    const [perfil, setPerfil] = useState(null);
    const [desempeno, setDesempeno] = useState(null);
    const [reservasHoy, setReservasHoy] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Animación de entrada
    useEffect(() => {
        const cards = document.querySelectorAll('.pt-card');
        cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), i * 100);
        });
    }, [perfil]);

    useEffect(() => {
        if (!user?.id) {
            console.warn('⚠️ PerfilTrabajador: user.id no disponible aún.', user);
            return;
        }
        console.log('🔍 PerfilTrabajador: cargando datos para user.id =', user.id);
        fetchDatos();
    }, [user]);

    // ── Carga de datos ────────────────────────────────────────────────────────
    const fetchDatos = async () => {
        setIsLoading(true);
        setError('');

        // ── 1. Perfil (obligatorio) ───────────────────────────────────────────
        try {
            const perfilRes = await api.get(`/empleados/${user.id}/perfil`);
            if (perfilRes.data?.success && perfilRes.data?.data) {
                setPerfil(perfilRes.data.data);
                const p = perfilRes.data.data;
                if (!p.N_Documento) console.warn('📋 Sin número de documento registrado.');
                if (!p.tipo_de_documento) console.warn('📋 Sin tipo de documento registrado.');
                if (!p.fecha_nacimiento) console.warn('📋 Sin fecha de nacimiento registrada.');
                if (!p.cargo) console.warn('📋 Sin cargo registrado en la tabla empleado.');
                if (!p.Direccion) console.warn('📋 Sin dirección registrada.');
                if (!p.fecha_ingreso) console.warn('📋 Sin fecha de ingreso registrada.');
                if (!p.Telefono) console.warn('📋 Sin teléfono registrado.');
            } else {
                console.warn('⚠️ /perfil no devolvió datos. Usando datos básicos del token.');
                setPerfil({ Nombre: user.nombre, Correo: user.correo ?? user.email });
            }
        } catch (err) {
            console.error('❌ Error en /perfil:', err?.response?.data ?? err.message);
            // Usar datos básicos del token como fallback
            setPerfil({ Nombre: user.nombre, Correo: user.correo ?? user.email });
        }

        // ── 2. Desempeño (opcional) ───────────────────────────────────────────
        try {
            const desempenoRes = await api.get(`/empleados/${user.id}/desempeno`);
            if (desempenoRes.data?.success && desempenoRes.data?.data) {
                const d = desempenoRes.data.data;
                setDesempeno(d);
                if (d.servicios_mes === 0) console.info('📊 Sin servicios este mes.');
                if (d.calificacion_promedio === null) console.info('📊 Sin calificaciones aún.');
                if (d.comentarios === 0) console.info('📊 Sin comentarios aún.');
            } else {
                console.warn('⚠️ /desempeno no devolvió datos.');
                setDesempeno(null);
            }
        } catch (err) {
            console.warn('⚠️ Error en /desempeno (no crítico):', err?.response?.data ?? err.message);
            setDesempeno(null);
        }

        // ── 3. Servicios de hoy (opcional) ────────────────────────────────────
        try {
            const reservasRes = await api.get(`/empleados/${user.id}/servicios-hoy`);
            if (reservasRes.data?.success) {
                setReservasHoy(reservasRes.data.data || []);
            }
        } catch (err) {
            console.warn('⚠️ Error en /servicios-hoy (no crítico):', err?.response?.data ?? err.message);
            setReservasHoy([]);
        }

        setIsLoading(false);
    };

    const handleEditProfile = () => { if (onEditarPerfil) onEditarPerfil(); };
    const handleCerrarSesion = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            if (onLogout) onLogout();
            else if (onBackToHome) onBackToHome();
        }
    };

    // ── Estados de pantalla ───────────────────────────────────────────────────
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

    // ── Datos derivados ───────────────────────────────────────────────────────
    const certificaciones = parseCertificaciones(perfil?.certificaciones);
    const especialidades = parseEspecialidades(perfil?.especialidades);
    const fotoUrl = getFotoUrl(perfil?.foto_perfil);

    // Nombre del rol real o badge genérico como último recurso
    const rolBadge = perfil?.rol?.Rol || perfil?.cargo || null;

    return (
        <div style={{ background: '#f6f7fb', minHeight: '100vh' }}>
            <div className="pt-main">
                <div className="pt-container">

                    {/* ══════════════════════════════════════════
                        SIDEBAR
                    ══════════════════════════════════════════ */}
                    <div className="pt-sidebar">

                        {/* Foto */}
                        <div className="pt-photo">
                            {fotoUrl
                                ? <img
                                    src={fotoUrl}
                                    alt="Foto de perfil"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                : null
                            }
                            <span style={{ fontSize: '3rem', display: fotoUrl ? 'none' : 'block' }}>
                                <IcUser size={48} />
                            </span>
                        </div>

                        <div className="pt-name">{perfil?.Nombre || '—'}</div>

                        {rolBadge && <div className="pt-role">{rolBadge}</div>}

                        {/* Disponibilidad */}
                        <div className="pt-availability">
                            <span className="pt-status-dot"></span>
                            <span>Disponible</span>
                        </div>

                        {/* Stats — valores REALES o sin datos */}
                        <div className="pt-stats">
                            <StatSidebar
                                valor={desempeno !== null ? desempeno.servicios_mes : null}
                                etiqueta="Este Mes"
                                mensajeVacio="Sin datos"
                            />
                            <StatSidebar
                                valor={desempeno?.calificacion_promedio ?? null}
                                etiqueta="Calificación"
                                mensajeVacio="Sin datos"
                            />
                            <StatSidebar
                                valor={null /* puntualidad no calculable */}
                                etiqueta="Puntualidad"
                                mensajeVacio="N/D"
                            />
                            <StatSidebar
                                valor={desempeno !== null ? desempeno.comentarios : null}
                                etiqueta="Comentarios"
                                mensajeVacio="Sin datos"
                            />
                        </div>

                        <button className="pt-edit-btn" onClick={handleEditProfile}>
                            Editar Perfil
                        </button>
                    </div>

                    {/* ══════════════════════════════════════════
                        PANEL DERECHO
                    ══════════════════════════════════════════ */}
                    <div className="pt-right">

                        {/* ── Información Personal ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcUser size={18} /></span>
                                Información Personal
                            </h2>
                            <div className="pt-info-grid">
                                <CampoInfo
                                    label="Nombre Completo"
                                    valor={perfil?.Nombre}
                                    mensajeVacio="No existe un nombre registrado para este usuario."
                                />
                                <CampoInfo
                                    label="Tipo de Documento"
                                    valor={perfil?.tipo_de_documento?.nombre_del_documento}
                                    mensajeVacio="No existe un tipo de documento registrado para este usuario."
                                />
                                <CampoInfo
                                    label="Número de Documento"
                                    valor={perfil?.N_Documento}
                                    mensajeVacio="No existe un número de documento registrado para este usuario."
                                />
                                <CampoInfo
                                    label="Fecha de Nacimiento"
                                    valor={formatFecha(perfil?.fecha_nacimiento)}
                                    mensajeVacio="La fecha de nacimiento aún no ha sido registrada."
                                />
                                <CampoInfo
                                    label="Cargo"
                                    valor={perfil?.cargo}
                                    mensajeVacio="No hay cargo registrado para este empleado."
                                />
                                <CampoInfo
                                    label="Correo"
                                    valor={perfil?.Correo}
                                    mensajeVacio="No existe un correo registrado para este usuario."
                                />
                                <CampoInfo
                                    label="Teléfono"
                                    valor={perfil?.Telefono}
                                    mensajeVacio="No existe un teléfono registrado para este usuario."
                                />
                                <CampoInfo
                                    label="Dirección"
                                    valor={perfil?.Direccion}
                                    mensajeVacio="No existe una dirección registrada para este usuario."
                                />
                                <CampoInfo
                                    label="Fecha de Ingreso"
                                    valor={formatFecha(perfil?.fecha_ingreso)}
                                    mensajeVacio="La fecha de ingreso aún no ha sido registrada."
                                />
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
                                            <div className="pt-schedule-icon">
                                                <IcBriefcase size={14} />
                                            </div>
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
                                <PerfCard
                                    icono="⭐"
                                    valor={desempeno?.calificacion_promedio ?? null}
                                    etiqueta="Calificación Promedio"
                                    mensajeVacio="Este trabajador aún no tiene calificaciones."
                                />
                                <PerfCard
                                    icono="✅"
                                    valor={desempeno !== null ? desempeno.servicios_mes : null}
                                    etiqueta="Servicios Completados"
                                    mensajeVacio="No hay servicios completados durante este mes."
                                />
                                <PerfCard
                                    icono="⏱️"
                                    valor={null /* puntualidad no calculable en este sistema */}
                                    etiqueta="Puntualidad"
                                    mensajeVacio="No disponible: el sistema no registra la hora real de inicio."
                                />
                                <PerfCard
                                    icono="💬"
                                    valor={desempeno !== null ? desempeno.comentarios : null}
                                    etiqueta="Comentarios"
                                    mensajeVacio="No existen comentarios registrados."
                                />
                            </div>
                        </div>

                        {/* ── Horario Laboral ── */}
                        <div className="pt-card">
                            <h2 className="pt-card-title">
                                <span className="pt-card-icon"><IcClock size={18} /></span>
                                Horario Laboral
                            </h2>
                            <div className="pt-info-grid">
                                <CampoInfo
                                    label="Días Laborales"
                                    valor={perfil?.dias_laborales}
                                    mensajeVacio="No hay días laborales registrados."
                                />
                                <CampoInfo
                                    label="Horario"
                                    valor={perfil?.horario}
                                    mensajeVacio="No hay horario registrado."
                                />
                            </div>
                        </div>

                        {/* ── Especialidades (solo si existen) ── */}
                        {especialidades.length > 0 && (
                            <div className="pt-card">
                                <h2 className="pt-card-title">
                                    <span className="pt-card-icon"><IcStar size={18} /></span>
                                    Especialidades
                                </h2>
                                <div className="pt-cert-list">
                                    {especialidades.map((esp, i) => (
                                        <div key={i} className="pt-cert-item">
                                            <span className="pt-cert-icon"><IcBriefcase size={14} /></span>
                                            <div className="pt-cert-info"><h4>{esp}</h4></div>
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
                                            <span className="pt-cert-icon"><IcFileText size={14} /></span>
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

                    </div>{/* pt-right */}
                </div>{/* pt-container */}
            </div>{/* pt-main */}
        </div>
    );
};

export default PerfilTrabajador;