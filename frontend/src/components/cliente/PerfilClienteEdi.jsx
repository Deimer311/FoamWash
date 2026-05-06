// =============================================================================
// ARCHIVO  : PerfilClienteEdi.jsx — REDISEÑO PREMIUM v2
// PROYECTO : FoamWash
// NOTA     : Diseño unificado con PerfilCliente. Lógica 100% intacta.
//            Todos los emojis reemplazados por SVG. Layout corregido.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../autenticacion/AuthContext';
import api         from '../../services/api';
import HeaderCliente from './HeaderCliente';

const axiosUpload = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

const API_BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// ── SVG icons ────────────────────────────────────────────────────────────────
const IconUser = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);
const IconMail = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);
const IconPhone = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 12 19.79 19.79 0 0 1 1.04 3.38 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);
const IconMapPin = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
);
const IconCamera = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
    </svg>
);
const IconLock = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const IconEdit = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const IconSave = ({ size = 18, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>
);
const IconAlert = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
const IconCheck = ({ size = 18, color = 'white' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IconX = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
);
const IconUpload = ({ size = 32, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
);
const IconSpinner = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.21-8.58"/>
    </svg>
);

// ── CardIcon (igual que PerfilCliente) ───────────────────────────────────────
const CardIcon = ({ children }) => (
    <span style={{
        width: 34, height: 34,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #1a56ff, #7c3aed)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(26,86,255,0.3)',
    }}>
        {children}
    </span>
);

// ─────────────────────────────────────────────────────────────────────────────

const PerfilClienteEdi = ({ onBackToProfile, onBackToHome }) => {
    const { user, updateUser, refreshUser } = useAuth();

    const [imagePreview, setImagePreview] = useState(null);
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

    useEffect(() => {
        if (!user?.id) return;
        const cargar = async () => {
            try {
                const res = await api.get('/clientes/' + user.id + '/perfil');
                if (res.data.success) {
                    const p = res.data.data;
                    setFormData(prev => ({
                        ...prev,
                        nombre:    p.Nombre      || '',
                        email:     p.Correo      || '',
                        telefono:  p.Telefono    || '',
                        direccion: p.Direccion   || '',
                        numDoc:    p.N_Documento || '',
                        tipoDoc:   p.tipo_documento || 'CC'
                    }));
                    if (p.foto_perfil) {
                        const url = p.foto_perfil.startsWith('http')
                            ? p.foto_perfil
                            : `${API_BASE_URL}${p.foto_perfil}`;
                        setImagePreview(url);
                    }
                }
            } catch { setError('No se pudieron cargar los datos del perfil.'); }
            finally  { setIsLoading(false); }
        };
        cargar();
    }, [user?.id]);

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
        setGuardando(true); setError('');
        try {
            if (archivoFoto) {
                const fd = new FormData();
                fd.append('foto', archivoFoto);
                const fotoRes = await axiosUpload.post(`/clientes/${user.id}/foto`, fd);
                if (fotoRes.data?.data?.foto_perfil) updateUser({ foto_perfil: fotoRes.data.data.foto_perfil });
            }
            await api.put('/clientes/' + user.id + '/perfil', {
                Nombre:    formData.nombre,
                Telefono:  formData.telefono,
                Direccion: formData.direccion
            });
            await refreshUser();
            setShowSuccess(true);
            setTimeout(() => { setShowSuccess(false); if (onBackToProfile) onBackToProfile(); }, 2000);
        } catch (err) {
            console.error('ERROR:', err?.response?.data || err);
            setError('No se pudieron guardar los cambios. Intenta nuevamente.');
        } finally { setGuardando(false); }
    };

    const handleCancel = () => { if (onBackToProfile) onBackToProfile(); };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
                <p style={{ fontSize: 16, color: '#1a56ff', fontFamily: 'Kanit' }}>Cargando perfil...</p>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* ── Reset & base ── */
                .pce-page {
                    background: #f6f7fb;
                    min-height: 100vh;
                }
                .pce-wrap {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 104px 40px 80px;
                    animation: pceIn 0.4s ease-out both;
                }
                @keyframes pceIn {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Layout ── */
                .pce-layout {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 28px;
                    align-items: start;
                }

                /* ══════════════════════════════════════
                   SIDEBAR — espejo exacto de PerfilCliente
                ══════════════════════════════════════ */
                .pce-sidebar {
                    position: sticky;
                    top: 104px;
                    background: linear-gradient(160deg, #1a56ff 0%, #7c3aed 100%);
                    border-radius: 20px;
                    padding: 36px 24px;
                    color: #fff;
                    box-shadow: 0 12px 40px rgba(26,86,255,0.28);
                    overflow: hidden;
                    text-align: center;
                }
                .pce-sidebar::before {
                    content: '';
                    position: absolute;
                    width: 180px; height: 180px;
                    background: rgba(255,255,255,0.07);
                    border-radius: 50%;
                    top: -50px; right: -50px;
                    pointer-events: none;
                }
                .pce-sidebar::after {
                    content: '';
                    position: absolute;
                    width: 120px; height: 120px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    bottom: -40px; left: -40px;
                    pointer-events: none;
                }

                /* Avatar */
                .pce-avatar {
                    width: 110px; height: 110px;
                    border-radius: 50%;
                    margin: 0 auto 8px;
                    border: 3px solid rgba(255,255,255,0.5);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
                    background: rgba(255,255,255,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                    cursor: pointer;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .pce-avatar:hover {
                    transform: scale(1.04);
                    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
                }
                .pce-avatar img { width: 100%; height: 100%; object-fit: cover; }

                .pce-avatar-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.38);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.22s ease;
                    border-radius: 50%;
                }
                .pce-avatar:hover .pce-avatar-overlay { opacity: 1; }

                .pce-photo-hint {
                    font-size: 11px;
                    color: rgba(255,255,255,0.6);
                    margin-bottom: 14px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Kanit', sans-serif;
                }

                /* Role badge */
                .pce-role-badge {
                    display: inline-block;
                    padding: 4px 18px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.22);
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    margin-bottom: 24px;
                    position: relative;
                    z-index: 1;
                    font-family: 'Kanit', sans-serif;
                }

                /* Info items */
                .pce-info-list {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                    position: relative;
                    z-index: 1;
                    margin-bottom: 20px;
                }
                .pce-info-item {
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 11px;
                    padding: 10px 13px;
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    text-align: left;
                    font-size: 13px;
                    color: #fff;
                    word-break: break-all;
                    font-family: 'Kanit', sans-serif;
                }

                /* Upload btn sidebar */
                .pce-upload-btn {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    padding: 11px;
                    background: rgba(255,255,255,0.15);
                    border: 1.5px solid rgba(255,255,255,0.35);
                    border-radius: 12px;
                    color: #fff;
                    font-family: 'Kanit', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: background 0.22s ease, border-color 0.22s ease;
                }
                .pce-upload-btn:hover {
                    background: rgba(255,255,255,0.24);
                    border-color: rgba(255,255,255,0.6);
                }

                /* ══════════════════════════════════════
                   PANEL DERECHO — formulario
                ══════════════════════════════════════ */
                .pce-form-panel {
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 2px 20px rgba(0,0,0,0.06);
                    overflow: hidden;
                }

                /* ── Secciones dentro del form panel ── */
                .pce-card {
                    padding: 28px 32px;
                    border-bottom: 1px solid #f0f1f8;
                    transition: background 0.2s;
                }
                .pce-card:last-child { border-bottom: none; }

                /* Card title — igual que PerfilCliente */
                .pce-card-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 800;
                    color: #0a1435;
                    font-family: 'Kanit', sans-serif;
                    margin-bottom: 22px;
                    letter-spacing: -0.2px;
                }

                /* Warning banner */
                .pce-warning {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: #fffbeb;
                    border-left: 3px solid #f59e0b;
                    border-radius: 0 10px 10px 0;
                    color: #92400e;
                    font-size: 13px;
                    font-family: 'Kanit', sans-serif;
                    margin-bottom: 0;
                }

                /* Error banner */
                .pce-error {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: #fef2f2;
                    border-left: 3px solid #ef4444;
                    border-radius: 0 10px 10px 0;
                    color: #b91c1c;
                    font-size: 13px;
                    font-family: 'Kanit', sans-serif;
                }

                /* ── Foto upload area ── */
                .pce-photo-drop {
                    border: 2px dashed #c7d2fe;
                    border-radius: 14px;
                    padding: 28px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    background: #fafbff;
                    transition: border-color 0.22s ease, background 0.22s ease;
                }
                .pce-photo-drop:hover {
                    border-color: #1a56ff;
                    background: #f0f2ff;
                }
                .pce-photo-preview-img {
                    width: 96px; height: 96px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #1a56ff;
                    box-shadow: 0 4px 16px rgba(26,86,255,0.2);
                }
                .pce-photo-placeholder {
                    width: 72px; height: 72px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(26,86,255,0.1), rgba(124,58,237,0.1));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pce-photo-label-main {
                    font-size: 14px;
                    font-weight: 700;
                    color: #1a56ff;
                    font-family: 'Kanit', sans-serif;
                }
                .pce-photo-label-sub {
                    font-size: 12px;
                    color: #aaa;
                    font-family: 'Kanit', sans-serif;
                }
                .pce-change-photo-btn {
                    padding: 7px 20px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                }
                .pce-change-photo-btn:hover { opacity: 0.88; transform: translateY(-1px); }

                /* ── Form grid ── */
                .pce-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 18px;
                }
                .pce-grid-3 {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 18px;
                }

                /* ── Form group ── */
                .pce-fg { display: flex; flex-direction: column; gap: 6px; }
                .pce-fg label {
                    font-size: 11px;
                    font-weight: 700;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-family: 'Kanit', sans-serif;
                }
                .pce-fg input,
                .pce-fg select {
                    padding: 12px 15px;
                    font-size: 14px;
                    font-family: 'Kanit', sans-serif;
                    border: 1.5px solid #e0e4ef;
                    border-radius: 10px;
                    background: #f8f9ff;
                    color: #111;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    box-sizing: border-box;
                }
                .pce-fg input:focus,
                .pce-fg select:focus {
                    border-color: #1a56ff;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(26,86,255,0.09);
                }
                .pce-fg input:disabled {
                    background: #f4f5f9;
                    color: #aaa;
                    cursor: not-allowed;
                    border-color: #eaedf5;
                }

                /* Password hint */
                .pce-pass-hint {
                    font-size: 12px;
                    color: #bbb;
                    font-family: 'Kanit', sans-serif;
                    margin: -10px 0 16px;
                }

                /* ── Buttons ── */
                .pce-btn-row {
                    display: flex;
                    gap: 12px;
                }
                .pce-btn-cancel {
                    flex: 1;
                    padding: 14px;
                    background: #f4f5f9;
                    color: #555;
                    border: 1.5px solid #e0e4ef;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s;
                }
                .pce-btn-cancel:hover { background: #ebedf5; border-color: #c5cadf; }

                .pce-btn-save {
                    flex: 2;
                    padding: 14px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 16px rgba(26,86,255,0.28);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
                }
                .pce-btn-save:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.07);
                    box-shadow: 0 8px 24px rgba(26,86,255,0.36);
                }
                .pce-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .pce-spin { animation: spin 0.8s linear infinite; display: inline-block; }

                /* ── Toast ── */
                .pce-toast {
                    position: fixed;
                    top: 88px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    color: #fff;
                    padding: 13px 32px;
                    border-radius: 50px;
                    font-weight: 700;
                    font-size: 14px;
                    font-family: 'Kanit', sans-serif;
                    z-index: 9999;
                    box-shadow: 0 4px 24px rgba(22,163,74,0.35);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-14px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                /* ── Responsive ── */
                @media (max-width: 860px) {
                    .pce-layout { grid-template-columns: 1fr; }
                    .pce-sidebar { position: static; }
                    .pce-wrap { padding: 96px 20px 60px; }
                    .pce-grid { grid-template-columns: 1fr; }
                    .pce-grid-3 { grid-template-columns: 1fr; }
                    .pce-card { padding: 22px 20px; }
                }
            `}</style>

            {/* ── Toast de éxito ── */}
            {showSuccess && (
                <div className="pce-toast">
                    <IconCheck size={18} color="white" />
                    Perfil actualizado correctamente
                </div>
            )}

            <div className="pce-page">
                <HeaderCliente
                    onBackToHome={onBackToHome}
                    onPerfil={onBackToProfile}
                    activeLink="perfil"
                />

                <div className="pce-wrap">
                    <div className="pce-layout">

                        {/* ══════════════ SIDEBAR ══════════════ */}
                        <div className="pce-sidebar">
                            <div
                                className="pce-avatar"
                                onClick={() => fileInputRef.current?.click()}
                                title="Clic para cambiar foto"
                            >
                                {imagePreview
                                    ? <img src={imagePreview} alt="Foto" />
                                    : <IconUser size={52} color="rgba(255,255,255,0.8)" />
                                }
                                <div className="pce-avatar-overlay">
                                    <IconCamera size={22} color="white" />
                                </div>
                            </div>
                            <div className="pce-photo-hint">Clic en la foto para cambiarla</div>

                            <div className="pce-role-badge">Cliente</div>

                            <div className="pce-info-list">
                                <div className="pce-info-item">
                                    <IconUser size={14} color="rgba(255,255,255,0.8)" />
                                    <span>{formData.nombre || 'Sin nombre'}</span>
                                </div>
                                <div className="pce-info-item">
                                    <IconMail size={14} color="rgba(255,255,255,0.8)" />
                                    <span>{formData.email || '—'}</span>
                                </div>
                                <div className="pce-info-item">
                                    <IconPhone size={14} color="rgba(255,255,255,0.8)" />
                                    <span>{formData.telefono || '—'}</span>
                                </div>
                                <div className="pce-info-item">
                                    <IconMapPin size={14} color="rgba(255,255,255,0.8)" />
                                    <span>{formData.direccion || '—'}</span>
                                </div>
                            </div>

                            <button type="button" className="pce-upload-btn" onClick={() => fileInputRef.current?.click()}>
                                <IconCamera size={15} color="white" />
                                {imagePreview ? 'Cambiar foto' : 'Subir foto'}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* ══════════════ FORMULARIO ══════════════ */}
                        <div className="pce-form-panel">

                            {/* — Header de la tarjeta — */}
                            <div className="pce-card" style={{ background: 'linear-gradient(135deg, rgba(26,86,255,0.03), rgba(124,58,237,0.03))' }}>
                                <div className="pce-card-title">
                                    <CardIcon><IconEdit size={16} color="white" /></CardIcon>
                                    Editar Perfil
                                </div>
                                <div className="pce-warning">
                                    <IconAlert size={15} color="#d97706" />
                                    El correo electrónico no puede modificarse desde aquí.
                                </div>
                            </div>

                            {/* — Error banner — */}
                            {error && (
                                <div className="pce-card" style={{ padding: '16px 32px' }}>
                                    <div className="pce-error">
                                        <IconX size={15} color="#b91c1c" />
                                        {error}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* — Foto de perfil — */}
                                <div className="pce-card">
                                    <div className="pce-card-title">
                                        <CardIcon><IconCamera size={16} color="white" /></CardIcon>
                                        Foto de Perfil
                                    </div>
                                    <div
                                        className="pce-photo-drop"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Vista previa" className="pce-photo-preview-img" />
                                                <button type="button" className="pce-change-photo-btn">
                                                    Cambiar foto
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <div className="pce-photo-placeholder">
                                                    <IconUpload size={28} color="#1a56ff" />
                                                </div>
                                                <div className="pce-photo-label-main">Elegir archivo</div>
                                                <div className="pce-photo-label-sub">JPG, PNG, WEBP · máx. 5 MB</div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* — Información Personal — */}
                                <div className="pce-card">
                                    <div className="pce-card-title">
                                        <CardIcon><IconUser size={16} color="white" /></CardIcon>
                                        Información Personal
                                    </div>
                                    <div className="pce-grid">
                                        <div className="pce-fg">
                                            <label htmlFor="nombre">Nombre Completo *</label>
                                            <input
                                                id="nombre"
                                                type="text"
                                                value={formData.nombre}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Tu nombre completo"
                                            />
                                        </div>
                                        <div className="pce-fg">
                                            <label>Correo Electrónico</label>
                                            <input type="email" value={formData.email} disabled />
                                        </div>
                                        <div className="pce-fg">
                                            <label htmlFor="telefono">Teléfono</label>
                                            <input
                                                id="telefono"
                                                type="tel"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                placeholder="3123456789"
                                            />
                                        </div>
                                        <div className="pce-fg">
                                            <label htmlFor="direccion">Dirección</label>
                                            <input
                                                id="direccion"
                                                type="text"
                                                value={formData.direccion}
                                                onChange={handleInputChange}
                                                placeholder="Calle 80 #45-23, Bogotá"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* — Cambiar Contraseña — */}
                                <div className="pce-card">
                                    <div className="pce-card-title">
                                        <CardIcon><IconLock size={16} color="white" /></CardIcon>
                                        Cambiar Contraseña
                                    </div>
                                    <p className="pce-pass-hint">
                                        Deja estos campos vacíos si no deseas cambiar tu contraseña.
                                    </p>
                                    <div className="pce-grid-3">
                                        <div className="pce-fg">
                                            <label htmlFor="passwordActual">Contraseña Actual</label>
                                            <input
                                                id="passwordActual"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.passwordActual}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="pce-fg">
                                            <label htmlFor="passwordNueva">Nueva Contraseña</label>
                                            <input
                                                id="passwordNueva"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.passwordNueva}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="pce-fg">
                                            <label htmlFor="passwordConfirmar">Confirmar Contraseña</label>
                                            <input
                                                id="passwordConfirmar"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.passwordConfirmar}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* — Botones — */}
                                <div className="pce-card">
                                    <div className="pce-btn-row">
                                        <button type="button" className="pce-btn-cancel" onClick={handleCancel}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="pce-btn-save" disabled={guardando}>
                                            {guardando
                                                ? <><span className="pce-spin"><IconSpinner size={16} /></span> Guardando...</>
                                                : <><IconSave size={16} color="white" /> Guardar Cambios</>
                                            }
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

export default PerfilClienteEdi;