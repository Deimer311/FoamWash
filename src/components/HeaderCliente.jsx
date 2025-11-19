// =============================================================================
// HEADERCLIENTE.JSX - ENCABEZADO PARA CLIENTES AUTENTICADOS
// =============================================================================
// Este componente muestra el header de la página cuando el usuario ya está
// logueado. Incluye navegación, logo y botón de cerrar sesión.
//
// DIFERENCIAS CON EL HEADER PÚBLICO:
// - Tiene más opciones de navegación (Cotización, Agendar, Perfil)
// - Incluye botón "Cerrar Sesión" en lugar de "Iniciar Sesión"
// - Muestra información del usuario logueado
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';  // Asumiendo que tendrás este Context

/**
 * COMPONENTE: HeaderCliente
 * 
 * PROPS:
 * @param {function} onBackToHome - Función para volver a la página principal
 * @param {function} onCotizacion - Función para ir a cotización
 * @param {function} onPerfil - Función para ir al perfil
 * 
 * CONCEPTO: Componente de Navegación Autenticado
 * Este componente solo se muestra cuando el usuario está logueado.
 */
const HeaderCliente = ({ onBackToHome, onCotizacion, onPerfil }) => {
    
    // =========================================================================
    // 1. HOOKS Y ESTADOS
    // =========================================================================
    
    // Obtener datos del usuario y función de logout del contexto
    const { user, logout } = useAuth();
    
    // Estado para el menú móvil (responsive)
    const [menuAbierto, setMenuAbierto] = useState(false);
    
    // =========================================================================
    // 2. MANEJADORES DE EVENTOS
    // =========================================================================
    
    /**
     * Maneja el clic en "Cerrar Sesión"
     * 
     * FLUJO:
     * 1. Mostrar confirmación (para evitar cierres accidentales)
     * 2. Si confirma, ejecutar logout()
     * 3. Redirigir a la página principal
     */
    const handleLogout = (e) => {
        e.preventDefault();  // Evitar navegación del enlace
        
        // Mostrar ventana de confirmación
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // Ejecutar logout (limpia el estado de autenticación)
            logout();
            
            // Volver a la página principal
            if (onBackToHome) {
                onBackToHome();
            }
        }
    };
    
    /**
     * Maneja el scroll hacia la sección de servicios
     * 
     * CONCEPTO: scrollIntoView
     * Método del DOM que hace scroll suave hasta un elemento específico
     */
    const handleAgendar = (e) => {
        e.preventDefault();
        
        // Buscar el elemento con clase 'services-section'
        const servicesSection = document.querySelector('.services-section');
        
        if (servicesSection) {
            // Hacer scroll suave hasta ese elemento
            servicesSection.scrollIntoView({ 
                behavior: 'smooth',  // Animación suave
                block: 'start'       // Alinear al inicio de la vista
            });
        }
    };
    
    // =========================================================================
    // 3. ESTILOS
    // =========================================================================
    
    // Estilo del header principal con imagen de fondo
    const headerStyle = {
        position: 'relative',
        width: '100%',
        height: '180px',
        background: 'linear-gradient(135deg, rgba(70, 70, 130, 0.95), rgba(100, 80, 150, 0.95))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        overflow: 'hidden'
    };
    
    // Overlay oscuro sobre el fondo (para mejorar legibilidad)
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.3)',  // Negro semi-transparente
        zIndex: 1
    };
    
    // Estilo del logo
    const logoStyle = {
        position: 'relative',
        zIndex: 2,  // Aparecer encima del overlay
        fontSize: '36px',
        fontWeight: '900',
        marginBottom: '20px',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',  // Sombra para legibilidad
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };
    
    // Estilo de la barra de navegación
    const navBarStyle = {
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '40px',  // Espacio entre enlaces
        alignItems: 'center',
        flexWrap: 'wrap',  // Permitir que se envuelva en pantallas pequeñas
        justifyContent: 'center',
        padding: '0 20px'
    };
    
    // Estilo base de los enlaces
    const navLinkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontSize: '18px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        position: 'relative',
        paddingBottom: '5px',
        cursor: 'pointer',
        // Añadir efecto de subrayado con ::after usando hover
        borderBottom: '2px solid transparent'
    };
    
    // Estilo del enlace activo (Agendar)
    const navLinkActiveStyle = {
        ...navLinkStyle,
        color: 'rgb(133, 198, 255)'  // Color celeste para destacar
    };
    
    // Estilo del botón "Cerrar Sesión" (diferente a los demás enlaces)
    const logoutButtonStyle = {
        ...navLinkStyle,
        background: 'rgba(255, 77, 77, 0.2)',  // Fondo rojo semi-transparente
        padding: '8px 20px',
        borderRadius: '20px',
        border: '2px solid rgba(255, 77, 77, 0.5)',
        transition: 'all 0.3s ease'
    };
    
    // =========================================================================
    // 4. RENDERIZADO
    // =========================================================================
    /**
     * ESTRUCTURA HTML:
     * 
     * <header> (contenedor principal)
     *   ├── <div> (overlay oscuro)
     *   ├── <h1> (logo clickeable)
     *   └── <nav> (barra de navegación)
     *         ├── <a> (Hogar)
     *         ├── <a> (Cotización)
     *         ├── <a> (Agendar - destacado)
     *         ├── <a> (Perfil)
     *         └── <a> (Cerrar Sesión - botón especial)
     */
    
    return (
        <header style={headerStyle}>
            {/* OVERLAY OSCURO PARA MEJORAR CONTRASTE */}
            <div style={overlayStyle}></div>
            
            {/* LOGO CLICKEABLE - Al hacer clic vuelve al home */}
            <h1 
                style={logoStyle}
                onClick={onBackToHome}
                // EFECTOS HOVER
                onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.color = '#5BC0DE';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.color = 'white';
                }}
            >
                FoamWash
                <span style={{ fontSize: '0.7em' }}>LG</span>
            </h1>
            
            {/* BARRA DE NAVEGACIÓN */}
            <nav style={navBarStyle}>
                {/* 
                    ENLACE: HOGAR
                    Vuelve a la página principal
                */}
                <a 
                    href="#" 
                    style={navLinkStyle}
                    onClick={(e) => {
                        e.preventDefault();
                        onBackToHome();
                    }}
                    // EFECTOS HOVER
                    onMouseEnter={(e) => {
                        e.target.style.color = '#5BC0DE';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.borderBottom = '2px solid #5BC0DE';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.borderBottom = '2px solid transparent';
                    }}
                >
                    Hogar
                </a>
                
                {/* 
                    ENLACE: COTIZACIÓN
                    Ir a la página de cotización
                */}
                <a 
                    href="#" 
                    style={navLinkStyle}
                    onClick={(e) => {
                        e.preventDefault();
                        if (onCotizacion) {
                            onCotizacion();
                        } else {
                            alert('Cotización próximamente');
                        }
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#5BC0DE';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.borderBottom = '2px solid #5BC0DE';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.borderBottom = '2px solid transparent';
                    }}
                >
                    Cotización
                </a>
                
                {/* 
                    ENLACE: AGENDAR (DESTACADO)
                    Hace scroll a la sección de servicios
                    Este enlace está destacado porque es la acción principal
                */}
                <a
                    href="#" 
                    style={navLinkActiveStyle}  // Estilo diferente (celeste)
                    onClick={handleAgendar}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.textShadow = '0 0 10px rgba(133, 198, 255, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.textShadow = 'none';
                    }}
                >
                    Agendar
                </a>
                
                {/* 
                    ENLACE: PERFIL
                    Ir a la página de perfil del usuario
                */}
                <a
                    href="#" 
                    style={navLinkStyle}
                    onClick={(e) => {
                        e.preventDefault();
                        if (onPerfil) {
                            onPerfil();
                        } else {
                            alert('Perfil próximamente');
                        }
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.color = '#5BC0DE';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.borderBottom = '2px solid #5BC0DE';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.borderBottom = '2px solid transparent';
                    }}
                >
                    Perfil
                </a>
                
                {/* 
                    BOTÓN: CERRAR SESIÓN
                    Estilo especial (rojo) para indicar acción destructiva
                */}
                <a
                    href="#" 
                    style={logoutButtonStyle}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 77, 77, 0.4)';
                        e.target.style.borderColor = 'rgba(255, 77, 77, 0.8)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(255, 77, 77, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 77, 77, 0.2)';
                        e.target.style.borderColor = 'rgba(255, 77, 77, 0.5)';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    Cerrar Sesión
                </a>
            </nav>
        </header>
    );
};

export default HeaderCliente;

// =============================================================================
// CONCEPTOS CLAVE QUE APRENDISTE:
// =============================================================================
//
// 1. NAVEGACIÓN AUTENTICADA:
//    - Diferentes opciones según el estado de autenticación
//    - Enlaces específicos para usuarios logueados
//
// 2. CONFIRMACIÓN DE ACCIONES DESTRUCTIVAS:
//    - window.confirm() para confirmar cerrar sesión
//    - Evita que el usuario cierre sesión accidentalmente
//
// 3. SCROLL PROGRAMÁTICO:
//    - document.querySelector('.clase')
//    - elemento.scrollIntoView({ behavior: 'smooth' })
//    - Útil para navegación dentro de la misma página
//
// 4. ESTILOS INLINE CON SPREAD OPERATOR:
//    - const nuevoEstilo = { ...estiloBase, propiedad: 'valor' }
//    - Heredar estilos y sobrescribir propiedades específicas
//
// 5. Z-INDEX:
//    - Controla qué elementos aparecen "encima" de otros
//    - z-index: 1 (overlay) vs z-index: 2 (logo y nav)
//    - Solo funciona en elementos posicionados (position: relative/absolute/fixed)
//
// 6. TEXT-SHADOW:
//    - textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
//    - Mejora la legibilidad de texto sobre fondos complejos
//    - Formato: desplazamiento-x desplazamiento-y difuminado color
//
// 7. EVENTOS EN NAVEGACIÓN:
//    - e.preventDefault() para evitar comportamiento por defecto
//    - Esencial en enlaces <a> que no navegan a URLs reales
//
// 8. FLEXBOX PARA NAVEGACIÓN:
//    - display: flex con gap para espaciado uniforme
//    - flexWrap: 'wrap' para responsive (se envuelve en móviles)
//    - justifyContent: 'center' para centrar los elementos
//
// =============================================================================
//
// DIFERENCIAS CON EL HEADER PÚBLICO:
// =============================================================================
//
// HEADER PÚBLICO (no logueado):
// - Enlaces: Inicio, Servicios
// - Botón: "Iniciar Sesión"
// - No muestra información del usuario
//
// HEADER CLIENTE (logueado):
// - Enlaces: Hogar, Cotización, Agendar, Perfil
// - Botón: "Cerrar Sesión" (estilo rojo)
// - Puede mostrar nombre del usuario
// - Acceso a funcionalidades protegidas
//
// =============================================================================