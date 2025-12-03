  import { useEffect } from 'react';
  import Header from "./Header.jsx";
  import './css/PerfilAdmin.css';

  const PerfilAdmin = () => {
    useEffect(() => {
      const cards = document.querySelectorAll('.detail-card');
      cards.forEach((card, index) => {
        card.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s forwards`;
        card.style.opacity = '0';
      });
    }, []);

    const handleEditProfile = () => {
      // Opción 1: Navegar usando window.location
      window.location.href = '/perfil-admin-editar';
      
      // Opción 2: Si quieres solo mostrar un mensaje
      // alert('Función de editar perfil');
      
      // Opción 3: Si tienes una página HTML directa
      // window.location.href = '/perfil-admin-editar.html';
    };

    return (
      <div>
        <Header userType="admin" />
        
        <div className="admin-main-content">
          <div className="profile-container">
            {/* Sidebar del perfil */}
            <div className="profile-sidebar">
              <div className="profile-photo">👤</div>
              <div className="profile-name">Administrador</div>
              <div className="profile-role">Administrador</div>
              
              <div className="admin-badges">
                <div className="badge-item">
                  <span>🔐</span>
                  <span>Acceso Total</span>
                </div>
                <div className="badge-item">
                  <span>⭐</span>
                  <span>Super Usuario</span>
                </div>
                <div className="badge-item">
                  <span>🛡️</span>
                  <span>Seguridad Máxima</span>
                </div>
              </div>

              <button className="edit-profile-btn" onClick={handleEditProfile}>
                Editar Perfil
              </button>
            </div>

            {/* Detalles del perfil */}
            <div className="right-panel">
              <div className="profile-details">
                {/* Información del Administrador */}
                <div className="detail-card">
                  <h2 className="card-title">
                    <span className="card-icon">👤</span>
                    Información del Administrador
                  </h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Nombre Completo</span>
                      <div className="info-value">Juan Pablo Rodríguez</div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Cargo</span>
                      <div className="info-value">Administrador General</div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email Corporativo</span>
                      <div className="info-value">admin@foamwash.com</div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Teléfono</span>
                      <div className="info-value">+57 300 123 4567</div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Departamento</span>
                      <div className="info-value">Administración</div>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Fecha de Ingreso</span>
                      <div className="info-value">1 de Enero, 2022</div>
                    </div>
                  </div>
                </div>

                {/* Estadísticas del Sistema */}
                <div className="detail-card">
                  <h2 className="card-title">
                    <span className="card-icon">📊</span>
                    Estadísticas del Sistema
                  </h2>
                  <div className="stats-dashboard">
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-value">2,847</div>
                      <div className="stat-label">Total Usuarios</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">👨‍💼</div>
                      <div className="stat-value">45</div>
                      <div className="stat-label">Empleados Activos</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-value">8,921</div>
                      <div className="stat-label">Servicios Totales</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-value">$48.5M</div>
                      <div className="stat-label">Ingresos del Mes</div>
                    </div>
                  </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="detail-card">
                  <h2 className="card-title">
                    <span className="card-icon">⚡</span>
                    Acciones Rápidas
                  </h2>
                  <div className="quick-actions">
                    <button className="action-btn primary">
                      <span>➕</span>
                      <span>Nuevo Usuario</span>
                    </button>
                    <button className="action-btn">
                      <span>📊</span>
                      <span>Ver Reportes</span>
                    </button>
                    <button className="action-btn">
                      <span>⚙️</span>
                      <span>Configuración</span>
                    </button>
                    <button className="action-btn">
                      <span>👨‍💼</span>
                      <span>Gestión Empleados</span>
                    </button>
                    <button className="action-btn">
                      <span>💵</span>
                      <span>Finanzas</span>
                    </button>
                    <button className="action-btn">
                      <span>🔧</span>
                      <span>Notificaciones</span>
                    </button>
                  </div>
                </div>

                {/* Estado del Sistema */}
                <div className="detail-card">
                  <h2 className="card-title">
                    <span className="card-icon">🖥️</span>
                    Estado del Sistema
                  </h2>
                  <div className="system-status">
                    <div className="status-item">
                      <div className="status-left">
                        <div className="status-icon">🌐</div>
                        <div className="status-info">
                          <h4>Servidor Principal</h4>
                          <p>Funcionando correctamente</p>
                        </div>
                      </div>
                      <div className="status-indicator status-ok">
                        <span className="status-dot"></span>
                        <span>En línea</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-left">
                        <div className="status-icon">💾</div>
                        <div className="status-info">
                          <h4>Base de Datos</h4>
                          <p>Respuesta óptima - 45ms</p>
                        </div>
                      </div>
                      <div className="status-indicator status-ok">
                        <span className="status-dot"></span>
                        <span>En línea</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-left">
                        <div className="status-icon">🔄</div>
                        <div className="status-info">
                          <h4>Backup Automático</h4>
                          <p>Último backup: hace 2 horas</p>
                        </div>
                      </div>
                      <div className="status-indicator status-ok">
                        <span className="status-dot"></span>
                        <span>Activo</span>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className="status-left">
                        <div className="status-icon">📈</div>
                        <div className="status-info">
                          <h4>Tráfico del Sitio</h4>
                          <p>1,234 usuarios activos ahora</p>
                        </div>
                      </div>
                      <div className="status-indicator status-warning">
                        <span className="status-dot"></span>
                        <span>Alto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permisos y Accesos */}
                <div className="detail-card">
                  <h2 className="card-title">
                    <span className="card-icon">🔐</span>
                    Permisos y Accesos
                  </h2>
                  <div className="permissions-grid">
                    <div className="permission-item">
                      <span className="permission-icon">👥</span>
                      <div className="permission-text">
                        <h4>Gestión de Usuarios</h4>
                        <p>Crear, editar y eliminar usuarios</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                    <div className="permission-item">
                      <span className="permission-icon">👨‍💼</span>
                      <div className="permission-text">
                        <h4>Gestión de Empleados</h4>
                        <p>Administrar personal y horarios</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                    <div className="permission-item">
                      <span className="permission-icon">💰</span>
                      <div className="permission-text">
                        <h4>Acceso Financiero</h4>
                        <p>Ver y gestionar finanzas</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                    <div className="permission-item">
                      <span className="permission-icon">📊</span>
                      <div className="permission-text">
                        <h4>Reportes Avanzados</h4>
                        <p>Generar y exportar reportes</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                    <div className="permission-item">
                      <span className="permission-icon">⚙️</span>
                      <div className="permission-text">
                        <h4>Configuración Sistema</h4>
                        <p>Modificar parámetros del sistema</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                    <div className="permission-item">
                      <span className="permission-icon">🔒</span>
                      <div className="permission-text">
                        <h4>Seguridad y Auditoría</h4>
                        <p>Acceso a logs y auditorías</p>
                      </div>
                      <span className="permission-check">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default PerfilAdmin;