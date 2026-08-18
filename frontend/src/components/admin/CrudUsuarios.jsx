// =============================================================================
// ARCHIVO  : CrudUsuarios.jsx — PREMIUM FINAL
// PROYECTO : FoamWash
// NOTA     : Todos los emojis → SVG. Lógica API 100% intacta.
// =============================================================================

import React, { useState, useEffect } from 'react';
import api from '../../services/api';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IcPlus  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcEdit  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IcX     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcUser  = ({ s = 20, c = '#0066ff' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcMail  = ({ s = 13, c = 'currentColor' }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;

const getInitials = (nombre = '') => {
    const parts = nombre.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const CrudUsuarios = () => {
    const [usuarios,   setUsuarios]   = useState([]);
    const [isLoading,  setIsLoading]  = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', usuario: '', correo: '' });
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        api.get('/usuarios')
            .then(res => {
                const data = res.data?.data || res.data || [];
                setUsuarios(Array.isArray(data) ? data.map(u => ({
                    id:      u.Id_Usuario || u.id,
                    nombre:  u.Nombre     || u.nombre,
                    usuario: u.Correo     || u.correo,
                    correo:  u.Correo     || u.correo,
                    estado:  u.estado,
                    rol:     u.rol_Id_Rol,
                })) : []);
            })
            .catch(err => console.error('Error cargando usuarios:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const abrirModal = (usuario = null) => {
        if (usuario) {
            setUsuarioEditando(usuario);
            setFormData({ nombre: usuario.nombre, usuario: usuario.usuario, correo: usuario.correo });
        } else {
            setUsuarioEditando(null);
            setFormData({ nombre: '', usuario: '', correo: '' });
        }
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setUsuarioEditando(null);
        setFormData({ nombre: '', usuario: '', correo: '' });
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const guardarUsuario = async () => {
        try {
            if (usuarioEditando) {
                await api.put('/usuarios/' + usuarioEditando.id, { Nombre: formData.nombre, Correo: formData.correo });
                setUsuarios(usuarios.map(u => u.id === usuarioEditando.id ? { ...u, ...formData } : u));
            }
            cerrarModal();
        } catch (err) {
            console.error('Error guardando usuario:', err);
            alert('Error al guardar el usuario');
        }
    };

    const eliminarUsuario = async (id) => {
        try {
            await api.delete('/usuarios/' + id);
            setUsuarios(usuarios.filter(u => u.id !== id));
            setToastMsg('Usuario desactivado');
            setTimeout(() => setToastMsg(''), 3000);
        } catch (err) {
            console.error('Error eliminando usuario:', err);
            setUsuarios(usuarios.filter(u => u.id !== id));
        }
    };

    return (
        <>
            <style>{`
                .cu-page { min-height: 100vh; background: var(--ad-bg, #f0f4f8); }
                .cu-wrap { max-width: 960px; margin: 0 auto; padding: 40px 24px; }

                .cu-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 14px; }
                .cu-title-row { display: flex; align-items: center; gap: 12px; }
                .cu-page-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(0,102,255,0.10);
                    display: flex; align-items: center; justify-content: center;
                }
                .cu-title { font-size: 26px; font-weight: 800; color: #1a2540; letter-spacing: -0.5px; margin: 0; }
                .cu-subtitle { font-size: 13px; color: #8898b3; margin: 2px 0 0; }

                .cu-btn-add {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 11px 22px;
                    background: linear-gradient(135deg, #00b8ff, #0066ff);
                    color: #fff; border: none; border-radius: 50px;
                    font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer;
                    box-shadow: 0 4px 18px rgba(0,102,255,0.30);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .cu-btn-add:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,102,255,0.40); }

                .cu-loading { text-align: center; padding: 60px 20px; color: #8898b3; font-size: 14px; }

                .cu-list { display: flex; flex-direction: column; gap: 10px; }

                .cu-row {
                    background: #fff; border-radius: 14px;
                    padding: 16px 20px;
                    display: flex; align-items: center; gap: 16px;
                    border: 1px solid #e0e8f5;
                    box-shadow: 0 2px 10px rgba(10,30,80,0.06);
                    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
                }
                .cu-row:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,102,255,0.11);
                    border-color: rgba(0,102,255,0.16);
                }

                .cu-avatar {
                    width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #00b8ff, #0066ff);
                    display: flex; align-items: center; justify-content: center;
                    color: #fff; font-weight: 700; font-size: 15px;
                    border: 2px solid rgba(0,102,255,0.15);
                }

                .cu-meta { display: flex; align-items: center; gap: 20px; flex: 1; flex-wrap: wrap; min-width: 0; }
                .cu-id { font-size: 12px; font-weight: 700; color: #c4d0e8; font-family: monospace; min-width: 44px; }
                .cu-email-tag {
                    font-size: 13px; font-weight: 600; color: #0052cc;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;
                }
                .cu-name { font-size: 13.5px; color: #1a2540; font-weight: 500; }
                .cu-correo {
                    font-size: 12.5px; color: #8898b3;
                    display: flex; align-items: center; gap: 4px;
                }

                .cu-row-actions { display: flex; gap: 6px; flex-shrink: 0; }
                .cu-btn-icon {
                    width: 34px; height: 34px; border-radius: 9px; border: none;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all 0.2s ease;
                }
                .cu-btn-edit { background: rgba(0,102,255,0.08); color: #0052cc; }
                .cu-btn-edit:hover { background: rgba(0,102,255,0.16); transform: scale(1.1); }
                .cu-btn-del  { background: rgba(239,68,68,0.08); color: #b91c1c; }
                .cu-btn-del:hover  { background: rgba(239,68,68,0.14); transform: scale(1.1); }

                /* ── Modal ── */
                .cu-modal-overlay {
                    position: fixed; inset: 0;
                    background: rgba(5,8,25,0.60); backdrop-filter: blur(10px);
                    z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;
                    animation: cuOverlayIn 0.2s ease;
                }
                @keyframes cuOverlayIn { from { opacity: 0; } to { opacity: 1; } }

                .cu-modal {
                    background: #fff; border-radius: 22px; width: 100%; max-width: 480px;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.28);
                    animation: cuModalIn 0.3s cubic-bezier(.34,1.56,.64,1);
                }
                @keyframes cuModalIn {
                    from { opacity: 0; transform: translateY(18px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .cu-modal-banner {
                    background: linear-gradient(135deg, #0066ff, #00b8ff);
                    padding: 28px 0 20px;
                    display: flex; align-items: center; justify-content: center;
                }
                .cu-modal-avatar {
                    width: 80px; height: 80px; border-radius: 50%;
                    background: rgba(255,255,255,0.22);
                    border: 3px solid rgba(255,255,255,0.5);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }

                .cu-modal-body { padding: 24px 28px 0; }
                .cu-fg { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
                .cu-fg label {
                    font-size: 11px; font-weight: 700; color: #8898b3;
                    text-transform: uppercase; letter-spacing: 0.5px;
                }
                .cu-fg input {
                    padding: 11px 14px; font-size: 14px; font-family: inherit;
                    color: #1a2540; background: #f8faff;
                    border: 1.5px solid #e0e8f5; border-radius: 10px;
                    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                    width: 100%; box-sizing: border-box;
                }
                .cu-fg input:focus {
                    border-color: #0066ff; background: #fff;
                    box-shadow: 0 0 0 3px rgba(0,102,255,0.09);
                }
                .cu-modal-foot { display: flex; gap: 10px; padding: 16px 28px 24px; }
                .cu-btn-cancel {
                    flex: 1; padding: 12px; border: 1.5px solid #e0e8f5; border-radius: 12px;
                    background: #f8faff; color: #4a5a80; font-size: 14px; font-weight: 600;
                    font-family: inherit; cursor: pointer; transition: background 0.2s;
                }
                .cu-btn-cancel:hover { background: #e8f0ff; }
                .cu-btn-save {
                    flex: 1; padding: 12px; border: none; border-radius: 12px;
                    background: linear-gradient(135deg, #00b8ff, #0066ff);
                    color: #fff; font-size: 14px; font-weight: 700;
                    font-family: inherit; cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0,102,255,0.28);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .cu-btn-save:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,102,255,0.38); }

                @media (max-width: 700px) {
                    .cu-meta { flex-direction: column; align-items: flex-start; gap: 4px; }
                    .cu-row { flex-direction: column; align-items: flex-start; }
                    .cu-row-actions { align-self: flex-end; }
                }
            `}</style>

            <div className="cu-page">
                <div className="cu-wrap">
                {toastMsg && <div className="toast-success" style={{background: '#00c853', color: '#fff', padding: '10px 20px', borderRadius: '8px', marginBottom: '20px'}}>{toastMsg}</div>}

                    {/* Header */}
                    <div className="cu-header">
                        <div className="cu-title-row">
                            <div className="cu-page-icon"><IcUser s={22} c="#0066ff" /></div>
                            <div>
                                <h1 className="cu-title">Usuarios</h1>
                                <p className="cu-subtitle">Gestiona las cuentas registradas</p>
                            </div>
                        </div>
                        <button className="cu-btn-add" onClick={() => abrirModal()}>
                            <IcPlus /> Agregar Usuario
                        </button>
                    </div>

                    {/* Lista */}
                    {isLoading ? (
                        <div className="cu-loading">Cargando usuarios...</div>
                    ) : (
                        <div className="cu-list">
                            {usuarios.map(u => (
                                <div key={u.id} className="cu-row">
                                    <div className="cu-avatar">{getInitials(u.nombre)}</div>
                                    <div className="cu-meta">
                                        <span className="cu-id">#{String(u.id).padStart(3, '0')}</span>
                                        <span className="cu-email-tag">{u.usuario}</span>
                                        <span className="cu-name">{u.nombre}</span>
                                        <span className="cu-correo">
                                            <IcMail s={12} c="#8898b3" />
                                            {u.correo}
                                        </span>
                                    </div>
                                    <div className="cu-row-actions">
                                        <button className="cu-btn-icon cu-btn-edit" title="Editar" onClick={() => abrirModal(u)}>
                                            <IcEdit />
                                        </button>
                                        <button className="cu-btn-icon cu-btn-del" title="Eliminar" onClick={() => eliminarUsuario(u.id)}>
                                            <IcTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalAbierto && (
                <div className="cu-modal-overlay" onClick={cerrarModal}>
                    <div className="cu-modal" onClick={e => e.stopPropagation()}>
                        <div className="cu-modal-banner">
                            <div className="cu-modal-avatar">
                                <IcUser s={36} c="white" />
                            </div>
                        </div>
                        <div className="cu-modal-body">
                            <div className="cu-fg">
                                <label>Nombre</label>
                                <input type="text" name="nombre" value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') })} placeholder="Nombre completo" />
                            </div>
                            <div className="cu-fg">
                                <label>Usuario</label>
                                <input type="text" name="usuario" value={formData.usuario}
                                    onChange={handleInputChange} placeholder="Usuario" />
                            </div>
                            <div className="cu-fg">
                                <label>Correo</label>
                                <input type="email" name="correo" value={formData.correo}
                                    onChange={handleInputChange} placeholder="correo@gmail.com" />
                            </div>
                        </div>
                        <div className="cu-modal-foot">
                            <button className="cu-btn-cancel" onClick={cerrarModal}>Cancelar</button>
                            <button className="cu-btn-save" onClick={guardarUsuario}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CrudUsuarios;