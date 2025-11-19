import React, { useState } from 'react';
import '../styles/PerfilAdmin.css'; // Importa los estilos del componente

// Asumimos que también tienes un archivo header.css en el mismo nivel o lo incluyes en App.js/index.js
// import './header.css'; 

const PerfilAdmin = () => {
    // ------------------------------------------
    // 1. ESTADO DEL COMPONENTE (Maneja los datos y la UI)
    // ------------------------------------------
    const [profileData, setProfileData] = useState({
        nombre: "Juan Pablo Rodríguez",
        cargo: "Administrador General",
        cedula: "1.012.345.678",
        departamento: "Administración",
        email: "admin@foamwash.com",
        emailAlt: "",
        telefono: "+57 300 123 4567",
        telefonoAlt: "",
        passwordActual: "",
        passwordNueva: "",
        passwordConfirmar: "",
        notifEmail: "todas",
        notifSMS: "importantes",
    });
    const [fotoUrl, setFotoUrl] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // ------------------------------------------
    // 2. FUNCIONES DE MANEJO DE EVENTOS (Reemplaza el JS nativo)
    // ------------------------------------------

    // Maneja los cambios en los campos de texto y select
    const handleChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    // Maneja la carga de la imagen (reemplaza 'fileInput.addEventListener')
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                setFotoUrl(e.target.result);
                // Aquí podrías agregar la lógica de subida real al servidor
            };
            reader.readAsDataURL(file);
        }
    };

    // Maneja el envío del formulario (reemplaza 'profileForm.addEventListener')
    const handleSubmit = (e) => {
        e.preventDefault();
        setPasswordError('');
        setShowSuccess(false);

        // Validación de Contraseñas
        if (profileData.passwordNueva && profileData.passwordNueva !== profileData.passwordConfirmar) {
            setPasswordError('Las contraseñas no coinciden');
            return;
        }

        // Simulación de envío de datos
        console.log("Datos del perfil a guardar:", profileData);
        console.log("Nueva foto:", fotoUrl);

        // Mostrar mensaje de éxito
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);

        // Limpiar campos de contraseña después del intento
        setProfileData(prevData => ({
            ...prevData,
            passwordActual: "",
            passwordNueva: "",
            passwordConfirmar: "",
        }));
    };

    // ------------------------------------------
    // 3. RENDERIZADO (JSX)
    // ------------------------------------------
    return (
        // El contenido del <header> se movería idealmente a un componente <Header />
        // Aquí lo incluimos directamente para mantener el layout.
        <>
            <header className="header-banner">
                {/* Nota: En React, las rutas de imágenes estáticas se manejan mejor importándolas 
                o usando la carpeta 'public'. Aquí dejamos la ruta directa por simplicidad. */}
                <img src="img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 className="logo-header">FoamWash</h1>
                <nav className="nav-bar">
                    <a href="./index.html" className="nav-link">Hogar</a>
                    <a href="" className="nav-link">Ordenes</a>
                    <a href="" className="nav-link">Usuarios</a>
                    <a href="" className="nav-link">Servicios</a>
                    <a href="" className="nav-link">Reportes</a>
                    <a href="#" className="nav-link" style={{ color: 'rgb(133, 198, 255)' }}>Perfil</a>
                </nav>
            </header>

            <div className="main-content">
                <div className="container">
                    {/* PANEL IZQUIERDO */}
                    <div className="left-panel">
                        <div className="current-photo-container">
                            <div 
                                className="current-photo" 
                                style={fotoUrl ? { backgroundImage: `url(${fotoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                            >
                                {/* Si no hay foto, muestra el emoji. Si hay foto, queda vacío para que el estilo funcione */}
                                {!fotoUrl && '👤'} 
                            </div>
                            <div className="photo-label">Foto actual</div>
                        </div>
                        <div className="logo">FoamWash</div>
                        <div className="tagline">Panel de Administración</div>
                        <div className="role-badge">Administrador</div>
                        <div className="admin-badges">
                            <div className="badge-item"><span>🔐</span><span>Acceso Total</span></div>
                            <div className="badge-item"><span>⚡</span><span>Super Usuario</span></div>
                            <div className="badge-item"><span>🛡</span><span>Seguridad Máxima</span></div>
                        </div>
                    </div>

                    {/* PANEL DERECHO: FORMULARIO */}
                    <div className="right-panel">
                        <h2>Editar Perfil de Administrador</h2>

                        <div className="alert-box">
                            <span className="alert-icon">⚠</span>
                            <span className="alert-text">Los cambios en permisos afectarán el acceso del administrador al sistema</span>
                        </div>
                        
                        <form id="profileForm" onSubmit={handleSubmit}>
                            
                            {/* 1. Foto de Perfil */}
                            <div className="form-section">
                                <h3 className="section-title">📷 Foto de Perfil</h3>
                                <div className="photo-upload">
                                    <div 
                                        className={`upload-area ${fotoUrl ? 'has-image' : ''}`}
                                        onClick={() => document.getElementById('fileInput').click()}
                                    >
                                        <input type="file" id="fileInput" accept="image/*" onChange={handleFileChange} style={{display: 'none'}} />
                                        
                                        {!fotoUrl ? (
                                            <>
                                                <div className="upload-placeholder">📷 Elegir archivo</div>
                                                <div className="upload-hint">Haz clic para subir una foto</div>
                                            </>
                                        ) : (
                                            <div className="preview-container active">
                                                <img id="imagePreview" src={fotoUrl} alt="Vista previa" />
                                                <button type="button" className="change-photo-btn" onClick={(e) => { e.stopPropagation(); document.getElementById('fileInput').click(); }}>
                                                    Cambiar foto
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Información Personal */}
                            <div className="form-section">
                                <h3 className="section-title">👤 Información del Administrador</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="nombre">Nombre completo *</label>
                                        <input type="text" id="nombre" value={profileData.nombre} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cargo">Cargo *</label>
                                        <input type="text" id="cargo" value={profileData.cargo} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cedula">Cédula de Ciudadanía *</label>
                                        <input type="text" id="cedula" value={profileData.cedula} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="departamento">Departamento *</label>
                                        <input type="text" id="departamento" value={profileData.departamento} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Información de Contacto */}
                            <div className="form-section">
                                <h3 className="section-title">📧 Información de Contacto</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="email">Correo Corporativo *</label>
                                        <input type="email" id="email" value={profileData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="emailAlt">Correo Alternativo</label>
                                        <input type="email" id="emailAlt" value={profileData.emailAlt} onChange={handleChange} placeholder="correo.alternativo@email.com" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="telefono">Teléfono Principal *</label>
                                        <input type="tel" id="telefono" value={profileData.telefono} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="telefonoAlt">Teléfono Alternativo</label>
                                        <input type="tel" id="telefonoAlt" value={profileData.telefonoAlt} onChange={handleChange} placeholder="+57 300 000 0000" />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Permisos del Sistema (Solo UI, sin lógica de toggle) */}
                            <div className="form-section">
                                <h3 className="section-title">🔐 Permisos del Sistema</h3>
                                <div className="permission-grid">
                                    {/* Mapear permisos sería la forma React, aquí el estático para igualar el HTML */}
                                    {/* Nota: En React, se usarían componentes <PermissionCard /> y un estado para el toggle. */}
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>👥</span><span>Gestión de Usuarios</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Crear, editar y eliminar usuarios</p></div>
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>👨‍💼</span><span>Gestión de Empleados</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Administrar personal y horarios</p></div>
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>💰</span><span>Acceso Financiero</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Ver y gestionar finanzas</p></div>
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>📊</span><span>Reportes Avanzados</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Generar y exportar reportes</p></div>
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>⚙</span><span>Configuración Sistema</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Modificar parámetros del sistema</p></div>
                                    <div className="permission-card"><div className="permission-header"><span className="permission-title"><span>🔒</span><span>Seguridad y Auditoría</span></span><div className="permission-toggle"></div></div><p className="permission-desc">Acceso a logs y auditorías</p></div>
                                </div>
                            </div>

                            {/* 5. Cambiar Contraseña */}
                            <div className="form-section">
                                <h3 className="section-title">🔒 Cambiar Contraseña</h3>
                                <div className="form-group">
                                    <label htmlFor="passwordActual">Contraseña actual *</label>
                                    <input type="password" id="passwordActual" value={profileData.passwordActual} onChange={handleChange} placeholder="••••••••" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="passwordNueva">Nueva contraseña</label>
                                        <input type="password" id="passwordNueva" value={profileData.passwordNueva} onChange={handleChange} placeholder="••••••••" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="passwordConfirmar">Confirmar nueva contraseña</label>
                                        <input type="password" id="passwordConfirmar" value={profileData.passwordConfirmar} onChange={handleChange} placeholder="••••••••" />
                                    </div>
                                </div>
                                {passwordError && <p style={{color: 'red', marginTop: '-10px', marginBottom: '10px'}}>{passwordError}</p>}
                            </div>

                            {/* 6. Configuración de Notificaciones */}
                            <div className="form-section">
                                <h3 className="section-title">🔔 Notificaciones</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="notifEmail">Notificaciones por Email</label>
                                        <select id="notifEmail" value={profileData.notifEmail} onChange={handleChange}>
                                            <option value="todas">Todas las notificaciones</option>
                                            <option value="importantes">Solo importantes</option>
                                            <option value="ninguna">Ninguna</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="notifSMS">Notificaciones por SMS</label>
                                        <select id="notifSMS" value={profileData.notifSMS} onChange={handleChange}>
                                            <option value="importantes">Solo importantes</option>
                                            <option value="todas">Todas las notificaciones</option>
                                            <option value="ninguna">Ninguna</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Botones y Mensaje de Éxito */}
                            <div className="button-group">
                                {/* Usamos window.history.back() para simular el comportamiento del HTML original */}
                                <button type="button" className="btn-cancel" onClick={() => window.history.back()}>Cancelar</button> 
                                <button type="submit" className="btn-submit">💾 Guardar Cambios</button>
                            </div>
                            
                            <div className={`success-message ${showSuccess ? 'active' : ''}`}>
                                ✓ Perfil actualizado correctamente
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

// Exportamos el componente para usarlo en App.js
export default PerfilAdmin;