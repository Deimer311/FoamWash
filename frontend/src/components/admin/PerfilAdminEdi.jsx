// =============================================================================
// ARCHIVO  : PerfilAdminEdi.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/admin/PerfilAdminEdi.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Formulario de edición del perfil del administrador.
// =============================================================================

import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';

const PerfilAdminEdi = ({ onBackToProfile, onBackToHome }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: 'Administrador General',
    cedula: '',
    departamento: '',
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const data = res.data?.data || res.data || {};
        setUserId(data.Id_Usuario || data.id || null);
        setFormData(prev => ({
          ...prev,
          nombre: data.Nombre || '',
          correo: data.Correo || '',
          email: data.Correo || '',
          telefono: data.Telefono || '',
          departamento: data.departamento || 'Administración',
          cedula: data.N_Documento || '',
          cargo: data.cargo || 'Administrador General'
        }));
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      }
    };

    loadUser();
  }, []);


  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error('No user ID available to update');
      return;
    }

    try {
      const payload = {
        Nombre: formData.nombre,
        Correo: formData.email,
        Telefono: formData.telefono,
        N_Documento: formData.cedula,
        direccion: formData.departamento,
        cargo: formData.cargo
      };

      const res = await api.put(`/usuarios/${userId}`, payload);
      if (res.data?.success) {
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          if (onBackToProfile) onBackToProfile();
        }, 1500);
      } else {
        console.error('Fallo al actualizar usuario:', res.data);
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
    }
  };

  return (
    <div>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .header-banner {
          background: linear-gradient(135deg, #223BFF 0%, #008CFF 100%);
          padding: 20px 0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .fondo {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.2;
          top: 0;
          left: 0;
        }

        .logo-header {
          font-size: 32px;
          font-weight: bold;
          color: #FFFFFF;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          text-align: center;
          position: relative;
          z-index: 1;
          margin-bottom: 15px;
        }

        .nav-bar {
          display: flex;
          gap: 40px;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .nav-link {
          color: #FFFFFF;
          text-decoration: none;
          font-weight: 500;
          font-size: 16px;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: #85C6FF;
        }

        .main-content {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 20px;
          min-height: calc(100vh - 100px);
        }

        .container {
          display: grid;
          grid-template-columns: 380px 1fr;
          max-width: 1200px;
          width: 100%;
          background: #FFFFFF;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.6s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .left-panel {
          background: linear-gradient(135deg, #008CFF 0%, #223BFF 100%);
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .current-photo-container {
          z-index: 1;
          margin-bottom: 25px;
          position: relative;
        }

        .current-photo {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          object-fit: cover;
          border: 5px solid #FFFFFF;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          color: #008CFF;
        }

        .photo-label {
          color: #FFFFFF;
          font-size: 13px;
          margin-top: 12px;
          opacity: 0.9;
          font-weight: 500;
        }

        .logo {
          font-size: 38px;
          font-weight: bold;
          color: #FFFFFF;
          margin-bottom: 1px;
          z-index: 1;
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .tagline {
          color: #FFFFFF;
          font-size: 15px;
          margin-bottom: 20px;
          z-index: 1;
          opacity: 0.95;
        }

        .role-badge {
          background: #008CFF;
          color: #ffffff;
          padding: 8px 25px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 14px;
          z-index: 1;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
          margin-bottom: 20px;
        }

        .admin-badges {
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1;
          width: 100%;
        }

        .badge-item {
          background: rgba(255, 255, 255, 0.2);
          padding: 10px 18px;
          border-radius: 25px;
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #FFFFFF;
        }

        .right-panel {
          padding: 50px 45px;
          background: #FFFFFF;
          overflow-y: auto;
          max-height: 85vh;
        }

        h2 {
          color: #223BFF;
          font-size: 32px;
          margin-bottom: 35px;
          text-align: center;
        }

        .form-section {
          margin-bottom: 35px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #223BFF;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        label {
          display: block;
          color: #000000;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
        }

        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="tel"],
        input[type="date"],
        select,
        textarea {
          width: 100%;
          padding: 14px 18px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s ease;
          background: #FFFFFF;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #008CFF;
          box-shadow: 0 5px 15px rgba(38, 0, 255, 0.4);
        }

        .photo-upload {
          margin-bottom: 25px;
        }

        .upload-area {
          border: 2px dashed #223BFF;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, rgba(20, 0, 73, 0.05) 0%, rgba(34, 59, 255, 0.05) 100%);
        }

        .upload-area:hover {
          border-color: #223BFF;
          background: linear-gradient(135deg, rgba(34, 59, 255, 0.05) 0%, rgba(255, 0, 200, 0.05) 100%);
          transform: translateY(-2px);
        }

        .upload-area.has-image {
          padding: 15px;
        }

        .preview-container {
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .preview-container.active {
          display: flex;
        }

        #imagePreview {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #223BFF;
          box-shadow: 0 5px 15px rgba(38, 0, 255, 0.4);
        }

        .change-photo-btn {
          background: #223BFF;
          color: #FFFFFF;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .change-photo-btn:hover {
          background: #008CFF;
          transform: scale(1.05);
        }

        .upload-placeholder {
          color: #223BFF;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .upload-hint {
          color: #666;
          font-size: 13px;
        }

        .permission-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .permission-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #223BFF;
          transition: all 0.3s ease;
        }

        .permission-card:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }

        .permission-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .permission-title {
          font-weight: 600;
          color: #000000;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .permission-toggle {
          width: 45px;
          height: 24px;
          background: #00c851;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
        }

        .permission-toggle::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background: #FFFFFF;
          border-radius: 50%;
          top: 2px;
          right: 2px;
        }

        .permission-desc {
          font-size: 13px;
          color: #666;
        }

        .button-group {
          display: flex;
          gap: 15px;
          margin-top: 35px;
        }

        .btn-submit {
          flex: 1;
          padding: 16px;
          background: linear-gradient(135deg, #008CFF 0%, #223BFF 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(38, 0, 255, 0.4);
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(38, 0, 255, 0.4);
        }

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

        .btn-cancel:hover {
          background: #e9ecef;
          border-color: #d0d0d0;
        }

        .success-message {
          display: none;
          background: linear-gradient(135deg, #00c851 0%, #007e33 100%);
          color: #FFFFFF;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          text-align: center;
          font-weight: 600;
          animation: slideIn 0.5s ease-out;
        }

        .success-message.active {
          display: block;
        }

        .alert-box {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border-left: 4px solid #223BFF;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-icon {
          font-size: 24px;
        }

        .alert-text {
          color: #856404;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 968px) {
          .container {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .permission-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      

      <div className="main-content">
        <div className="container">
          <div className="left-panel">
            <div className="current-photo-container">
              <div className="current-photo" id="currentPhoto">
                {imagePreview ? <img src={imagePreview} alt="Foto actual" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : ''}
              </div>
              <div className="photo-label">Foto actual</div>
            </div>
            <div className="tagline">Panel de Administración</div>
            <div className="role-badge" onClick={onBackToProfile} style={{cursor: 'pointer'}}>
  Administrador
</div>
            <div className="admin-badges">
              <div className="badge-item">
                <span>🔐</span>
                <span>Acceso Total</span>
              </div>
              <div className="badge-item">
                <span>⚡</span>
                <span>Super Usuario</span>
              </div>
              <div className="badge-item">
                <span>🛡️</span>
                <span>Seguridad Máxima</span>
              </div>
            </div>
          </div>

          <div className="right-panel">
            <h2>Editar Perfil de Administrador</h2>

            <div className="alert-box">
              <span className="alert-icon">⚠️</span>
              <span className="alert-text">Los cambios en permisos afectarán el acceso del administrador al sistema</span>
            </div>
            
            <div id="profileForm" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="section-title">📷 Foto de Perfil</h3>
                <div className="photo-upload">
                  <div className={`upload-area ${imagePreview ? 'has-image' : ''}`} onClick={!imagePreview ? handleUploadClick : undefined}>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{display: 'none'}}
                    />
                    {!imagePreview ? (
                      <>
                        <div className="upload-placeholder">📷 Elegir archivo</div>
                        <div className="upload-hint">Haz clic para subir una foto</div>
                      </>
                    ) : (
                      <div className="preview-container active">
                        <img src={imagePreview} alt="Vista previa" id="imagePreview" />
                        <button type="button" className="change-photo-btn" onClick={handleChangePhoto}>Cambiar foto</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">👤 Información del Administrador</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre completo *</label>
                    <input type="text" id="nombre" value={formData.nombre} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cargo">Cargo *</label>
                    <input type="text" id="cargo" value={formData.cargo} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cedula">Cédula de Ciudadanía *</label>
                    <input type="text" id="cedula" value={formData.cedula} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="departamento">Departamento *</label>
                    <input type="text" id="departamento" value={formData.departamento} onChange={handleInputChange} required />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">📧 Información de Contacto</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Correo Corporativo *</label>
                    <input type="email" id="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="emailAlt">Correo Alternativo</label>
                    <input type="email" id="emailAlt" value={formData.emailAlt} onChange={handleInputChange} placeholder="correo.alternativo@email.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono Principal *</label>
                    <input type="tel" id="telefono" value={formData.telefono} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefonoAlt">Teléfono Alternativo</label>
                    <input type="tel" id="telefonoAlt" value={formData.telefonoAlt} onChange={handleInputChange} placeholder="+57 300 000 0000" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">🔐 Permisos del Sistema</h3>
                <div className="permission-grid">
                  {[
                    { icon: '👥', title: 'Gestión de Usuarios', desc: 'Crear, editar y eliminar usuarios' },
                    { icon: '👨‍💼', title: 'Gestión de Empleados', desc: 'Administrar personal y horarios' },
                    { icon: '💰', title: 'Acceso Financiero', desc: 'Ver y gestionar finanzas' },
                    { icon: '📊', title: 'Reportes Avanzados', desc: 'Generar y exportar reportes' },
                    { icon: '⚙️', title: 'Configuración Sistema', desc: 'Modificar parámetros del sistema' },
                    { icon: '🔒', title: 'Seguridad y Auditoría', desc: 'Acceso a logs y auditorías' }
                  ].map((perm, idx) => (
                    <div key={idx} className="permission-card">
                      <div className="permission-header">
                        <span className="permission-title">
                          <span>{perm.icon}</span>
                          <span>{perm.title}</span>
                        </span>
                        <div className="permission-toggle"></div>
                      </div>
                      <p className="permission-desc">{perm.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">🔑 Cambiar Contraseña</h3>
                <div className="form-group">
                  <label htmlFor="passwordActual">Contraseña actual *</label>
                  <input type="password" id="passwordActual" value={formData.passwordActual} onChange={handleInputChange} placeholder="••••••••" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="passwordNueva">Nueva contraseña</label>
                    <input type="password" id="passwordNueva" value={formData.passwordNueva} onChange={handleInputChange} placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="passwordConfirmar">Confirmar nueva contraseña</label>
                    <input type="password" id="passwordConfirmar" value={formData.passwordConfirmar} onChange={handleInputChange} placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">🔔 Notificaciones</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="notifEmail">Notificaciones por Email</label>
                    <select id="notifEmail" value={formData.notifEmail} onChange={handleInputChange}>
                      <option value="todas">Todas las notificaciones</option>
                      <option value="importantes">Solo importantes</option>
                      <option value="ninguna">Ninguna</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="notifSMS">Notificaciones por SMS</label>
                    <select id="notifSMS" value={formData.notifSMS} onChange={handleInputChange}>
                      <option value="importantes">Solo importantes</option>
                      <option value="todas">Todas las notificaciones</option>
                      <option value="ninguna">Ninguna</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="button-group">
                  <button type="button" className="btn-cancel" onClick={() => {
                    if (onBackToProfile) onBackToProfile();
                  }}>Cancelar</button>
                  <button type="button" className="btn-submit" onClick={handleSubmit}>💾 Guardar Cambios</button>
                </div>

                {showSuccess && (
                  <div className="success-message active">
                    ✓ Perfil actualizado correctamente
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAdminEdi;