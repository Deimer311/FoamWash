// =============================================================================
// ARCHIVO  : PerfilClienteEdi.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/cliente/PerfilClienteEdi.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Formulario de edición del perfil del cliente: datos personales y foto.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import api         from '../../services/api';

/**
 * PerfilClienteEdi.jsx — Editor de perfil conectado a la BD
 * Diseño original intacto. Solo se conecta al backend para cargar y guardar.
 */
const PerfilClienteEdi = ({ onBackToProfile, onBackToHome }) => {
    const { user } = useAuth();

    const [imagePreview, setImagePreview] = useState(null);
    const [showSuccess,  setShowSuccess]  = useState(false);
    const [isLoading,    setIsLoading]    = useState(true);
    const [guardando,    setGuardando]    = useState(false);
    const [error,        setError]        = useState('');

    const [formData, setFormData] = useState({
        nombre:           '',
        tipoDoc:          'CC',
        numDoc:           '',
        email:            '',
        telefono:         '',
        direccion:        '',
        passwordActual:   '',
        passwordNueva:    '',
        passwordConfirmar: ''
    });
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [tipoDocId, setTipoDocId] = useState(null);

    const fileInputRef = useRef(null);

    // ── Cargar datos reales ────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        const cargar = async () => {
            try {
                // Cargar tipos de documento (con fallback si endpoint no existe o está en mantenimiento)
                try {
                    const tiposRes = await api.get('/clientes/tipos-documento');
                    if (tiposRes.data.success) {
                        setTiposDocumento(tiposRes.data.data);
                    }
                } catch (err) {
                    console.warn('No se pudo cargar tipos de documento, usando valores por defecto.', err);
                    setTiposDocumento([
                        { idTipo_de_Documento: 1, nombre_del_documento: 'CC' },
                        { idTipo_de_Documento: 2, nombre_del_documento: 'TI' },
                        { idTipo_de_Documento: 3, nombre_del_documento: 'CE' }
                    ]);
                }

                // Cargar perfil
                const res = await api.get('/clientes/' + user.id + '/perfil');
                if (res.data.success) {
                    const p = res.data.data;
                    setFormData(prev => ({
                        ...prev,
                        nombre:   p.Nombre    || '',
                        email:    p.Correo    || '',
                        telefono: p.Telefono  || '',
                        direccion: p.Direccion || '',
                        numDoc:   p.N_Documento || '',
                        tipoDoc:  p.tipo_de_documento?.nombre_del_documento || 'CC'
                    }));
                    setTipoDocId(p.tipo_de_documento_id_tipo_de_documento || null);
                    if (p.foto_perfil) {
                        const url = p.foto_perfil.startsWith('http')
                            ? p.foto_perfil
                            : 'http://localhost:5000' + p.foto_perfil;
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { id, name, value } = e.target;
        setFormData(prev => ({ ...prev, [id || name]: value }));
    };

    const handleTipoDocChange = (e) => {
        const selectedId = parseInt(e.target.value);
        const selectedTipo = tiposDocumento.find(t => t.idTipo_de_Documento === selectedId);
        setTipoDocId(selectedId);
        setFormData(prev => ({ ...prev, tipoDoc: selectedTipo?.nombre_del_documento || '' }));
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
            // Actualizar datos básicos
            await api.put('/clientes/' + user.id + '/perfil', {
                Nombre:    formData.nombre,
                Telefono:  formData.telefono,
                Direccion: formData.direccion,
                N_Documento: formData.numDoc,
                tipo_de_documento_id_tipo_de_documento: tipoDocId
            });

            // Actualizar foto si se seleccionó una nueva (base64 local = nueva foto)
            if (fileInputRef.current?.files?.[0]) {
                const fd = new FormData();
                fd.append('foto', fileInputRef.current.files[0]);
                await api.post('/clientes/' + user.id + '/foto', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onBackToProfile) onBackToProfile();
            }, 2000);
        } catch (err) {
            console.error(err);
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

    // ── JSX — Diseño original del PerfilClienteEdi, solo conectado a BD ────
    return (
        <div>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; min-height: 100vh; }
                .header-banner { background: linear-gradient(135deg, #223BFF 0%, #008CFF 100%); padding: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,.1); position: relative; }
                .fondo { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: .2; top: 0; left: 0; }
                .logo-header { position: relative; color: white; font-size: 2rem; font-weight: 900; text-align: center; cursor: pointer; z-index: 2; }
                .nav-bar { display: flex; justify-content: center; gap: 30px; margin-top: 12px; position: relative; z-index: 2; flex-wrap: wrap; }
                .nav-link { color: rgba(255,255,255,.85); text-decoration: none; font-weight: 600; font-size: 1rem; transition: color .2s; }
                .nav-link:hover { color: #fff; }
                .btn-salir { background: rgba(255,77,77,.2); padding: 6px 16px; border-radius: 20px; border: 1.5px solid rgba(255,77,77,.5); }
                .btn-salir:hover { background: rgba(255,77,77,.4); }
                .edit-container { max-width: 900px; margin: 40px auto; padding: 0 20px 60px; }
                .edit-header { text-align: center; margin-bottom: 32px; }
                .edit-header h1 { font-size: 2rem; color: #223BFF; }
                .edit-header p { color: #666; margin-top: 6px; }
                .edit-card { background: white; border-radius: 16px; padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 24px rgba(34,59,255,.08); }
                .edit-card h2 { font-size: 1.1rem; font-weight: 700; color: #223BFF; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
                .photo-section { display: flex; flex-direction: column; align-items: center; gap: 16px; }
                .photo-preview { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, #223BFF, #008CFF); display: flex; align-items: center; justify-content: center; font-size: 48px; overflow: hidden; box-shadow: 0 4px 16px rgba(34,59,255,.3); }
                .photo-preview img { width: 100%; height: 100%; object-fit: cover; }
                .btn-upload { background: linear-gradient(135deg, #223BFF, #008CFF); color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: .9rem; font-weight: 600; cursor: pointer; transition: opacity .2s; }
                .btn-upload:hover { opacity: .85; }
                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .form-group-edit { display: flex; flex-direction: column; gap: 6px; }
                .form-group-edit label { font-size: .85rem; font-weight: 600; color: #444; }
                .form-group-edit input, .form-group-edit select { padding: 10px 14px; border: 1.5px solid #e0e0e0; border-radius: 8px; font-size: .95rem; transition: border-color .2s; }
                .form-group-edit input:focus, .form-group-edit select:focus { outline: none; border-color: #223BFF; }
                .form-group-edit input:disabled { background: #f5f5f5; color: #999; }
                .form-group-edit.full { grid-column: 1 / -1; }
                .btn-group { display: flex; gap: 16px; justify-content: flex-end; margin-top: 8px; }
                .btn-save { background: linear-gradient(135deg, #223BFF, #008CFF); color: white; border: none; padding: 12px 32px; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity .2s; }
                .btn-save:hover:not(:disabled) { opacity: .85; }
                .btn-save:disabled { opacity: .6; cursor: not-allowed; }
                .btn-cancel-edit { background: #f5f5f5; color: #666; border: none; padding: 12px 24px; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; }
                .btn-cancel-edit:hover { background: #e0e0e0; }
                .success-toast { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: #00c853; color: white; padding: 14px 32px; border-radius: 50px; font-weight: 700; z-index: 9999; box-shadow: 0 4px 20px rgba(0,200,83,.3); animation: fadeSlideIn .3s ease; }
                .error-banner { background: #fff0f0; border: 1.5px solid #ffcccc; color: #c00; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
                @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
                @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
            `}</style>

            {showSuccess && <div className="success-toast">✅ Perfil actualizado correctamente</div>}

            <header className="header-banner">
                <img src="/img/ima9.jpg" alt="Fondo" className="fondo" />
                <h1 className="logo-header" onClick={onBackToHome}>FoamWash</h1>
                <nav className="nav-bar">
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onBackToHome(); }}>Hogar</a>
                    <a href="#" className="nav-link" onClick={e => { e.preventDefault(); onBackToProfile(); }}>Perfil</a>
                </nav>
            </header>

            <div className="edit-container">
                <div className="edit-header">
                    <h1>✏️ Editar Perfil</h1>
                    <p>Actualiza tu información personal</p>
                </div>

                {error && <div className="error-banner">❌ {error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Foto */}
                    <div className="edit-card">
                        <h2>📷 Foto de Perfil</h2>
                        <div className="photo-section">
                            <div className="photo-preview">
                                {imagePreview
                                    ? <img src={imagePreview} alt="Preview" />
                                    : <span>👤</span>
                                }
                            </div>
                            <button type="button" className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                                {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                    </div>

                    {/* Datos personales */}
                    <div className="edit-card">
                        <h2>👤 Información Personal</h2>
                        <div className="form-grid">
                            <div className="form-group-edit">
                                <label htmlFor="nombre">Nombre Completo</label>
                                <input id="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group-edit">
                                <label htmlFor="tipoDoc">Tipo de Documento</label>
                                <select id="tipoDoc" value={tipoDocId || ''} onChange={handleTipoDocChange} required>
                                    <option value="">Seleccionar...</option>
                                    {tiposDocumento.map(tipo => (
                                        <option key={tipo.idTipo_de_Documento} value={tipo.idTipo_de_Documento}>
                                            {tipo.nombre_del_documento}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group-edit">
                                <label htmlFor="numDoc">Número de Documento</label>
                                <input id="numDoc" type="text" value={formData.numDoc} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group-edit">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input id="email" type="email" value={formData.email} disabled title="El correo no se puede cambiar" />
                            </div>
                            <div className="form-group-edit">
                                <label htmlFor="telefono">Teléfono</label>
                                <input id="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} />
                            </div>
                            <div className="form-group-edit full">
                                <label htmlFor="direccion">Dirección</label>
                                <input id="direccion" type="text" value={formData.direccion} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>

                    <div className="btn-group">
                        <button type="button" className="btn-cancel-edit" onClick={handleCancel}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={guardando}>
                            {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PerfilClienteEdi;