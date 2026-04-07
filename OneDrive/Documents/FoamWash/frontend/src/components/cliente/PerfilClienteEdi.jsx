// =============================================================================
// ARCHIVO  : PerfilClienteEdi.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/PerfilClienteEdi.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Formulario de edición del perfil del cliente: datos personales y foto.
//   FIX FOTO: se usa axiosUpload (instancia sin Content-Type fijo) igual que
//   PerfilAdminEdi y PerfilTrabajadorEdi para que el FormData llegue como
//   multipart/form-data y no sea serializado a JSON por la instancia 'api'.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../autenticacion/AuthContext';
import api         from '../../services/api';

// ✅ FIX FOTO: Instancia axios limpia sin Content-Type global.
// La instancia 'api' tiene Content-Type: application/json fijo, lo que
// serializa el FormData a JSON en lugar de enviarlo como multipart/form-data.
// Esta instancia no tiene ese header y permite que axios detecte
// automáticamente el Content-Type correcto al recibir un FormData.
const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

// ✅ FIX: URL base del backend para construir rutas completas de imágenes
const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilClienteEdi = ({ onBackToProfile, onBackToHome }) => {
    const { user, updateUser, refreshUser } = useAuth();

    const [imagePreview, setImagePreview] = useState(null);
    // ✅ FIX: guardar el archivo en estado (igual que Admin y Trabajador)
    const [archivoFoto,  setArchivoFoto]  = useState(null);
    const [showSuccess,  setShowSuccess]  = useState(false);
    const [isLoading,    setIsLoading]    = useState(true);
    const [guardando,    setGuardando]    = useState(false);
    const [error,        setError]        = useState('');

    const [formData, setFormData] = useState({
        nombre:            '',
        tipoDoc:           'CC',
        numDoc:            '',
        email:             '',
        telefono:          '',
        direccion:         '',
        passwordActual:    '',
        passwordNueva:     '',
        passwordConfirmar: ''
    });

    const fileInputRef = useRef(null);

    // ── Cargar datos reales ────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        const cargar = async () => {
            try {
                const res = await api.get('/clientes/' + user.id + '/perfil');
                if (res.data.success) {
                    const p = res.data.data;
                    setFormData(prev => ({
                        ...prev,
                        nombre:    p.Nombre     || '',
                        email:     p.Correo     || '',
                        telefono:  p.Telefono   || '',
                        direccion: p.Direccion  || '',
                        numDoc:    p.N_Documento || '',
                        tipoDoc:   p.tipo_documento || 'CC'
                    }));
                    // ✅ FIX: usar API_BASE_URL como Admin y Trabajador
                    if (p.foto_perfil) {
                        const url = p.foto_perfil.startsWith('http')
                            ? p.foto_perfil
                            : `${API_BASE_URL}${p.foto_perfil}`;
                        setImagePreview(url);
                    }
                }
            } catch (err) {
                setError('No se pudieron cargar los datos del perfil.');
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, [user?.id]);

    // ✅ FIX: guardar el archivo en estado igual que Admin y Trabajador
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setArchivoFoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { id, name, value } = e.target;
        setFormData(prev => ({ ...prev, [id || name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.passwordNueva && formData.passwordNueva !== formData.passwordConfirmar) {
            alert('Las contraseñas nuevas no coinciden.');
            return;
        }

        setGuardando(true);
        setError('');
        try {
            // ── PASO 1: Subir foto si el usuario seleccionó una nueva ─────────
            // ✅ FIX: usar axiosUpload (sin Content-Type fijo) igual que Admin.
            // Antes se usaba api.post con header manual que era sobreescrito
            // por el Content-Type: application/json global de la instancia 'api'.
            if (archivoFoto) {
                const fd = new FormData();
                fd.append('foto', archivoFoto);
                const fotoRes = await axiosUpload.post(`/clientes/${user.id}/foto`, fd);
                if (fotoRes.data?.data?.foto_perfil) {
                    updateUser({ foto_perfil: fotoRes.data.data.foto_perfil });
                }
            }

            // ── PASO 2: Guardar datos del perfil ─────────────────────────────
            await api.put('/clientes/' + user.id + '/perfil', {
                Nombre:    formData.nombre,
                Telefono:  formData.telefono,
                Direccion: formData.direccion
            });

            // ✅ FIX: refreshUser DESPUÉS de subir foto y guardar datos,
            // para que el Header reciba foto_perfil actualizada desde el backend.
            await refreshUser();

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onBackToProfile) onBackToProfile();
            }, 2000);
        } catch (err) {
            console.error('ERROR REAL:', err?.response?.data || err);
            setError('No se pudieron guardar los cambios. Intenta nuevamente.');
        } finally {
            setGuardando(false);
        }
    };

    const handleCancel = () => {
        if (onBackToProfile) onBackToProfile();
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p style={{ fontSize: 18, color: '#666' }}>⏳ Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }

                .main-content-cli {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 20px;
                    min-height: 100vh;
                    background: #f5f5f5;
                }

                .container-cli {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    max-width: 1100px;
                    width: 100%;
                    background: #FFF;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                }

                /* ── PANEL IZQUIERDO ── */
                .left-panel-cli {
                    background: linear-gradient(160deg, #008CFF 0%, #223BFF 100%);
                    padding: 50px 30px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .left-panel-cli::before {
                    content: '';
                    position: absolute;
                    width: 260px;
                    height: 260px;
                    background: rgba(255,255,255,0.07);
                    border-radius: 50%;
                    top: -90px;
                    right: -70px;
                }
                .left-panel-cli::after {
                    content: '';
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    bottom: -50px;
                    left: -50px;
                }

                .current-photo-cli {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    border: 5px solid rgba(255,255,255,0.9);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 58px;
                    overflow: hidden;
                    margin-bottom: 12px;
                    z-index: 1;
                    transition: transform 0.3s ease;
                }
                .current-photo-cli:hover { transform: scale(1.03); }

                .photo-label-cli {
                    color: rgba(255,255,255,0.85);
                    font-size: 13px;
                    font-weight: 500;
                    z-index: 1;
                    margin-bottom: 18px;
                }

                .role-badge-cli {
                    background: rgba(255,255,255,0.2);
                    color: #FFF;
                    padding: 8px 28px;
                    border-radius: 25px;
                    font-weight: 700;
                    font-size: 14px;
                    z-index: 1;
                    margin-bottom: 28px;
                    letter-spacing: 0.5px;
                    border: 1.5px solid rgba(255,255,255,0.3);
                }

                .left-info-cli {
                    z-index: 1;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .left-info-item {
                    background: rgba(255,255,255,0.15);
                    border-radius: 12px;
                    padding: 11px 14px;
                    color: #FFF;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    text-align: left;
                    border: 1px solid rgba(255,255,255,0.18);
                    word-break: break-all;
                }
                .left-info-item .info-icon { font-size: 15px; flex-shrink: 0; }

                .upload-trigger-btn {
                    z-index: 1;
                    margin-top: 22px;
                    background: rgba(255,255,255,0.2);
                    color: #FFF;
                    border: 2px solid rgba(255,255,255,0.5);
                    padding: 11px 22px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    width: 100%;
                }
                .upload-trigger-btn:hover {
                    background: rgba(255,255,255,0.32);
                    border-color: rgba(255,255,255,0.8);
                }

                /* ── PANEL DERECHO ── */
                .right-panel-cli {
                    padding: 48px 50px;
                    background: #FFF;
                    overflow-y: auto;
                    max-height: 90vh;
                }

                .right-panel-cli h2 {
                    color: #223BFF;
                    font-size: 26px;
                    font-weight: 800;
                    margin-bottom: 6px;
                    text-align: center;
                }

                .right-panel-cli .subtitle {
                    text-align: center;
                    color: #999;
                    font-size: 14px;
                    margin-bottom: 28px;
                }

                .warning-banner-cli {
                    background: #FFF8E1;
                    border-left: 4px solid #FFC107;
                    border-radius: 0 10px 10px 0;
                    padding: 11px 16px;
                    margin-bottom: 26px;
                    color: #7a5c00;
                    font-size: 13.5px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-section-cli { margin-bottom: 26px; }

                .section-title-cli {
                    font-size: 16px;
                    font-weight: 700;
                    color: #223BFF;
                    margin-bottom: 16px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e8ecff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .form-row-cli {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .form-group-cli { margin-bottom: 0; }

                .form-group-cli label {
                    display: block;
                    color: #333;
                    font-weight: 600;
                    margin-bottom: 7px;
                    font-size: 13.5px;
                }

                .form-group-cli input {
                    width: 100%;
                    padding: 12px 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 14.5px;
                    transition: all 0.25s ease;
                    background: #FFF;
                    font-family: inherit;
                    color: #333;
                    margin-bottom: 16px;
                }
                .form-group-cli input:focus {
                    outline: none;
                    border-color: #223BFF;
                    box-shadow: 0 0 0 3px rgba(34,59,255,0.1);
                }
                .form-group-cli input:disabled {
                    background: #f5f7ff;
                    color: #aaa;
                    cursor: not-allowed;
                    border-color: #e8ecff;
                }

                .upload-area-cli {
                    border: 2px dashed #008CFF;
                    border-radius: 14px;
                    padding: 22px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(0,140,255,0.03);
                }
                .upload-area-cli:hover { background: rgba(0,140,255,0.07); }

                .change-photo-btn-cli {
                    background: #223BFF;
                    color: #FFF;
                    border: none;
                    padding: 8px 22px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: 10px;
                    transition: background 0.3s;
                }
                .change-photo-btn-cli:hover { background: #008CFF; }

                .button-group-cli {
                    display: flex;
                    gap: 14px;
                    margin-top: 10px;
                }

                .btn-save-cli {
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #008CFF 0%, #223BFF 100%);
                    color: #FFF;
                    border: none;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-save-cli:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(34,59,255,0.35);
                }
                .btn-save-cli:disabled { opacity: 0.65; cursor: not-allowed; }

                .btn-cancel-cli {
                    flex: 1;
                    padding: 15px;
                    background: #f5f7ff;
                    color: #555;
                    border: 2px solid #e0e6ff;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-cancel-cli:hover { background: #e8ecff; border-color: #c5d0ff; }

                .error-msg-cli {
                    background: #FEF2F2;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    font-weight: 600;
                    border: 1px solid #FECACA;
                    font-size: 14px;
                }

                .success-toast-cli {
                    position: fixed;
                    top: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #00c853, #007e33);
                    color: white;
                    padding: 14px 34px;
                    border-radius: 50px;
                    font-weight: 700;
                    z-index: 9999;
                    box-shadow: 0 4px 20px rgba(0,200,83,0.35);
                    animation: fadeSlideIn .3s ease;
                    font-size: 15px;
                }
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                @media (max-width: 900px) {
                    .container-cli { grid-template-columns: 1fr; }
                    .form-row-cli  { grid-template-columns: 1fr; }
                    .right-panel-cli { padding: 30px 22px; }
                }
            `}</style>

            {showSuccess && (
                <div className="success-toast-cli">✅ Perfil actualizado correctamente</div>
            )}

            <div className="main-content-cli">
                <div className="container-cli">

                    {/* ════════════════════════════════════════════════════
                        PANEL IZQUIERDO: foto, rol e info resumida
                    ════════════════════════════════════════════════════ */}
                    <div className="left-panel-cli">

                        <div className="current-photo-cli">
                            {imagePreview
                                ? <img src={imagePreview} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span>👤</span>
                            }
                        </div>
                        <div className="photo-label-cli">Foto actual</div>

                        <div className="role-badge-cli">Cliente</div>

                        <div className="left-info-cli">
                            <div className="left-info-item">
                                <span className="info-icon">👤</span>
                                <span>{formData.nombre || 'Sin nombre'}</span>
                            </div>
                            <div className="left-info-item">
                                <span className="info-icon">📧</span>
                                <span>{formData.email || '—'}</span>
                            </div>
                            <div className="left-info-item">
                                <span className="info-icon">📱</span>
                                <span>{formData.telefono || '—'}</span>
                            </div>
                            <div className="left-info-item">
                                <span className="info-icon">📍</span>
                                <span>{formData.direccion || '—'}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="upload-trigger-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📷 {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* ════════════════════════════════════════════════════
                        PANEL DERECHO: formulario completo
                    ════════════════════════════════════════════════════ */}
                    <div className="right-panel-cli">
                        <h2>✏️ Editar Perfil de Cliente</h2>
                        <p className="subtitle">Actualiza tu información personal</p>

                        <div className="warning-banner-cli">
                            ⚠️ El correo electrónico no puede modificarse desde aquí.
                        </div>

                        {error && <div className="error-msg-cli">❌ {error}</div>}

                        <form onSubmit={handleSubmit}>

                            {/* ── Foto de Perfil ── */}
                            <div className="form-section-cli">
                                <h3 className="section-title-cli">📷 Foto de Perfil</h3>
                                <div
                                    className="upload-area-cli"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={imagePreview}
                                                alt="Vista previa"
                                                style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #008CFF' }}
                                            />
                                            <button type="button" className="change-photo-btn-cli">
                                                Cambiar foto
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ color: '#008CFF', fontWeight: 600, marginBottom: 6, fontSize: 15 }}>
                                                📷 Elegir archivo
                                            </div>
                                            <div style={{ color: '#999', fontSize: 13 }}>
                                                Haz clic para subir una foto · JPG, PNG, WEBP
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ── Información Personal ── */}
                            <div className="form-section-cli">
                                <h3 className="section-title-cli">👤 Información Personal</h3>
                                <div className="form-row-cli">
                                    <div className="form-group-cli">
                                        <label htmlFor="nombre">Nombre Completo *</label>
                                        <input id="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required placeholder="Tu nombre completo" />
                                    </div>
                                    <div className="form-group-cli">
                                        <label htmlFor="email">Correo Electrónico (no editable)</label>
                                        <input id="email" type="email" value={formData.email} disabled />
                                    </div>
                                    <div className="form-group-cli">
                                        <label htmlFor="telefono">Teléfono</label>
                                        <input id="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: 3123456789" />
                                    </div>
                                    <div className="form-group-cli">
                                        <label htmlFor="direccion">Dirección</label>
                                        <input id="direccion" type="text" value={formData.direccion} onChange={handleInputChange} placeholder="Ej: Calle 80 #45-23, Bogotá" />
                                    </div>
                                </div>
                            </div>

                            {/* ── Cambiar Contraseña ── */}
                            <div className="form-section-cli">
                                <h3 className="section-title-cli">🔐 Cambiar Contraseña</h3>
                                <p style={{ color: '#999', fontSize: 13, marginBottom: 16 }}>
                                    Deja estos campos vacíos si no deseas cambiar tu contraseña.
                                </p>
                                <div className="form-row-cli">
                                    <div className="form-group-cli">
                                        <label htmlFor="passwordActual">Contraseña Actual</label>
                                        <input id="passwordActual" type="password" placeholder="••••••••" value={formData.passwordActual} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-cli">
                                        <label htmlFor="passwordNueva">Nueva Contraseña</label>
                                        <input id="passwordNueva" type="password" placeholder="••••••••" value={formData.passwordNueva} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group-cli">
                                        <label htmlFor="passwordConfirmar">Confirmar Contraseña</label>
                                        <input id="passwordConfirmar" type="password" placeholder="••••••••" value={formData.passwordConfirmar} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Botones ── */}
                            <div className="button-group-cli">
                                <button type="button" className="btn-cancel-cli" onClick={handleCancel}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save-cli" disabled={guardando}>
                                    {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                                </button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PerfilClienteEdi;