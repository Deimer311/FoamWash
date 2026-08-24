// =============================================================================
// ARCHIVO  : FooterPublic.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/comun/FooterPublic.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Footer de las páginas públicas (servicios y cotización sin login).
// =============================================================================

import React, { useState } from 'react';

const FooterPublic = () => {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState('');
    const [hoveredLink, setHoveredLink] = useState(null);
    const [hoveredSocial, setHoveredSocial] = useState(null);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            alert(`¡Gracias por suscribirte con el email: ${email}!`);
            setEmail('');
        }
    };

    return (
        <footer style={{
            width: '100%',
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            marginTop: 'auto'
        }}>
            {/* Sección superior con información de contacto */}
            <div style={{
                backgroundColor: '#1E293B',
                borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '30px 40px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '30px'
                }}>
                    {/* Ubícanos */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#F1F5F9',
                                marginBottom: '4px'
                            }}>
                                Ubícanos
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#94A3B8',
                                margin: 0
                            }}>
                                Bogotá, Colombia
                            </p>
                        </div>
                    </div>

                    {/* Llámanos */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#F1F5F9',
                                marginBottom: '4px'
                            }}>
                                Llámanos
                            </h3>
                            <a 
                                href="tel:3144368571"
                                style={{
                                    fontSize: '14px',
                                    color: '#94A3B8',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#60A5FA'}
                                onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                            >
                                314 436 8571
                            </a>
                        </div>
                    </div>

                    {/* Escríbenos */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="white"/>
                            </svg>
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#F1F5F9',
                                marginBottom: '4px'
                            }}>
                                Escríbenos
                            </h3>
                            <a 
                                href="mailto:contacto@foamwash.com"
                                style={{
                                    fontSize: '14px',
                                    color: '#94A3B8',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = '#60A5FA'}
                                onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
                            >
                                contacto@foamwash.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección principal del footer */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '60px 40px 40px 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '50px'
            }}>
                {/* Columna 1 - Logo y descripción */}
                <div style={{
                    maxWidth: '350px'
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '900',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            <img src="/LogoFW.jpeg" alt="Logo FoamWash" style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
                        </div>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '900',
                            margin: 0,
                            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}>
                            FoamWash
                        </h2>
                    </div>

                    {/* Descripción */}
                    <p style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: '#94A3B8',
                        marginBottom: '25px'
                    }}>
                        Servicios profesionales de limpieza profunda para tu hogar y negocio. Cuidamos cada detalle con calidad y dedicación.
                    </p>

                    {/* Redes sociales */}
                    <div style={{
                        marginBottom: '10px'
                    }}>
                        <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#F1F5F9',
                            marginBottom: '15px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            Síguenos
                        </h4>
                        <div style={{
                            display: 'flex',
                            gap: '12px'
                        }}>
                            {/* Facebook */}
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={() => setHoveredSocial('facebook')}
                                onMouseLeave={() => setHoveredSocial(null)}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    backgroundColor: hoveredSocial === 'facebook' ? '#1877F2' : '#1E293B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredSocial === 'facebook' ? 'translateY(-4px)' : 'translateY(0)',
                                    boxShadow: hoveredSocial === 'facebook' ? '0 6px 20px rgba(24, 119, 242, 0.4)' : 'none',
                                    border: `2px solid ${hoveredSocial === 'facebook' ? '#1877F2' : '#334155'}`
                                }}
                            >
                                <svg height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href="https://wa.me/573144368571"
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={() => setHoveredSocial('whatsapp')}
                                onMouseLeave={() => setHoveredSocial(null)}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    backgroundColor: hoveredSocial === 'whatsapp' ? '#25D366' : '#1E293B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredSocial === 'whatsapp' ? 'translateY(-4px)' : 'translateY(0)',
                                    boxShadow: hoveredSocial === 'whatsapp' ? '0 6px 20px rgba(37, 211, 102, 0.4)' : 'none',
                                    border: `2px solid ${hoveredSocial === 'whatsapp' ? '#25D366' : '#334155'}`
                                }}
                            >
                                <svg height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                onMouseEnter={() => setHoveredSocial('instagram')}
                                onMouseLeave={() => setHoveredSocial(null)}
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '10px',
                                    background: hoveredSocial === 'instagram' 
                                        ? 'linear-gradient(135deg, #E1306C, #C13584, #833AB4)' 
                                        : '#1E293B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    transform: hoveredSocial === 'instagram' ? 'translateY(-4px)' : 'translateY(0)',
                                    boxShadow: hoveredSocial === 'instagram' ? '0 6px 20px rgba(225, 48, 108, 0.4)' : 'none',
                                    border: `2px solid ${hoveredSocial === 'instagram' ? '#E1306C' : '#334155'}`
                                }}
                            >
                                <svg height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Columna 2 - Enlaces Rápidos */}
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
                        <svg height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 11.88,16.24 7.76,16.24 12.12,7.76" fill="#60A5FA" stroke="none"/></svg>
                        Enlaces Rápidos
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
                                name: 'Hogar', href: '#hogar',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            },
                            {
                                name: 'Cotización', href: '#cotizacion',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                            },
                            {
                                name: 'Agendar', href: '#agendar',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            },
                            {
                                name: 'Iniciar Sesión', href: '#login',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                            }
                        ].map((link, index) => (
                            <li key={index}>
                                <a
                                    href={link.href}
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

                {/* Columna 3 - Nuestros Servicios */}
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
                        <svg height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
                        Nuestros Servicios
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
                                name: 'Lavado de Muebles',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V5a2 2 0 012-2h14a2 2 0 012 2v6"/><path d="M3 11h18"/><path d="M3 11v7a2 2 0 002 2h14a2 2 0 002-2v-7"/><line x1="7" y1="20" x2="7" y2="22"/><line x1="17" y1="20" x2="17" y2="22"/></svg>
                            },
                            {
                                name: 'Lavado de Alfombras',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="2" y1="14" x2="22" y2="14"/></svg>
                            },
                            {
                                name: 'Lavado de Colchones',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"/><path d="M3 13V8a2 2 0 012-2h14a2 2 0 012 2v5"/><line x1="7" y1="21" x2="7" y2="23"/><line x1="17" y1="21" x2="17" y2="23"/></svg>
                            },
                            {
                                name: 'Tapicería de Carros',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 010-4l1-6a2 2 0 012-2h10l3 4h2a2 2 0 012 2v4a2 2 0 01-2 2h-2"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/></svg>
                            },
                            {
                                name: 'Limpieza de Cortinas',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="3" x2="22" y2="3"/><path d="M2 3v1c0 4 4 7 4 7v8a1 1 0 001 1h10a1 1 0 001-1v-8s4-3 4-7V3"/><line x1="8" y1="21" x2="16" y2="21"/></svg>
                            },
                            {
                                name: 'Mantenimiento de Pisos',
                                icon: <svg height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="14" height="8" rx="1"/><line x1="2" y1="18" x2="22" y2="18"/><line x1="8" y1="14" x2="8" y2="22"/><line x1="16" y1="14" x2="16" y2="22"/></svg>
                            }
                        ].map((servicio, index) => (
                            <li key={index} style={{
                                fontSize: '14px',
                                color: '#94A3B8',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                transition: 'background 0.25s ease'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.06)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{
                                    color: '#4A6FA5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0
                                }}>
                                    {servicio.icon}
                                </span>
                                <span style={{ flex: 1 }}>{servicio.name}</span>
                                <span style={{
                                    color: '#3B82F6',
                                    fontSize: '14px',
                                    flexShrink: 0
                                }}>✓</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna 4 - Newsletter */}
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
                        <svg height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        Newsletter
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
                    <p style={{
                        fontSize: '14px',
                        color: '#94A3B8',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                    }}>
                        No te pierdas nuestras ofertas y novedades. Suscríbete a nuestro boletín.
                    </p>
                    <form onSubmit={handleSubscribe} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{
                            position: 'relative'
                        }}>
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    backgroundColor: '#1E293B',
                                    border: '2px solid #334155',
                                    borderRadius: '10px',
                                    color: '#E2E8F0',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3B82F6';
                                    e.target.style.backgroundColor = '#0F172A';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#334155';
                                    e.target.style.backgroundColor = '#1E293B';
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            Suscribirse
                        </button>
                    </form>

                    {/* Horarios */}
                    <div style={{
                        marginTop: '25px',
                        padding: '16px',
                        backgroundColor: '#1E293B',
                        borderRadius: '10px',
                        border: '2px solid #334155'
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#F1F5F9',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '16px' }}>🕐</span>
                            Horario de Atención
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#94A3B8'
                        }}>
                            Lun - Sáb: 8:00 AM - 6:00 PM
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
                padding: '30px 40px',
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
                    }}>FoamWash</span>. Todos los derechos reservados.
                </div>
                <div style={{
                    fontSize: '13px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    Hecho con <span style={{ color: '#EF4444' }}>❤️</span> en Colombia
                </div>
            </div>
        </footer>
    );
};

export default FooterPublic;
