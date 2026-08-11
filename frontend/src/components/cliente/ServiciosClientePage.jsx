// =============================================================================
// ARCHIVO  : ServiciosClientePage.jsx
// PROYECTO : FoamWash
// REDISEÑO : Reemplaza el <CarritoModal/> externo (diseño distinto al de
//            Cotizar) por el modal compartido ModalesCarrito.jsx, logrando
//            diseño idéntico entre Cotizar y Agendar. Sin emojis. El carrito
//            se limpia automáticamente al cerrar sesión. Lógica de negocio,
//            sincronización local y consumo de API permanecen intactos.
// =============================================================================

import HeaderCliente from './HeaderCliente';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../autenticacion/AuthContext';
import { useCarrito } from '../modales/CarritoContext';
import { useNotificaciones, NotificacionContainer } from '../comun/Notificacion';
import BotonCarritoFlotante from '../modales/BotonCarritoFlotante';
import ServiceCardCliente from './ServiceCardCliente';
import Footer from '../comun/Footer1';
import api from '../../services/api';
import { leerCotizacionLocal, sincronizarCotizacionConBD } from '../../services/cotizacionStorage';
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

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const ServiciosClientePage = ({ onBackToHome, onCotizacion, onPerfil, onMisAgendamientos, onMisCotizaciones }) => {
    const { user } = useAuth();
    const { carrito, agregarAlCarrito, actualizarCantidad, actualizarDetalle, vaciarCarrito } = useCarrito();
    const { notificaciones, agregarNotificacion, removerNotificacion } = useNotificaciones();

    const [servicios, setServicios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [mostrarCarritoModal, setMostrarCarritoModal] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

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
        if (!user?.id) return;
        const datos = leerCotizacionLocal();
        if (!datos?.items?.length) return;
        setSyncMsg('Sincronizando cotización previa...');
        sincronizarCotizacionConBD(user.id).then(res => {
            setSyncMsg(res.success
                ? `${res.sincronizados + res.actualizados} servicio(s) guardados.`
                : 'No se pudo sincronizar la cotización.');
            setTimeout(() => setSyncMsg(''), 5000);
        });
    }, [user?.id]);

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
            setMostrarCarritoModal(false);
            setMostrarConfirmacion(false);
        }
        prevUserRef.current = user;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const serviciosFiltrados = servicios.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || (s.descripcion || '').toLowerCase().includes(q);
    });

    const handleActualizarCantidad = (id, n) => actualizarCantidad?.(id, n);

    const handleFinalizarCompra = () => {
        if (!carrito?.length) { agregarNotificacion('El carrito está vacío', 'error'); return; }
        setMostrarCarritoModal(false);
        setMostrarConfirmacion(true);
    };

    const handlePedidoConfirmado = () => {
        agregarNotificacion('¡Servicio agendado con éxito!', 'exito');
        if (typeof vaciarCarrito === 'function') {
            vaciarCarrito();
        } else {
            carrito.forEach(item => actualizarCantidad(item.id, 0));
        }
        if (typeof window !== 'undefined') localStorage.removeItem('foamwash_carrito_local');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f6f7fb' }}>

            {/* Sync toast */}
            {syncMsg && (
                <div style={{
                    position: 'fixed', top: 84, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg,#1e3a8a,#0f172a)', color: '#fff',
                    padding: '10px 24px', borderRadius: 50, fontWeight: 600, zIndex: 10001,
                    boxShadow: '0 4px 20px rgba(15,23,42,0.35)', fontSize: 14,
                    fontFamily: 'Kanit', whiteSpace: 'nowrap'
                }}>
                    <IcLoader /> {syncMsg}
                </div>
            )}

            <HeaderCliente
                onBackToHome={onBackToHome}
                onPerfil={onPerfil}
                onCotizacion={onCotizacion}
                onMisAgendamientos={onMisAgendamientos}
                onMisCotizaciones={onMisCotizaciones}
                activeLink="agendar"
            />

            <main style={{ flex: 1, paddingTop: 72 }}>

                {/* ── Búsqueda ── */}
                <section className="search-section">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar servicios: muebles, colchones, tapicería, carros..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            aria-label="Buscar servicios"
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
                        textAlign: 'center',
                        fontSize: 14,
                        color: '#8890aa',
                        marginBottom: 44,
                        fontFamily: 'Kanit',
                        fontWeight: 400,
                        letterSpacing: '0.3px'
                    }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    {isLoading ? (
                        <div className="state-loading"><IcLoader /> Cargando servicios...</div>
                    ) : (
                        <div className="services-grid">
                            {serviciosFiltrados.length > 0 ? (
                                serviciosFiltrados.map(s => (
                                    <ServiceCardCliente
                                        key={s.id}
                                        servicio={s}
                                        onNotificacion={(msg) => agregarNotificacion(msg, 'exito')}
                                    />
                                ))
                            ) : (
                                <div className="state-empty">
                                    <IcSearch />
                                    <p>No se encontraron servicios para "<strong>{searchQuery}</strong>"</p>
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

            <BotonCarritoFlotante onClick={() => setMostrarCarritoModal(true)} />

            {mostrarCarritoModal && (
                <CartModal
                    carrito={carrito}
                    onActualizarCantidad={handleActualizarCantidad}
                    onCerrar={() => setMostrarCarritoModal(false)}
                    onFinalizarCompra={handleFinalizarCompra}
                />
            )}

            {mostrarConfirmacion && (
                <ConfirmationModal
                    carrito={carrito}
                    user={user}
                    onCerrar={() => setMostrarConfirmacion(false)}
                    onActualizarDetalle={actualizarDetalle}
                    onPedidoConfirmado={handlePedidoConfirmado}
                />
            )}

            <NotificacionContainer notificaciones={notificaciones} onRemove={removerNotificacion} />
        </div>
    );
};

export default ServiciosClientePage;