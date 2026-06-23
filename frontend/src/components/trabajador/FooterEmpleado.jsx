// =============================================================================
// ARCHIVO  : FooterEmpleado.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/trabajador/FooterEmpleado.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Footer exclusivo del panel del trabajador con métricas rápidas.
// =============================================================================

import React, { useState } from 'react';

const FooterEmpleado = ({ 
    onGoPanelEmpleado, 
    onGoAgendaEmpleado, 
    onGoPerfil,
    kpiSnapshot = {}
}) => {
    const currentYear = new Date().getFullYear();
    const [hoveredLink, setHoveredLink] = useState(null);

    // Default KPI values
    const {
        serviciosHoy = 0,
        serviciosSemana = 0,
        completados = 0,
        pendientes = 0
    } = kpiSnapshot;

    return (
        <footer style={{
            width: '100%',
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            marginTop: 'auto'
        }}>
            {/* Sección superior - Estado del sistema */}
            <div style={{
                backgroundColor: '#1E293B',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '25px 40px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '25px'
                }}>
                    {/* Estado del sistema */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                background: '#FFF',
                                borderRadius: '50%',
                                animation: 'pulse-dot 2s ease-in-out infinite'
                            }} />
                            <style>{`
                                @keyframes pulse-dot {
                                    0%, 100% { transform: scale(1); opacity: 1; }
                                    50% { transform: scale(1.2); opacity: 0.8; }
                                }
                            `}</style>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#10B981',
                                marginBottom: '4px',
                                letterSpacing: '-0.01em'
                            }}>
                                Sistema Operativo
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#94A3B8',
                                margin: 0,
                                fontWeight: 500
                            }}>
                                Todos los servicios activos
                            </p>
                        </div>
                    </div>

                    {/* Última sincronización */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="23 4 23 10 17 10"/>
                                <polyline points="1 20 1 14 7 14"/>
                                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#F1F5F9',
                                marginBottom: '4px',
                                letterSpacing: '-0.01em'
                            }}>
                                Última sincronización
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#94A3B8',
                                margin: 0,
                                fontWeight: 500
                            }}>
                                Hace menos de 1 minuto
                            </p>
                        </div>
                    </div>

                    {/* Sesión activa */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="8" r="4"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#F1F5F9',
                                marginBottom: '4px',
                                letterSpacing: '-0.01em'
                            }}>
                                Sesión Activa
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#94A3B8',
                                margin: 0,
                                fontWeight: 500
                            }}>
                                Conectado como Empleado
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección principal del footer */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '55px 40px 35px 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '45px'
            }}>
                {/* Columna 1 - Logo y descripción */}
                <div style={{
                    maxWidth: '350px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '18px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '22px',
                            fontWeight: '900',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            FW
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: '26px',
                                fontWeight: '900',
                                margin: 0,
                                background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2'
                            }}>
                                FoamWash
                            </h2>
                            <div style={{
                                fontSize: '11px',
                                color: '#60A5FA',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginTop: '2px'
                            }}>
                                Panel Empleado
                            </div>
                        </div>
                    </div>

                    <p style={{
                        fontSize: '14px',
                        lineHeight: '1.7',
                        color: '#94A3B8',
                        marginBottom: '22px',
                        fontWeight: 500
                    }}>
                        Gestiona tus servicios diarios, revisa tu agenda y mantén el control de todas tus asignaciones desde un solo lugar.
                    </p>

                    {/* Info de versión */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#1E293B',
                            borderRadius: '8px',
                            border: '1px solid #334155'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                color: '#94A3B8',
                                fontWeight: 600
                            }}>Versión del sistema</span>
                            <span style={{
                                fontSize: '12px',
                                color: '#60A5FA',
                                fontWeight: 700
                            }}>v2.4.1</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#1E293B',
                            borderRadius: '8px',
                            border: '1px solid #334155'
                        }}>
                            <span style={{
                                fontSize: '12px',
                                color: '#94A3B8',
                                fontWeight: 600
                            }}>Entorno</span>
                            <span style={{
                                fontSize: '12px',
                                color: '#10B981',
                                fontWeight: 700
                            }}>Production</span>
                        </div>
                    </div>
                </div>

                {/* Columna 2 - Navegación */}
                <div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#F1F5F9',
                        marginBottom: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        position: 'relative',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="16.24,7.76 11.88,16.24 7.76,16.24 12.12,7.76" fill="#60A5FA" stroke="none"/>
                        </svg>
                        Navegación
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '40px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
                            borderRadius: '2px'
                        }} />
                    </h3>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        {[
                            {
                                name: 'Panel', 
                                onClick: onGoPanelEmpleado,
                                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                            },
                            {
                                name: 'Agenda', 
                                onClick: onGoAgendaEmpleado,
                                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            },
                            {
                                name: 'Perfil', 
                                onClick: onGoPerfil,
                                icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="8" r="4"/></svg>
                            }
                        ].map((link, index) => (
                            <li key={index}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.onClick) link.onClick();
                                    }}
                                    onMouseEnter={() => setHoveredLink(link.name)}
                                    onMouseLeave={() => setHoveredLink(null)}
                                    style={{
                                        color: hoveredLink === link.name ? '#60A5FA' : '#94A3B8',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        transition: 'all 0.25s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '9px 11px',
                                        borderRadius: '8px',
                                        background: hoveredLink === link.name ? 'rgba(59,130,246,0.07)' : 'transparent',
                                        transform: hoveredLink === link.name ? 'translateX(4px)' : 'translateX(0)'
                                    }}
                                >
                                    <span style={{
                                        color: hoveredLink === link.name ? '#60A5FA' : '#4A6FA5',
                                        transition: 'color 0.25s ease',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {link.icon}
                                    </span>
                                    {link.name}
                                    <span style={{
                                        marginLeft: 'auto',
                                        opacity: hoveredLink === link.name ? 1 : 0,
                                        transition: 'opacity 0.25s ease',
                                        fontSize: '12px'
                                    }}>→</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna 3 - Métricas en vivo */}
                <div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#F1F5F9',
                        marginBottom: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        position: 'relative',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        Métricas
                        <span style={{
                            marginLeft: 'auto',
                            fontSize: '10px',
                            color: '#10B981',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                background: '#10B981',
                                borderRadius: '50%',
                                animation: 'pulse-live 2s ease-in-out infinite'
                            }} />
                            Live
                        </span>
                        <style>{`
                            @keyframes pulse-live {
                                0%, 100% { opacity: 1; transform: scale(1); }
                                50% { opacity: 0.6; transform: scale(1.2); }
                            }
                        `}</style>
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '40px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #10B981, #059669)',
                            borderRadius: '2px'
                        }} />
                    </h3>
                    
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        {[
                            { label: 'Servicios hoy', value: serviciosHoy, icon: '📋', color: '#3B82F6' },
                            { label: 'Esta semana', value: serviciosSemana, icon: '📅', color: '#8B5CF6' },
                            { label: 'Completados', value: completados, icon: '✅', color: '#10B981' },
                            { label: 'Pendientes', value: pendientes, icon: '⏳', color: '#F59E0B' }
                        ].map((metric, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                background: '#1E293B',
                                borderRadius: '10px',
                                border: '1px solid #334155',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#283548';
                                e.currentTarget.style.borderColor = metric.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#1E293B';
                                e.currentTarget.style.borderColor = '#334155';
                            }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <span style={{ fontSize: '18px' }}>{metric.icon}</span>
                                    <span style={{
                                        fontSize: '13px',
                                        color: '#94A3B8',
                                        fontWeight: 600
                                    }}>{metric.label}</span>
                                </div>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '800',
                                    color: metric.color,
                                    letterSpacing: '-0.02em'
                                }}>{metric.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna 4 - Horario y contacto */}
                <div>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#F1F5F9',
                        marginBottom: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        position: 'relative',
                        paddingBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Información
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '40px',
                            height: '3px',
                            background: 'linear-gradient(90deg, #3B82F6, #2563EB)',
                            borderRadius: '2px'
                        }} />
                    </h3>

                    {/* Horario operativo */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#1E293B',
                        borderRadius: '12px',
                        border: '2px solid #334155',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#F1F5F9',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>🕐</span>
                            Horario Operativo
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#94A3B8',
                            fontWeight: 600,
                            lineHeight: '1.6'
                        }}>
                            <div>Lun - Sáb: 8:00 AM - 6:00 PM</div>
                            <div style={{
                                marginTop: '8px',
                                fontSize: '12px',
                                color: '#64748B'
                            }}>
                                Soporte Admin: 24 / 7
                            </div>
                        </div>
                    </div>

                    {/* Contacto de emergencia */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#1E293B',
                        borderRadius: '12px',
                        border: '2px solid #334155'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#F1F5F9',
                            marginBottom: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '18px' }}>📞</span>
                            Contacto de Emergencia
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#94A3B8',
                            fontWeight: 600,
                            lineHeight: '1.6'
                        }}>
                            <div>Admin: 314 436 8571</div>
                            <div style={{
                                marginTop: '4px'
                            }}>
                                Email: admin@foamwash.com
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Línea separadora */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 40px'
            }}>
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #334155, transparent)'
                }} />
            </div>

            {/* Copyright */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '25px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{
                    fontSize: '14px',
                    color: '#94A3B8'
                }}>
                    © {currentYear} <span style={{
                        background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '700'
                    }}>FoamWash</span> · Panel de Empleados · Todos los derechos reservados.
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        fontSize: '13px',
                        color: '#94A3B8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        Hecho con <span style={{ color: '#EF4444' }}>❤️</span> en Colombia
                    </div>
                    <div style={{
                        padding: '4px 10px',
                        background: '#1E293B',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#60A5FA',
                        fontWeight: 700,
                        border: '1px solid #334155'
                    }}>
                        FW-ADMIN v2.4.1
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterEmpleado;