// =============================================================================
// ARCHIVO  : PerfilTrabajadorEdi.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Layout y estilos actualizados al estándar
//            del PerfilClienteEdi (sidebar gradiente, cards limpias, sin header interno).
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../autenticacion/AuthContext';
import api from '../../services/api';

const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
});

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const TIPOS_DOCUMENTO = [
  { id: 1, nombre: 'Cédula de Ciudadanía' },
  { id: 3, nombre: 'Cédula de Extranjería' },
  { id: 4, nombre: 'Pasaporte' },
  { id: 5, nombre: 'NIT' },
  { id: 6, nombre: 'RUT' },
  { id: 7, nombre: 'Registro Civil' },
  { id: 2, nombre: 'Tarjeta de Identidad' },
];

const PerfilTrabajadorEdi = ({ onBackToProfile }) => {
    const { user, updateUser, refreshUser } = useAuth();
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading]     = useState(true);
    const [isSaving, setIsSaving]       = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg]       = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [archivoFoto, setArchivoFoto] = useState(null);

    const [formData, setFormData] = useState({
        nombre:            '',
        cedula:            '',
        tipoDocId:         1,
        fechaNac:          '',
        cargo:             '',
        email:             '',
        telefono:          '',
        direccion:         '',
        horaInicio:        '08:00',
        horaFin:           '17:00',
        passwordActual:    '',
        passwordNueva:     '',
        passwordConfirmar: ''
    });

    const [diasLaborales, setDiasLaborales] = useState({
        lunes: false, martes: false, miercoles: false,
        jueves: false, viernes: false, sabado: false
    });

    const [especialidades, setEspecialidades] = useState({
        sofas: false, colchones: false, sillas: false, tapiceria: false
    });

    const [certificaciones, setCertificaciones] = useState('');

    // ── Carga inicial ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        fetchPerfil();
    }, [user]);

    const fetchPerfil = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/empleados');
            const lista = res.data?.data || [];
            const d = lista.find(e => e.Id_Usuario === user.id);

            if (d) {
                setFormData(prev => ({
                    ...prev,
                    nombre:    d.Nombre        || '',
                    cedula:    d.N_Documento   || '',
                    tipoDocId: d.tipo_de_documento?.idTipo_de_Documento || 1,
                    fechaNac:  d.fecha_nacimiento ? d.fecha_nacimiento.split('T')[0] : '',
                    cargo:     d.cargo         || '',
                    email:     d.Correo        || '',
                    telefono:  d.Telefono      || '',
                    direccion: d.Direccion     || '',
                    horaInicio: d.horario ? d.horario.split('-')[0]?.trim() : '08:00',
                    horaFin:    d.horario ? d.horario.split('-')[1]?.trim() : '17:00',
                }));

                if (d.foto_perfil) {
                    const fotoUrl = d.foto_perfil.startsWith('http')
                        ? d.foto_perfil
                        : `${API_BASE_URL}${d.foto_perfil}`;
                    setImagePreview(fotoUrl);
                }

                if (d.dias_laborales) {
                    const dias = d.dias_laborales.toLowerCase().split(',').map(s => s.trim());
                    setDiasLaborales({
                        lunes:     dias.includes('lunes'),
                        martes:    dias.includes('martes'),
                        miercoles: dias.includes('miercoles') || dias.includes('miércoles'),
                        jueves:    dias.includes('jueves'),
                        viernes:   dias.includes('viernes'),
                        sabado:    dias.includes('sabado') || dias.includes('sábado'),
                    });
                }

                if (d.especialidades) {
                    const esps = d.especialidades.toLowerCase().split(',').map(s => s.trim());
                    setEspecialidades({
                        sofas:     esps.includes('sofas') || esps.includes('sofás'),
                        colchones: esps.includes('colchones'),
                        sillas:    esps.includes('sillas'),
                        tapiceria: esps.includes('tapiceria') || esps.includes('tapicería'),
                    });
                }

                if (d.certificaciones) setCertificaciones(d.certificaciones);
            } else {
                setFormData(prev => ({
                    ...prev,
                    nombre: user.nombre || '',
                    email:  user.email  || '',
                }));
            }
        } catch (err) {
            console.error('❌ Error al cargar perfil para editar:', err);
            setErrorMsg('No se pudo cargar la información. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setArchivoFoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleDiaChange = (e) => {
        const { id, checked } = e.target;
        setDiasLaborales(prev => ({ ...prev, [id]: checked }));
    };

    const handleEspecialidadChange = (e) => {
        const { id, checked } = e.target;
        setEspecialidades(prev => ({ ...prev, [id]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.passwordNueva) {
            if (!formData.passwordActual) {
                setErrorMsg('Debes ingresar tu contraseña actual para cambiarla.');
                return;
            }
            if (formData.passwordNueva !== formData.passwordConfirmar) {
                setErrorMsg('Las contraseñas nuevas no coinciden.');
                return;
            }
            if (formData.passwordNueva.length < 6) {
                setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
        }

        setIsSaving(true);
        try {
            if (archivoFoto) {
                const formDataFoto = new FormData();
                formDataFoto.append('foto', archivoFoto);
                const fotoRes = await axiosUpload.post(`/empleados/${user.id}/foto`, formDataFoto);
                if (fotoRes.data?.data?.foto_perfil) {
                    updateUser({ foto_perfil: fotoRes.data.data.foto_perfil });
                }
            }

            await api.put(`/usuarios/${user.id}`, {
                Nombre:    formData.nombre,
                Telefono:  formData.telefono,
                Direccion: formData.direccion,
                N_Documento: formData.cedula || undefined,
                tipo_de_documento_id_tipo_de_documento: formData.tipoDocId ? Number(formData.tipoDocId) : undefined,
            });

            await refreshUser();

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onBackToProfile) onBackToProfile();
            }, 2000);

        } catch (err) {
            console.error('❌ Error al guardar perfil:', err);
            const msg = err.response?.data?.error?.message || 'Error al guardar los cambios. Intenta de nuevo.';
            setErrorMsg(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
                <p style={{ fontSize: 16, color: '#1a56ff', fontFamily: 'Kanit' }}>⏳ Cargando perfil...</p>
            </div>
        );
    }

    /* ── Estilos inline (mismo estándar que PerfilAdminEdi) ───────────────── */
    const S = {
        page:      { background: '#f6f7fb', minHeight: '100vh' },
        main:      { maxWidth: '1300px', margin: '0 auto', padding: '156px 40px 80px' },
        container: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px' },
        sidebar: {
            position: 'sticky', top: '120px', height: 'fit-content',
            background: 'linear-gradient(160deg, #1a56ff 0%, #7c3aed 100%)',
            borderRadius: '20px', padding: '36px 28px', color: '#fff',
            boxShadow: '0 12px 40px rgba(26,86,255,0.28)', overflow: 'hidden', textAlign: 'center',
        },
        photo: {
            width: '110px', height: '110px', borderRadius: '50%',
            margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '44px', overflow: 'hidden', position: 'relative', zIndex: 1, cursor: 'pointer',
        },
        photoImg:  { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' },
        photoHint: { fontSize: '11px', opacity: 0.75, fontFamily: 'Kanit', marginBottom: '14px', position: 'relative', zIndex: 1 },
        name:      { fontSize: '20px', fontWeight: 700, marginBottom: '8px', position: 'relative', zIndex: 1, fontFamily: 'Kanit' },
        role:      {
            display: 'inline-block', padding: '4px 16px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '18px', position: 'relative', zIndex: 1, fontFamily: 'Kanit',
        },
        availBadge: {
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(6px)', borderRadius: '12px', padding: '10px 14px',
            fontSize: '13px', fontWeight: 600, fontFamily: 'Kanit',
            marginBottom: '22px', position: 'relative', zIndex: 1, cursor: 'pointer',
            width: '100%', justifyContent: 'center',
        },
        dot: {
            width: '9px', height: '9px', borderRadius: '50%',
            background: '#22c55e', flexShrink: 0,
            animation: 'ptePulse 2s ease-in-out infinite',
        },
        dotOff: {
            width: '9px', height: '9px', borderRadius: '50%',
            background: '#f87171', flexShrink: 0,
        },
        editBtn: {
            width: '100%', padding: '13px', background: 'rgba(255,255,255,0.95)',
            color: '#1a56ff', border: 'none', borderRadius: '12px',
            fontSize: '14px', fontWeight: 700, fontFamily: 'Kanit', cursor: 'pointer',
            position: 'relative', zIndex: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        },
        right:   { display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
        card:    { background: '#fff', borderRadius: '18px', padding: '28px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
        cardTitle: { fontSize: '17px', fontWeight: 700, color: '#0a1435', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Kanit' },
        cardIcon:  { width: '32px', height: '32px', background: 'linear-gradient(135deg, #1a56ff, #7c3aed)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
        formGrid:  { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' },
        formGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' },
        fg:        { display: 'flex', flexDirection: 'column', gap: '6px' },
        label:     { fontSize: '10px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Kanit' },
        input:     { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7ef', borderRadius: '10px', fontSize: '14px', fontFamily: 'Kanit', color: '#111', background: '#fff', outline: 'none' },
        inputDisabled: { background: '#f6f7fb', color: '#aaa', cursor: 'not-allowed' },
        select:    { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7ef', borderRadius: '10px', fontSize: '14px', fontFamily: 'Kanit', color: '#111', background: '#fff', outline: 'none' },
        textarea:  { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7ef', borderRadius: '10px', fontSize: '14px', fontFamily: 'Kanit', color: '#111', background: '#fff', outline: 'none', resize: 'vertical', minHeight: '90px' },
        photoDrop: { border: '2px dashed rgba(26,86,255,0.3)', borderRadius: '14px', padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(26,86,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
        photoPreview: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1a56ff', boxShadow: '0 4px 14px rgba(26,86,255,0.25)' },
        changePhotoBtn: { background: '#1a56ff', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Kanit' },
        checkGroup: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' },
        checkItem:  { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: '#f6f7fb', borderRadius: '10px', cursor: 'pointer', border: '1.5px solid #e5e7ef', fontFamily: 'Kanit', fontSize: '13px', fontWeight: 600, color: '#444', transition: 'all 0.2s ease' },
        btnRow:     { display: 'flex', gap: '14px' },
        btnSave:    { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #1a56ff, #7c3aed)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, fontFamily: 'Kanit', cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,86,255,0.3)' },
        btnCancel:  { flex: 1, padding: '14px', background: '#f6f7fb', color: '#666', border: '1.5px solid #e5e7ef', borderRadius: '12px', fontSize: '14px', fontWeight: 700, fontFamily: 'Kanit', cursor: 'pointer' },
        successMsg: { background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: 700, fontFamily: 'Kanit' },
        errorMsg:   { background: '#fff0f0', border: '1.5px solid #fecaca', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontFamily: 'Kanit' },
        alertBox:   { background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' },
    };

    return (
        <>
            <style>{`
                @keyframes pteFadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes ptePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.7); } 50% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } }
                .pte-sidebar::before { content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,0.07); pointer-events:none; width:200px; height:540px; top:-60px; right:-60px; animation:pteFloat 7s ease-in-out infinite; }
                .pte-sidebar::after  { content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,0.07); pointer-events:none; width:130px; height:540px; bottom:-40px; left:-40px; animation:pteFloat 9s ease-in-out infinite reverse; }
                @keyframes pteFloat { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(8px,-12px) scale(1.08);} }
                .pte-input:focus { border-color:#1a56ff !important; box-shadow:0 0 0 3px rgba(26,86,255,0.1) !important; outline:none; }
                .pte-card:hover { box-shadow:0 8px 28px rgba(26,86,255,0.10) !important; transform:translateY(-2px); }
                .pte-check-item:hover { background:#eef2ff !important; border-color:rgba(26,86,255,0.3) !important; }
                @media(max-width:1024px){.pte-container{grid-template-columns:260px 1fr !important;}.pte-main{padding:140px 24px 60px !important;}.pte-form-grid{grid-template-columns:1fr !important;}.pte-form-grid3{grid-template-columns:1fr !important;}}
                @media(max-width:768px){.pte-container{grid-template-columns:1fr !important;}.pte-sidebar{position:static !important;}.pte-main{padding:120px 16px 60px !important;}}
            `}</style>

            <div style={S.page}>
                <div className="pte-main" style={S.main}>
                    <div className="pte-container" style={{ ...S.container, animation: 'pteFadeUp 0.5s ease-out' }}>

                        {/* ══════════════════════════════
                            SIDEBAR
                        ══════════════════════════════ */}
                        <div className="pte-sidebar" style={S.sidebar}>
                            <div
                                style={S.photo}
                                onClick={() => fileInputRef.current?.click()}
                                title="Clic para cambiar foto"
                            >
                                {imagePreview
                                    ? <img src={imagePreview} alt="Foto" style={S.photoImg}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    : <span>👤</span>
                                }
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <p style={S.photoHint}>Clic en la foto para cambiarla</p>

                            <div style={S.name}>{formData.nombre || 'Empleado'}</div>
                            <div style={S.role}>Empleado</div>

                            <div
                                style={S.availBadge}
                                onClick={() => setIsAvailable(!isAvailable)}
                                title="Cambiar disponibilidad"
                            >
                                <span style={isAvailable ? S.dot : S.dotOff} />
                                <span>{isAvailable ? 'Disponible' : 'No disponible'}</span>
                            </div>

                            <button
                                style={S.editBtn}
                                onClick={onBackToProfile}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
                            >
                                ← Volver al Perfil
                            </button>
                        </div>

                        {/* ══════════════════════════════
                            PANEL DERECHO
                        ══════════════════════════════ */}
                        <div style={S.right}>

                            {/* Mensajes feedback */}
                            {errorMsg    && <div style={S.errorMsg}>❌ {errorMsg}</div>}
                            {showSuccess && <div style={S.successMsg}>✓ Perfil actualizado correctamente</div>}

                            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>

                                {/* ── Alerta ── */}
                                <div style={S.alertBox}>
                                    <span style={{ fontSize: '18px' }}>⚠️</span>
                                    <span style={{ fontSize: '13px', color: '#92400e', fontFamily: 'Kanit', fontWeight: 500 }}>
                                        El correo electrónico no puede modificarse desde aquí.
                                    </span>
                                </div>

                                {/* ── Foto de Perfil ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>📷</span>
                                        Foto de Perfil
                                    </div>
                                    <div
                                        style={S.photoDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Vista previa" style={S.photoPreview} />
                                                <button type="button" style={S.changePhotoBtn}
                                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                                    Cambiar foto
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '32px' }}>📷</span>
                                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a56ff', fontFamily: 'Kanit' }}>Elegir archivo</span>
                                                <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'Kanit' }}>JPG, PNG, WEBP · máx. 5 MB</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* ── Información Personal ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>👤</span>
                                        Información Personal
                                    </div>
                                    <div className="pte-form-grid" style={S.formGrid}>
                                        <div style={S.fg}>
                                            <label style={S.label}>Nombre Completo *</label>
                                            <input className="pte-input" id="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required placeholder="Nombre completo" style={S.input} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Fecha de Nacimiento</label>
                                            <input className="pte-input" id="fechaNac" type="date" value={formData.fechaNac} onChange={handleInputChange} style={S.input} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Tipo de Documento</label>
                                            <select id="tipoDocId" value={formData.tipoDocId} onChange={handleInputChange} style={S.select}>
                                                {TIPOS_DOCUMENTO.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                            </select>
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Número de Documento</label>
                                            <input className="pte-input" id="cedula" type="text" value={formData.cedula} onChange={handleInputChange} placeholder="Ej: 1234567890" style={S.input} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Cargo</label>
                                            <input className="pte-input" id="cargo" type="text" value={formData.cargo} onChange={handleInputChange} placeholder="Técnico de Limpieza" style={S.input} />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Información de Contacto ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>📧</span>
                                        Información de Contacto
                                    </div>
                                    <div className="pte-form-grid" style={S.formGrid}>
                                        <div style={S.fg}>
                                            <label style={S.label}>Correo (no editable)</label>
                                            <input type="email" value={formData.email} disabled style={{ ...S.input, ...S.inputDisabled }} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Teléfono *</label>
                                            <input className="pte-input" id="telefono" type="tel" value={formData.telefono} onChange={handleInputChange} required placeholder="3123456789" style={S.input} />
                                        </div>
                                        <div style={{ ...S.fg, gridColumn: '1 / -1' }}>
                                            <label style={S.label}>Dirección</label>
                                            <input className="pte-input" id="direccion" type="text" value={formData.direccion} onChange={handleInputChange} placeholder="Calle 80 #45-23, Bogotá" style={S.input} />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Horario de Trabajo ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>⏰</span>
                                        Horario de Trabajo
                                    </div>
                                    <div className="pte-form-grid" style={{ ...S.formGrid, marginBottom: '20px' }}>
                                        <div style={S.fg}>
                                            <label style={S.label}>Hora de Inicio</label>
                                            <input className="pte-input" id="horaInicio" type="time" value={formData.horaInicio} onChange={handleInputChange} style={S.input} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Hora de Fin</label>
                                            <input className="pte-input" id="horaFin" type="time" value={formData.horaFin} onChange={handleInputChange} style={S.input} />
                                        </div>
                                    </div>
                                    <div style={S.fg}>
                                        <label style={S.label}>Días Laborales</label>
                                        <div style={S.checkGroup}>
                                            {Object.entries(diasLaborales).map(([dia, checked]) => (
                                                <label key={dia} className="pte-check-item" style={{
                                                    ...S.checkItem,
                                                    background: checked ? '#eef2ff' : '#f6f7fb',
                                                    borderColor: checked ? 'rgba(26,86,255,0.4)' : '#e5e7ef',
                                                    color: checked ? '#1a56ff' : '#666',
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        id={dia}
                                                        checked={checked}
                                                        onChange={handleDiaChange}
                                                        style={{ accentColor: '#1a56ff' }}
                                                    />
                                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Especialidades ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>⭐</span>
                                        Especialidades
                                    </div>
                                    <div style={S.checkGroup}>
                                        {[
                                            { id: 'sofas',     label: '🛋️ Limpieza de Sofás y Muebles' },
                                            { id: 'colchones', label: '🛏️ Limpieza de Colchones' },
                                            { id: 'sillas',    label: '💺 Limpieza de Sillas' },
                                            { id: 'tapiceria', label: '🎨 Tratamiento de Tapicería Delicada' },
                                        ].map(({ id, label }) => (
                                            <label key={id} className="pte-check-item" style={{
                                                ...S.checkItem,
                                                background: especialidades[id] ? '#eef2ff' : '#f6f7fb',
                                                borderColor: especialidades[id] ? 'rgba(26,86,255,0.4)' : '#e5e7ef',
                                                color: especialidades[id] ? '#1a56ff' : '#666',
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    id={id}
                                                    checked={especialidades[id]}
                                                    onChange={handleEspecialidadChange}
                                                    style={{ accentColor: '#1a56ff' }}
                                                />
                                                {label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Certificaciones ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>🏆</span>
                                        Certificaciones y Capacitaciones
                                    </div>
                                    <div style={S.fg}>
                                        <label style={S.label}>Certificaciones (una por línea o separadas por comas)</label>
                                        <textarea
                                            id="certificaciones"
                                            value={certificaciones}
                                            onChange={(e) => setCertificaciones(e.target.value)}
                                            placeholder="Ej: Técnicas de Limpieza de Tapicería, Manejo de Productos Químicos..."
                                            style={S.textarea}
                                        />
                                    </div>
                                </div>

                                {/* ── Cambiar Contraseña ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.cardTitle}>
                                        <span style={S.cardIcon}>🔑</span>
                                        Cambiar Contraseña
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#aaa', fontFamily: 'Kanit', marginBottom: '18px' }}>
                                        Deja estos campos vacíos si no deseas cambiar tu contraseña.
                                    </p>
                                    <div style={{ ...S.fg, marginBottom: '18px' }}>
                                        <label style={S.label}>Contraseña Actual</label>
                                        <input className="pte-input" id="passwordActual" type="password" placeholder="••••••••" value={formData.passwordActual} onChange={handleInputChange} style={S.input} />
                                    </div>
                                    <div className="pte-form-grid" style={S.formGrid}>
                                        <div style={S.fg}>
                                            <label style={S.label}>Nueva Contraseña</label>
                                            <input className="pte-input" id="passwordNueva" type="password" placeholder="••••••••" value={formData.passwordNueva} onChange={handleInputChange} style={S.input} />
                                        </div>
                                        <div style={S.fg}>
                                            <label style={S.label}>Confirmar Contraseña</label>
                                            <input className="pte-input" id="passwordConfirmar" type="password" placeholder="••••••••" value={formData.passwordConfirmar} onChange={handleInputChange} style={S.input} />
                                        </div>
                                    </div>
                                </div>

                                {/* ── Botones ── */}
                                <div className="pte-card" style={S.card}>
                                    <div style={S.btnRow}>
                                        <button
                                            type="button"
                                            style={S.btnCancel}
                                            onClick={onBackToProfile}
                                            disabled={isSaving}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#e9ebf5'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = '#f6f7fb'; }}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            style={{ ...S.btnSave, opacity: isSaving ? 0.75 : 1 }}
                                            disabled={isSaving}
                                            onMouseEnter={e => { if (!isSaving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                                        >
                                            {isSaving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PerfilTrabajadorEdi;