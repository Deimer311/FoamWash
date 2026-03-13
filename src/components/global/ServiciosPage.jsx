/**
 * ============================================================================
 * SERVICIOSPAGE.JSX — Servicios público (NO logueado)
 * ============================================================================
 * CAMBIO: imagen viene de imagen_url en BD (campo agregado con ALTER TABLE)
 * Diseño 100% intacto.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import ServicesHeader  from './ServicesHeader';
import SearchSection   from './SearchSection';
import ServicesGrid    from './ServicesGrid';
import FooterPublic    from './FooterPublic';
import api             from '../../services/api';
import '../css/servicios.css';

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
                        imagen:  s.imagen_url || IMAGEN_FALLBACK,
                        tamanos: ['Estándar'],
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.2rem', color: '#666' }}>
                ⏳ Cargando servicios...
            </div>
        );
    }

    return (
        <div className="servicios-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ServicesHeader
                onBackToHome={onBackToHome}
                onGoToLogin={onGoToLogin}
                onCotizacionPublica={onCotizacionPublica}
            />

            <SearchSection searchQuery={searchQuery} onSearch={setSearchQuery} />

            <section className="services-section" style={{ flex: 1 }}>
                <h2 className="section-title">
                    Nuestros Servicios
                    {desdeBD && (
                        <span style={{ fontSize: '12px', color: '#0b74ff', marginLeft: 8, fontWeight: 400 }}>
                            • Actualizado desde base de datos
                        </span>
                    )}
                </h2>

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

            <FooterPublic />
        </div>
    );
};

export default ServiciosPage;