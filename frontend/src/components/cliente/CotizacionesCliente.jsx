// =============================================================================
// ARCHIVO  : CotizacionesCliente.jsx
// PROYECTO : FoamWash
// REDISEÑO : Usa el modal compartido (ModalesCarrito.jsx) — mismo diseño que
//            el flujo de Agendar. Sin emojis. Carrito se limpia al cerrar sesión.
//            Lógica de negocio y consumo de API intactos.
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import { useCarrito } from '../modales/CarritoContext';
import ServiceCardCliente from './ServiceCardCliente';
import Footer from '../comun/Footer1';
import BotonCarritoFlotante from '../modales/BotonCarritoFlotante';
import HeaderCliente from './HeaderCliente';
import api from '../../services/api';
import { guardarCotizacionLocal } from '../../services/cotizacionStorage';
import { CartModal, ConfirmationModal, IcSearch, IcLoader } from './Modalescarrito';
import './estilos_cliente/estilos_cotizar_cliente.css';

const IMAGEN_FALLBACK = '/img/imag1.jpg';

const getImageUrl = (path) => {
    if (!path) return IMAGEN_FALLBACK;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const baseUrl = (api.defaults.baseURL || 'http://localhost:5000').replace(/\/api$/, '');
    return `${baseUrl}${cleanPath}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function CotizacionesCliente({ onBackToHome, onGoToServicios, onPerfil, onServicios, onMisAgendamientos, onMisCotizaciones }) {
    const { user } = useAuth();
    const { carrito, agregarAlCarrito, actualizarCantidad, actualizarDetalle, vaciarCarrito } = useCarrito();

    const [servicios, setServicios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCartModal, setShowCartModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    setServicios(res.data.data.map(s => ({
                        ...s,
                        id: s.Id_Servicio || s.id,
                        nombre: s.Nombre_Servicio || s.nombre || 'Sin nombre',
                        descripcion: s.Descripcion || s.descripcion || '',
                        precio: Number(s.Precio || s.precio || 0),
                        imagen: getImageUrl(s.imagen_url),
                        tamanos: ['Estándar'],
                        rating: 4.8,
                        garantia: true,
                        ecologico: true,
                        popular: false
                    })));
                } else { setServicios([]); }
            } catch { setServicios([]); }
            finally { setIsLoading(false); }
        };
        cargar();
    }, []);

    useEffect(() => {
        if (!user && carrito.length > 0) guardarCotizacionLocal(carrito);
    }, [carrito, user]);

    // ── Limpia el carrito automáticamente al cerrar sesión ──
    const prevUserRef = useRef(user);
    useEffect(() => {
        const habiaSesion = !!prevUserRef.current;
        const haySesionAhora = !!user;
        if (habiaSesion && !haySesionAhora) {
            if (typeof vaciarCarrito === 'function') {
                vaciarCarrito();
            } else {
                carrito.forEach(item => actualizarCantidad(item.id, 0));
            }
            if (typeof window !== 'undefined') localStorage.removeItem('foamwash_carrito_local');
            setShowCartModal(false);
            setShowConfirmModal(false);
        }
        prevUserRef.current = user;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const filtered = servicios.filter(s => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleActualizarCantidad = (id, n) => actualizarCantidad?.(id, n);
    const handleFinalizarCompra = () => { if (!carrito.length) return; setShowCartModal(false); setShowConfirmModal(true); };
    const handlePedidoConfirmado = () => {
        if (typeof vaciarCarrito === 'function') {
            vaciarCarrito();
        } else {
            carrito.forEach(item => actualizarCantidad(item.id, 0));
        }
        if (typeof window !== 'undefined') localStorage.removeItem('foamwash_carrito_local');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>

            <HeaderCliente
                onBackToHome={onBackToHome}
                onCotizacion={() => { }}
                onPerfil={onPerfil}
                onServicios={onGoToServicios || onServicios}
                onMisAgendamientos={onMisAgendamientos}
                onMisCotizaciones={onMisCotizaciones}
                activeLink="cotizacion"
            />

            <main style={{ flex: 1, paddingTop: 72 }}>
                {/* ── Búsqueda ── */}
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios: muebles, colchones, tapicería, carros..."
                            aria-label="Buscar servicios"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" aria-label="Buscar">
                            <IcSearch />
                        </button>
                    </div>
                </section>

                {/* ── Servicios ── */}
                <section className="services-section">
                    <h2 className="section-title">Nuestros Servicios</h2>
                    <p style={{
                        textAlign: 'center', fontSize: 14, color: '#8890aa',
                        marginBottom: 44, fontFamily: 'Kanit', fontWeight: 400, letterSpacing: '0.3px'
                    }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    {isLoading ? (
                        <div className="state-loading"><IcLoader /> Cargando servicios...</div>
                    ) : (
                        <div className="services-grid">
                            {filtered.length > 0 ? (
                                filtered.map(s => (
                                    <ServiceCardCliente
                                        key={s.id}
                                        servicio={s}
                                        onNotificacion={(msg) => console.log(msg)}
                                    />
                                ))
                            ) : (
                                <div className="state-empty">
                                    <IcSearch />
                                    <p>No se encontraron servicios para "<strong>{searchTerm}</strong>"</p>
                                    <p style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>
                                        Intenta con: muebles, colchones, tapicería, alfombras…
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />

            <BotonCarritoFlotante onClick={() => setShowCartModal(true)} />

            {showCartModal && (
                <CartModal
                    carrito={carrito}
                    onActualizarCantidad={handleActualizarCantidad}
                    onCerrar={() => setShowCartModal(false)}
                    onFinalizarCompra={handleFinalizarCompra}
                />
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    carrito={carrito}
                    user={user}
                    onCerrar={() => setShowConfirmModal(false)}
                    onActualizarDetalle={actualizarDetalle}
                    onPedidoConfirmado={handlePedidoConfirmado}
                    soloCotizacion={true}
                />
            )}
        </div>
    );
}