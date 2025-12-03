// =============================================================================
// SERVICIOSCLIENTEPAGE.JSX - RESPETANDO CSS ORIGINAL
// =============================================================================
// Esta versión usa las clases CSS de tu archivo estilos_cotizar_cliente.css
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useCarrito } from './CarritoContext';
import { useNotificaciones, NotificacionContainer } from './Notificacion';
import CarritoModal from './CarritoModal';
import ConfirmacionModal from './ConfirmacionModal';
import BotonCarritoFlotante from './BotonCarritoFlotante';

// Importar tu CSS original
import './css/estilos_cotizar_cliente.css';

// =============================================================================
// DATOS DE SERVICIOS (mismo que tenías en servicios_cliente.js)
// =============================================================================
const SERVICIOS_DATA = [
    { id: 1, nombre: "Lavado de muebles", precio: 90000, imagen: "/img/imag1.jpg", desc: "Lavado profundo de sofás y sillas, eliminación de manchas y olores.", tamanos: ["Pequeño", "Mediano", "Grande"] },
    { id: 2, nombre: "Lavado de alfombras", precio: 50000, imagen: "/img/imag4.jpg",desc: "Limpieza profunda para alfombras pequeñas y medianas", tamanos: ["Pequeña", "Mediana", "Grande"] },
    { id: 3, nombre: "Tapicería de carros", precio: 140000, imagen: "/img/imag5.jpg",desc: "Limpieza interior del vehículo: asientos, alfombras y paneles.", tamanos: ["Sedan", "SUV", "Camioneta"] },
    { id: 4, nombre: "Lavado de cortinas", precio: 80000, imagen: "/img/imag7.jpg", desc: "Lavado y planchado ligero para cortinas y visillos.", tamanos: ["Por metro", "Juego completo"] },
    { id: 5, nombre: "Lavado de colchones", precio: 90000, imagen: "/img/imag6.jpg",desc:"Eliminación de ácaros y manchas, desodorización y secado rápido.", tamanos: ["Sencillo", "Semi-doble", "Doble", "Queen", "King"] },
    { id: 6, nombre: "Mantenimiento y pulido de pisos", precio: 100000, imagen: "/img/imag8.jpg",desc: "Recuperar brillo, proteger la superficie y mejorar su apariencia.", tamanos: ["Pequeño (hasta 50m²)", "Mediano (50-100m²)", "Grande (más de 100m²)"] },
    { id: 7, nombre: "Limpieza sillas de comedor", precio: 7000, imagen: "/img/imag2.jpg", desc: "Elimina manchas, suciedad y malos olores.", tamanos: ["7.000 por silla", "10.000 por silla"] },
    { id: 8, nombre: "Limpieza de tapetes decorativos", precio: 60000, imagen: "/img/imag3.jpg", desc: "Remueve suciedad, polvo y manchas, devolviendo frescura y color..", tamanos: ["Pequeño (hasta 50m²)", "Mediano (50-100m²)", "Grande (más de 100m²)"] },

    
];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
const ServiciosClientePage = ({ onBackToHome, onCotizacion, onPerfil }) => {
    const { user, logout } = useAuth();
    const { agregarAlCarrito } = useCarrito();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [mostrarCarritoModal, setMostrarCarritoModal] = useState(false);
    const [mostrarConfirmacionModal, setMostrarConfirmacionModal] = useState(false);
    
    // Filtrar servicios según búsqueda
    const serviciosFiltrados = SERVICIOS_DATA.filter(servicio => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const nombre = servicio.nombre.toLowerCase();
        const descripcion = servicio.descripcion.toLowerCase();
        
        return nombre.includes(query) || descripcion.includes(query);
    });
    
    // Manejador de cerrar sesión
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
    
    // Manejador de agregar al carrito
    const handleAgregarAlCarrito = (servicio) => {
        agregarAlCarrito(servicio);
        agregarNotificacion(`${servicio.nombre} agregado al carrito`, 'exito');
    };
    
    return (
        <>
            {/* ==================== HEADER CON BANNER ==================== */}
            <header className="header-banner">
                <img src="img/ima9.jpg" alt="Fondo encabezado" className="fondo" />
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
                            onCotizacion ? onCotizacion() : alert('Cotización próximamente');
                        }}
                    >
                        Cotización
                    </a>
                    <a 
                        href="#" 
                        className="nav-link" 
                        style={{ color: 'rgb(133, 198, 255)' }}
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector('.services-section')?.scrollIntoView({ 
                                behavior: 'smooth' 
                            });
                        }}
                    >
                        Agendar
                    </a>
                    <a 
                        href="#" 
                        className="nav-link"
                        onClick={(e) => {
                            e.preventDefault();
                            onPerfil ? onPerfil() : alert('redirigiendo');
                        }}
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
            <section className="search-section">
                <div className="search-container">
                    <input 
                        type="text" 
                        className="search-input" 
                        id="searchInput" 
                        placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)" 
                        aria-label="Buscar servicios"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="search-button" aria-label="buscar">🔍</button>
                </div>
            </section>
            
            <section className="services-section">
                <h2 className="section-title">Nuestros Servicios</h2>
                <div className="services-grid">
                    {serviciosFiltrados.map(servicio => (
                        <article key={servicio.id} className="service-card">
                            <div className="service-image">
                                <img 
                                    src={servicio.imagen} 
                                    alt={servicio.nombre}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/500x300?text=Imagen+no+disponible';
                                    }}
                                />
                            </div>
                            <div className="service-content">
                                <h3 className="service-title">{servicio.nombre}</h3>
                                <p className="service-desc">{servicio.descripcion}</p>
                                <div className="service-meta">
                                    <span className="service-price">
                                        ${servicio.precio.toLocaleString('es-CO')}
                                    </span>
                                    <button 
                                        type="button" 
                                        className="service-btn" 
                                        onClick={() => handleAgregarAlCarrito(servicio)}
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* BOTÓN FLOTANTE DEL CARRITO */}
            <BotonCarritoFlotante onClick={() => setMostrarCarritoModal(true)} />

            {/* MODAL DEL CARRITO */}
            <CarritoModal
                isOpen={mostrarCarritoModal}
                onClose={() => setMostrarCarritoModal(false)}
                onFinalizarCompra={() => {
                    setMostrarCarritoModal(false);
                    setMostrarConfirmacionModal(true);
                }}
            />

            {/* MODAL DE CONFIRMACIÓN */}
            <ConfirmacionModal
                isOpen={mostrarConfirmacionModal}
                onClose={() => setMostrarConfirmacionModal(false)}
            />

            {/* SISTEMA DE NOTIFICACIONES */}
            <NotificacionContainer
                notificaciones={notificaciones}
                onRemove={removerNotificacion}
            />
        </>
    );
};

export default ServiciosClientePage;