/**
 * ============================================================================
 * EDITAR PERFIL DEL TRABAJADOR - COMPONENTE REACT
 * ============================================================================
 * Descripción:
 * - Carga los datos actuales del empleado desde el backend al montar.
 * - Permite editar: nombre, teléfono, dirección, cargo, fecha de nacimiento,
 *   horario, días laborales, especialidades, certificaciones y contraseña.
 * - La foto de perfil se sube por separado usando multipart/form-data
 *   (POST /api/empleados/:id/foto) para evitar el error PayloadTooLarge.
 * - El resto de datos se envía como JSON (PUT /api/empleados/:id/perfil).
 *
 * ✅ FIXES APLICADOS:
 * - Se eliminó foto_perfil: null del PUT /perfil para no sobreescribir la foto
 *   con null después de haberla subido correctamente en el paso anterior.
 * - Se agregó API_BASE_URL para construir la URL completa de la foto al cargar
 *   el preview inicial desde la BD (ruta relativa → URL completa del backend).
 *
 * Rutas del backend que usa este componente:
 * - GET  /api/empleados/:id/perfil    → cargar datos actuales
 * - POST /api/empleados/:id/foto      → subir foto (multipart/form-data)
 * - PUT  /api/empleados/:id/perfil    → guardar datos del formulario (JSON)
 * - PUT  /api/empleados/:id/password  → cambiar contraseña (si se llenó)
 *
 * Ubicación: frontend/src/components/empleado/PerfilTrabajadorEdi.jsx
 * Última modificación: 25/02/2026
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../modals/AuthContext';
import api from '../../services/api';

// ✅ FIX FOTO: Instancia axios limpia sin Content-Type global
// La instancia 'api' tiene Content-Type: application/json fijo, lo que
// serializa el FormData a JSON en lugar de enviarlo como multipart/form-data.
// Esta instancia no tiene ese header y permite que axios detecte
// automáticamente el Content-Type correcto al recibir un FormData.
const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
});

// ✅ FIX: URL base del backend para construir rutas completas de imágenes
const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const PerfilTrabajadorEdi = ({ onBackToProfile }) => {

    // ── Contexto de autenticación: obtiene el ID del usuario logueado ────────
    const { user } = useAuth();

    // ── Referencia al input de archivo (foto) para activarlo con click ───────
    const fileInputRef = useRef(null);

    // ── Estados de control de la UI ──────────────────────────────────────────
    const [isLoading, setIsLoading]     = useState(true);   // Cargando datos iniciales
    const [isSaving, setIsSaving]       = useState(false);  // Guardando cambios
    const [showSuccess, setShowSuccess] = useState(false);  // Mensaje de éxito
    const [errorMsg, setErrorMsg]       = useState('');     // Mensaje de error
    const [isAvailable, setIsAvailable] = useState(true);   // Toggle disponibilidad

    // ── Estado para la preview visual de la foto (solo para mostrar) ─────────
    const [imagePreview, setImagePreview] = useState(null);

    // ── Estado para el ARCHIVO real que se subirá al servidor ────────────────
    const [archivoFoto, setArchivoFoto] = useState(null);

    // ── Datos del formulario principal ───────────────────────────────────────
    const [formData, setFormData] = useState({
        nombre:            '',
        cedula:            '',   // No editable (documento de identidad)
        fechaNac:          '',
        cargo:             '',
        email:             '',   // No editable (correo es el login)
        telefono:          '',
        direccion:         '',
        horaInicio:        '08:00',
        horaFin:           '17:00',
        passwordActual:    '',   // Solo si quiere cambiar contraseña
        passwordNueva:     '',
        passwordConfirmar: ''
    });

    // ── Días laborales: checkboxes individuales ───────────────────────────────
    const [diasLaborales, setDiasLaborales] = useState({
        lunes:     false,
        martes:    false,
        miercoles: false,
        jueves:    false,
        viernes:   false,
        sabado:    false
    });

    // ── Especialidades: checkboxes individuales ───────────────────────────────
    const [especialidades, setEspecialidades] = useState({
        sofas:     false,
        colchones: false,
        sillas:    false,
        tapiceria: false
    });

    // ── Certificaciones: texto libre ─────────────────────────────────────────
    const [certificaciones, setCertificaciones] = useState('');


    // =========================================================================
    // CARGA INICIAL: traer datos del backend al montar el componente
    // =========================================================================
    useEffect(() => {
        if (!user?.id) return;
        fetchPerfil();
    }, [user]);

    const fetchPerfil = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/empleados/${user.id}/perfil`);

            if (res.data.success) {
                const d = res.data.data;

                setFormData(prev => ({
                    ...prev,
                    nombre:    d.Nombre        || '',
                    cedula:    d.N_Documento   || '',
                    fechaNac:  d.fecha_nacimiento
                                ? d.fecha_nacimiento.split('T')[0]
                                : '',
                    cargo:     d.cargo         || '',
                    email:     d.Correo        || '',
                    telefono:  d.Telefono      || '',
                    direccion: d.Direccion     || '',
                    horaInicio: d.horario ? d.horario.split('-')[0]?.trim() : '08:00',
                    horaFin:    d.horario ? d.horario.split('-')[1]?.trim() : '17:00',
                }));

                // ✅ FIX: Construir URL completa de la foto al cargar el preview
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
            }
        } catch (err) {
            console.error('❌ Error al cargar perfil para editar:', err);
            setErrorMsg('No se pudo cargar la información. Intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };


    // =========================================================================
    // MANEJO DE FOTO: selección y preview local
    // =========================================================================
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setArchivoFoto(file);

        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };


    // =========================================================================
    // MANEJO DE INPUTS DEL FORMULARIO
    // =========================================================================
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


    // =========================================================================
    // GUARDAR CAMBIOS: envío al backend en dos pasos
    // =========================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // ── Validación de contraseña (solo si quiere cambiarla) ───────────────
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

            // ── PASO 1: Subir foto si el usuario seleccionó una nueva ─────────
            if (archivoFoto) {
                const formDataFoto = new FormData();
                formDataFoto.append('foto', archivoFoto);

                await axiosUpload.post(`/empleados/${user.id}/foto`, formDataFoto);
            }

            // ── PASO 2: Construir strings para días y especialidades ───────────
            const diasString = Object.entries(diasLaborales)
                .filter(([_, activo]) => activo)
                .map(([dia]) => dia)
                .join(', ');

            const especialidadesString = Object.entries(especialidades)
                .filter(([_, activo]) => activo)
                .map(([esp]) => esp)
                .join(', ');

            const horarioString = `${formData.horaInicio} - ${formData.horaFin}`;

            // ── PASO 3: Guardar resto del perfil como JSON ────────────────────
            // ✅ FIX: foto_perfil NO se incluye aquí para no sobreescribir con null
            // la foto que ya se subió correctamente en el Paso 1
            await api.put(`/empleados/${user.id}/perfil`, {
                nombre:                       formData.nombre,
                telefono:                     formData.telefono,
                direccion:                    formData.direccion,
                cargo:                        formData.cargo,
                fecha_nacimiento:             formData.fechaNac || null,
                fecha_ingreso:                null,
                dias_laborales:               diasString,
                horario:                      horarioString,
                especialidades:               especialidadesString,
                certificaciones:              certificaciones,
                contacto_emergencia_nombre:   null,
                contacto_emergencia_telefono: null,
            });

            // ── PASO 4: Cambiar contraseña si el usuario la llenó ─────────────
            if (formData.passwordNueva) {
                await api.put(`/empleados/${user.id}/password`, {
                    passwordActual: formData.passwordActual,
                    passwordNueva:  formData.passwordNueva,
                });
            }

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


    // =========================================================================
    // ESTADO DE CARGA INICIAL
    // =========================================================================
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '1.2rem', color: '#666' }}>
                ⏳ Cargando datos del perfil...
            </div>
        );
    }


    // =========================================================================
    // RENDER PRINCIPAL
    // =========================================================================
    return (
        <div>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }

                .main-content {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding: 40px 20px;
                    min-height: calc(100vh - 100px);
                }

                .container {
                    display: grid;
                    grid-template-columns: 340px 1fr;
                    max-width: 1200px;
                    width: 100%;
                    background: #FFF;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                }

                .left-panel {
                    background: linear-gradient(135deg, #008CFF 0%, #223BFF 100%);
                    padding: 50px 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .left-panel::before {
                    content: '';
                    position: absolute;
                    width: 300px;
                    height: 300px;
                    background: rgba(255,0,200,0.1);
                    border-radius: 50%;
                    top: -100px;
                    right: -100px;
                }

                .current-photo {
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    border: 5px solid #FFF;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    background: #e0e0e0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 64px;
                    overflow: hidden;
                    margin-bottom: 12px;
                    z-index: 1;
                }

                .photo-label {
                    color: #FFF;
                    font-size: 13px;
                    opacity: 0.9;
                    font-weight: 500;
                    z-index: 1;
                    margin-bottom: 20px;
                }

                .role-badge {
                    background: rgba(255,255,255,0.2);
                    color: #FFF;
                    padding: 8px 25px;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 14px;
                    z-index: 1;
                    margin-bottom: 15px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .role-badge:hover { background: rgba(255,255,255,0.3); }

                .availability-toggle {
                    z-index: 1;
                    background: rgba(255,255,255,0.2);
                    padding: 15px 20px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: background 0.3s;
                }
                .availability-toggle:hover { background: rgba(255,255,255,0.28); }

                .toggle-switch {
                    width: 50px;
                    height: 26px;
                    background: #ccc;
                    border-radius: 13px;
                    position: relative;
                    transition: background 0.3s ease;
                    flex-shrink: 0;
                }
                .toggle-switch.active { background: #00ff00; }
                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    width: 22px;
                    height: 22px;
                    background: #FFF;
                    border-radius: 50%;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.3s ease;
                }
                .toggle-switch.active::after { transform: translateX(24px); }
                .availability-text { color: #FFF; font-size: 14px; font-weight: 600; }

                .right-panel {
                    padding: 50px 45px;
                    background: #FFF;
                    overflow-y: auto;
                    max-height: 90vh;
                }
                .right-panel h2 {
                    color: #223BFF;
                    font-size: 28px;
                    margin-bottom: 30px;
                    text-align: center;
                }

                .form-section { margin-bottom: 30px; }

                .section-title {
                    font-size: 17px;
                    font-weight: 700;
                    color: #223BFF;
                    margin-bottom: 18px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
                .form-group { margin-bottom: 18px; }

                label { display: block; color: #333; font-weight: 600; margin-bottom: 7px; font-size: 14px; }
                input[type="text"], input[type="email"], input[type="password"],
                input[type="tel"], input[type="date"], input[type="time"], textarea {
                    width: 100%;
                    padding: 13px 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    font-size: 15px;
                    transition: all 0.3s ease;
                    background: #FFF;
                    font-family: inherit;
                }
                textarea { resize: vertical; min-height: 100px; }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #008CFF;
                    box-shadow: 0 0 0 3px rgba(0,140,255,0.1);
                }

                input:disabled { background: #f5f5f5; color: #888; cursor: not-allowed; }

                .upload-area {
                    border: 2px dashed #008CFF;
                    border-radius: 15px;
                    padding: 25px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(0,140,255,0.04);
                }
                .upload-area:hover { background: rgba(0,140,255,0.08); }

                .change-photo-btn {
                    background: #223BFF;
                    color: #FFF;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    margin-top: 10px;
                    transition: background 0.3s;
                }
                .change-photo-btn:hover { background: #008CFF; }

                .checkbox-group { display: flex; flex-direction: column; gap: 10px; }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 11px 14px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .checkbox-item:hover { background: #e9ecef; }
                .checkbox-item input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
                .checkbox-item label { margin: 0; cursor: pointer; font-weight: 500; }

                .button-group { display: flex; gap: 15px; margin-top: 30px; }

                .btn-submit {
                    flex: 1;
                    padding: 16px;
                    background: linear-gradient(135deg, #008CFF 0%, #223BFF 100%);
                    color: #FFF;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,140,255,0.4); }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                .btn-cancel {
                    flex: 1;
                    padding: 16px;
                    background: #f8f9fa;
                    color: #666;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .btn-cancel:hover { background: #e9ecef; }

                .success-msg {
                    background: linear-gradient(135deg, #00c851, #007e33);
                    color: #FFF;
                    padding: 15px;
                    border-radius: 10px;
                    margin-top: 20px;
                    text-align: center;
                    font-weight: 600;
                }

                .error-msg {
                    background: #FEF2F2;
                    color: #DC2626;
                    padding: 12px 16px;
                    border-radius: 10px;
                    margin-top: 15px;
                    font-weight: 600;
                    border: 1px solid #FECACA;
                }

                @media (max-width: 968px) {
                    .container { grid-template-columns: 1fr; }
                    .form-row { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="main-content">
                <div className="container">

                    {/* ════════════════════════════════════════════════════════
                        PANEL IZQUIERDO: foto de perfil, rol y disponibilidad
                    ════════════════════════════════════════════════════════ */}
                    <div className="left-panel">

                        <div className="current-photo">
                            {imagePreview
                                ? <img src={imagePreview} alt="Foto actual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '👤'
                            }
                        </div>
                        <div className="photo-label">Foto actual</div>

                        <div className="role-badge" onClick={onBackToProfile} title="Volver al perfil">
                            Trabajador
                        </div>

                        <div className="availability-toggle" onClick={() => setIsAvailable(!isAvailable)}>
                            <div className={`toggle-switch ${isAvailable ? 'active' : ''}`}></div>
                            <span className="availability-text">
                                {isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                        </div>
                    </div>

                    {/* ════════════════════════════════════════════════════════
                        PANEL DERECHO: formulario completo de edición
                    ════════════════════════════════════════════════════════ */}
                    <div className="right-panel">
                        <h2>Editar Perfil de Empleado</h2>

                        <form onSubmit={handleSubmit}>

                            {/* ── SECCIÓN 1: Foto de perfil ─────────────────── */}
                            <div className="form-section">
                                <h3 className="section-title">📷 Foto de Perfil</h3>
                                <div
                                    className="upload-area"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />

                                    {imagePreview ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={imagePreview}
                                                alt="Vista previa"
                                                style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '4px solid #008CFF' }}
                                            />
                                            <button type="button" className="change-photo-btn">
                                                Cambiar foto
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ color: '#008CFF', fontWeight: 600, marginBottom: 6, fontSize: 16 }}>
                                                📷 Elegir archivo
                                            </div>
                                            <div style={{ color: '#888', fontSize: 13 }}>
                                                Haz clic para subir una foto · Máximo 5MB · JPG, PNG, WEBP
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* ── SECCIÓN 2: Información Personal ──────────── */}
                            <div className="form-section">
                                <h3 className="section-title">👤 Información Personal</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombre">Nombre completo *</label>
                                        <input
                                            type="text" id="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cedula">Cédula (no editable)</label>
                                        <input type="text" id="cedula" value={formData.cedula} disabled />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="fechaNac">Fecha de Nacimiento</label>
                                        <input
                                            type="date" id="fechaNac"
                                            value={formData.fechaNac}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cargo">Cargo</label>
                                        <input
                                            type="text" id="cargo"
                                            value={formData.cargo}
                                            onChange={handleInputChange}
                                            placeholder="Ej: Técnico de Limpieza Senior"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── SECCIÓN 3: Información de Contacto ───────── */}
                            <div className="form-section">
                                <h3 className="section-title">📧 Información de Contacto</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email">Correo electrónico (no editable)</label>
                                        <input type="email" id="email" value={formData.email} disabled />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telefono">Teléfono *</label>
                                        <input
                                            type="tel" id="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Ej: 3123456789"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="direccion">Dirección</label>
                                    <input
                                        type="text" id="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Calle 80 #45-23, Bogotá"
                                    />
                                </div>
                            </div>

                            {/* ── SECCIÓN 4: Horario de Trabajo ────────────── */}
                            <div className="form-section">
                                <h3 className="section-title">⏰ Horario de Trabajo</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="horaInicio">Hora de Inicio</label>
                                        <input type="time" id="horaInicio" value={formData.horaInicio} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="horaFin">Hora de Fin</label>
                                        <input type="time" id="horaFin" value={formData.horaFin} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Días Laborales</label>
                                    <div className="checkbox-group">
                                        {Object.entries(diasLaborales).map(([dia, checked]) => (
                                            <div key={dia} className="checkbox-item">
                                                <input type="checkbox" id={dia} checked={checked} onChange={handleDiaChange} />
                                                <label htmlFor={dia}>
                                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── SECCIÓN 5: Especialidades ─────────────────── */}
                            <div className="form-section">
                                <h3 className="section-title">⭐ Especialidades</h3>
                                <div className="checkbox-group">
                                    {[
                                        { id: 'sofas',     label: '🛋️ Limpieza de Sofás y Muebles' },
                                        { id: 'colchones', label: '🛏️ Limpieza de Colchones' },
                                        { id: 'sillas',    label: '💺 Limpieza de Sillas' },
                                        { id: 'tapiceria', label: '🎨 Tratamiento de Tapicería Delicada' },
                                    ].map(({ id, label }) => (
                                        <div key={id} className="checkbox-item">
                                            <input type="checkbox" id={id} checked={especialidades[id]} onChange={handleEspecialidadChange} />
                                            <label htmlFor={id}>{label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── SECCIÓN 6: Certificaciones ────────────────── */}
                            <div className="form-section">
                                <h3 className="section-title">🏆 Certificaciones y Capacitaciones</h3>
                                <div className="form-group">
                                    <label htmlFor="certificaciones">
                                        Certificaciones (una por línea o separadas por comas)
                                    </label>
                                    <textarea
                                        id="certificaciones"
                                        value={certificaciones}
                                        onChange={(e) => setCertificaciones(e.target.value)}
                                        placeholder="Ej: Técnicas de Limpieza de Tapicería, Manejo de Productos Químicos..."
                                    />
                                </div>
                            </div>

                            {/* ── SECCIÓN 7: Cambiar Contraseña ─────────────── */}
                            <div className="form-section">
                                <h3 className="section-title">🔐 Cambiar Contraseña</h3>
                                <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>
                                    Deja estos campos vacíos si no deseas cambiar tu contraseña.
                                </p>
                                <div className="form-group">
                                    <label htmlFor="passwordActual">Contraseña actual</label>
                                    <input type="password" id="passwordActual" placeholder="••••••••" value={formData.passwordActual} onChange={handleInputChange} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="passwordNueva">Nueva contraseña</label>
                                        <input type="password" id="passwordNueva" placeholder="••••••••" value={formData.passwordNueva} onChange={handleInputChange} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="passwordConfirmar">Confirmar nueva contraseña</label>
                                        <input type="password" id="passwordConfirmar" placeholder="••••••••" value={formData.passwordConfirmar} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* ── Mensajes de feedback ──────────────────────── */}
                            {errorMsg    && <div className="error-msg">❌ {errorMsg}</div>}
                            {showSuccess && <div className="success-msg">✓ Perfil actualizado correctamente</div>}

                            {/* ── Botones de acción ─────────────────────────── */}
                            <div className="button-group">
                                <button type="button" className="btn-cancel" onClick={onBackToProfile} disabled={isSaving}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit" disabled={isSaving}>
                                    {isSaving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilTrabajadorEdi;