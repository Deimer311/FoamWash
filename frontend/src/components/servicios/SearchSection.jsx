// =============================================================================
// ARCHIVO  : SearchSection.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/servicios/SearchSection.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Barra de búsqueda de servicios para la página pública.
// =============================================================================

import React from 'react';

/**
 * COMPONENTE: SearchSection
 * 
 * PROPS:
 * - searchQuery: Valor actual del input de búsqueda
 * - onSearch: Función que se ejecuta cuando el usuario busca
 */
const SearchSection = ({ searchQuery, onSearch }) => {
    // -------------------------------------------------------------------------
    // MANEJADORES DE EVENTOS
    // -------------------------------------------------------------------------
    
    /**
     * Maneja el cambio en el input de búsqueda
     * Se ejecuta cada vez que el usuario escribe una letra
     */
    const handleInputChange = (e) => {
        onSearch(e.target.value);
    };

    /**
     * Maneja el clic en el botón de búsqueda
     */
    const handleSearchClick = () => {
        console.log('Buscando:', searchQuery);
    };

    /**
     * Maneja la tecla Enter en el input
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchClick();
        }
    };

    // -------------------------------------------------------------------------
    // RENDERIZADO
    // -------------------------------------------------------------------------
    
    return (
        <section className="search-section">
            <div className="search-container">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Buscar servicios (ej: lavado muebles, sillas, carros, tapetes...)"
                    aria-label="Buscar servicios"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                
                <button className="search-button" aria-label="Buscar">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                </button>
            </div>
        </section>
    );
};

export default SearchSection;