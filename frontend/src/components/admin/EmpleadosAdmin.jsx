// =============================================================================
// ARCHIVO  : EmpleadosAdmin.jsx — PREMIUM FINAL
// PROYECTO : FoamWash
// NOTA     : Todos los emojis → SVG. Lógica y flip 100% intactos.
// =============================================================================

import React, { useState, useEffect } from 'react';
import './estilos_admin/EmpleadosAdmin.css';
import api from '../../services/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcPlus   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IcX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcPhone  = ({ s = 13, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 4.11 12 19.79 19.79 0 0 1 2 3.18 2 2 0 0 1 4 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcStar   = ({ s = 13, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcCal    = ({ s = 13, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcUsers  = ({ s = 22, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

// ── helpers ───────────────────────────────────────────────────────────────────
const getInitials = (nombre = '') =>
    nombre.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';

const CrudEmpleados = () => {
    const [empleados,  setEmpleados]  = useState([]);
    const [isLoading,  setIsLoading]  = useState(true);
    const [flippedId,  setFlippedId]  = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '', foto: '', cargo: '', especialidad: '',
        descripcion: '', experiencia: '', telefono: '', correo: '', password: ''
    });

    useEffect(() => {
        api.get('/empleados')
            .then(res => {
                const data = res.data?.data || [];
                setEmpleados(data.map(e => {
                    const emp = e.empleado && e.empleado.length > 0 ? e.empleado[0] : {};
                    return {
                        id:           e.Id_Usuario    || e.id,
                        nombre:       e.Nombre        || e.nombre        || '',
                        foto:         e.foto_perfil
                                        ? (e.foto_perfil.startsWith('http')
                                            ? e.foto_perfil
                                            : 'http://localhost:5000' + e.foto_perfil)
                                        : null,
                        cargo:        emp.cargo         || '—',
                        especialidad: emp.especialidades || '—',
                        descripcion:  emp.certificaciones   || '',
                        experiencia:  emp.fecha_ingreso ? emp.fecha_ingreso.split('T')[0] : '',
                        telefono:     e.Telefono       || e.telefono || '—',
                    };
                }));
            })
            .catch(err => console.error('Error cargando empleados:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const toggleFlip = (id) => setFlippedId(prev => (prev === id ? null : id));

    const abrirModal = (empleado) => {
        // Avoid event objects masquerading as 'empleado' data
        const isEvent = empleado && typeof empleado === 'object' && 'nativeEvent' in empleado;
        const validEmpleado = (empleado && !isEvent) ? empleado : null;
        
        setFormData(validEmpleado || {
            nombre: '', foto: '', cargo: '', especialidad: '',
            descripcion: '', experiencia: '', telefono: '', correo: '', password: ''
        });
        setModalAbierto(true);
    };

    const cerrarModal = (e) => {
        setModalAbierto(false);
        setFormData({ nombre: '', foto: '', cargo: '', especialidad: '', descripcion: '', experiencia: '', telefono: '', correo: '', password: '' });
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const guardarEmpleado = async () => {
        try {
            const payload = {
                nombre:         formData.nombre,
                telefono:       formData.telefono,
                cargo:          formData.cargo,
                especialidad:   formData.especialidad,
                certificaciones: formData.descripcion,
                fecha_ingreso:  formData.experiencia
            };
            if (formData.id) {
                // Para el PUT de usuarios, debemos respetar las mayúsculas originales o lo que pida el backend.
                // En usuarios.service.ts el update acepta: Nombre, Telefono, cargo, especialidades, certificaciones, fecha_ingreso
                const putPayload = {
                    Nombre: formData.nombre,
                    Telefono: formData.telefono,
                    cargo: formData.cargo,
                    especialidades: formData.especialidad,
                    certificaciones: formData.descripcion,
                    fecha_ingreso: formData.experiencia
                };
                await api.put('/usuarios/' + formData.id, putPayload);
                setEmpleados(empleados.map(e => e.id === formData.id ? { ...e, ...formData } : e));
            } else {
                payload.correo = formData.correo;
                payload.password = formData.password;
                
                const res = await api.post('/usuarios/empleado', payload);
                const nuevoEmpleado = res.data.data;
                
                // Agregarlo a la lista de forma local
                setEmpleados([...empleados, {
                    id: nuevoEmpleado.Id_Usuario,
                    nombre: nuevoEmpleado.Nombre,
                    foto: null,
                    cargo: formData.cargo || '—',
                    especialidad: formData.especialidad || '—',
                    descripcion: formData.descripcion || '',
                    experiencia: formData.experiencia || '—',
                    telefono: formData.telefono || '—',
                }]);
            }
        } catch (err) {
            console.error('Error guardando empleado:', err);
            alert('Error guardando empleado: ' + (err.response?.data?.message || err.message));
        } finally { cerrarModal(); }
    };

    const eliminarEmpleado = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este empleado?')) return;
        try { await api.delete('/usuarios/' + id); }
        catch (err) { console.error('Error:', err); alert('Error al eliminar'); return; }
        setEmpleados(empleados.filter(e => e.id !== id));
        if (flippedId === id) setFlippedId(null);
    };

    // ── Avatar con fallback de iniciales ──
    const Avatar = ({ foto, nombre, size = 96 }) => {
        const [imgError, setImgError] = useState(false);
        if (foto && !imgError) {
            return (
                <img src={foto} alt={nombre}
                    style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
                             border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.14)' }}
                    onError={() => setImgError(true)}
                />
            );
        }
        return (
            <div className="avatar-initials" style={{ width: size, height: size, fontSize: size * 0.32 }}>
                {getInitials(nombre)}
            </div>
        );
    };

    return (
        <div className="crud-container">
            <div className="crud-content">

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6, width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,102,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IcUsers s={22} c="#0066ff" />
                    </div>
                    <h2 className="crud-title" style={{ margin: 0 }}>Empleados</h2>
                </div>

                {!isLoading && (
                    <p className="crud-subtitle">
                        {empleados.length} colaborador{empleados.length !== 1 ? 'es' : ''} activo{empleados.length !== 1 ? 's' : ''} · Haz clic en la tarjeta para girarla
                    </p>
                )}

                <button type="button" className="btn-agregar" onClick={(e) => { e.preventDefault(); abrirModal(); }}>
                    <IcPlus /> Agregar Empleado
                </button>

                {isLoading ? (
                    <div className="loading-grid">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : (
                    <div className="empleados-grid">
                        {empleados.map((empleado, idx) => (
                            <div
                                key={empleado.id}
                                className={`empleado-flip-wrapper${flippedId === empleado.id ? ' flipped' : ''}`}
                                style={{ animationDelay: `${idx * 0.07}s` }}
                                onClick={() => toggleFlip(empleado.id)}
                            >
                                <div className="empleado-flip-inner">

                                    {/* ── CARA FRONTAL ── */}
                                    <div className="empleado-front">
                                        <div className="empleado-foto-area">
                                            <Avatar foto={empleado.foto} nombre={empleado.nombre} size={96} />
                                            {empleado.cargo && empleado.cargo !== '—' && (
                                                <span className="cargo-badge">{empleado.cargo}</span>
                                            )}
                                        </div>
                                        <div className="empleado-info">
                                            <h3 className="empleado-nombre">{empleado.nombre}</h3>
                                            <p className="empleado-especialidad">{empleado.especialidad}</p>
                                            <p className="flip-hint">Clic para ver info</p>
                                        </div>
                                    </div>

                                    {/* ── CARA TRASERA ── */}
                                    <div className="empleado-back">
                                        <p className="back-nombre">{empleado.nombre}</p>

                                        {empleado.descripcion && (
                                            <p className="back-descripcion">{empleado.descripcion}</p>
                                        )}

                                        <div className="back-datos">
                                            <div className="back-dato">
                                                <span className="back-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <IcPhone s={11} c="rgba(255,255,255,0.7)" /> Teléfono
                                                </span>
                                                <span className="back-valor">{empleado.telefono}</span>
                                            </div>
                                            {empleado.especialidad !== '—' && (
                                                <div className="back-dato">
                                                    <span className="back-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <IcStar s={11} c="rgba(255,255,255,0.7)" /> Especialidad
                                                    </span>
                                                    <span className="back-valor">{empleado.especialidad}</span>
                                                </div>
                                            )}
                                            {empleado.experiencia !== '—' && (
                                                <div className="back-dato">
                                                    <span className="back-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <IcCal s={11} c="rgba(255,255,255,0.7)" /> Desde
                                                    </span>
                                                    <span className="back-valor">{empleado.experiencia}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="back-acciones">
                                            <button
                                                className="btn-back-editar"
                                                onClick={e => { e.stopPropagation(); abrirModal(empleado); }}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                            >
                                                <IcEdit /> Editar
                                            </button>
                                            <button
                                                className="btn-back-eliminar"
                                                onClick={e => { e.stopPropagation(); eliminarEmpleado(empleado.id); }}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                            >
                                                <IcTrash /> Eliminar
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {modalAbierto && (
                <div className="ea-modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content-empleado" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={cerrarModal}><IcX /></button>
                        <div className="modal-body-empleado">
                            <h3 className="modal-titulo">
                                {formData.id ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </h3>
                            <div className="form-group-modal">
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre completo del empleado" />
                            </div>
                            {!formData.id && (
                                <div className="form-row">
                                    <div className="form-group-modal">
                                        <label>Correo Electrónico</label>
                                        <input type="email" name="correo" value={formData.correo || ''} onChange={handleInputChange} placeholder="empleado@foamwash.com" />
                                    </div>
                                    <div className="form-group-modal">
                                        <label>Contraseña</label>
                                        <input type="password" name="password" value={formData.password || ''} onChange={handleInputChange} placeholder="Mínimo 6 caracteres" />
                                    </div>
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Cargo</label>
                                    <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} placeholder="Ej: Técnico de Limpieza" />
                                </div>
                                <div className="form-group-modal">
                                    <label>Especialidad</label>
                                    <input type="text" name="especialidad" value={formData.especialidad} onChange={handleInputChange} placeholder="Ej: Limpieza profunda" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group-modal">
                                    <label>Fecha de Ingreso</label>
                                    <input type="date" name="experiencia" value={formData.experiencia} onChange={handleInputChange} />
                                </div>
                                <div className="form-group-modal">
                                    <label>Teléfono</label>
                                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="+57 310 123 4567" />
                                </div>
                            </div>
                            <div className="form-group-modal">
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} placeholder="Describe las habilidades y experiencia del empleado..." rows="4" />
                            </div>
                            <div className="modal-botones">
                                <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                                <button className="btn-guardar" onClick={guardarEmpleado}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrudEmpleados;