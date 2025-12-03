import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotificaciones, NotificacionContainer } from './Notificacion';
import './css/estilos_cotizar_cliente.css';

const PerfilTrabajador = ({ onBackToHome, onTareas }) => {
    const { user, logout } = useAuth();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();
    
    const [editando, setEditando] = useState(false);
    const [perfilData, setPerfilData] = useState({
        nombreCompleto: 'Juan Pérez López',
        tipoIdentificacion: 'Cédula de Ciudadanía',
        numeroDocumento: '9.876.543.210',
        fechaNacimiento: '20 de Marzo, 1988',
        email: user?.email || 'juan.perez@foamwash.com',
        telefono: '+57 315 987 6543',
        direccion: 'Carrera 45 #67-89, Bogotá',
        ciudad: 'Bogotá, D.C.',
        cargo: 'Técnico de Limpieza',
        especialidad: 'Lavado de Muebles y Tapicería',
        experiencia: '5 años'
    });
    
    const [formData, setFormData] = useState({ ...perfilData });
    
    const tareasRecientes = [
        {
            id: 1,
            icono: '🛋️',
            titulo: 'Lavado de Sofá de 3 Puestos',
            fecha: '5 de Noviembre, 2025',
            cliente: 'María García',
            estado: 'Completado'
        },
        {
            id: 2,
            icono: '🛏️',
            titulo: 'Lavado de Colchón Queen Size',
            fecha: '28 de Octubre, 2025',
            cliente: 'Carlos Rodríguez',
            estado: 'Completado'
        },
        {
            id: 3,
            icono: '💺',
            titulo: 'Limpieza de 6 Sillas de Comedor',
            fecha: '15 de Octubre, 2025',
            cliente: 'Ana Martínez',
            estado: 'Completado'
        },
        {
            id: 4,
            icono: '🚗',
            titulo: 'Tapicería de Automóvil',
            fecha: '10 de Octubre, 2025',
            cliente: 'Pedro Sánchez',
            estado: 'Completado'
        }
    ];
    
    useEffect(() => {
        const cards = document.querySelectorAll('.detail-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, []);
    
    const handleCerrarSesion = (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            agregarNotificacion('Cerrando sesión...', 'info');
            setTimeout(() => {
                logout();
                onBackToHome();
            }, 1000);
        }
    };
    
    const handleGuardarCambios = (e) => {
        e.preventDefault();
        setPerfilData({ ...formData });
        setEditando(false);
        agregarNotificacion('Perfil actualizado correctamente', 'exito');
    };
    
    const handleCancelarEdicion = () => {
        setFormData({ ...perfilData });
        setEditando(false);
    };
    
    const getEstadoColor = (estado) => {
        switch(estado) {
            case 'Completado': return '#28a745';
            case 'En Proceso': return '#ffc107';
            case 'Pendiente': return '#17a2b8';
            default: return '#6c757d';
        }
    };
    
    return (
        <>
            {/* ==================== HEADER CON BANNER ==================== */}
            <header className="header-banner">
                <img src="/img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
                <h1 
                    className="logo-header"
                    onClick={onBackToHome}
                    style={{ cursor: 'pointer' }}
                >
                    FoamWash
                </h1>
                
                <nav className="nav-bar">
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onBackToHome();
                        }}
                    >
                        Hogar
                    </a>
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onTareas ? onTareas() : alert('Tareas próximamente');
                        }}
                    >
                        Mis Tareas
                    </a>
                    <a 
                        href="#" 
                        className="nav-link" 
                        style={{ color: 'rgb(133, 198, 255)' }}
                        onClick={(e) => e.preventDefault()}
                    >
                        Perfil
                    </a>
                    <a 
                        href="#" 
                        className="nav-link btn-salir" 
                        onClick={handleCerrarSesion}
                    >
                        Cerrar Sesión
                    </a>
                </nav>
            </header>

            {/* ==================== CONTENIDO PRINCIPAL ==================== */}
            <div style={{ 
                padding: '40px 20px', 
                maxWidth: '1400px', 
                margin: '0 auto',
                minHeight: '100vh',
                background: '#f5f5f5'
            }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '350px 1fr', 
                    gap: '30px',
                    alignItems: 'start'
                }}>
                    {/* ==================== SIDEBAR DEL PERFIL ==================== */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '30px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '60px',
                            margin: '0 auto 20px'
                        }}>
                            👷
                        </div>
                        <h2 style={{ margin: '0 0 5px', fontSize: '24px' }}>
                            {perfilData.nombreCompleto.split(' ')[0]} {perfilData.nombreCompleto.split(' ')[1]}
                        </h2>
                        <p style={{ color: '#666', margin: '0 0 5px' }}>Trabajador</p>
                        <p style={{ 
                            color: '#fff', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '5px 15px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            display: 'inline-block',
                            marginBottom: '20px'
                        }}>
                            {perfilData.cargo}
                        </p>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '15px',
                            margin: '30px 0',
                            padding: '20px 0',
                            borderTop: '1px solid #eee',
                            borderBottom: '1px solid #eee'
                        }}>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>42</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Tareas Total</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>38</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Completadas</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>3</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Pendientes</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff6b6b' }}>4.8</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>Calificación</div>
                            </div>
                        </div>

                        {!editando && (
                            <button 
                                className="service-btn"
                                onClick={() => setEditando(true)}
                                style={{ width: '100%', marginTop: '10px' }}
                            >
                                ✏️ Editar Perfil
                            </button>
                        )}
                    </div>

                    {/* ==================== DETALLES DEL PERFIL ==================== */}
                    <div style={{ display: 'grid', gap: '20px' }}>
                        
                        {/* Información Personal */}
                        <div className="detail-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            opacity: 0,
                            transform: 'translateY(20px)',
                            transition: 'all 0.3s ease'
                        }}>
                            <h2 style={{ 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>👤</span>
                                Información Personal
                            </h2>
                            
                            {!editando ? (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '20px' 
                                }}>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Nombre Completo
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.nombreCompleto}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Tipo de Identificación
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.tipoIdentificacion}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Número de Documento
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.numeroDocumento}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Fecha de Nacimiento
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.fechaNacimiento}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Nombre Completo</label>
                                        <input 
                                            type="text"
                                            value={formData.nombreCompleto}
                                            onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Número de Documento</label>
                                        <input 
                                            type="text"
                                            value={formData.numeroDocumento}
                                            onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Información de Contacto */}
                        <div className="detail-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            opacity: 0,
                            transform: 'translateY(20px)',
                            transition: 'all 0.3s ease'
                        }}>
                            <h2 style={{ 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>📧</span>
                                Información de Contacto
                            </h2>
                            
                            {!editando ? (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '20px' 
                                }}>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Correo Electrónico
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.email}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Teléfono
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.telefono}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Dirección
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.direccion}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                            Ciudad
                                        </div>
                                        <div style={{ fontWeight: '500' }}>{perfilData.ciudad}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input 
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input 
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dirección</label>
                                        <input 
                                            type="text"
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ciudad</label>
                                        <input 
                                            type="text"
                                            value={formData.ciudad}
                                            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Información Laboral */}
                        <div className="detail-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            opacity: 0,
                            transform: 'translateY(20px)',
                            transition: 'all 0.3s ease'
                        }}>
                            <h2 style={{ 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>💼</span>
                                Información Laboral
                            </h2>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '20px' 
                            }}>
                                <div>
                                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                        Cargo
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{perfilData.cargo}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                        Especialidad
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{perfilData.especialidad}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                        Experiencia
                                    </div>
                                    <div style={{ fontWeight: '500' }}>{perfilData.experiencia}</div>
                                </div>
                                <div>
                                    <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                                        Fecha de Ingreso
                                    </div>
                                    <div style={{ fontWeight: '500' }}>Marzo 2020</div>
                                </div>
                            </div>
                        </div>

                        {/* Tareas Recientes */}
                        <div className="detail-card" style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            opacity: 0,
                            transform: 'translateY(20px)',
                            transition: 'all 0.3s ease'
                        }}>
                            <h2 style={{ 
                                fontSize: '20px', 
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <span>📋</span>
                                Tareas Recientes
                            </h2>
                            
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {tareasRecientes.map(tarea => (
                                    <div 
                                        key={tarea.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '15px',
                                            padding: '15px',
                                            background: '#f8f9fa',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    >
                                        <div style={{ fontSize: '32px' }}>{tarea.icono}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', marginBottom: '3px' }}>
                                                {tarea.titulo}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#666' }}>
                                                👤 {tarea.cliente} • 📅 {tarea.fecha}
                                            </div>
                                        </div>
                                        <span style={{
                                            padding: '5px 15px',
                                            borderRadius: '20px',
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            background: getEstadoColor(tarea.estado)
                                        }}>
                                            {tarea.estado}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Botones de acción cuando está editando */}
                        {editando && (
                            <div style={{ 
                                display: 'flex', 
                                gap: '15px', 
                                justifyContent: 'flex-end',
                                padding: '20px',
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <button 
                                    className="btn-secondary"
                                    onClick={handleCancelarEdicion}
                                >
                                    ❌ Cancelar
                                </button>
                                <button 
                                    className="btn-primary"
                                    onClick={handleGuardarCambios}
                                >
                                    💾 Guardar Cambios
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SISTEMA DE NOTIFICACIONES */}
            <NotificacionContainer
                notificaciones={notificaciones}
                onRemove={removerNotificacion}
            />
        </>
    );
};

export default PerfilTrabajador;