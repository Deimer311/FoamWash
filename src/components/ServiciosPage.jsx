import React, { useState } from 'react';
import ServicesHeader from './ServicesHeader';
import SearchSection from './SearchSection';
import ServicesGrid from './ServicesGrid';
import './css/servicios.css';

const SERVICIOS_DATA = [
    {
        id: 1,
        titulo: 'Lavado de muebles',
        descripcion: 'Lavado profundo de sofás y sillas, eliminación de manchas y olores.',
        precio: '$90.000',
        imagen: '/img/serv_lavado_muebles.jpg'
    },
    {
        id: 2,
        titulo: 'Lavado de alfombras',
        descripcion: 'Limpieza profunda para alfombras pequeñas y medianas.',
        precio: '$50.000',
        imagen: '/img/serv_alfombras.jpg'
    },
    {
        id: 3,
        titulo: 'Tapicería de carros',
        descripcion: 'Limpieza interior del vehículo: asientos, alfombras y paneles.',
        precio: '$140.000',
        imagen: '/img/serv_tapiceria_carro.jpg'
    },
    {
        id: 4,
        titulo: 'Lavado de cortinas',
        descripcion: 'Lavado y planchado ligero para cortinas y visillos.',
        precio: '$80.000',
        imagen: '/img/serv_cortinas.jpg'
    },
    {
        id: 5,
        titulo: 'Lavado de colchones',
        descripcion: 'Eliminación de ácaros y manchas, desodorización y secado rápido.',
        precio: '$90.000',
        imagen: '/img/serv_colchones.jpg'
    },
    {
        id: 6,
        titulo: 'Desinfección y sanitización',
        descripcion: 'Servicio rápido de desinfección para hogares y oficinas.',
        precio: '$150.000',
        imagen: '/img/serv_desinfeccion.jpg'
    }
];

const ServiciosPage = ({ onBackToHome, onGoToLogin }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const serviciosFiltrados = SERVICIOS_DATA.filter(servicio => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const titulo = servicio.titulo.toLowerCase();
        const descripcion = servicio.descripcion.toLowerCase();
        const precio = servicio.precio.toLowerCase();
        
        return titulo.includes(query) || 
                descripcion.includes(query) || 
                precio.includes(query);
    });

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleSolicitar = (servicio) => {
        console.log('Solicitar servicio:', servicio);
        alert(`Servicio: ${servicio.titulo}\nPrecio: ${servicio.precio}\n\n¡Próximamente podrás agendarlo!`);
    };

    return (
        <div className="servicios-page">
            <ServicesHeader 
                onBackToHome={onBackToHome}
                onGoToLogin={onGoToLogin}
            />
            
            <SearchSection 
                searchQuery={searchQuery}
                onSearch={handleSearch}
            />
            
            <section className="services-section">
                <h2 className="section-title">Nuestros servicios</h2>
                
                {serviciosFiltrados.length > 0 ? (
                    <ServicesGrid 
                        servicios={serviciosFiltrados}
                        onSolicitar={handleSolicitar}
                    />
                ) : (
                    <div className="no-results">
                        <p>No se encontraron servicios que coincidan con "{searchQuery}"</p>
                        <button 
                            className="clear-search-btn"
                            onClick={() => setSearchQuery('')}
                        >
                            Limpiar búsqueda
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ServiciosPage;