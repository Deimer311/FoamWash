// =============================================================================
// ARCHIVO  : PerfilAdminEdi.jsx — REDISEÑO PREMIUM
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
    withCredentials: true,
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

const PerfilAdminEdi = ({ onBackToProfile, onBackToHome }) => {
  const { user, updateUser, refreshUser } = useAuth();
  const [imagePreview, setImagePreview] = useState(null);
  const [archivoFoto,  setArchivoFoto]  = useState(null);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [guardando,    setGuardando]    = useState(false);
  const [errorMsg,     setErrorMsg]     = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: 'Administrador General',
    cedula: '',
    tipoDocId: 1,
    departamento: 'Administración',
    email: '',
    emailAlt: '',
    telefono: '',
    telefonoAlt: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: '',
    notifEmail: 'todas',
    notifSMS: 'importantes'
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    const cargar = async () => {
      try {
        const res = await api.get(`/usuarios/${user.id}`);
        if (res.data.success) {
          const d = res.data.data;
          setFormData(prev => ({
            ...prev,
            nombre:    d.Nombre   || '',
            email:     d.Correo   || '',
            telefono:  d.Telefono || '',
            cedula:    d.N_Documento || '',
            tipoDocId: d.tipo_de_documento?.idTipo_de_Documento || 1,
          }));
          if (d.foto_perfil) {
            const url = d.foto_perfil.startsWith('http')
                ? d.foto_perfil
                : `${API_BASE_URL}${d.foto_perfil}`;
            setImagePreview(url);
          }
        }
      } catch (err) {
        console.error('❌ Error al cargar perfil admin:', err);
        setErrorMsg('No se pudieron cargar los datos del perfil.');
      } finally {
        setIsLoading(false);
      }
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

  const handleUploadClick  = () => fileInputRef.current?.click();
  const handleChangePhoto  = () => fileInputRef.current?.click();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let finalValue = value;
    if (id === 'nombre') {
      finalValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    setFormData(prev => ({ ...prev, [id]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.passwordNueva && formData.passwordNueva !== formData.passwordConfirmar) {
      setErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }

    setGuardando(true);
    try {
      if (archivoFoto) {
        const fd = new FormData();
        fd.append('foto', archivoFoto);
        await axiosUpload.post(`/usuarios/${user.id}/foto`, fd);
      }

      await api.put(`/usuarios/${user.id}`, {
        Nombre:   formData.nombre,
        Telefono: formData.telefono,
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
      console.error('❌ Error al guardar perfil admin:', err);
      setErrorMsg('No se pudieron guardar los cambios. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f6f7fb' }}>
        <p style={{ fontSize: 16, color: '#1a56ff', fontFamily: 'Kanit' }}>⏳ Cargando perfil...</p>
      </div>
    );
  }

  /* ── Estilos inline (mismo estándar que PerfilClienteEdi) ─────────────── */
  const S = {
    page: {
      background: '#f6f7fb',
      minHeight: '100vh',
    },
    main: {
      maxWidth: '1300px',
      margin: '0 auto',
      padding: '156px 40px 80px',
    },
    container: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '28px',
      animation: 'paeiFadeUp 0.5s ease-out',
    },
    /* ── Sidebar ── */
    sidebar: {
      position: 'sticky',
      top: '120px',
      height: 'fit-content',
      background: 'linear-gradient(160deg, #1a56ff 0%, #7c3aed 100%)',
      borderRadius: '20px',
      padding: '36px 28px',
      color: '#fff',
      boxShadow: '0 12px 40px rgba(26,86,255,0.28)',
      overflow: 'hidden',
      textAlign: 'center',
    },
    photo: {
      width: '110px', height: '110px',
      borderRadius: '50%',
      margin: '0 auto 20px',
      border: '3px solid rgba(255,255,255,0.5)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      background: 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '44px',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1,
      cursor: 'pointer',
    },
    photoImg: {
      width: '100%', height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
    },
    photoHint: {
      fontSize: '11px',
      opacity: 0.75,
      fontFamily: 'Kanit',
      marginBottom: '14px',
      position: 'relative',
      zIndex: 1,
    },
    name: {
      fontSize: '20px',
      fontWeight: 700,
      marginBottom: '8px',
      position: 'relative',
      zIndex: 1,
      fontFamily: 'Kanit',
    },
    role: {
      display: 'inline-block',
      padding: '4px 16px',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: '16px',
      position: 'relative',
      zIndex: 1,
      fontFamily: 'Kanit',
    },
    badgeRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '20px',
      position: 'relative',
      zIndex: 1,
    },
    badge: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.14)',
      border: '1px solid rgba(255,255,255,0.18)',
      backdropFilter: 'blur(6px)',
      borderRadius: '12px',
      padding: '10px 14px',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: 'Kanit',
    },
    editBtn: {
      width: '100%',
      padding: '13px',
      background: 'rgba(255,255,255,0.95)',
      color: '#1a56ff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'Kanit',
      cursor: 'pointer',
      position: 'relative',
      zIndex: 1,
      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
    },
    /* ── Right ── */
    right: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      minWidth: 0,
    },
    card: {
      background: '#fff',
      borderRadius: '18px',
      padding: '28px',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    cardTitle: {
      fontSize: '17px',
      fontWeight: 700,
      color: '#0a1435',
      marginBottom: '22px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontFamily: 'Kanit',
    },
    cardIcon: {
      width: '32px', height: '32px',
      background: 'linear-gradient(135deg, #1a56ff, #7c3aed)',
      borderRadius: '9px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      flexShrink: 0,
    },
    /* ── Form ── */
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '18px',
    },
    formGrid3: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '18px',
    },
    fg: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    label: {
      fontSize: '10px',
      fontWeight: 700,
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      fontFamily: 'Kanit',
    },
    input: {
      width: '100%',
      padding: '11px 14px',
      border: '1.5px solid #e5e7ef',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'Kanit',
      color: '#111',
      background: '#fff',
      outline: 'none',
      transition: 'border-color 0.2s ease',
    },
    inputFocus: {
      borderColor: '#1a56ff',
      boxShadow: '0 0 0 3px rgba(26,86,255,0.1)',
    },
    inputDisabled: {
      background: '#f6f7fb',
      color: '#aaa',
      cursor: 'not-allowed',
    },
    select: {
      width: '100%',
      padding: '11px 14px',
      border: '1.5px solid #e5e7ef',
      borderRadius: '10px',
      fontSize: '14px',
      fontFamily: 'Kanit',
      color: '#111',
      background: '#fff',
      outline: 'none',
    },
    /* ── Photo drop ── */
    photoDrop: {
      border: '2px dashed rgba(26,86,255,0.3)',
      borderRadius: '14px',
      padding: '32px',
      textAlign: 'center',
      cursor: 'pointer',
      background: 'rgba(26,86,255,0.03)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    },
    photoPreview: {
      width: '100px', height: '100px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #1a56ff',
      boxShadow: '0 4px 14px rgba(26,86,255,0.25)',
    },
    changePhotoBtn: {
      background: '#1a56ff',
      color: '#fff',
      border: 'none',
      padding: '8px 20px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 700,
      fontFamily: 'Kanit',
    },
    /* ── Permission grid ── */
    permGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    permCard: {
      background: '#f6f7fb',
      padding: '16px',
      borderRadius: '12px',
      borderLeft: '3px solid #1a56ff',
    },
    permHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '6px',
    },
    permTitle: {
      fontWeight: 700,
      fontSize: '13px',
      color: '#111',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: 'Kanit',
    },
    permToggle: {
      width: '40px', height: '22px',
      background: '#22c55e',
      borderRadius: '11px',
      position: 'relative',
      flexShrink: 0,
    },
    permDesc: {
      fontSize: '11px',
      color: '#999',
      fontFamily: 'Kanit',
    },
    /* ── Alert ── */
    alertBox: {
      background: '#fffbeb',
      border: '1px solid #fde68a',
      borderLeft: '4px solid #f59e0b',
      borderRadius: '10px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '0',
    },
    alertText: {
      fontSize: '13px',
      color: '#92400e',
      fontFamily: 'Kanit',
      fontWeight: 500,
    },
    /* ── Buttons ── */
    btnRow: {
      display: 'flex',
      gap: '14px',
    },
    btnSave: {
      flex: 1,
      padding: '14px',
      background: 'linear-gradient(135deg, #1a56ff, #7c3aed)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'Kanit',
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(26,86,255,0.3)',
    },
    btnCancel: {
      flex: 1,
      padding: '14px',
      background: '#f6f7fb',
      color: '#666',
      border: '1.5px solid #e5e7ef',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      fontFamily: 'Kanit',
      cursor: 'pointer',
    },
    /* ── Success / Error ── */
    successMsg: {
      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
      color: '#fff',
      padding: '14px',
      borderRadius: '12px',
      textAlign: 'center',
      fontWeight: 700,
      fontFamily: 'Kanit',
    },
    errorMsg: {
      background: '#fff0f0',
      border: '1.5px solid #fecaca',
      color: '#b91c1c',
      padding: '12px 16px',
      borderRadius: '10px',
      fontSize: '13px',
      fontFamily: 'Kanit',
    },
  };

  return (
    <>
      <style>{`
        @keyframes paeiFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .paei-sidebar::before,
        .paei-sidebar::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.07);
          pointer-events: none;
        }
        .paei-sidebar::before {
          width: 200px; height: 200px;
          top: -60px; right: -60px;
          animation: paeiFloat 7s ease-in-out infinite;
        }
        .paei-sidebar::after {
          width: 130px; height: 130px;
          bottom: -40px; left: -40px;
          animation: paeiFloat 9s ease-in-out infinite reverse;
        }
        @keyframes paeiFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%       { transform: translate(8px,-12px) scale(1.08); }
        }
        .paei-input:focus {
          border-color: #1a56ff !important;
          box-shadow: 0 0 0 3px rgba(26,86,255,0.1) !important;
          outline: none;
        }
        .paei-card:hover {
          box-shadow: 0 8px 28px rgba(26,86,255,0.10) !important;
          transform: translateY(-2px);
        }
        .paei-photo-drop:hover {
          border-color: rgba(26,86,255,0.5) !important;
          background: rgba(26,86,255,0.06) !important;
        }
        .paei-perm-card:hover {
          background: #eef2ff !important;
          transform: translateX(3px);
        }
        @media (max-width: 1024px) {
          .paei-container { grid-template-columns: 260px 1fr !important; }
          .paei-main { padding: 140px 24px 60px !important; }
          .paei-form-grid { grid-template-columns: 1fr !important; }
          .paei-perm-grid { grid-template-columns: 1fr !important; }
          .paei-form-grid3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .paei-container { grid-template-columns: 1fr !important; }
          .paei-sidebar { position: static !important; }
          .paei-main { padding: 120px 16px 60px !important; }
        }
      `}</style>

      <div style={S.page}>
        <div className="paei-main" style={S.main}>
          <div className="paei-container" style={S.container}>

            {/* ══════════════════════════════
                SIDEBAR
            ══════════════════════════════ */}
            <div
              className="paei-sidebar"
              style={S.sidebar}
            >
              {/* Foto (clickeable para cambiar) */}
              <div
                style={S.photo}
                onClick={handleUploadClick}
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
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <p style={S.photoHint}>Clic en la foto para cambiarla</p>

              <div style={S.name}>{formData.nombre || 'Administrador'}</div>
              <div style={S.role}>Administrador</div>

              <div style={S.badgeRow}>
                {[
                  { icon: '🔐', label: 'Acceso Total' },
                  { icon: '⚡', label: 'Super Usuario' },
                  { icon: '🛡️', label: 'Seguridad Máxima' },
                ].map((b, i) => (
                  <div key={i} style={S.badge}>
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
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

              {/* ── Alerta ── */}
              <div style={S.alertBox}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span style={S.alertText}>Los cambios en permisos afectarán el acceso del administrador al sistema</span>
              </div>

              {/* ── Mensajes feedback ── */}
              {errorMsg && <div style={S.errorMsg}>❌ {errorMsg}</div>}
              {showSuccess && <div style={S.successMsg}>✓ Perfil actualizado correctamente</div>}

              {/* ── Foto de Perfil ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>📷</span>
                  Foto de Perfil
                </div>
                <div
                  className="paei-photo-drop"
                  style={S.photoDrop}
                  onClick={handleUploadClick}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Vista previa" style={S.photoPreview} />
                      <button type="button" style={S.changePhotoBtn} onClick={(e) => { e.stopPropagation(); handleChangePhoto(); }}>
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

              {/* ── Información del Administrador ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>👤</span>
                  Información del Administrador
                </div>
                <div className="paei-form-grid" style={S.formGrid}>
                  {[
                    { id: 'nombre',   label: 'Nombre Completo *',    type: 'text',  placeholder: 'Tu nombre completo', required: true },
                    { id: 'cargo',    label: 'Cargo *',               type: 'text',  placeholder: 'Administrador General', required: true },
                  ].map(f => (
                    <div key={f.id} style={S.fg}>
                      <label style={S.label}>{f.label}</label>
                      <input
                        className="paei-input"
                        id={f.id}
                        type={f.type}
                        value={formData[f.id]}
                        onChange={handleInputChange}
                        placeholder={f.placeholder}
                        required={f.required}
                        style={S.input}
                      />
                    </div>
                  ))}
                  <div style={S.fg}>
                    <label style={S.label}>Tipo de Documento *</label>
                    <select
                      id="tipoDocId"
                      value={formData.tipoDocId}
                      onChange={handleInputChange}
                      style={S.select}
                    >
                      {TIPOS_DOCUMENTO.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>Número de Documento *</label>
                    <input
                      className="paei-input"
                      id="cedula"
                      type="text"
                      value={formData.cedula}
                      onChange={handleInputChange}
                      placeholder="Ej: 1234567890"
                      style={S.input}
                    />
                  </div>
                </div>
              </div>

              {/* ── Información de Contacto ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>📧</span>
                  Información de Contacto
                </div>
                <div className="paei-form-grid" style={S.formGrid}>
                  {[
                    { id: 'email',      label: 'Correo Corporativo *',   type: 'email', placeholder: 'admin@empresa.com',     required: true  },
                    { id: 'emailAlt',   label: 'Correo Alternativo',      type: 'email', placeholder: 'correo.alt@email.com',  required: false },
                    { id: 'telefono',   label: 'Teléfono Principal *',    type: 'tel',   placeholder: '+57 300 000 0000',       required: true  },
                    { id: 'telefonoAlt',label: 'Teléfono Alternativo',    type: 'tel',   placeholder: '+57 300 000 0000',       required: false },
                  ].map(f => (
                    <div key={f.id} style={S.fg}>
                      <label style={S.label}>{f.label}</label>
                      <input
                        className="paei-input"
                        id={f.id}
                        type={f.type}
                        value={formData[f.id]}
                        onChange={handleInputChange}
                        placeholder={f.placeholder}
                        required={f.required}
                        style={S.input}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Permisos del Sistema ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>🔐</span>
                  Permisos del Sistema
                </div>
                <div className="paei-perm-grid" style={S.permGrid}>
                  {[
                    { icon: '👥', title: 'Gestión de Usuarios',   desc: 'Crear, editar y eliminar usuarios' },
                    { icon: '👨‍💼', title: 'Gestión de Empleados',  desc: 'Administrar personal y horarios'   },
                    { icon: '💰', title: 'Acceso Financiero',      desc: 'Ver y gestionar finanzas'          },
                    { icon: '📊', title: 'Reportes Avanzados',     desc: 'Generar y exportar reportes'       },
                    { icon: '⚙️', title: 'Configuración Sistema',  desc: 'Modificar parámetros del sistema'  },
                    { icon: '🔒', title: 'Seguridad y Auditoría',  desc: 'Acceso a logs y auditorías'        }
                  ].map((perm, idx) => (
                    <div key={idx} className="paei-perm-card" style={{ ...S.permCard, transition: 'all 0.2s ease' }}>
                      <div style={S.permHeader}>
                        <span style={S.permTitle}>
                          <span>{perm.icon}</span>
                          <span>{perm.title}</span>
                        </span>
                        <div style={S.permToggle}>
                          <div style={{
                            position: 'absolute',
                            width: '18px', height: '18px',
                            background: '#fff',
                            borderRadius: '50%',
                            top: '2px', right: '2px',
                          }} />
                        </div>
                      </div>
                      <p style={S.permDesc}>{perm.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Cambiar Contraseña ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>🔑</span>
                  Cambiar Contraseña
                </div>
                <p style={{ fontSize: '13px', color: '#aaa', fontFamily: 'Kanit', marginBottom: '18px' }}>
                  Deja estos campos vacíos si no deseas cambiar tu contraseña.
                </p>
                <div style={{ ...S.fg, marginBottom: '18px' }}>
                  <label style={S.label}>Contraseña Actual</label>
                  <input
                    className="paei-input"
                    id="passwordActual"
                    type="password"
                    value={formData.passwordActual}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    style={S.input}
                  />
                </div>
                <div className="paei-form-grid" style={S.formGrid}>
                  {[
                    { id: 'passwordNueva',     label: 'Nueva Contraseña'    },
                    { id: 'passwordConfirmar', label: 'Confirmar Contraseña' },
                  ].map(f => (
                    <div key={f.id} style={S.fg}>
                      <label style={S.label}>{f.label}</label>
                      <input
                        className="paei-input"
                        id={f.id}
                        type="password"
                        value={formData[f.id]}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        style={S.input}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Notificaciones ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.cardTitle}>
                  <span style={S.cardIcon}>🔔</span>
                  Notificaciones
                </div>
                <div className="paei-form-grid" style={S.formGrid}>
                  <div style={S.fg}>
                    <label style={S.label}>Notificaciones por Email</label>
                    <select id="notifEmail" value={formData.notifEmail} onChange={handleInputChange} style={S.select}>
                      <option value="todas">Todas las notificaciones</option>
                      <option value="importantes">Solo importantes</option>
                      <option value="ninguna">Ninguna</option>
                    </select>
                  </div>
                  <div style={S.fg}>
                    <label style={S.label}>Notificaciones por SMS</label>
                    <select id="notifSMS" value={formData.notifSMS} onChange={handleInputChange} style={S.select}>
                      <option value="importantes">Solo importantes</option>
                      <option value="todas">Todas las notificaciones</option>
                      <option value="ninguna">Ninguna</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Botones ── */}
              <div className="paei-card" style={S.card}>
                <div style={S.btnRow}>
                  <button
                    type="button"
                    style={S.btnCancel}
                    onClick={() => onBackToProfile ? onBackToProfile() : window.history.back()}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e9ebf5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f6f7fb'; }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    style={{ ...S.btnSave, opacity: guardando ? 0.75 : 1 }}
                    onClick={handleSubmit}
                    disabled={guardando}
                    onMouseEnter={e => { if (!guardando) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                  >
                    {guardando ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PerfilAdminEdi;