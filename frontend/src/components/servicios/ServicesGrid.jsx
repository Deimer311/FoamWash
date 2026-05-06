// =============================================================================
// ARCHIVO  : ServicesGrid.jsx
// PROYECTO : FoamWash
// RUTA     : src/components/servicios/ServicesGrid.jsx
// AUTOR    : Cristian Andrés Criollo Tovar
// FECHA    : 15-03-2026
// -----------------------------------------------------------------------------
// DESCRIPCIÓN:
//   Grid de tarjetas de servicios para la página pública.
// =============================================================================

import React from 'react';
import ServiceCard from './ServiceCard';

const ServicesGrid = ({ servicios, onSolicitar, onGoToLogin }) => {
    return (
        <div className="services-grid">
            {servicios.map(servicio => (
                <ServiceCard
                    key={servicio.id}
                    servicio={servicio}
                    onSolicitar={onSolicitar}
                    onGoToLogin={onGoToLogin}  // ← AGREGAR ESTA LÍNEA
                />
            ))}
        </div>
    );
};

export default ServicesGrid;