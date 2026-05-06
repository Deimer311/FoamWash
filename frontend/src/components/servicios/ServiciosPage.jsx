// =============================================================================
// ARCHIVO  : ServiciosPage.jsx — REDISEÑO PREMIUM
// PROYECTO : FoamWash
// LÓGICA   : 100% intacta. Layout actualizado con nuevo header fijo.
// =============================================================================

import React, { useState, useEffect } from 'react';
import ServicesHeader  from './ServicesHeader';
import SearchSection   from './SearchSection';
import ServicesGrid    from './ServicesGrid';
import FooterPublic    from '../comun/FooterPublic';
import api             from '../../services/api';
import './estilos_servicios/servicios.css';

const IMAGEN_FALLBACK = '/img/imag1.jpg';

const ServiciosPage = ({ onBackToHome, onGoToLogin, onCotizacionPublica }) => {
    const [servicios,   setServicios]   = useState([]);
    const [isLoading,   setIsLoading]   = useState(true);
    const [desdeBD,     setDesdeBD]     = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const cargarServicios = async () => {
            try {
                const res = await api.get('/cotizaciones/servicios');
                if (res.data.success && res.data.data.length > 0) {
                    const serviciosBD = res.data.data.map(s => ({
                        ...s,
                        id:          s.Id_Servicio        || s.id,
                        nombre:      s.Nombre_Servicio    || s.nombre       || 'Sin nombre',
                        descripcion: s.Descripcion        || s.descripcion  || '',
                        precio:      Number(s.Precio      || s.precio       || 0),
                        imagen:      s.imagen_url         || IMAGEN_FALLBACK,
                        tamanos:     ['Estándar'],
                    }));
                    setServicios(serviciosBD);
                    setDesdeBD(true);
                } else {
                    setServicios([]);
                    setDesdeBD(false);
                }
            } catch (error) {
                console.warn('⚠️ Error cargando servicios:', error.message);
                setServicios([]);
                setDesdeBD(false);
            } finally {
                setIsLoading(false);
            }
        };
        cargarServicios();
    }, []);

    const serviciosFiltrados = servicios.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.nombre.toLowerCase().includes(q) || s.descripcion?.toLowerCase().includes(q);
    });

    const handleSolicitar = () => onGoToLogin();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#1a56ff', fontFamily: 'Kanit' }}>
                Cargando servicios...
            </div>
        );
    }

    return (
        <div className="servicios-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

            {/* ── Overrides para alinear con el nuevo diseño premium ── */}
            <style>{`
                .servicios-page { background: #f6f7fb; }

                /* Search */
                .search-section {
                    background: #fff !important;
                    padding: 28px 20px !important;
                    display: flex !important;
                    justify-content: center !important;
                    border-bottom: 1px solid #eef0f5 !important;
                }
                .search-container {
                    position: relative !important;
                    width: 100% !important;
                    max-width: 640px !important;
                    background: none !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                }
                .search-input {
                    width: 100% !important;
                    padding: 14px 52px 14px 22px !important;
                    font-size: 15px !important;
                    font-family: 'Kanit', sans-serif !important;
                    border: 1.5px solid #e0e4ef !important;
                    border-radius: 50px !important;
                    outline: none !important;
                    background: #f8f9ff !important;
                    color: #111 !important;
                    box-shadow: none !important;
                    transition: border-color 0.22s ease, box-shadow 0.22s ease !important;
                }
                .search-input:focus {
                    border-color: #1a56ff !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 3px rgba(26,86,255,0.10) !important;
                }
                .search-button {
                    position: absolute !important;
                    right: 16px !important;
                    top: 50% !important;
                    transform: translateY(-50%) !important;
                    background: none !important;
                    border: none !important;
                    cursor: pointer !important;
                    color: #8890aa !important;
                    font-size: 18px !important;
                    padding: 4px !important;
                    transition: color 0.2s !important;
                }
                .search-button:hover { color: #1a56ff !important; }

                /* Services section */
                .services-section {
                    background: #f6f7fb !important;
                    padding: 52px 40px 80px !important;
                    flex: 1;
                }
                .section-title {
                    font-size: 34px !important;
                    font-weight: 800 !important;
                    color: #0a1435 !important;
                    text-shadow: none !important;
                    -webkit-text-fill-color: unset !important;
                    background: none !important;
                    -webkit-background-clip: unset !important;
                    background-clip: unset !important;
                    margin-bottom: 10px !important;
                    letter-spacing: -0.5px !important;
                }

                /* Grid */
                .services-grid {
                    display: grid !important;
                    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)) !important;
                    gap: 28px !important;
                    max-width: 1320px !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                }

                .no-results { text-align: center; padding: 60px 20px; color: #999; font-family: 'Kanit', sans-serif; }
                .clear-search-btn {
                    margin-top: 12px;
                    padding: 10px 28px;
                    background: linear-gradient(135deg, #1a56ff, #7c3aed);
                    color: #fff; border: none; border-radius: 10px;
                    font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .services-section { padding: 36px 20px 60px !important; }
                    .services-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
                }
                @media (max-width: 480px) {
                    .services-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>

            <ServicesHeader
                onBackToHome={onBackToHome}
                onGoToLogin={onGoToLogin}
                onCotizacionPublica={onCotizacionPublica}
            />

            {/* Padding top = altura del header fijo */}
            <div style={{ paddingTop: 72 }}>
                <SearchSection searchQuery={searchQuery} onSearch={setSearchQuery} />

                <section className="services-section">
                    <h2 className="section-title" style={{ textAlign: 'center' }}>
                        Nuestros Servicios
                    </h2>
                    <p style={{
                        textAlign: 'center', fontSize: 14, color: '#8890aa', marginBottom: 44,
                        fontFamily: 'Kanit', fontWeight: 400, letterSpacing: '0.3px'
                    }}>
                        Profesionales certificados · Productos ecológicos · Garantía de satisfacción
                    </p>

                    {serviciosFiltrados.length > 0 ? (
                        <ServicesGrid
                            servicios={serviciosFiltrados}
                            onSolicitar={handleSolicitar}
                            onGoToLogin={onGoToLogin}
                        />
                    ) : (
                        <div className="no-results">
                            <p>No se encontraron servicios que coincidan con "{searchQuery}"</p>
                            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                Limpiar búsqueda
                            </button>
                        </div>
                    )}
                </section>
            </div>

            <FooterPublic />
        </div>
    );
};

export default ServiciosPage;